import { Navigation7 } from "@/components/navigation-7";
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
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <Navigation7 />
      <Hero7 />
      <SocialProof7 />
      <HowItWorks3 />
      <Comparison1 />
      <Stats8 />
      <Pricing1 />
      <Download3 />
      <Footer2 />
    </main>
  );
}
