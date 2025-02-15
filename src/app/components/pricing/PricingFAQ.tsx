"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What happens after my free trial ends?",
    answer:
      "After your 7-day free trial, you'll automatically switch to the Basic plan unless you choose a different tier. Don't worry - we'll notify you before the trial ends, and you can change or cancel your plan at any time.",
  },
  {
    question: "Can I switch between plans?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to the new features. When downgrading, the change will take effect at the start of your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. For Enterprise plans, we also support wire transfers and purchase orders.",
  },
  {
    question: "Is there a long-term contract?",
    answer:
      "No, all our plans are month-to-month with no long-term commitment required. Enterprise plans can be customized with annual billing options for additional savings.",
  },
  {
    question: "What's included in the Enterprise plan?",
    answer:
      "Enterprise plans are customized to your needs and can include features like white-labeling, custom integrations, dedicated account management, and flexible user limits. Contact our sales team to discuss your requirements.",
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

export const PricingFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Have questions? We're here to help.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        {faqs.map((faq, index) => (
          <motion.div key={index} variants={itemVariants} className="mb-4">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                />
              </div>
              {openIndex === index && (
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              )}
            </button>
          </motion.div>
        ))}
      </motion.div>

      <div className="text-center mt-12">
        <p className="text-gray-600 dark:text-gray-400">
          Still have questions?{" "}
          <a
            href="/contact"
            className="text-purple-600 hover:text-purple-500 font-medium"
          >
            Contact our team
          </a>
        </p>
      </div>
    </section>
  );
};
