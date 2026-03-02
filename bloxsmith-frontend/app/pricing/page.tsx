"use client"

import { motion } from "motion/react"
import { useAuth } from "@/hooks/use-auth"
import { MODELS, COST_PER_FRAME_CENTS, FREE_GENERATION_LIMIT, TOKEN_MARKUP } from "@/lib/billing"
import Footer2 from "@/components/footer-2"

const models = Object.values(MODELS)

export default function PricingPage() {
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-background">
      <section className="w-full pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-4">
              Pricing
            </h1>
            <p className="text-base sm:text-lg text-foreground/70 leading-relaxed max-w-xl">
              Pay as you go. No subscriptions, no tiers. Just reload and build.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10"
          >
            <h2 className="text-xs font-medium text-muted-foreground tracking-wider mb-6">
              PRESET STYLES
            </h2>
            <p className="text-sm text-foreground/70 mb-4">
              Fixed price per generation when using a curated style preset.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {models.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
                  className="p-4 border border-border bg-card"
                >
                  <h3 className="text-sm font-medium text-foreground mb-1">{m.name}</h3>
                  <p className="text-2xl font-medium text-foreground mb-0.5">
                    ${(COST_PER_FRAME_CENTS[m.id] / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">per frame</p>
                  <p className="text-xs text-muted-foreground mt-2">{m.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-xs font-medium text-muted-foreground tracking-wider mb-6">
              ADAPTIVE MODE
            </h2>
            <p className="text-sm text-foreground/70 mb-4">
              Token-based pricing when using Adaptive mode with your own extracted styles.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {models.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.06 }}
                  className="p-4 border border-border bg-card"
                >
                  <h3 className="text-sm font-medium text-foreground mb-3">{m.name}</h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-muted-foreground">Input</span>
                      <span className="text-sm font-medium text-foreground">
                        ${(m.inputCostPerMillionTokens * TOKEN_MARKUP).toFixed(2)}/M
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-muted-foreground">Output</span>
                      <span className="text-sm font-medium text-foreground">
                        ${(m.outputCostPerMillionTokens * TOKEN_MARKUP).toFixed(2)}/M
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 border border-border bg-card"
          >
            <h2 className="text-xs font-medium text-muted-foreground tracking-wider mb-4">
              GETTING STARTED
            </h2>
            <ul className="space-y-2 text-sm text-foreground/70 mb-6">
              <li>{FREE_GENERATION_LIMIT} free generations for new accounts</li>
              <li>Reload $5 / $10 / $25 anytime</li>
              <li>No monthly fees or commitments</li>
            </ul>
            <a
              href={user ? "/profile" : "/forge/ui"}
              className="block w-full px-8 py-3.5 rounded-none bg-foreground text-background font-medium text-sm text-center hover:bg-foreground/90 transition-colors duration-200"
            >
              {user ? "Add Credits" : "Start Free"}
            </a>
          </motion.div>
        </div>
      </section>

      <div className="border-t border-border" />
      <Footer2 />
    </main>
  )
}
