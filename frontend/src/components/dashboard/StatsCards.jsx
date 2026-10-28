import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  Target,
  Sparkles,
  TrendingUp,
  Loader2,
} from "lucide-react";

import { getAnalyses } from "@/services/resumeApi";
import { fadeUp } from "@/lib/animations";


const icons = {
  "Average ATS": BarChart3,
  Analyses: FileText,
  "Match Rate": Target,
  "AI Rating": Sparkles,
};


const colors = {
  violet: {
    bg: "bg-violet-100 dark:bg-violet-900/30",
    text: "text-violet-600 dark:text-violet-400",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-600 dark:text-green-400",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-600 dark:text-orange-400",
  },
};


function calculateStats(analyses) {
  const items = Array.isArray(analyses) ? analyses : [];

  if (items.length === 0) {
    return {
      averageATS: 0,
      totalAnalyses: 0,
      matchRate: 0,
      aiRating: "—",
    };
  }

  const atsScores = items
    .map((item) => Number(item?.ats_score))
    .filter(Number.isFinite);

  const matchScores = items
    .map((item) => Number(item?.match_score))
    .filter(Number.isFinite);

  const averageATS =
    atsScores.length > 0
      ? Math.round(
          atsScores.reduce((sum, score) => sum + score, 0) /
            atsScores.length
        )
      : 0;

  const matchRate =
    matchScores.length > 0
      ? Math.round(
          matchScores.reduce((sum, score) => sum + score, 0) /
            matchScores.length
        )
      : 0;

  // A neutral label derived from the average ATS score.
  let aiRating = "Needs Work";

  if (averageATS >= 90) {
    aiRating = "Excellent";
  } else if (averageATS >= 80) {
    aiRating = "Good";
  } else if (averageATS >= 70) {
    aiRating = "Average";
  }

  return {
    averageATS,
    totalAnalyses: items.length,
    matchRate,
    aiRating,
  };
}


export default function StatsCards() {
  const [stats, setStats] = useState({
    averageATS: 0,
    totalAnalyses: 0,
    matchRate: 0,
    aiRating: "—",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        setLoading(true);

        const response = await getAnalyses(100);

        if (!mounted) return;

        setStats(calculateStats(response?.analyses));
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);

        if (mounted) {
          setStats({
            averageATS: 0,
            totalAnalyses: 0,
            matchRate: 0,
            aiRating: "—",
          });
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


  const items = [
    {
      title: "Average ATS",
      value: `${stats.averageATS}`,
      color: "violet",
    },
    {
      title: "Analyses",
      value: `${stats.totalAnalyses}`,
      color: "blue",
    },
    {
      title: "Match Rate",
      value: `${stats.matchRate}%`,
      color: "green",
    },
    {
      title: "AI Rating",
      value: stats.aiRating,
      color: "orange",
    },
  ];


  return (
    <motion.div
      variants={fadeUp}
      className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
    >
      {items.map((item) => {
        const Icon = icons[item.title];
        const color = colors[item.color];

        return (
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.25 }}
            key={item.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className={`rounded-2xl p-3 ${color.bg}`}>
                <Icon className={`h-6 w-6 ${color.text}`} />
              </div>

              <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <TrendingUp className="h-3.5 w-3.5" />
                Live
              </div>
            </div>

            {/* Value */}
            <div className="mt-6 flex min-h-12 items-center">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              ) : (
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {item.value}
                </h2>
              )}
            </div>

            {/* Label */}
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {item.title}
            </p>

            {/* Footer */}
            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Based on your saved analyses
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
