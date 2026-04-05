import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, email, first_name, last_name, phone_number, gig_id, title } = body;

    if (!amount || !email || !gig_id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const tx_ref = `gig-${gig_id}-${Date.now()}`;
    const return_url = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?tx_ref=${tx_ref}`;

    const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency: "ETB",
        email,
        first_name: first_name || "Test",
        last_name: last_name || "User",
        phone_number: phone_number || "0900123456",
        tx_ref,
        title: title || "Gig Payment",
        description: `Payment for gig #${gig_id}`,
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

    return NextResponse.json({
      success: true,
      checkout_url: data.data.checkout_url,
      tx_ref,
    });
  } catch (error: any) {
    console.error("Chapa payment error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
