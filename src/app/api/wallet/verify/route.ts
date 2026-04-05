import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tx_ref, status } = body;

    if (!tx_ref) {
      return NextResponse.json(
        { success: false, error: "Missing tx_ref" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    if (status === 'success' || status === 'completed') {
    const { data: purchase, error: fetchError } = await supabase
      .from('coin_purchases')
      .select('*')
      .eq('payment_tx_ref', tx_ref)
      .single();

    console.log("Looking for tx_ref:", tx_ref);
    console.log("Purchase result:", { purchase, fetchError });

    if (fetchError || !purchase) {
      console.error("Coin purchase not found:", tx_ref, fetchError);
      return NextResponse.json(
        { success: false, error: "Purchase not found", debug: { tx_ref, error: fetchError?.message } },
        { status: 404 }
      );
    }

      if (purchase.status === 'completed') {
        return NextResponse.json({
          success: true,
          message: "Already processed"
        });
      }

      const { error: updatePurchaseError } = await supabase
        .from('coin_purchases')
        .update({ status: 'completed' })
        .eq('payment_tx_ref', tx_ref);

      if (updatePurchaseError) {
        console.error("Failed to update purchase status:", updatePurchaseError);
        return NextResponse.json(
          { success: false, error: "Failed to update purchase" },
          { status: 500 }
        );
      }

      const { data: wallet, error: walletError } = await supabase
        .from('user_wallets')
        .select('coin_balance')
        .eq('user_id', purchase.user_id)
        .single();

      let currentBalance = wallet?.coin_balance;
      
      if (!wallet || walletError) {
        await supabase.from('user_wallets').insert({
          user_id: purchase.user_id,
          coin_balance: 5,
          total_coins_spent: 0,
          total_earned_etb: 0
        });
        currentBalance = 5;
      }

      const newBalance = (currentBalance || 0) + purchase.coins_purchased;

      const { error: updateWalletError } = await supabase
        .from('user_wallets')
        .update({ coin_balance: newBalance })
        .eq('user_id', purchase.user_id);

      if (updateWalletError) {
        console.error("Failed to update wallet:", updateWalletError);
        return NextResponse.json(
          { success: false, error: "Failed to update wallet" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        coins_added: purchase.coins_purchased,
        new_balance: newBalance
      });
    }

    if (status === 'failed' || status === 'cancelled') {
      await supabase
        .from('coin_purchases')
        .update({ status: 'failed' })
        .eq('payment_tx_ref', tx_ref);

      return NextResponse.json({
        success: true,
        message: "Payment failed"
      });
    }

    return NextResponse.json({
      success: true,
      message: "Status pending"
    });
  } catch (error: any) {
    console.error("Verify wallet error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}