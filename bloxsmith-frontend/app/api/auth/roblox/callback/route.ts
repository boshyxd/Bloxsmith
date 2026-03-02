import { NextRequest, NextResponse } from "next/server"
import { getServiceSupabase } from "@/lib/supabase-server"

const ROBLOX_CLIENT_ID = process.env.ROBLOX_CLIENT_ID!
const ROBLOX_CLIENT_SECRET = process.env.ROBLOX_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/auth/roblox/callback`
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

interface RobloxTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface RobloxUserInfo {
  sub: string
  preferred_username: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const storedState = request.cookies.get("roblox_oauth_state")?.value

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${SITE_URL}/auth?error=invalid_state`)
  }

  const tokenRes = await fetch("https://apis.roblox.com/oauth/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: ROBLOX_CLIENT_ID,
      client_secret: ROBLOX_CLIENT_SECRET,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${SITE_URL}/auth?error=token_exchange_failed`)
  }

  const tokenData: RobloxTokenResponse = await tokenRes.json()

  const userInfoRes = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!userInfoRes.ok) {
    return NextResponse.redirect(`${SITE_URL}/auth?error=userinfo_failed`)
  }

  const userInfo: RobloxUserInfo = await userInfoRes.json()
  const syntheticEmail = `${userInfo.sub}@roblox.local`

  const supabase = getServiceSupabase()

  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find((u) => u.email === syntheticEmail)

  let userId: string

  if (existingUser) {
    userId = existingUser.id
  } else {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: syntheticEmail,
      email_confirm: true,
      user_metadata: { display_name: userInfo.preferred_username },
    })
    if (createError || !newUser.user) {
      return NextResponse.redirect(`${SITE_URL}/auth?error=user_creation_failed`)
    }
    userId = newUser.user.id
  }

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: syntheticEmail,
  })

  if (linkError || !linkData.properties?.hashed_token) {
    return NextResponse.redirect(`${SITE_URL}/auth?error=link_generation_failed`)
  }

  const response = NextResponse.redirect(
    `${SITE_URL}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=magiclink`
  )

  response.cookies.delete("roblox_oauth_state")

  return response
}
