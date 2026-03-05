import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { getServiceSupabase } from "@/lib/supabase-server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  const { error: dbError } = await supabase
    .from("waitlist")
    .insert({ email: email.toLowerCase().trim() })

  if (dbError) {
    if (dbError.code === "23505") {
      return NextResponse.json({ error: "Already on the waitlist" }, { status: 409 })
    }
    throw dbError
  }

  await resend.emails.send({
    from: "Bloxsmith <hello@bloxsmith.net>",
    to: email,
    subject: "You're on the Bloxsmith waitlist",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <img src="https://bloxsmith.net/logos/bloxsmith-wordmark.png" alt="Bloxsmith" style="height: 32px; margin-bottom: 24px;" />
        <h1 style="font-size: 20px; font-weight: 600; color: #171717; margin: 0 0 12px;">You're on the list.</h1>
        <p style="font-size: 14px; color: #525252; line-height: 1.6; margin: 0 0 24px;">
          Thanks for joining the Bloxsmith waitlist. We're building AI-powered Roblox UI generation and you'll be among the first to try it.
        </p>
        <p style="font-size: 14px; color: #525252; line-height: 1.6; margin: 0;">
          We'll email you when it's ready. Stay tuned.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0 16px;" />
        <p style="font-size: 12px; color: #a3a3a3; margin: 0;">Bloxsmith &mdash; AI-powered Roblox UI generation</p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
