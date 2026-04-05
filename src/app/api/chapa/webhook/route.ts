import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-chapa-signature') || req.headers.get('chapa-signature')
    const secret = process.env.CHAPA_WEBHOOK_SECRET

    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)

    if (payload.event === 'charge.success' && payload.status === 'success') {
      const tx_ref = payload.tx_ref
      const supabase = await createClient()

      const paymentType = tx_ref.startsWith('coin-') 
        ? 'coin_purchase' 
        : tx_ref.startsWith('hire-') || tx_ref.startsWith('gig-')
          ? 'gig_payment'
          : 'unknown'

      if (paymentType === 'coin_purchase') {
        const { data: purchase, error: fetchError } = await supabase
          .from('coin_purchases')
          .select('*')
          .eq('payment_tx_ref', tx_ref)
          .single()

        if (fetchError || !purchase) {
          console.error('Coin purchase not found:', tx_ref)
          return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
        }

        if (purchase.status === 'completed') {
          return NextResponse.json({ received: true, message: 'Already processed' })
        }

        await supabase
          .from('coin_purchases')
          .update({ status: 'completed' })
          .eq('payment_tx_ref', tx_ref)

        const { data: wallet, error: walletError } = await supabase
          .from('user_wallets')
          .select('coin_balance')
          .eq('user_id', purchase.user_id)
          .single()

        let currentBalance = wallet?.coin_balance;
        
        if (!wallet || walletError) {
          await supabase.from('user_wallets').insert({
            user_id: purchase.user_id,
            coin_balance: 5 + purchase.coins_purchased,
            total_coins_spent: 0,
            total_earned_etb: 0
          });
          currentBalance = 5;
        } else {
          const newBalance = (currentBalance || 0) + purchase.coins_purchased;
          await supabase
            .from('user_wallets')
            .update({ coin_balance: newBalance })
            .eq('user_id', purchase.user_id);
        }

        await supabase.from('notifications').insert({
          user_id: purchase.user_id,
          type: 'coins_purchased',
          content: `Successfully purchased ${purchase.coins_purchased} coins!`,
          is_read: false
        })

        return NextResponse.json({ received: true, type: 'coin_purchase', coins_added: purchase.coins_purchased })
      }

      if (paymentType === 'gig_payment') {
        const { data: payment, error: updateError } = await supabase
          .from('payments')
          .update({ 
            status: 'paid',
            paid_at: new Date().toISOString()
          })
          .eq('transaction_id', tx_ref)
          .select()
          .single()

        if (updateError || !payment) {
          console.error('Failed to update payment:', updateError)
          return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
        }

        await supabase
          .from('gigs')
          .update({ 
            payment_status: 'paid',
            payment_id: payment.id
          })
          .eq('id', payment.gig_id)

        const { data: freelancerWallet, error: fwError } = await supabase
          .from('user_wallets')
          .select('total_earned_etb')
          .eq('user_id', payment.freelancer_id)
          .single()

        if (!freelancerWallet || fwError) {
          await supabase.from('user_wallets').insert({
            user_id: payment.freelancer_id,
            coin_balance: 5,
            total_coins_spent: 0,
            total_earned_etb: Number(payment.amount)
          });
        } else {
          await supabase
            .from('user_wallets')
            .update({ 
              total_earned_etb: (freelancerWallet?.total_earned_etb || 0) + Number(payment.amount)
            })
            .eq('user_id', payment.freelancer_id);
        }

        await supabase.from('notifications').insert({
          user_id: payment.freelancer_id,
          type: 'payment_received',
          content: `Payment of ETB ${payment.amount} received for gig.`,
          is_read: false
        })

        await supabase.from('notifications').insert({
          user_id: payment.client_id,
          type: 'payment_sent',
          content: `Payment of ETB ${payment.amount} sent for gig hiring.`,
          is_read: false
        })

        return NextResponse.json({ received: true, type: 'gig_payment' })
      }

      return NextResponse.json({ received: true, message: 'Unknown payment type' })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}