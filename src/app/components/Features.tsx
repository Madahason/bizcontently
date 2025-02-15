"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Effortless Blog Posts That Pass AI Detection",
    description:
      "Generate outlines, finalize sections, and automatically add AI-created images that wow your readers—without the dreaded 'robotic' feel.",
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
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  {
    title: "Viral Video Insights at Your Fingertips",
    description:
      "Identify trending videos across platforms, extract key insights, and generate fresh scripts for short-form or long-form content.",
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
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: "Publish Everywhere in One Click",
    description:
      "Push your content to WordPress, Medium, Instagram, and more—all from a single dashboard.",
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
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
    ),
  },
  {
    title: "Stay Organized & In Control",
    description:
      "Easily manage all your generated content, media assets, and user preferences to keep your workflow smooth.",
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
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
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

export const Features = () => {
  return (
    <section className="bg-gray-50 py-20 dark:bg-gray-800">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Everything You Need to Supercharge Your Content Strategy
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Powerful features designed to help you create, manage, and
            distribute content effortlessly
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl dark:bg-gray-900"
            >
              <div className="mb-4 inline-block rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10 transition-all group-hover:ring-purple-500/20 dark:ring-white/10" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
