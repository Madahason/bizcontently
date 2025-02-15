"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export const CTASection = () => {
  return (
    <section className="relative overflow-hidden bg-purple-600 py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-700/30 blur-3xl" />
      </div>

      <div className="relative container mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Ready to Transform Your Content Strategy?
            </h2>
            <p className="mb-8 text-lg text-purple-100">
              Be among the first to access BizContently and experience
              streamlined, AI-powered content creation. Get notified when we
              launch!
            </p>

            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-medium text-purple-600 shadow-lg transition-colors hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
                >
                  Get started for free
                  <svg
                    className="ml-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </motion.div>

              <p className="text-sm text-purple-100">
                Limited spots available • No credit card required
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
