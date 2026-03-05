"use client";

import { useState } from "react";
import { motion } from "motion/react";

export default function Waitlist3() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setIsSubmitting(false);

    if (res.status === 409) {
      setIsSubmitted(true);
      setEmail("");
      return;
    }

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    setIsSubmitted(true);
    setEmail("");
  };

  return (
    <section className="w-full min-h-screen flex items-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-xl relative"
          >
            {/* SVG positioned on top of card */}
            <div className="absolute top-px left-1/2 -translate-x-1/2 -translate-y-full z-10">
              <svg
                width="756"
                height="86"
                viewBox="0 0 756 86"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[200px] sm:w-[280px] md:w-[300px] h-auto"
              >
                <path
                  d="M378 0H620.709C643.31 0 663.485 8.35584 672.03 20.8335C706.133 70.6268 726.465 85.9951 756 86H378V0Z"
                  fill="currentColor"
                  className="text-secondary"
                />
                <path
                  d="M378 0H135.291C112.69 0 92.5152 8.35584 83.9696 20.8335C49.8674 70.6268 29.535 85.9951 0 86H378V0Z"
                  fill="currentColor"
                  className="text-secondary"
                />
              </svg>
            </div>

            {/* Card */}
            <div className="w-full rounded-none bg-secondary p-8 sm:p-12">
              <div className="flex flex-col items-center space-y-6">
                {/* Logo */}
                <div className="flex items-center justify-center aspect-square h-16 bg-background rounded-none">
                  <img src="/logos/bloxsmith-icon.svg" alt="Bloxsmith" className="h-10 w-10" />
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-foreground text-center">
                  Join the Bloxsmith waitlist.
                </h2>

                {/* Description */}
                <p className="text-sm sm:text-base tracking-tight text-muted-foreground text-center leading-relaxed max-w-md">
                  We're building AI-powered Roblox UI generation. Join the waitlist to get early access when we launch.
                </p>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                {isSubmitted ? (
                  <div className="w-full max-w-md text-center py-4">
                    <p className="text-sm font-medium text-foreground">You're on the list.</p>
                    <p className="text-xs text-muted-foreground mt-1">We'll notify you when Bloxsmith is ready.</p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md space-y-3"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={isSubmitting}
                      aria-label="Email address"
                      className="w-full px-4 py-3 rounded-none bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-border disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      aria-label={
                        isSubmitting ? "Submitting" : "Join the waitlist"
                      }
                      className="w-full px-6 py-3 bg-foreground text-background rounded-none font-medium text-sm tracking-wider hover:bg-foreground/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Joining..." : "Join the waitlist"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
