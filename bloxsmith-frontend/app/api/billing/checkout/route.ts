import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getServerSupabase } from "@/lib/supabase-server"
import { RELOAD_AMOUNTS_CENTS } from "@/lib/billing"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServerSupabase(authHeader.slice(7))
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { amountCents } = await request.json()
  if (!RELOAD_AMOUNTS_CENTS.includes(amountCents)) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
  }

  const stripe = new Stripe(stripeKey)
  const origin = request.headers.get("origin") ?? "http://localhost:3000"

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: `Bloxsmith Credits — $${(amountCents / 100).toFixed(2)}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      amount_cents: String(amountCents),
    },
    success_url: `${origin}/profile?reload=success`,
    cancel_url: `${origin}/profile`,
  })

  return NextResponse.json({ url: session.url })
}
