"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabase } from "@/lib/supabase"

interface CreditState {
  balanceCents: number
  freeGensRemaining: number
  loading: boolean
  refetch: () => Promise<void>
}

export function useCredits(): CreditState {
  const [balanceCents, setBalanceCents] = useState(0)
  const [freeGensRemaining, setFreeGensRemaining] = useState(0)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    const { data: { session } } = await getSupabase().auth.getSession()
    if (!session) return

    const res = await fetch("/api/billing/balance", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (!res.ok) return

    const data = await res.json()
    setBalanceCents(data.balanceCents)
    setFreeGensRemaining(data.freeGensRemaining)
  }, [])

  useEffect(() => {
    refetch().finally(() => setLoading(false))
  }, [refetch])

  return { balanceCents, freeGensRemaining, loading, refetch }
}
