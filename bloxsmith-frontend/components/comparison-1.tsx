"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";

export default function Comparison1() {
  const features = [
    {
      name: "All-in-one platform (UI + builds + audio)",
      brand1: true,
      brand2: false,
    },
    {
      name: "Curated style presets from real games",
      brand1: true,
      brand2: false,
    },
    {
      name: "Flat pricing, no credit/token burn",
      brand1: true,
      brand2: false,
    },
    {
      name: "Bring your own AI key (BYOK)",
      brand1: true,
      brand2: false,
    },
    {
      name: "One-click publish to Studio",
      brand1: true,
      brand2: true,
    },
  ];

  return (
    <section className="relative w-full bg-white px-8 py-12 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* Left Column - Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <h2 className="mb-6 text-4xl font-medium tracking-tight text-neutral-950 dark:text-white">
              Bloxsmith vs. Others
            </h2>
            <p className="mb-8 text-md max-w-md leading-relaxed text-neutral-600 dark:text-neutral-400">
              Other Roblox AI tools are single-purpose and burn through credits.
              Bloxsmith gives you UI, builds, and audio generation in one
              platform with flat pricing and no token anxiety.
            </p>
            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-full bg-neutral-950 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 md:w-auto"
              >
                Try Bloxsmith Free
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column - Comparison Table */}
          <div className="w-full">
            {/* Brand Headers */}
            <div className="mb-8 grid grid-cols-2 gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex items-center"
              >
                <span className="text-2xl font-bold text-neutral-950 dark:text-white md:text-3xl">
                  Bloxsmith
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center"
              >
                <span className="text-2xl font-bold tracking-wider text-neutral-950 dark:text-white md:text-3xl">
                  Others
                </span>
              </motion.div>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="grid grid-cols-2 gap-4 md:gap-6"
                >
                  {/* Brand 1 Feature */}
                  <div className="flex items-center gap-3 py-4">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                        feature.brand1
                          ? "bg-neutral-950 dark:bg-white"
                          : "border-2 border-neutral-300 dark:border-neutral-700"
                      }`}
                    >
                      {feature.brand1 && (
                        <Check
                          className="h-4 w-4 text-white dark:text-neutral-950"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    <span className="text-sm font-medium text-neutral-950 dark:text-white md:text-base">
                      {feature.name}
                    </span>
                  </div>

                  {/* Brand 2 Feature */}
                  <div className="flex items-center gap-3 py-4">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                        feature.brand2
                          ? "bg-neutral-950 dark:bg-white"
                          : "border-2 border-neutral-300 dark:border-neutral-700"
                      }`}
                    >
                      {feature.brand2 && (
                        <Check
                          className="h-4 w-4 text-white dark:text-neutral-950"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium md:text-base ${
                        feature.brand2
                          ? "text-neutral-950 dark:text-white"
                          : "text-neutral-400 dark:text-neutral-600"
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
