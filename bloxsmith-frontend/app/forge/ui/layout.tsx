import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UI Forge | Bloxsmith",
};

export default function ForgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex-1 min-h-0 w-full overflow-hidden">{children}</div>;
}
