import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const steps = [
  "Uploading Resume",
  "Extracting Resume Text",
  "Understanding Job Description",
  "Matching Skills",
  "Calculating ATS Score",
  "Generating AI Suggestions",
  "Preparing Dashboard",
];

const messages = [
  "Uploading your resume...",
  "Extracting text from the document...",
  "Understanding the job description...",
  "Comparing skills with job requirements...",
  "Calculating ATS compatibility...",
  "Generating personalized suggestions...",
  "Preparing your dashboard...",
];

export default function AnalysisModal({
  open,
  analysisComplete = false,
  error = "",
}) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      return;
    }

    if (analysisComplete || error) {
      return;
    }

    // Progress deliberately stops before 100%.
    // The last 5% belongs to the real API response.
    const interval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 2));
    }, 700);

    return () => clearInterval(interval);
  }, [open, analysisComplete, error]);

  const progress = useMemo(() => {
    if (error) return 100;
    if (analysisComplete) return 100;

    // Never show 100% while waiting for Gemini.
    return Math.min(95, ((currentStep + 1) / steps.length) * 100);
  }, [currentStep, analysisComplete, error]);

  const isComplete = analysisComplete && !error;
  const isError = Boolean(error);

  const visibleMessage = isError
    ? "Gemini is temporarily unavailable. Please try again."
    : isComplete
      ? "Analysis complete. Opening your results..."
      : messages[currentStep];


  // Decorative floating bubbles. Keep positions deterministic so they
  // remain stable between React renders.
  const bubbles = [
    { size: 7, left: "10%", top: "18%", delay: 0, duration: 4.2 },
    { size: 5, left: "22%", top: "76%", delay: 0.6, duration: 5.1 },
    { size: 8, left: "78%", top: "20%", delay: 1.1, duration: 4.6 },
    { size: 6, left: "88%", top: "68%", delay: 0.3, duration: 5.4 },
    { size: 4, left: "68%", top: "84%", delay: 1.5, duration: 4.9 },
    { size: 6, left: "34%", top: "12%", delay: 0.9, duration: 5.8 },
    { size: 4, left: "48%", top: "92%", delay: 1.8, duration: 4.4 },
    { size: 5, left: "93%", top: "42%", delay: 0.2, duration: 5.2 },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            {/* Floating bubbles */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-3xl">
              {bubbles.map((bubble, index) => (
                <motion.span
                  key={index}
                  className="absolute rounded-full bg-violet-400/40 shadow-[0_0_14px_rgba(139,92,246,0.35)] dark:bg-violet-300/30"
                  style={{
                    width: bubble.size,
                    height: bubble.size,
                    left: bubble.left,
                    top: bubble.top,
                  }}
                  animate={{
                    y: [0, -18, 0],
                    x: [0, 8, 0],
                    opacity: [0.15, 0.8, 0.15],
                    scale: [0.8, 1.25, 0.8],
                  }}
                  transition={{
                    duration: bubble.duration,
                    delay: bubble.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            <motion.div
              className={`absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-[100px] ${
                isError
                  ? "bg-red-500/20"
                  : isComplete
                    ? "bg-emerald-500/20"
                    : "bg-violet-500/25"
              }`}
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.35, 0.65, 0.35],
              }}
              transition={{ repeat: Infinity, duration: 3.5 }}
            />

            <div className="relative z-10 flex items-center gap-5 py-2">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                <motion.div
                  animate={{
                    scale: isComplete || isError ? 1 : [1, 1.2, 1],
                    opacity: isComplete || isError ? 0.4 : [0.3, 0.7, 0.3],
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`absolute h-16 w-16 rounded-full blur-xl ${
                    isError
                      ? "bg-red-500"
                      : isComplete
                        ? "bg-emerald-500"
                        : "bg-violet-500"
                  }`}
                />

                {!isComplete && !isError && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="absolute h-14 w-14 rounded-full border-2 border-violet-300/50"
                  />
                )}

                <div
                  className={`relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl ${
                    isError
                      ? "bg-gradient-to-br from-red-500 to-rose-600"
                      : isComplete
                        ? "bg-gradient-to-br from-emerald-500 to-green-600"
                        : "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600"
                  }`}
                >
                  {isError ? (
                    <AlertCircle className="h-6 w-6" />
                  ) : isComplete ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Sparkles className="h-6 w-6" />
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isError ? "Analysis Unavailable" : isComplete ? "Analysis Complete" : "AI Resume Analysis"}
                </h2>

                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  {isError
                    ? "Gemini could not complete the analysis right now."
                    : isComplete
                      ? "Your personalized ATS report is ready."
                      : "Our AI is carefully reviewing your resume..."}
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-10">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {isError ? "Request status" : "Progress"}
                </span>

                <span
                  className={`font-bold ${
                    isError
                      ? "text-red-600"
                      : isComplete
                        ? "text-emerald-600"
                        : "text-violet-600"
                  }`}
                >
                  {Math.round(progress)}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className={`relative h-full rounded-full ${
                    isError
                      ? "bg-gradient-to-r from-red-500 to-rose-500"
                      : isComplete
                        ? "bg-gradient-to-r from-emerald-500 to-green-500"
                        : "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600"
                  }`}
                >
                  {!isComplete && !isError && (
                    <motion.div
                      animate={{ x: ["-100%", "250%"] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 w-20 bg-white/30 blur-sm"
                    />
                  )}
                </motion.div>
              </div>
            </div>

            {!isError && (
              <div className="relative z-10 mt-10 space-y-4">
                {steps.map((step, index) => {
                  const completed = isComplete
                    ? index <= steps.length - 1
                    : index < currentStep;

                  const active = !isComplete && index === currentStep;

                  return (
                    <div key={step} className="flex items-center gap-3 py-0.5">
                      {completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : active ? (
                        <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                      )}

                      <span
                        className={`text-sm ${
                          completed || active
                            ? "font-medium text-slate-900 dark:text-white"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <motion.div
              key={`${currentStep}-${isComplete}-${isError}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative z-10 mt-7 rounded-2xl border p-4 ${
                isError
                  ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
                  : isComplete
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-900/20"
                    : "border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-900/20"
              }`}
            >
              <div className="flex items-center gap-3 py-0.5">
                {isError ? (
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                ) : isComplete ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                    className="shrink-0"
                  >
                    🧠
                  </motion.div>
                )}

                <p
                  className={`text-sm font-medium ${
                    isError
                      ? "text-red-700 dark:text-red-300"
                      : isComplete
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {visibleMessage}
                </p>
              </div>
            </motion.div>

            <p className="relative z-10 mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              {isError
                ? "You can close this window and start the analysis again."
                : isComplete
                  ? "Loading your personalized results..."
                  : "Please don't close this window while the analysis is running."}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}