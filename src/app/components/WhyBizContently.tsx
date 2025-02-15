"use client";

import { motion } from "framer-motion";

const painPoints = [
  {
    pain: "Wasted hours on manual keyword research and scattered tools.",
    solution:
      "Our AI-powered platform centralizes everything, giving you real-time keyword insights at the click of a button.",
    icon: (
      <svg
        className="h-8 w-8 text-purple-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    pain: "Struggling to create engaging content that actually drives traffic.",
    solution:
      "Automatically generate high-quality blog posts, reels, and video scripts designed to rank and resonate.",
    icon: (
      <svg
        className="h-8 w-8 text-purple-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
    ),
  },
  {
    pain: "No time or energy left to manage multi-platform publishing.",
    solution:
      "Seamlessly publish across WordPress, Medium, YouTube, and more with just a few clicks.",
    icon: (
      <svg
        className="h-8 w-8 text-purple-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
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

export const WhyBizContently = () => {
  return (
    <section className="bg-white py-20 dark:bg-gray-900">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Why BizContently?
          </h2>
          <p className="mb-16 text-lg text-gray-600 dark:text-gray-400">
            Transform your content strategy with powerful AI-driven solutions
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-8 md:grid-cols-3"
        >
          {painPoints.map((point, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative rounded-2xl bg-purple-50 p-8 dark:bg-purple-900/20"
            >
              <div className="mb-4">{point.icon}</div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Problem
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {point.pain}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                  Solution
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {point.solution}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
