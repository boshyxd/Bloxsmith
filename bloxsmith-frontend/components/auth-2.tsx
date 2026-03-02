"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export function Auth2() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (isSignUp) {
      const { data, error: authError } = await getSupabase().auth.signUp({ email, password });
      if (authError) {
        setError(authError.message);
        setSubmitting(false);
        return;
      }
      if (data.session) {
        window.location.href = "/forge/ui";
      } else {
        setConfirmationSent(true);
        setSubmitting(false);
      }
    } else {
      const { error: authError } = await getSupabase().auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        setSubmitting(false);
        return;
      }
      window.location.href = "/forge/ui";
    }
  };

  const handleOAuth = async (provider: "discord" | "github") => {
    await getSupabase().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/forge/ui` },
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Column - Gradient Background with Logo & Tagline */}
      <div className="hidden lg:flex lg:w-1/2 p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full rounded-none p-12 flex flex-col justify-between relative overflow-hidden"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-bottom"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1623410439361-22ac19216577?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
              transform: "scale(1.2)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <a href="/" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-none bg-neutral-900 flex items-center justify-center">
                  <span className="text-xl font-bold text-amber-500">B</span>
                </div>
                <span className="text-2xl font-bold text-neutral-900">
                  Bloxsmith
                </span>
              </a>
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-neutral-900 leading-tight">
                The AI Forge
                <br />
                for Roblox
              </h2>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right Column - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Title */}
          {confirmationSent && (
            <div className="text-center space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Check your email
              </h1>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>
              </p>
              <button
                onClick={() => { setConfirmationSent(false); setIsSignUp(false); }}
                className="text-sm text-forge hover:text-forge-light font-medium transition-colors"
              >
                Back to sign in
              </button>
            </div>
          )}

          {!confirmationSent && (
            <>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
            {isSignUp ? "Sign up" : "Sign in"}
          </h1>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            {/* Discord Sign In */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              onClick={() => handleOAuth("discord")}
              className="w-full px-6 py-3 rounded-none border border-border bg-[#5865F2] text-white font-medium hover:bg-[#4752C4] transition-colors duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
              </svg>
              Sign in with Discord
            </motion.button>

            {/* GitHub Sign In */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              onClick={() => handleOAuth("github")}
              className="w-full px-6 py-3 rounded-none border border-border bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Sign in with GitHub
            </motion.button>
          </div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">
              or
            </span>
            <div className="flex-1 h-px bg-border" />
          </motion.div>

          {/* Email/Password Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Email Field */}
            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-4 py-3 rounded-none border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-forge focus:border-forge transition-all duration-200"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-4 py-3 pr-12 rounded-none border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-forge focus:border-forge transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 rounded-none bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors duration-200 disabled:opacity-50"
            >
              {submitting ? "..." : isSignUp ? "Sign up" : "Sign in"}
            </button>
          </motion.form>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-6 space-y-3 text-center"
          >
            <a
              href="#"
              className="block text-sm text-forge hover:text-forge-light font-medium transition-colors no-underline"
            >
              Forgot password?
            </a>
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "No account?"}{" "}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="text-forge hover:text-forge-light font-medium transition-colors"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Auth2;
