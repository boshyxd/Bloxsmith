"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";

interface DropdownItem {
  title: string;
  description: string;
  badge?: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  dropdown?: {
    title: string;
    items: DropdownItem[];
  };
}

export function Navigation7() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { balanceCents } = useCredits();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(
    null,
  );

  if (pathname.startsWith("/forge") || pathname.startsWith("/auth")) return null;

  const navItems: NavItem[] = [
    {
      label: "Tools",
      dropdown: {
        title: "FORGE TOOLS",
        items: [
          {
            title: "UI Forge",
            description:
              "Generate styled Roblox UIs from text descriptions with curated presets",
            href: "/forge/ui",
          },
          {
            title: "Studio Plugin",
            description:
              "One-click import and auto-publish to Roblox Studio",
            href: "/plugin",
          },
        ],
      },
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
    {
      label: "Community",
      dropdown: {
        title: "JOIN US",
        items: [
          {
            title: "Discord",
            description: "Chat with other Roblox developers using Bloxsmith",
            href: "#",
          },
          {
            title: "GitHub",
            description: "Open-source MCP server with 10K+ installs",
            href: "https://github.com/anthropics/robloxstudio-mcp",
          },
          {
            title: "DevForum",
            description: "Follow us on the Roblox Developer Forum",
            href: "#",
          },
        ],
      },
    },
  ];

  return (
    <>
      <nav className="w-full py-4 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between gap-8">
          {/* Left side: Logo + Nav Items */}
          <div className="flex items-center gap-2">
            {/* Logo */}
            <a
              href="/"
              className="flex items-center justify-center aspect-square h-8 bg-secondary rounded-none hover:bg-accent transition-colors"
              aria-label="Home"
            >
              <img src="/logos/bloxsmith-icon.svg" alt="Bloxsmith" className="h-5 w-5" />
            </a>

            {/* Nav Items */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.href && !item.dropdown ? (
                    <a
                      href={item.href}
                      className="flex items-center gap-1.5 px-3 h-8 bg-secondary hover:bg-accent rounded-none transition-colors text-sm tracking-tight font-medium text-foreground"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <button
                      className="flex items-center gap-1.5 px-3 h-8 bg-secondary hover:bg-accent rounded-none transition-colors text-sm tracking-tight font-medium text-foreground"
                      aria-expanded={activeDropdown === item.label}
                      aria-haspopup="true"
                    >
                      {item.label}
                    </button>
                  )}

                  {/* Dropdown */}
                  <AnimatePresence>
                    {activeDropdown === item.label && item.dropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{
                          duration: 0.2,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className="absolute top-full left-0 pt-2 z-50"
                      >
                        <div className="bg-card rounded-none border border-border py-2 min-w-[500px]">
                          <div className="text-xs font-medium text-muted-foreground tracking-wider my-4 px-4">
                            {item.dropdown.title}
                          </div>
                          <div className="grid grid-cols-2 gap-3 px-2">
                            {item.dropdown.items.map((dropdownItem, idx) => (
                              <motion.a
                                key={idx}
                                href={dropdownItem.href}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: idx * 0.03,
                                  ease: [0.4, 0, 0.2, 1],
                                }}
                                className="group p-3 rounded-none hover:bg-accent transition-colors"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-sm font-medium tracking-tight text-foreground group-hover:text-white transition-colors">
                                    {dropdownItem.title}
                                  </h3>
                                  {dropdownItem.badge && (
                                    <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-none">
                                      {dropdownItem.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {dropdownItem.description}
                                </p>
                              </motion.a>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Desktop Buttons */}
            {user ? (
              <a href="/profile" className="hidden md:block px-3 h-8 bg-secondary hover:bg-accent rounded-none text-sm font-medium tracking-tight text-foreground transition-colors leading-8">
                ${(balanceCents / 100).toFixed(2)} | Profile
              </a>
            ) : (
              <a href="/auth" className="hidden md:block px-3 h-8 bg-secondary hover:bg-accent rounded-none text-sm font-medium tracking-tight text-foreground transition-colors leading-8">
                Log in
              </a>
            )}
            <a
              href="/forge/ui"
              className="px-3 h-8 bg-foreground hover:bg-foreground/90 text-background rounded-none text-sm font-medium tracking-tight transition-colors leading-8"
            >
              {user ? "Open Forge" : "Start Free"}
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden px-3 h-8 bg-secondary hover:bg-accent rounded-none text-sm font-medium tracking-tight text-foreground transition-colors flex items-center gap-2"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-background md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between py-4 px-4">
              <div className="flex items-center justify-center aspect-square h-8 bg-secondary rounded-none">
                <img src="/logos/bloxsmith-icon.svg" alt="Bloxsmith" className="h-5 w-5" />
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setMobileExpandedItem(null);
                }}
                className="flex items-center gap-2 px-3 h-8 bg-secondary hover:bg-accent rounded-none text-sm font-medium text-foreground transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="overflow-y-auto h-[calc(100vh-240px)] p-4 sm:p-6">
              <nav className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    {item.href && !item.dropdown ? (
                      <a
                        href={item.href}
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          setMobileExpandedItem(null)
                        }}
                        className="w-full flex items-center px-4 py-3 bg-secondary hover:bg-accent rounded-none text-left transition-colors"
                      >
                        <span className="font-medium text-foreground">
                          {item.label}
                        </span>
                      </a>
                    ) : (
                      <button
                        onClick={() =>
                          setMobileExpandedItem(
                            mobileExpandedItem === item.label ? null : item.label,
                          )
                        }
                        className="w-full flex items-center justify-between px-4 py-3 bg-secondary hover:bg-accent rounded-none text-left transition-colors"
                      >
                        <span className="font-medium text-foreground">
                          {item.label}
                        </span>
                        <motion.div
                          animate={{
                            rotate: mobileExpandedItem === item.label ? 180 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                      </button>
                    )}

                    {/* Expandable Content */}
                    <AnimatePresence>
                      {mobileExpandedItem === item.label && item.dropdown && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 pb-1 space-y-1">
                            {item.dropdown.items.map((dropdownItem, idx) => (
                              <motion.a
                                key={idx}
                                href={dropdownItem.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: idx * 0.03,
                                }}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setMobileExpandedItem(null);
                                }}
                                className="block p-3 rounded-none hover:bg-accent transition-colors"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-sm font-medium text-foreground">
                                    {dropdownItem.title}
                                  </h3>
                                  {dropdownItem.badge && (
                                    <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-none">
                                      {dropdownItem.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {dropdownItem.description}
                                </p>
                              </motion.a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Mobile Action Buttons - Fixed at Bottom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 space-y-3 bg-background border-t border-border"
            >
              {user ? (
                <a href="/profile" className="w-full block px-4 py-3 bg-secondary hover:bg-accent rounded-none text-sm font-medium text-foreground transition-colors text-center">
                  ${(balanceCents / 100).toFixed(2)} | Profile
                </a>
              ) : (
                <a href="/auth" className="w-full block px-4 py-3 bg-secondary hover:bg-accent rounded-none text-sm font-medium text-foreground transition-colors text-center">
                  Log in
                </a>
              )}
              <a href="/forge/ui" className="w-full block px-4 py-3 bg-foreground hover:bg-foreground/90 text-background rounded-none text-sm font-medium transition-colors text-center">
                {user ? "Open Forge" : "Start Free"}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
