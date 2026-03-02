import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getServiceSupabase } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
  }

  const stripe = new Stripe(stripeKey)
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const userId = session.metadata?.user_id
  const amountCents = Number(session.metadata?.amount_cents)
  if (!userId || !amountCents) {
    return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("balance_cents")
    .eq("id", userId)
    .single()

  if (fetchError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  const newBalance = profile.balance_cents + amountCents

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ balance_cents: newBalance })
    .eq("id", userId)

  if (updateError) {
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 })
  }

  const { error: txError } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      type: "reload",
      amount_cents: amountCents,
      balance_after_cents: newBalance,
      stripe_session_id: session.id,
      description: `Added $${(amountCents / 100).toFixed(2)}`,
    })

  if (txError) {
    return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
