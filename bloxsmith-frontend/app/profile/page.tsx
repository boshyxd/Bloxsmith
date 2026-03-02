"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useCredits } from "@/hooks/use-credits"
import { getSupabase } from "@/lib/supabase"
import { RELOAD_AMOUNTS_CENTS } from "@/lib/billing"

interface Transaction {
  id: string
  type: string
  amount_cents: number
  balance_after_cents: number
  description: string | null
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { balanceCents, freeGensRemaining, loading: creditsLoading, refetch } = useCredits()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingCheckout, setLoadingCheckout] = useState<number | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [editingEmail, setEditingEmail] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [emailStatus, setEmailStatus] = useState<string | null>(null)

  const reloadSuccess = searchParams.get("reload") === "success"

  useEffect(() => {
    if (reloadSuccess) refetch()
  }, [reloadSuccess, refetch])

  useEffect(() => {
    if (!user) return
    getSupabase()
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setDisplayName(data.display_name)
      })
  }, [user])

  useEffect(() => {
    if (!user) return
    getSupabase()
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setTransactions(data)
      })
  }, [user])

  async function saveDisplayName() {
    if (!user) return
    const trimmed = nameInput.trim()
    if (!trimmed || trimmed === displayName) {
      setEditingName(false)
      return
    }
    const { error } = await getSupabase()
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", user.id)
    if (error) throw error
    setDisplayName(trimmed)
    setEditingName(false)
  }

  async function saveEmail() {
    const trimmed = emailInput.trim()
    if (!trimmed || trimmed === user?.email) {
      setEditingEmail(false)
      return
    }
    const { error } = await getSupabase().auth.updateUser({ email: trimmed })
    if (error) throw error
    setEmailStatus("Confirmation sent to both old and new email")
    setEditingEmail(false)
  }

  async function startCheckout(amountCents: number) {
    setLoadingCheckout(amountCents)
    const { data: { session } } = await getSupabase().auth.getSession()
    if (!session) return

    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ amountCents }),
    })

    if (!res.ok) {
      setLoadingCheckout(null)
      return
    }

    const { url } = await res.json()
    window.location.href = url
  }

  async function signOut() {
    await getSupabase().auth.signOut()
    router.replace("/")
  }

  if (authLoading) return null

  if (!user) {
    router.replace("/auth")
    return null
  }

  const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        {reloadSuccess && (
          <div className="border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500">
            Credits added successfully.
          </div>
        )}

        {emailStatus && (
          <div className="border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-500">
            {emailStatus}
          </div>
        )}

        {/* Account */}
        <div className="border border-border bg-card p-6 space-y-5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Account</h2>

          <div className="space-y-4">
            {/* Display name */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Display name</span>
                {editingName ? (
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onBlur={saveDisplayName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveDisplayName()
                      if (e.key === "Escape") setEditingName(false)
                    }}
                    className="block text-sm bg-transparent border-b border-foreground outline-none w-full"
                  />
                ) : (
                  <p className="text-sm text-foreground">{displayName || "Not set"}</p>
                )}
              </div>
              {!editingName && (
                <button
                  onClick={() => {
                    setNameInput(displayName ?? "")
                    setEditingName(true)
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="border-t border-border" />

            {/* Email */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Email</span>
                {editingEmail ? (
                  <input
                    autoFocus
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onBlur={saveEmail}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEmail()
                      if (e.key === "Escape") setEditingEmail(false)
                    }}
                    className="block text-sm bg-transparent border-b border-foreground outline-none w-full"
                  />
                ) : (
                  <p className="text-sm text-foreground">{user.email}</p>
                )}
              </div>
              {!editingEmail && (
                <button
                  onClick={() => {
                    setEmailInput(user.email ?? "")
                    setEditingEmail(true)
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change
                </button>
              )}
            </div>

            <div className="border-t border-border" />

            {/* Member since */}
            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground">Member since</span>
              <p className="text-sm text-foreground">{joinedDate}</p>
            </div>
          </div>
        </div>

        {/* Balance + Add Credits */}
        <div className="border border-border bg-card p-6 space-y-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Balance</h2>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold">${(balanceCents / 100).toFixed(2)}</span>
              {freeGensRemaining > 0 && (
                <span className="text-xs text-muted-foreground">
                  + {freeGensRemaining} free
                </span>
              )}
              {creditsLoading && (
                <span className="text-xs text-muted-foreground">...</span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {RELOAD_AMOUNTS_CENTS.map((amount) => (
              <button
                key={amount}
                onClick={() => startCheckout(amount)}
                disabled={loadingCheckout !== null}
                className="flex-1 px-4 py-2.5 border border-border bg-background text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                {loadingCheckout === amount ? "..." : `+$${(amount / 100).toFixed(0)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        {transactions.length > 0 && (
          <div className="border border-border bg-card p-6 space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">History</h2>
            <div className="space-y-0 divide-y divide-border">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <span className="text-foreground">{tx.description}</span>
                    <span className="text-muted-foreground ml-2">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={tx.amount_cents > 0 ? "text-green-500" : "text-muted-foreground"}>
                      {tx.amount_cents > 0 ? "+" : ""}${(tx.amount_cents / 100).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      ${(tx.balance_after_cents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={signOut}
          className="w-full px-4 py-3 border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
