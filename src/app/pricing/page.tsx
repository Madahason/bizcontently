import { PricingTiers } from "../components/pricing/PricingTiers";
import { PricingFAQ } from "../components/pricing/PricingFAQ";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 pt-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your content creation needs. Start with
            our free trial and scale as you grow.
          </p>
        </div>

        <PricingTiers />
        <PricingFAQ />
      </div>
    </main>
  );
}
