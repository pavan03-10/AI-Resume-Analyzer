import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  FileText,
  SearchCheck,
  BadgeCheck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const analysisSteps = [
  {
    icon: FileText,
    title: "Parsing Resume",
  },
  {
    icon: SearchCheck,
    title: "Extracting Skills",
  },
  {
    icon: Brain,
    title: "Matching Job Description",
  },
  {
    icon: BadgeCheck,
    title: "Calculating ATS Score",
  },
];

export default function AnalysisLoader() {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= analysisSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 750);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  const remaining = Math.max(0, Math.ceil((100 - progress) / 33));

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-2xl"
      >
        {/* Animated AI Icon */}
        <div className="flex justify-center">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.08, 1],
            }}
            transition={{
              rotate: {
                repeat: Infinity,
                duration: 8,
                ease: "linear",
              },
              scale: {
                repeat: Infinity,
                duration: 2,
              },
            }}
            className="rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-5 shadow-xl"
          >
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>
        </div>

        <h2 className="mt-8 text-center text-3xl font-bold text-slate-900">
          AI is Analyzing Your Resume
        </h2>

        <p className="mt-3 text-center text-slate-500">
          Comparing your resume against the job description and calculating your
          ATS score.
        </p>

        {/* Progress */}
        <div className="mt-10">
          <div className="mb-3 flex justify-between">
            <span className="text-sm font-medium text-slate-500">
              Analysis Progress
            </span>

            <span className="font-bold text-violet-600">
              {progress}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
            />
          </div>

          <p className="mt-3 text-center text-sm text-slate-500">
            Estimated time remaining: {remaining}s
          </p>
        </div>

        {/* Steps */}
        <div className="mt-10 space-y-4">
          {analysisSteps.map((step, index) => {
            const Icon = step.icon;

            const completed = index < activeStep;
            const active = index === activeStep;

            return (
              <motion.div
                key={step.title}
                animate={
                  active
                    ? {
                        scale: [1, 1.02, 1],
                      }
                    : {}
                }
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                }}
                className={`flex items-center gap-4 rounded-2xl border p-4 transition-all
                  ${
                    active
                      ? "border-violet-200 bg-violet-50"
                      : completed
                      ? "border-green-200 bg-green-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
              >
                <div
                  className={`rounded-xl p-3
                  ${
                    completed
                      ? "bg-green-100"
                      : active
                      ? "bg-violet-100"
                      : "bg-slate-200"
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Icon
                      className={`h-5 w-5 ${
                        active ? "text-violet-600" : "text-slate-500"
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {step.title}
                  </p>
                </div>

                {completed && (
                  <span className="font-semibold text-green-600">
                    Done
                  </span>
                )}

                {active && (
                  <span className="font-semibold text-violet-600">
                    Processing...
                  </span>
                )}

                {!completed && !active && (
                  <span className="text-slate-400">
                    Waiting
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}