import { NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { FREE_GENERATION_LIMIT } from "@/lib/billing"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServerSupabase(authHeader.slice(7))
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("balance_cents, free_generations_used")
    .eq("id", user.id)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  return NextResponse.json({
    balanceCents: profile.balance_cents,
    freeGensRemaining: Math.max(0, FREE_GENERATION_LIMIT - profile.free_generations_used),
  })
}
