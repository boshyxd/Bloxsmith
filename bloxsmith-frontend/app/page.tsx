import { Hero7 } from "@/components/hero-7";
import { SocialProof7 } from "@/components/social-proof-7";
import { HowItWorks3 } from "@/components/how-it-works-3";
import Comparison1 from "@/components/comparison-1";
import Stats8 from "@/components/stats-8";
import Pricing1 from "@/components/pricing-1";
import { Download3 } from "@/components/download-3";
import Footer2 from "@/components/footer-2";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero7 />
      <div className="border-t border-border" />
      <SocialProof7 />
      <div className="border-t border-border" />
      <HowItWorks3 />
      <div className="border-t border-border" />
      <Comparison1 />
      <div className="border-t border-border" />
      <Stats8 />
      <div className="border-t border-border" />
      <Pricing1 />
      <div className="border-t border-border" />
      <Download3 />
      <div className="border-t border-border" />
      <Footer2 />
    </main>
  );
}
