import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = await createServiceRoleClient();

    const tables = [
      'profiles',
      'gigs',
      'applications',
      'user_wallets',
      'coin_purchases',
      'payments',
      'messages',
      'conversations',
      'notifications',
      'reviews',
      'verification_documents',
      'client_profiles',
      'freelancer_profiles',
      'telegram_accounts'
    ];

    const results: Record<string, any> = {};

    for (const table of tables) {
      const { data, error, count } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: false })
        .limit(100);

      results[table] = {
        total: count || 0,
        data: data || [],
        error: error?.message || null
      };
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}