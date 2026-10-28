import { motion } from "framer-motion";
import { Bot, Sparkles, Lightbulb, ArrowUpRight, Zap } from "lucide-react";

export default function AISuggestions({
  summary,
  suggestions = [],
}) {
  const getPriority = (index) => {
    if (index === 0) {
      return {
        label: "HIGH",
        color: "from-red-500 to-rose-500",
        accent: "border-l-red-500",
      };
    }

    if (index === 1) {
      return {
        label: "MEDIUM",
        color: "from-amber-500 to-orange-500",
        accent: "border-l-amber-500",
      };
    }

    return {
      label: "LOW",
      color: "from-violet-500 to-indigo-500",
      accent: "border-l-violet-500",
    };
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-700 px-6 py-6 text-white sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <Bot className="h-6 w-6" />
            </div>

            <div>
              <div className="mb-0.5 flex items-center gap-2 text-xs font-medium text-violet-100">
                <Sparkles className="h-3.5 w-3.5" />
                AI Resume Coach
              </div>

              <h2 className="text-2xl font-bold">
                Personalized AI Suggestions
              </h2>

              <p className="mt-1 text-sm text-violet-100">
                Actionable recommendations to improve your resume.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15">
            Gemini AI
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        {/* Summary */}
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-800 dark:bg-violet-900/20">
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-500" />

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Summary
            </h3>
          </div>

          <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
            {summary || "No summary available."}
          </p>
        </div>

        {/* Suggestions */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Recommended Improvements
              </h3>
            </div>

            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {suggestions.length} {suggestions.length === 1 ? "tip" : "tips"}
            </span>
          </div>

          {suggestions.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {suggestions.map((item, index) => {
                const priority = getPriority(index);

                return (
                  <motion.div
                    key={`${index}-${item}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.06,
                    }}
                    whileHover={{ y: -2 }}
                    className={`group relative overflow-hidden rounded-2xl border border-slate-200 border-l-4 bg-slate-50 p-4 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-800/80 ${priority.accent}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${priority.color} text-sm font-bold text-white shadow-sm`}
                      >
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            Recommendation {index + 1}
                          </span>

                          <span
                            className={`shrink-0 rounded-full bg-gradient-to-r ${priority.color} px-2.5 py-1 text-[10px] font-bold tracking-wide text-white`}
                          >
                            {priority.label}
                          </span>
                        </div>

                        <p className="pr-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {item}
                        </p>
                      </div>

                      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-500" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              No AI suggestions available.
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}