"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free Trial",
    price: "Free",
    duration: "7 days",
    description: "Experience the full potential of BizContently",
    features: [
      "Full access to all core features",
      "Limited content generation",
      "Basic AI models",
      "Standard support",
      "1 user account",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Basic",
    price: "$29",
    duration: "per month",
    description: "Perfect for casual creators and beginners",
    features: [
      "10 blog posts per month",
      "20 social media posts",
      "Standard AI image generation",
      "Basic analytics",
      "Email support",
      "1 user account",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$79",
    duration: "per month",
    description: "Ideal for professional content creators",
    features: [
      "Unlimited blog posts",
      "Unlimited social media posts",
      "Priority access to new AI models",
      "Advanced analytics",
      "Priority support",
      "3 user accounts",
      "API access",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    duration: "custom plan",
    description: "Tailored solutions for large teams",
    features: [
      "Custom content limits",
      "White-labeling options",
      "Dedicated account manager",
      "Custom integrations",
      "24/7 priority support",
      "Unlimited user accounts",
      "Full API access",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const PricingTiers = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid gap-8 lg:grid-cols-4 md:grid-cols-2 mb-16"
    >
      {tiers.map((tier, index) => (
        <motion.div
          key={tier.name}
          variants={itemVariants}
          className={`relative rounded-2xl p-8 ${
            tier.highlighted
              ? "bg-purple-600 text-white shadow-xl"
              : "bg-white dark:bg-gray-800 shadow-lg"
          }`}
        >
          {tier.highlighted && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-purple-200 px-4 py-1 text-sm font-semibold text-purple-800">
              Most Popular
            </div>
          )}

          <div className="mb-6">
            <h3
              className={`text-2xl font-bold mb-2 ${
                tier.highlighted
                  ? "text-white"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {tier.name}
            </h3>
            <div className="mb-2">
              <span
                className={`text-4xl font-bold ${
                  tier.highlighted
                    ? "text-white"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {tier.price}
              </span>
              <span
                className={`text-sm ${
                  tier.highlighted
                    ? "text-purple-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                /{tier.duration}
              </span>
            </div>
            <p
              className={`text-sm ${
                tier.highlighted
                  ? "text-purple-100"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {tier.description}
            </p>
          </div>

          <ul className="mb-8 space-y-4">
            {tier.features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-center">
                <Check
                  className={`h-5 w-5 mr-2 flex-shrink-0 ${
                    tier.highlighted ? "text-purple-200" : "text-purple-500"
                  }`}
                />
                <span
                  className={`text-sm ${
                    tier.highlighted
                      ? "text-purple-100"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href={tier.name === "Enterprise" ? "/contact" : "/auth"}
            className={`block w-full rounded-lg px-4 py-2 text-center text-sm font-semibold transition-colors ${
              tier.highlighted
                ? "bg-white text-purple-600 hover:bg-purple-50"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {tier.cta}
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};
