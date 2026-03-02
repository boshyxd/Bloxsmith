"use client"

import { useState, useEffect, useCallback, type CSSProperties } from "react"
import { motion, AnimatePresence } from "motion/react"

const STORAGE_KEY = "bloxsmith_onboarding_seen"
const PLUGIN_URL =
  "https://create.roblox.com/store/asset/108075911397883/Bloxsmith-Plugin"
const SPOTLIGHT_PAD = 8
const CARD_W = 320

interface Step {
  target: string | null
  title: string
  body: string
  showPlugin?: boolean
}

const STEPS: Step[] = [
  {
    target: null,
    title: "Welcome to UI Forge",
    body: "Generate Roblox UIs with AI and send them straight into Studio. Start by installing the plugin.",
    showPlugin: true,
  },
  {
    target: "connect",
    title: "Connect Studio",
    body: "Click here to link Roblox Studio. Enter the 6-digit code shown in the plugin.",
  },
  {
    target: "style",
    title: "Pick a Style",
    body: "Choose a visual style to guide the generated UI's look and feel.",
  },
  {
    target: "chat",
    title: "Describe Your UI",
    body: "Tell the AI what you want and hit Send. The generated code goes to Studio or downloads as .rbxmx.",
  },
  {
    target: "credits",
    title: "Your Credits",
    body: "You start with 3 free generations. Add more from your profile page.",
  },
]

function tooltipPosition(rect: DOMRect | null): CSSProperties {
  if (!rect) {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
  }

  const sx = rect.left - SPOTLIGHT_PAD
  const sy = rect.top - SPOTLIGHT_PAD
  const sw = rect.width + SPOTLIGHT_PAD * 2
  const sh = rect.height + SPOTLIGHT_PAD * 2
  const cx = sx + sw / 2
  const bottom = sy + sh

  const clampX = (x: number) =>
    Math.max(16, Math.min(x, window.innerWidth - CARD_W - 16))

  if (bottom + 200 < window.innerHeight) {
    return { top: bottom + 12, left: clampX(cx - CARD_W / 2) }
  }
  if (sy - 200 > 0) {
    return { bottom: window.innerHeight - sy + 12, left: clampX(cx - CARD_W / 2) }
  }
  return {
    top: "50%",
    left: clampX(rect.right + SPOTLIGHT_PAD + 16),
    transform: "translateY(-50%)",
  }
}

export function OnboardingOverlay() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    setVisible(true)
  }, [])

  useEffect(() => {
    if (!visible) return
    const { target } = STEPS[step]
    if (!target) {
      setRect(null)
      return
    }
    const el = document.querySelector(`[data-onboarding="${target}"]`)
    if (!el) {
      setRect(null)
      return
    }
    const update = () => setRect(el.getBoundingClientRect())
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [step, visible])

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1")
    setVisible(false)
  }, [])

  const next = useCallback(() => {
    if (step >= STEPS.length - 1) dismiss()
    else setStep((s) => s + 1)
  }, [step, dismiss])

  const prev = useCallback(() => setStep((s) => Math.max(0, s - 1)), [])

  if (!visible) return null

  const current = STEPS[step]

  return (
    <div className="fixed inset-0 z-50">
      {rect ? (
        <div
          className="absolute rounded-md pointer-events-none"
          style={{
            top: rect.top - SPOTLIGHT_PAD,
            left: rect.left - SPOTLIGHT_PAD,
            width: rect.width + SPOTLIGHT_PAD * 2,
            height: rect.height + SPOTLIGHT_PAD * 2,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/70" />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="absolute bg-popover border border-border rounded-lg p-5 shadow-xl"
          style={{ ...tooltipPosition(rect), width: CARD_W }}
        >
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-sm leading-none"
            aria-label="Close tutorial"
          >
            &#x2715;
          </button>

          <h3 className="text-sm font-semibold text-foreground mb-1.5">
            {current.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {current.body}
          </p>

          {current.showPlugin && (
            <a
              href={PLUGIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 mb-4 bg-foreground text-background text-xs font-medium rounded-none hover:bg-foreground/90 transition-colors"
            >
              Get the Plugin
            </a>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {step + 1} / {STEPS.length}
            </span>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={next}
                className="px-3 py-1.5 text-xs font-medium bg-foreground text-background rounded-none hover:bg-foreground/90 transition-colors"
              >
                {step >= STEPS.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
