import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  RotateCcw,
  FileSearch,
  Eye,
  Download,
  Loader2,
} from "lucide-react";

import AIAnalysisOverview from "@/components/results/AIAnalysisOverview";
import SkillsComparison from "@/components/results/SkillsComparison";
import AISuggestions from "@/components/results/AISuggestions";
import StrengthWeakness from "@/components/results/StrengthWeakness";

const ResumePreviewModal = lazy(
  () => import("@/components/results/ResumePreviewModal")
);

import {
  getAnalysisById,
  getAnalyses,
  getResumeSignedUrl,
} from "@/services/resumeApi";

import { generatePDF } from "@/utils/generatePDF";
import { staggerContainer } from "@/lib/animations";

const getDetailMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail.trim();
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => item?.msg || item)
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  if (
    error?.code === "ERR_NETWORK" ||
    error?.message === "Network Error"
  ) {
    return "Unable to connect to the server. Please check your connection and try again.";
  }

  return error?.message || fallback;
};

const getPossibleAnalysisIds = (location, analysis) => {
  return [
    new URLSearchParams(location.search).get("id"),
    location.state?.analysisId,
    location.state?.analysis?.analysisId,
    location.state?.analysis?.analysis_id,
    location.state?.analysis?.id,
    analysis?.analysisId,
    analysis?.analysis_id,
    analysis?.id,
  ].filter(Boolean);
};

const normalizeForComparison = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeForComparison);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeForComparison(value[key]);
        return result;
      }, {});
  }

  return value;
};

const analysesMatch = (candidate, currentAnalysis) => {
  if (!candidate || !currentAnalysis) {
    return false;
  }

  const candidateAnalysis = candidate.analysis || candidate;

  if (!candidateAnalysis) {
    return false;
  }

  // Compare AI-generated fields rather than relying on filename or score alone.
  const fields = [
    "ats_score",
    "match_score",
    "summary",
    "strengths",
    "missing_skills",
    "weaknesses",
    "suggestions",
    "breakdown",
    "match_breakdown",
  ];

  return fields.every((field) => {
    const currentValue = currentAnalysis?.[field];
    const candidateValue = candidateAnalysis?.[field];

    if (
      currentValue === undefined &&
      candidateValue === undefined
    ) {
      return true;
    }

    return (
      JSON.stringify(normalizeForComparison(currentValue)) ===
      JSON.stringify(normalizeForComparison(candidateValue))
    );
  });
};

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const analysisFromState = location.state?.analysis || null;
  const resumeFile = location.state?.resumeFile || null;

  const [analysis, setAnalysis] = useState(analysisFromState);

  const [resolvedAnalysisId, setResolvedAnalysisId] = useState(() => {
    const possibleIds = getPossibleAnalysisIds(
      location,
      analysisFromState
    );

    return possibleIds[0] || null;
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(!analysisFromState);
  const [error, setError] = useState("");
  const [reanalyzing, setReanalyzing] = useState(false);

  /*
   * Resolve the analysis ID from every place it may exist
   * in the current navigation state.
   */
  const analysisId = useMemo(() => {
    const possibleIds = getPossibleAnalysisIds(
      location,
      analysis
    );

    return resolvedAnalysisId || possibleIds[0] || null;
  }, [location, analysis, resolvedAnalysisId]);

  useEffect(() => {
    let mounted = true;

    const loadAnalysis = async () => {
      /*
       * If an analysis was already passed through router state,
       * display it immediately.
       */
      if (analysisFromState) {
        if (mounted) {
          setAnalysis(analysisFromState);
          setIsLoading(false);
          setError("");
        }

        /*
         * If the ID was not passed with the analysis,
         * attempt to recover it from saved analyses.
         */
        const directIds = getPossibleAnalysisIds(
          location,
          analysisFromState
        );

        if (directIds.length > 0) {
          if (mounted) {
            setResolvedAnalysisId(directIds[0]);
          }

          return;
        }

        try {
          const savedAnalyses = await getAnalyses(100);

          const rows = Array.isArray(savedAnalyses)
            ? savedAnalyses
            : Array.isArray(savedAnalyses?.analyses)
              ? savedAnalyses.analyses
              : Array.isArray(savedAnalyses?.data)
                ? savedAnalyses.data
                : [];

          /*
           * Find the exact saved analysis by comparing
           * the AI-generated fields.
           */
          const matchingAnalysis = rows.find((item) =>
            analysesMatch(item, analysisFromState)
          );

          if (mounted && matchingAnalysis) {
            const recoveredId =
              matchingAnalysis.id ||
              matchingAnalysis.analysisId ||
              matchingAnalysis.analysis_id;

            if (recoveredId) {
              setResolvedAnalysisId(recoveredId);
            }
          }
        } catch (lookupError) {
          /*
           * This fallback lookup is only for recovering
           * the missing ID. It should not prevent the
           * already-loaded Results page from working.
           */
          console.error(
            "Unable to recover analysis ID:",
            lookupError
          );
        }

        return;
      }

      /*
       * If there is no analysis in router state, we need
       * an ID from the URL or state to load the saved report.
       */
      const ids = getPossibleAnalysisIds(location, null);
      const id = ids[0] || null;

      if (!id) {
        if (mounted) {
          setAnalysis(null);
          setIsLoading(false);
          setError("");
        }

        return;
      }

      if (mounted) {
        setIsLoading(true);
        setError("");
      }

      try {
        const response = await getAnalysisById(id);

        if (!response) {
          throw new Error(
            "The requested analysis could not be found."
          );
        }

        /*
         * Backend may return either:
         * { analysis: {...} }
         * or the analysis record directly.
         */
        const loadedAnalysis = response.analysis || response;

        const loadedId =
          response.analysis_id ||
          response.analysisId ||
          response.id ||
          loadedAnalysis?.analysis_id ||
          loadedAnalysis?.analysisId ||
          loadedAnalysis?.id ||
          id;

        if (mounted) {
          setAnalysis(loadedAnalysis);
          setResolvedAnalysisId(loadedId);
          setIsLoading(false);
        }
      } catch (loadError) {
        console.error(
          "Failed to load saved analysis:",
          loadError
        );

        if (mounted) {
          setError(
            getDetailMessage(
              loadError,
              "Unable to load this saved analysis. Please try again."
            )
          );

          setIsLoading(false);
        }
      }
    };

    loadAnalysis();

    return () => {
      mounted = false;
    };
  }, [
    analysisFromState,
    location.search,
    location.state,
  ]);

  const handleReanalyze = async () => {
    if (reanalyzing) {
      return;
    }

    /*
     * Re-check every possible ID immediately before
     * starting the operation.
     */
    const possibleIds = getPossibleAnalysisIds(
      location,
      analysis
    );

    const id = resolvedAnalysisId || possibleIds[0] || null;

    if (!id) {
      window.alert(
        "This analysis could not be linked to its saved report. Please open it again from History and try Re-analyze."
      );

      return;
    }

    try {
      setReanalyzing(true);
      setError("");

      /*
       * Request a short-lived signed URL for the user's
       * private resume.
       */
      const resumeData = await getResumeSignedUrl(id);

      if (!resumeData?.signed_url) {
        throw new Error(
          "Unable to retrieve the saved resume."
        );
      }

      /*
       * Download the private PDF.
       */
      const response = await fetch(resumeData.signed_url);

      if (!response.ok) {
        throw new Error(
          "Unable to download the saved resume. Please try again."
        );
      }

      const blob = await response.blob();

      if (!blob.size) {
        throw new Error(
          "The saved resume file appears to be empty."
        );
      }

      const filename = resumeData.filename || "resume.pdf";

      const file = new File([blob], filename, {
        type: "application/pdf",
      });

      /*
       * Open Upload Resume with the existing PDF.
       * UploadResume will use this File and allow the
       * user to enter a new job description.
       */
      navigate("/upload", {
        state: {
          resumeFile: file,
          reanalyze: true,
          sourceAnalysisId: id,
        },
      });
    } catch (reanalyzeError) {
      console.error(
        "Re-analysis preparation failed:",
        reanalyzeError
      );

      window.alert(
        getDetailMessage(
          reanalyzeError,
          "Unable to prepare this resume for re-analysis. Please try again."
        )
      );
    } finally {
      setReanalyzing(false);
    }
  };

  /*
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
            <FileSearch className="h-10 w-10 text-violet-600 dark:text-violet-400" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Loading Analysis
          </h1>

          <p className="mt-4 text-lg leading-7 text-slate-600 dark:text-slate-400">
            Retrieving your saved resume analysis.
          </p>
        </div>
      </div>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <FileSearch className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Unable to Load Analysis
          </h1>

          <p className="mt-4 text-lg leading-7 text-slate-600 dark:text-slate-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/history")}
            className="mt-7 inline-flex items-center rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  /*
   * No analysis state
   */
  if (!analysis) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
            <FileSearch className="h-10 w-10 text-violet-600 dark:text-violet-400" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            No Analysis Found
          </h1>

          <p className="mt-4 text-lg leading-7 text-slate-600 dark:text-slate-400">
            Upload a resume and a job description to generate your
            AI-powered ATS analysis.
          </p>

          <button
            type="button"
            onClick={() => navigate("/upload")}
            className="mt-7 inline-flex items-center rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700"
          >
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900"
      >
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* HEADER */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
            </div>

            <div className="relative px-5 py-8 text-center sm:px-8 sm:py-9">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50 dark:bg-green-900/30 dark:ring-green-900/20">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Resume Analysis Complete
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
                Your resume has been analyzed using AI. Review your ATS
                performance, job compatibility, and recommendations below.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {/* RE-ANALYZE */}
                <button
                  type="button"
                  onClick={handleReanalyze}
                  disabled={reanalyzing}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {reanalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}

                  {reanalyzing
                    ? "Preparing Resume..."
                    : "Re-analyze Resume"}
                </button>

                {/* NEW RESUME */}
                <button
                  type="button"
                  onClick={() => navigate("/upload")}
                  className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-5 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-300 dark:hover:bg-violet-900/30"
                >
                  <FileSearch className="h-4 w-4" />
                  New Resume
                </button>

                {/* VIEW RESUME */}
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  <Eye className="h-4 w-4" />
                  View Resume
                </button>

                {/* DOWNLOAD REPORT */}
                <button
                  type="button"
                  onClick={() => generatePDF(analysis)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </motion.section>

          {/* AI ANALYSIS OVERVIEW */}
          <AIAnalysisOverview
            atsScore={analysis.ats_score}
            matchScore={analysis.match_score}
            breakdown={analysis.breakdown}
            matchBreakdown={analysis.match_breakdown}
            matchedSkills={analysis.strengths}
            missingSkills={analysis.missing_skills}
            suggestions={analysis.suggestions}
          />

          {/* SKILLS COMPARISON */}
          <SkillsComparison
            matchedSkills={analysis.strengths}
            missingSkills={analysis.missing_skills}
          />

          {/* AI SUGGESTIONS */}
          <AISuggestions
            summary={analysis.summary}
            suggestions={analysis.suggestions}
          />

          {/* STRENGTHS & WEAKNESSES */}
          <StrengthWeakness
            strengths={analysis.strengths}
            weaknesses={analysis.weaknesses}
          />
        </div>
      </motion.main>

      {/* PRIVATE RESUME PREVIEW — loaded on demand */}
      <Suspense fallback={null}>
        <ResumePreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          file={resumeFile}
          analysisId={analysisId}
        />
      </Suspense>
    </>
  );
}
