import { createClient } from "@supabase/supabase-js"

export function getServerSupabase(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars")
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}

export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase service role env vars")
  return createClient(url, key)
}
