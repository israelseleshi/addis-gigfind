import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { data: wallet, error } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const { data: newWallet, error: createError } = await supabase
          .from('user_wallets')
          .insert({
            user_id: user.id,
            coin_balance: 5,
            total_coins_spent: 0,
            total_earned_etb: 0
          })
          .select()
          .single();

        if (createError) {
          return NextResponse.json({
            success: true,
            wallet: {
              coin_balance: 5,
              total_coins_spent: 0,
              total_earned_etb: 0
            }
          });
        }

        return NextResponse.json({
          success: true,
          wallet: newWallet
        });
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      wallet
    });
  } catch (error: any) {
    console.error("Get wallet error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}