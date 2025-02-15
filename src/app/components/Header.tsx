"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";

export const Header = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Gradient overlay for better blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-white/70 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/70 backdrop-blur-sm" />

      <div className="container relative mx-auto max-w-7xl px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-14 w-48">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-cover"
                style={{
                  objectPosition: "50% 50%",
                }}
                priority
              />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/features"
              className="text-gray-800 hover:text-purple-600 dark:text-gray-200 dark:hover:text-purple-400"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-gray-800 hover:text-purple-600 dark:text-gray-200 dark:hover:text-purple-400"
            >
              Pricing
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-800 hover:text-purple-600 dark:text-gray-200 dark:hover:text-purple-400"
                >
                  Dashboard
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="rounded-full bg-gray-200 px-6 py-2 text-gray-800 shadow-sm hover:bg-gray-300 hover:shadow-md"
                >
                  Sign Out
                </motion.button>
              </>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/auth"
                  className="rounded-full bg-purple-600 px-6 py-2 text-white shadow-sm hover:bg-purple-700 hover:shadow-md dark:hover:bg-purple-500"
                >
                  Get Started
                </Link>
              </motion.div>
            )}
          </nav>

          {/* Mobile menu button - you can implement mobile menu functionality later */}
          <button className="md:hidden rounded-lg p-2 text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
