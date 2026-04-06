import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    // Get profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'client') {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    // Fetch payments made by client
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        *,
        gig:gigs(title),
        freelancer:profiles!payments_freelancer_id_fkey(full_name, avatar_url)
      `)
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (paymentsError) throw paymentsError;

    // Fetch coin purchases
    const { data: coinPurchases, error: coinsError } = await supabase
      .from('coin_purchases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (coinsError) throw coinsError;

    // Calculate totals
    const totalSpent = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const pendingPayments = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const totalCoinsBought = coinPurchases?.reduce((sum, c) => sum + c.coins_purchased, 0) || 0;
    const totalCoinsSpent = coinPurchases?.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.coins_purchased, 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        payments: payments || [],
        coinPurchases: coinPurchases || [],
        summary: {
          totalSpent,
          pendingPayments,
          totalCoinsBought,
          totalCoinsSpent
        }
      }
    });
  } catch (error: any) {
    console.error("Client finance error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}