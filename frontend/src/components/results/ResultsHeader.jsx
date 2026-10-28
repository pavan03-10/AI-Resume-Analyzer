import { motion } from "framer-motion";
import {
  CheckCircle2,
  Sparkles,
  Download,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { fadeUp } from "@/lib/animations";

export default function ResultsHeader({
  atsScore,
  matchScore,
}) {
  const navigate = useNavigate();

  const getStatus = () => {
    if (matchScore >= 90) return "Excellent Match";
    if (matchScore >= 75) return "Strong Match";
    if (matchScore >= 60) return "Good Match";
    return "Needs Improvement";
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-violet-50 to-indigo-50 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950"
    >
      <div className="flex flex-col gap-10 p-8 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}
        <div className="flex items-start gap-5">

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>

          <div>

            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Resume Analysis Complete
            </h1>

            <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-300">
              Your resume has been successfully analyzed using AI.
              Review your ATS score, resume match, and personalized
              recommendations below.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">

              <div className="rounded-xl bg-violet-100 px-5 py-3 dark:bg-violet-900/30">
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  ATS Score
                </p>

                <h3 className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                  {atsScore}%
                </h3>
              </div>

              <div className="rounded-xl bg-pink-100 px-5 py-3 dark:bg-pink-900/30">
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Resume Match
                </p>

                <h3 className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {matchScore}%
                </h3>
              </div>

            </div>

            <div className="mt-8 flex flex-wrap gap-4">

              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
              >
                <RotateCcw className="h-5 w-5" />
                Analyze Another
              </button>

              <button
                className="flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Download className="h-5 w-5" />
                Download PDF
              </button>

            </div>

          </div>

        </div>

        {/* Right */}
        <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 px-10 py-8 text-center text-white shadow-xl">

          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6" />

            <span className="text-lg font-medium uppercase tracking-wide">
              Match Score
            </span>
          </div>

          <h2 className="mt-4 text-7xl font-bold">
            {matchScore}%
          </h2>

          <p className="mt-3 text-lg opacity-95">
            {getStatus()}
          </p>

        </div>

      </div>
    </motion.div>
  );
}