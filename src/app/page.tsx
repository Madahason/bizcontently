import { HeroSection } from "./components/HeroSection";
import { WhyBizContently } from "./components/WhyBizContently";
import { Features } from "./components/Features";
import { CTASection } from "./components/CTASection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <HeroSection />
      <WhyBizContently />
      <Features />
      <CTASection />
    </main>
  );
}
