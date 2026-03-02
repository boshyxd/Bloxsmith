"use client"

import { motion } from "motion/react"
import { Download, ArrowRight, Plug, Zap, Eye } from "lucide-react"
import Footer2 from "@/components/footer-2"

const STEPS = [
  {
    number: "01",
    title: "Install the plugin",
    description:
      "Download the .rbxmx file and drop it into your Roblox Studio Plugins folder, or install directly from the Creator Marketplace.",
  },
  {
    number: "02",
    title: "Open your place",
    description:
      "Launch Roblox Studio and open any place. The Bloxsmith plugin tab appears in your toolbar automatically.",
  },
  {
    number: "03",
    title: "Connect to Bloxsmith",
    description:
      "Click Connect in the plugin, enter the 6-digit code shown on the website, and start generating UIs directly into your place.",
  },
]

const FEATURES = [
  {
    icon: Plug,
    title: "One-click connection",
    description: "Enter a 6-digit code to link Studio to the web editor. No API keys, no config files.",
  },
  {
    icon: Zap,
    title: "Live code injection",
    description: "Generated Luau code runs inside your place instantly. UIs appear in StarterGui in real time.",
  },
  {
    icon: Eye,
    title: "UI tree extraction",
    description: "The plugin reads your existing ScreenGuis so the AI can reference and modify them.",
  },
]

export default function PluginPage() {
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
              Studio Plugin
            </h1>
            <p className="text-base sm:text-lg text-foreground/70 leading-relaxed max-w-xl">
              A free Roblox Studio plugin that connects your place to Bloxsmith.
              Generate UIs from the web editor and they appear in Studio instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <motion.a
                href="https://create.roblox.com/store/asset/108075911397883/Bloxsmith-Plugin"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-none text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Get from Creator Marketplace
              </motion.a>
              <motion.a
                href="/forge/ui"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground rounded-none text-sm font-medium hover:bg-accent transition-colors"
              >
                Open UI Forge
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="text-xs font-medium text-muted-foreground tracking-wider mb-6">
              HOW IT WORKS
            </h2>
            <div className="space-y-6">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                  className="flex gap-4"
                >
                  <span className="text-sm font-medium text-muted-foreground pt-0.5 shrink-0">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-base font-medium text-foreground mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-xs font-medium text-muted-foreground tracking-wider mb-6">
              FEATURES
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.06 }}
                  className="p-4 border border-border bg-card"
                >
                  <feature.icon className="w-5 h-5 text-foreground mb-3" />
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
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
              REQUIREMENTS
            </h2>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>Roblox Studio (latest version)</li>
              <li>A Bloxsmith account (free to create)</li>
              <li>Plugin permissions: HTTP requests to bloxsmith.net</li>
            </ul>
          </motion.div>
        </div>
      </section>

      <div className="border-t border-border" />
      <Footer2 />
    </main>
  )
}
