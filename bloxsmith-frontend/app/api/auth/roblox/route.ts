import { NextResponse } from "next/server"
import { randomBytes } from "crypto"

const ROBLOX_CLIENT_ID = process.env.ROBLOX_CLIENT_ID
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/auth/roblox/callback`

export async function GET() {
  if (!ROBLOX_CLIENT_ID) {
    throw new Error("Missing ROBLOX_CLIENT_ID env var")
  }

  const state = randomBytes(32).toString("hex")

  const params = new URLSearchParams({
    client_id: ROBLOX_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "openid profile",
    response_type: "code",
    state,
  })

  const response = NextResponse.redirect(
    `https://apis.roblox.com/oauth/v1/authorize?${params}`
  )

  response.cookies.set("roblox_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  })

  return response
}
