import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PLATFORM_FEE_PERCENT = 10;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { freelancerId, gigId } = body;

    if (!freelancerId || !gigId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .select('id, title, budget, client_id, status')
      .eq('id', gigId)
      .single();

    if (gigError || !gig) {
      return NextResponse.json(
        { success: false, error: "Gig not found" },
        { status: 404 }
      );
    }

    if (gig.client_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "You can only pay for your own gigs" },
        { status: 403 }
      );
    }

    if (gig.status !== 'open' && gig.status !== 'assigned') {
      return NextResponse.json(
        { success: false, error: "This gig cannot be paid for" },
        { status: 400 }
      );
    }

    const { data: freelancer } = await supabase
      .from('profiles')
      .select('full_name, phone_number')
      .eq('id', freelancerId)
      .single();

    const { data: client } = await supabase
      .from('profiles')
      .select('full_name, phone_number')
      .eq('id', user.id)
      .single();

    const amount = Number(gig.budget);
    const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100));
    const totalAmount = amount + platformFee;
    const tx_ref = `hire-${gigId}-${freelancerId.slice(0, 8)}-${Date.now()}`;
    const return_url = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?tx_ref=${tx_ref}&type=hire&gig=${gigId}`;

    const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: totalAmount.toString(),
        currency: "ETB",
        email: user.email,
        first_name: client?.full_name?.split(' ')[0] || "Client",
        last_name: client?.full_name?.split(' ').slice(1).join(' ') || "",
        phone_number: client?.phone_number || "0900123456",
        tx_ref,
        title: `Hire for: ${gig.title}`,
        description: `Payment for hiring freelancer on gig: ${gig.title}. Gig budget: ${amount} ETB, Platform fee: ${platformFee} ETB`,
        return_url,
      }),
    });

    const data = await response.json();

    if (!data.data?.checkout_url) {
      return NextResponse.json(
        { success: false, error: data.message || "Payment initialization failed" },
        { status: 400 }
      );
    }

    const { error: paymentInsertError } = await supabase
      .from('payments')
      .insert({
        client_id: user.id,
        freelancer_id: freelancerId,
        gig_id: gigId,
        amount: totalAmount,
        currency: 'ETB',
        status: 'pending',
        transaction_id: tx_ref,
        payment_note: `Gig: ${gig.title}, Budget: ${amount} ETB, Fee: ${platformFee} ETB`
      });

    if (paymentInsertError) {
      console.error("Failed to record payment:", paymentInsertError);
    }

    return NextResponse.json({
      success: true,
      checkout_url: data.data.checkout_url,
      tx_ref,
      amount,
      platform_fee: platformFee,
      total: totalAmount,
      freelancer_name: freelancer?.full_name || 'Freelancer'
    });
  } catch (error: any) {
    console.error("Hire payment error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}