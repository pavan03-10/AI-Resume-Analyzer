import { motion } from "framer-motion";
import {
  Upload,
  History,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { fadeUp } from "@/lib/animations";

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <motion.div variants={fadeUp}>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
            <Sparkles className="h-4 w-4" />
            Quick Access
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Jump into your most common tasks with a single click.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Resume */}
          <motion.button
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/upload")}
            className="group flex items-center justify-between rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-6 text-left text-white shadow-lg transition-all duration-300 hover:shadow-2xl"
          >
            <div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Upload className="h-7 w-7" />
              </div>

              <h3 className="text-2xl font-bold">
                Upload Resume
              </h3>

              <p className="mt-2 max-w-xs text-violet-100">
                Upload a resume and receive an AI-powered ATS analysis in seconds.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                Analyze Now
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </motion.button>

          {/* History */}
          <motion.button
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/history")}
            className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-6 text-left shadow-sm transition-all duration-300 hover:border-violet-300 hover:bg-white hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-violet-500 dark:hover:bg-slate-800"
          >
            <div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-700">
                <History className="h-7 w-7 text-slate-700 dark:text-slate-300" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                View History
              </h3>

              <p className="mt-2 max-w-xs text-slate-500 dark:text-slate-400">
                Review previous resume analyses and compare your improvements.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
                Open History
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}