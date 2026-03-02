"use client";

import { Check } from "lucide-react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

const MovingBorder = ({
  children,
  duration = 3000,
  rx,
  ry,
}: {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
}) => {
  const pathRef = useRef<SVGRectElement | null>(null);
  const progress = useMotionValue<number>(0);

  useAnimationFrame((time: number) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).x,
  );
  const y = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).y,
  );

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
        }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default function Pricing1() {
  const { user } = useAuth();

  return (
    <section id="pricing" className="relative w-full bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-3xl tracking-tight font-medium text-foreground leading-tight mb-2">
            Pay as you go
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            No subscriptions, no tiers. Just reload and build.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative overflow-hidden p-0.5 rounded-none">
            <div className="absolute inset-0">
              <MovingBorder duration={5000} rx="0" ry="0">
                <div className="h-48 w-48 bg-[radial-gradient(#ffffff_15%,transparent_80%)] opacity-[0.5]" />
              </MovingBorder>
            </div>
            <div className="relative bg-background border border-border rounded-none p-6 sm:p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                  <span className="text-secondary-foreground text-sm sm:text-base">
                    3 free generations to start
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                  <div className="text-secondary-foreground text-sm sm:text-base">
                    <span className="font-medium text-foreground">Spark</span> $0.05
                    <span className="mx-1.5 text-muted-foreground">·</span>
                    <span className="font-medium text-foreground">Forge</span> $0.25
                    <span className="mx-1.5 text-muted-foreground">·</span>
                    <span className="font-medium text-foreground">Anvil</span> $0.50
                    <span className="block text-muted-foreground text-xs mt-0.5">per frame (preset styles)</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                  <div className="text-secondary-foreground text-sm sm:text-base">
                    <span className="font-medium text-foreground">Adaptive</span> — token-based pricing
                    <span className="block text-muted-foreground text-xs mt-0.5">
                      <span className="font-medium text-foreground/70">Spark</span> $0.39/M
                      <span className="mx-1 text-muted-foreground">·</span>
                      <span className="font-medium text-foreground/70">Forge</span> $14/M
                      <span className="mx-1 text-muted-foreground">·</span>
                      <span className="font-medium text-foreground/70">Anvil</span> $90/M tokens
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                  <span className="text-secondary-foreground text-sm sm:text-base">
                    Reload $5 / $10 / $25 anytime
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                  <span className="text-secondary-foreground text-sm sm:text-base">
                    Full access to UI Forge
                  </span>
                </div>
              </div>

              <a
                href={user ? "/profile" : "/forge/ui"}
                className="block w-full px-8 py-3.5 rounded-none bg-foreground text-background font-medium text-sm text-center hover:bg-foreground/90 transition-colors duration-200"
              >
                {user ? "Add Credits" : "Start Free"}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
