import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  History,
  Clock3,
  ArrowRight,
  Search,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { getAnalyses } from "@/services/resumeApi";
import { fadeUp } from "@/lib/animations";


function isThisWeek(dateValue) {
  if (!dateValue) return false;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const startOfWeek = new Date(now);

  // Monday as the first day of the week.
  const day = startOfWeek.getDay();
  const diff = day === 0 ? 6 : day - 1;

  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  return date >= startOfWeek;
}


export default function HistoryHeader() {
  const navigate = useNavigate();

  const [totalAnalyses, setTotalAnalyses] = useState(null);
  const [thisWeekAnalyses, setThisWeekAnalyses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        setLoading(true);

        const response = await getAnalyses(100);

        const analyses = Array.isArray(response?.analyses)
          ? response.analyses
          : [];

        if (!mounted) return;

        setTotalAnalyses(
          typeof response?.count === "number"
            ? response.count
            : analyses.length
        );

        setThisWeekAnalyses(
          analyses.filter((item) => isThisWeek(item?.created_at)).length
        );
      } catch (error) {
        console.error("Failed to load history stats:", error);

        if (mounted) {
          setTotalAnalyses(0);
          setThisWeekAnalyses(0);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);


  const handleSearchHistory = () => {
    // Focus the search field on HistoryList when available.
    const searchInput = document.getElementById("history-search");

    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    // Fallback if the search input is not mounted yet.
    navigate("/history");
  };


  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900 p-8 text-white shadow-2xl"
    >
      {/* Decorative Background */}
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
            <History className="h-4 w-4" />

            <span className="text-sm font-medium">
              Resume Analysis History
            </span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Analysis History
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Access every resume you've analyzed, compare ATS scores,
            revisit AI suggestions, and track your progress over time.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              onClick={() => navigate("/upload")}
              className="rounded-xl bg-white px-6 py-6 font-semibold text-slate-900 shadow-lg transition hover:scale-105 hover:bg-slate-100"
            >
              New Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleSearchHistory}
              className="rounded-xl border-white/30 bg-white/10 px-6 py-6 text-white backdrop-blur hover:bg-white/20"
            >
              <Search className="mr-2 h-4 w-4" />
              Search History
            </Button>
          </div>
        </div>

        {/* Right Stats Card */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-violet-500/20 p-3">
              <Clock3 className="h-6 w-6 text-violet-300" />
            </div>

            <div>
              <p className="text-sm text-slate-300">
                Total Analyses
              </p>

              <h2 className="mt-1 text-5xl font-extrabold">
                {loading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-white/80" />
                ) : (
                  totalAnalyses ?? 0
                )}
              </h2>
            </div>
          </div>

          {!loading && (
            <div className="mt-5 inline-flex rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-200">
              +{thisWeekAnalyses} this week
            </div>
          )}

          <p className="mt-4 text-sm text-slate-300">
            Keep analyzing your resumes to improve your ATS performance.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
