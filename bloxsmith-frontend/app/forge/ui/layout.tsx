import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UI Forge | Bloxsmith",
};

export default function ForgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-screen w-screen overflow-hidden">{children}</div>;
}
