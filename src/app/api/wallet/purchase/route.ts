import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const COIN_PACKAGES = {
  starter: { coins: 10, price: 100, label: "Starter Pack" },
  pro: { coins: 25, price: 200, label: "Pro Pack" },
  business: { coins: 50, price: 350, label: "Business Pack" }
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { packageId } = body;

    if (!packageId || !COIN_PACKAGES[packageId as keyof typeof COIN_PACKAGES]) {
      return NextResponse.json(
        { success: false, error: "Invalid package ID" },
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

    const pkg = COIN_PACKAGES[packageId as keyof typeof COIN_PACKAGES];
    const tx_ref = `coin-${packageId}-${user.id.slice(0, 8)}-${Date.now()}`;
    const return_url = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?tx_ref=${tx_ref}&type=coin`;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone_number')
      .eq('id', user.id)
      .single();

    const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: pkg.price.toString(),
        currency: "ETB",
        email: user.email,
        first_name: profile?.full_name?.split(' ')[0] || "User",
        last_name: profile?.full_name?.split(' ').slice(1).join(' ') || "",
        phone_number: profile?.phone_number || "0900123456",
        tx_ref,
        title: pkg.label,
        description: `Purchase ${pkg.coins} coins - ${pkg.label}`,
        return_url,
      }),
    });

    const data = await response.json();
    console.log("Chapa response:", data);

    if (!data.data?.checkout_url) {
      console.error("Chapa error:", data);
      return NextResponse.json(
        { success: false, error: data.message || data.error || "Payment initialization failed", details: data },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase
      .from('coin_purchases')
      .insert({
        user_id: user.id,
        package_id: packageId,
        coins_purchased: pkg.coins,
        amount_paid_etb: pkg.price,
        payment_tx_ref: tx_ref,
        status: 'pending'
      });

    if (insertError) {
      console.error("Failed to record coin purchase:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to record purchase" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkout_url: data.data.checkout_url,
      tx_ref,
      coins: pkg.coins,
      price: pkg.price
    });
  } catch (error: any) {
    console.error("Coin purchase error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}