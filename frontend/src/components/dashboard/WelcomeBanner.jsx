import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { getAnalyses } from "@/services/resumeApi";
import { fadeUp } from "@/lib/animations";


export default function WelcomeBanner() {
  const navigate = useNavigate();

  const [averageATS, setAverageATS] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadAverageATS = async () => {
      try {
        setLoading(true);

        const response = await getAnalyses(100);

        const analyses = Array.isArray(response?.analyses)
          ? response.analyses
          : [];

        const scores = analyses
          .map((item) => Number(item?.ats_score))
          .filter(Number.isFinite);

        const average =
          scores.length > 0
            ? Math.round(
                scores.reduce((sum, score) => sum + score, 0) /
                  scores.length
              )
            : 0;

        if (mounted) {
          setAverageATS(average);
        }
      } catch (error) {
        console.error(
          "Failed to load welcome banner statistics:",
          error
        );

        if (mounted) {
          setAverageATS(0);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAverageATS();

    return () => {
      mounted = false;
    };
  }, []);


  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-2xl"
    >
      {/* Decorative Background */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />

      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
            <Sparkles className="h-4 w-4" />

            <span className="text-sm font-medium">
              AI Resume Analyzer
            </span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Welcome back,
            <br />

            <span className="text-violet-100">
              Pavan 👋
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-violet-100">
            Track your resume performance, improve your ATS score,
            and receive AI-powered insights to maximize your interview
            opportunities.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              type="button"
              onClick={() => navigate("/upload")}
              className="rounded-xl bg-white px-6 py-6 font-semibold text-violet-700 shadow-lg transition hover:scale-105 hover:bg-slate-100"
            >
              Analyze Resume

              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/history")}
              className="rounded-xl border-white/30 bg-white/10 px-6 py-6 text-white backdrop-blur hover:bg-white/20"
            >
              View History
            </Button>
          </div>
        </div>

        {/* Right Stats Card */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 text-violet-100">
            <TrendingUp className="h-5 w-5" />

            <span className="text-sm">
              Average ATS Score
            </span>
          </div>

          <div className="mt-4 flex min-h-20 items-center">
            {loading ? (
              <Loader2 className="h-10 w-10 animate-spin text-white/80" />
            ) : (
              <h2 className="text-6xl font-extrabold">
                {averageATS}%
              </h2>
            )}
          </div>

          <div className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-violet-100">
            Live from your analyses
          </div>

          <p className="mt-4 text-sm text-violet-100">
            Your average ATS score is calculated from your saved resume analyses.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
