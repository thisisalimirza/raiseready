import { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { session_id } = req.query

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' })
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id as string)

    if (session.payment_status === 'paid') {
      const supabaseAdmin = createSupabaseAdmin()
      const email = session.metadata?.user_email

      if (!email) {
        return res.status(400).json({ error: 'User email not found in session' })
      }

      // Update user payment status
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          payment_status: 'paid',
          stripe_customer_id: session.customer as string,
          stripe_payment_intent_id: session.payment_intent as string,
          paid_at: new Date().toISOString()
        })
        .eq('email', email)

      if (updateError) {
        console.error('Error updating user payment status:', updateError)
        return res.status(500).json({ error: 'Failed to update payment status' })
      }

      // Create payment record
      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert({
          user_id: (await supabaseAdmin.from('users').select('id').eq('email', email).single()).data?.id,
          stripe_payment_intent_id: session.payment_intent as string,
          amount: session.amount_total || 3900,
          currency: session.currency || 'usd',
          status: 'completed'
        })

      if (paymentError) {
        console.error('Error creating payment record:', paymentError)
        // Don't return error here as the main payment update succeeded
      }

      res.status(200).json({ success: true, customer_email: email })
    } else {
      res.status(400).json({ error: 'Payment not completed' })
    }
  } catch (error) {
    console.error('Payment success error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}