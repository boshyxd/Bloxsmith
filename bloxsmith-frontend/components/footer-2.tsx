"use client";

import { motion } from "motion/react";
import { Instagram, Linkedin } from "lucide-react";

export default function Footer2() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <footer className="relative w-full overflow-hidden">
      {/* Background Image - Full height */}
      <div className="absolute inset-0 h-full w-full">
        <img
          src="https://images.unsplash.com/photo-1616144058124-979005390426?q=80&w=1744&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* Main Content Wrapper */}
      <div className="relative">
        {/* Spacer to show image at top */}
        <div className="h-32 sm:h-40 md:h-48" />

        {/* Black Container with Content */}
        <div className="relative bg-white dark:bg-neutral-950">
          {/* Left Corner SVG */}
          <div className="absolute left-0 top-0 z-10 -translate-y-full">
            <svg
              width="614"
              height="153"
              viewBox="0 0 614 153"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-auto w-[250px] relative top-px"
            >
              <path
                d="M0 0H451.601C467.78 0 483.071 7.75893 491.954 21.2815C558.518 122.612 538.359 153.074 614 153H0V0Z"
                className="fill-white dark:fill-neutral-950"
              />
            </svg>
          </div>

          {/* Right Corner SVG (Flipped) */}
          <div className="absolute right-0 top-0 z-10 -translate-y-full">
            <svg
              width="614"
              height="153"
              viewBox="0 0 614 153"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-auto w-[250px] scale-x-[-1] relative top-px"
            >
              <path
                d="M0 0H451.601C467.78 0 483.071 7.75893 491.954 21.2815C558.518 122.612 538.359 153.074 614 153H0V0Z"
                className="fill-white dark:fill-neutral-950"
              />
            </svg>
          </div>

          {/* Footer Content */}
          <div className="mx-auto w-full max-w-[1400px] px-4 lg:px-8 py-12">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col items-center space-y-8 sm:space-y-10 md:space-y-12"
            >
              {/* Logo */}
              <motion.div variants={itemVariants} className="text-center">
                <h2 className="text-4xl font-bold text-neutral-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  Bloxsmith
                </h2>
                <p className="mt-2 text-xl font-medium text-neutral-900 dark:text-white sm:text-2xl md:text-3xl">
                  forge your vision
                </p>
              </motion.div>

              {/* Links */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center justify-center gap-3 text-sm text-neutral-900 dark:text-white sm:gap-4 sm:text-base"
              >
                <a
                  href="#pricing"
                  className="transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  PRICING
                </a>
                <span className="text-neutral-400 dark:text-neutral-500">
                  -
                </span>
                <a
                  href="#"
                  className="transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  DISCORD
                </a>
                <span className="text-neutral-400 dark:text-neutral-500">
                  -
                </span>
                <a
                  href="https://github.com/anthropics/robloxstudio-mcp"
                  className="transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  GITHUB
                </a>
              </motion.div>

              {/* Social Icons */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-6"
              >
                <a
                  href="#"
                  className="text-neutral-900 transition-colors hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6 sm:h-7 sm:w-7" />
                </a>
                <a
                  href="#"
                  className="text-neutral-900 transition-colors hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300"
                  aria-label="Twitter"
                >
                  <svg
                    className="h-6 w-6 sm:h-7 sm:w-7"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-neutral-900 transition-colors hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-6 w-6 sm:h-7 sm:w-7" />
                </a>
              </motion.div>

              {/* Bottom Section */}
              <motion.div
                variants={itemVariants}
                className="flex w-full flex-col items-center justify-between gap-6 border-t border-neutral-200 dark:border-neutral-800 pt-8 text-center sm:flex-row sm:text-left md:pt-10"
              >
                {/* Copyright */}
                <div className="text-xs text-neutral-600 dark:text-neutral-400 sm:text-sm">
                  <p>© 2026 Bloxsmith. All rights reserved.</p>
                </div>

                {/* Right text */}
                <div className="text-xs text-neutral-600 dark:text-neutral-400 sm:text-right sm:text-sm">
                  <p>UI FORGE / BUILD FORGE / SOUND FORGE</p>
                  <p>POWERED BY BYOK AI</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
