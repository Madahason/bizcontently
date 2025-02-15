"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] w-full bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 dark:from-purple-900 dark:via-purple-800 dark:to-purple-900 pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-300/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl" />
      </div>

      {/* Content container */}
      <div className="container relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Reclaim Your Time and{" "}
            <span className="text-purple-600 dark:text-purple-400">
              Transform Your Reach
            </span>{" "}
            with BizContently
          </h1>

          <p className="mb-8 text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
            All-in-one AI-powered content creation and distribution—so you can
            focus on what matters most: growing your business.
          </p>

          <p className="mb-12 text-base text-gray-500 dark:text-gray-400">
            Say goodbye to content overwhelm—hello to effortless growth.
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-purple-600 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 dark:hover:bg-purple-500"
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
        </motion.div>
      </div>
    </section>
  );
};
