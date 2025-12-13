"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { User, Briefcase } from "lucide-react"
import { motion } from "framer-motion"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-slate-800">
              Create an account
            </h1>
            <p className="mt-2 text-slate-600">
              Join our community and choose your role
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Client */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col items-center p-8 text-center">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-blue-600/10 mb-6">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  Client
                </h2>
                <p className="text-slate-600 mb-6">
                  I want to post gigs and hire skilled freelancers for short-term tasks.
                </p>
                <div className="w-full">
                  <button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 font-semibold transition">
                    Sign up as Client
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Freelancer */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col items-center p-8 text-center">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-amber-500/10 mb-6">
                  <Briefcase className="h-8 w-8 text-amber-500" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  Freelancer
                </h2>
                <p className="text-slate-600 mb-6">
                  I want to find gigs, earn money, and offer my skills to clients.
                </p>
                <div className="w-full">
                  <button className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 py-2 font-semibold transition">
                    Sign up as Freelancer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-10 text-sm text-slate-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
