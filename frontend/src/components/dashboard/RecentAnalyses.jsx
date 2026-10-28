import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getAnalyses } from "@/services/resumeApi";
import { fadeUp } from "@/lib/animations";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function extractRole(jobDescription) {
  const text = String(jobDescription || "").trim();

  if (!text) {
    return "Resume Analysis";
  }

  const rolePatterns = [
    /(?:looking for|seeking|hiring|position for|role for)\s+(?:a|an)?\s*([^.,\n]+)/i,
    /(?:job title|role|position)\s*[:\-]\s*([^.,\n]+)/i,
  ];

  for (const pattern of rolePatterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      return match[1].trim().slice(0, 60);
    }
  }

  return "Resume Analysis";
}

function normalizeScore(value) {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/* =========================================================
   SKELETON CARD
========================================================= */

function AnalysisSkeleton() {
  return (
    <div
      className="
        animate-pulse
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        dark:border-slate-700
        dark:bg-slate-800
      "
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-200 dark:bg-slate-700" />

          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-700" />

            <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-700" />

            <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="h-10 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ onAnalyze }) {
  return (
    <div
      className="
        mt-8
        rounded-2xl
        border
        border-dashed
        border-slate-300
        bg-slate-50
        p-10
        text-center
        dark:border-slate-700
        dark:bg-slate-800/60
      "
    >
      <div
        className="
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-violet-100
          text-violet-600
          dark:bg-violet-900/30
          dark:text-violet-400
        "
      >
        <FileText className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
        No analyses yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        Upload a resume and add a job description to create your first AI
        analysis report.
      </p>

      <button
        type="button"
        onClick={onAnalyze}
        className="
          mt-6
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-violet-600
          px-5
          py-2.5
          text-sm
          font-semibold
          text-white
          transition
          hover:bg-violet-700
          focus:outline-none
          focus:ring-2
          focus:ring-violet-500
          focus:ring-offset-2
          dark:focus:ring-offset-slate-900
        "
      >
        Analyze Resume
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* =========================================================
   ERROR STATE
========================================================= */

function ErrorState({ message, onRetry }) {
  return (
    <div
      className="
        mt-8
        rounded-2xl
        border
        border-red-200
        bg-red-50
        p-6
        dark:border-red-900/50
        dark:bg-red-950/20
      "
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-red-100
              text-red-600
              dark:bg-red-900/30
              dark:text-red-400
            "
          >
            <AlertCircle className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-300">
              Unable to load recent analyses
            </h3>

            <p className="mt-1 text-sm leading-5 text-red-700 dark:text-red-400">
              {message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRetry}
          className="
            inline-flex
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-red-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-red-700
            transition
            hover:bg-red-50
            focus:outline-none
            focus:ring-2
            focus:ring-red-500
            dark:border-red-900/50
            dark:bg-red-950/30
            dark:text-red-300
            dark:hover:bg-red-950/50
          "
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RecentAnalyses() {
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD RECENT ANALYSES
  ======================================================= */

  const loadRecentAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAnalyses(5);

      const items = Array.isArray(response?.analyses)
        ? response.analyses
        : [];

      setAnalyses(items);
    } catch (err) {
      console.error(
        "Failed to load recent analyses:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAnalyses(5);

        if (!mounted) {
          return;
        }

        const items = Array.isArray(response?.analyses)
          ? response.analyses
          : [];

        setAnalyses(items);
      } catch (err) {
        console.error(
          "Failed to load recent analyses:",
          err
        );

        if (mounted) {
          setError(
            err?.response?.data?.detail ||
              err?.message ||
              "Please check your connection and try again."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     VIEW REPORT
  ======================================================= */

  const handleViewReport = (item) => {
    if (!item?.id) {
      return;
    }

    navigate("/results", {
      state: {
        analysis: {
          id: item.id,
          analysis_id: item.id,
          ats_score: normalizeScore(item?.ats_score),
          match_score: normalizeScore(item?.match_score),
          breakdown: item?.breakdown || {},
          match_breakdown: item?.match_breakdown || {},
          summary: item?.summary || "",
          strengths: Array.isArray(item?.strengths)
            ? item.strengths
            : [],
          missing_skills: Array.isArray(item?.missing_skills)
            ? item.missing_skills
            : [],
          weaknesses: Array.isArray(item?.weaknesses)
            ? item.weaknesses
            : [],
          suggestions: Array.isArray(item?.suggestions)
            ? item.suggestions
            : [],
        },

        analysisId: item.id,
        resumeId: item?.resume_id || null,
        resumeFile: null,
        fromHistory: true,
      },
    });
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <motion.div variants={fadeUp}>
      <section
        className="
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          transition-all
          duration-300
          sm:p-6
          lg:p-8
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              className="
                text-2xl
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              Recent Analyses
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
                sm:text-base
                dark:text-slate-400
              "
            >
              Review your latest AI resume analysis reports.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/history")}
            className="
              group
              inline-flex
              w-fit
              items-center
              gap-2
              text-sm
              font-semibold
              text-violet-600
              transition
              hover:text-violet-700
              focus:outline-none
              focus:ring-2
              focus:ring-violet-500
              focus:ring-offset-4
              dark:text-violet-400
              dark:hover:text-violet-300
              dark:focus:ring-offset-slate-900
            "
          >
            View All

            <ArrowRight
              className="
                h-4
                w-4
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
            />
          </button>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="mt-8 space-y-4">
            <AnalysisSkeleton />
            <AnalysisSkeleton />
            <AnalysisSkeleton />
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <ErrorState
            message={error}
            onRetry={loadRecentAnalyses}
          />
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading && !error && analyses.length === 0 && (
          <EmptyState
            onAnalyze={() => navigate("/upload")}
          />
        )}

        {/* =================================================
            ANALYSIS LIST
        ================================================= */}

        {!loading && !error && analyses.length > 0 && (
          <div className="mt-8 space-y-4">
            {analyses.map((item, index) => {
              const resume = item?.resumes || {};

              const role = extractRole(
                item?.job_description
              );

              const atsScore = normalizeScore(
                item?.ats_score
              );

              const matchScore = normalizeScore(
                item?.match_score
              );

              return (
                <motion.article
                  key={
                    item?.id ||
                    `${item?.resume_id || "analysis"}-${index}`
                  }
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.25,
                    delay: index * 0.04,
                  }}
                  whileHover={{
                    y: -3,
                  }}
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    transition-all
                    duration-300
                    hover:border-violet-300
                    hover:shadow-lg
                    sm:p-6
                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:hover:border-violet-500
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-5
                      lg:flex-row
                      lg:items-center
                      lg:justify-between
                    "
                  >
                    {/* =====================================
                        LEFT
                    ====================================== */}

                    <div className="flex min-w-0 items-start gap-4">
                      <div
                        className="
                          flex
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-violet-100
                          dark:bg-violet-900/30
                        "
                      >
                        <FileText
                          className="
                            h-6
                            w-6
                            text-violet-600
                            dark:text-violet-400
                          "
                        />
                      </div>

                      <div className="min-w-0">
                        <h3
                          className="
                            truncate
                            text-base
                            font-bold
                            text-slate-900
                            sm:text-lg
                            dark:text-white
                          "
                          title={role}
                        >
                          {role}
                        </h3>

                        <p
                          className="
                            mt-1
                            max-w-xl
                            truncate
                            text-sm
                            text-slate-500
                            dark:text-slate-400
                          "
                          title={
                            resume?.filename ||
                            "Resume"
                          }
                        >
                          {resume?.filename ||
                            "Resume"}
                        </p>

                        <div
                          className="
                            mt-2
                            flex
                            flex-wrap
                            items-center
                            gap-2
                            text-xs
                            text-slate-500
                            sm:gap-4
                            sm:text-sm
                            dark:text-slate-400
                          "
                        >
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4 shrink-0" />
                            {formatDate(
                              item?.created_at
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* =====================================
                        RIGHT
                    ====================================== */}

                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                        sm:gap-3
                        lg:justify-end
                      "
                    >
                      <span
                        className="
                          rounded-full
                          bg-green-100
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          text-green-700
                          sm:px-4
                          sm:text-sm
                          dark:bg-green-900/30
                          dark:text-green-300
                        "
                      >
                        ATS {atsScore}%
                      </span>

                      <span
                        className="
                          rounded-full
                          bg-violet-100
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          text-violet-700
                          sm:px-4
                          sm:text-sm
                          dark:bg-violet-900/30
                          dark:text-violet-300
                        "
                      >
                        Match {matchScore}%
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleViewReport(item)
                        }
                        disabled={!item?.id}
                        className="
                          group
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-violet-600
                          px-4
                          py-2.5
                          text-xs
                          font-semibold
                          text-white
                          transition-all
                          duration-300
                          hover:bg-violet-700
                          focus:outline-none
                          focus:ring-2
                          focus:ring-violet-500
                          focus:ring-offset-2
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                          sm:px-5
                          sm:text-sm
                          dark:focus:ring-offset-slate-800
                        "
                      >
                        <Eye className="h-4 w-4" />

                        View Report

                        <ArrowRight
                          className="
                            h-4
                            w-4
                            transition-transform
                            duration-200
                            group-hover:translate-x-1
                          "
                        />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
    </motion.div>
  );
}