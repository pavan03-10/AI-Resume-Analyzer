import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  Eye,
  ArrowRight,
  FileText,
  Trash2,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { deleteAnalysis } from "@/services/resumeApi";

export default function HistoryCard({ analysis }) {
  const navigate = useNavigate();

  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [deleteError, setDeleteError] =
    useState("");

  const score = Number(
    analysis?.score ??
      analysis?.atsScore ??
      0
  );

  const matchScore = Number(
    analysis?.matchScore
  );

  /* =======================================================
     SCORE BADGE
  ======================================================= */

  const getScoreBadge = (value) => {
    if (value >= 90) {
      return {
        text: "Excellent",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      };
    }

    if (value >= 80) {
      return {
        text: "Good",
        className:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      };
    }

    if (value >= 70) {
      return {
        text: "Average",
        className:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      };
    }

    return {
      text: "Needs Work",
      className:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    };
  };

  const badge = getScoreBadge(score);

  /* =======================================================
     VIEW REPORT
  ======================================================= */

  const handleViewReport = () => {
    if (deleting) {
      return;
    }

    navigate("/results", {
      state: {
        analysis: analysis.analysis,
        analysisId:
          analysis.analysisId ||
          analysis.id,
        resumeId: analysis.resumeId,
        resumeFile: null,
        fromHistory: true,
      },
    });
  };

  /* =======================================================
     OPEN DELETE MODAL
  ======================================================= */

  const openDeleteModal = () => {
    if (deleting) {
      return;
    }

    const analysisId =
      analysis?.analysisId ||
      analysis?.id;

    if (!analysisId) {
      setDeleteError(
        "Unable to identify this analysis."
      );
      setShowDeleteModal(true);
      return;
    }

    setDeleteError("");
    setShowDeleteModal(true);
  };

  /* =======================================================
     CLOSE DELETE MODAL
  ======================================================= */

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
    setDeleteError("");
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async () => {
    if (deleting) {
      return;
    }

    const analysisId =
      analysis?.analysisId ||
      analysis?.id;

    if (!analysisId) {
      setDeleteError(
        "Unable to identify this analysis."
      );
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      await deleteAnalysis(
        analysisId
      );

      navigate(0);
    } catch (error) {
      console.error(
        "Failed to delete analysis:",
        error
      );

      setDeleteError(
        error?.response?.data?.detail ||
          error?.message ||
          "Unable to delete the analysis. Please try again."
      );

      setDeleting(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* =================================================
          HISTORY CARD
      ================================================== */}

      <motion.article
        whileHover={{
          y: -3,
        }}
        transition={{
          duration: 0.2,
        }}
        className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-violet-300 hover:shadow-xl sm:p-5 lg:p-6 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-500"
      >
        <div className="flex flex-col gap-5">

          {/* =================================================
              TOP SECTION
          ================================================== */}

          <div className="flex min-w-0 items-start gap-3 sm:gap-4">

            {/* File Icon */}

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 sm:h-14 sm:w-14 dark:bg-violet-900/30">
              <FileText className="h-6 w-6 text-violet-600 sm:h-7 sm:w-7 dark:text-violet-400" />
            </div>

            {/* Resume Details */}

            <div className="min-w-0 flex-1">

              <div className="flex min-w-0 items-start justify-between gap-3">

                <div className="min-w-0">

                  <h3 className="truncate text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
                    {analysis.role ||
                      "Resume Analysis"}
                  </h3>

                  <p
                    className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400"
                    title={
                      analysis.filename
                    }
                  >
                    {analysis.filename ||
                      "Resume"}
                  </p>

                </div>

                {/* Mobile ATS */}

                <div className="shrink-0 lg:hidden">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {score}%
                  </span>
                </div>
              </div>

              {/* Metadata */}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 sm:text-sm dark:text-slate-400">

                {analysis.company ? (
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />

                    <span className="truncate">
                      {analysis.company}
                    </span>
                  </span>
                ) : null}

                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />

                  {analysis.date ||
                    "Date unavailable"}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              BOTTOM / ACTION SECTION
          ================================================== */}

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">

            {/* Scores */}

            <div className="flex flex-wrap items-center gap-2">

              {/* ATS */}

              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 sm:px-4 dark:border-slate-700 dark:bg-slate-800">
                <span className="text-xs font-semibold text-slate-900 sm:text-sm dark:text-white">
                  ATS {score}%
                </span>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs ${badge.className}`}
                >
                  {badge.text}
                </span>
              </div>

              {/* Match */}

              {Number.isFinite(
                matchScore
              ) && (
                <div
                  className={`rounded-full border px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm ${
                    matchScore < 50
                      ? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/20 dark:text-orange-300"
                      : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  Match {matchScore}%
                </div>
              )}
            </div>

            {/* Actions */}

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">

              {/* View Report */}

              <button
                type="button"
                onClick={
                  handleViewReport
                }
                disabled={deleting}
                className="group flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-5 sm:text-sm"
              >
                <Eye className="h-4 w-4 shrink-0" />

                <span className="truncate">
                  View Report
                </span>

                <ArrowRight className="hidden h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 sm:block" />
              </button>

              {/* Delete */}

              <button
                type="button"
                onClick={
                  openDeleteModal
                }
                disabled={deleting}
                title="Delete analysis"
                className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 transition-all duration-300 hover:border-red-300 hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:text-sm dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />

                    <span>
                      Deleting...
                    </span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 shrink-0" />

                    <span>
                      Delete
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.article>

      {/* ===================================================
          DELETE MODAL
      ==================================================== */}

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              if (!deleting) {
                closeDeleteModal();
              }
            }
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 12,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            {/* Header */}

            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 dark:border-slate-800">

              <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 sm:h-11 sm:w-11 dark:bg-red-900/30">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                    Delete analysis?
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  closeDeleteModal
                }
                disabled={deleting}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}

            <div className="px-5 py-5 sm:px-6 sm:py-6">

              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                You are about to permanently
                delete this resume analysis
                and its associated resume.
              </p>

              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">

                <div className="flex items-start gap-3">

                  <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                  <div className="min-w-0">

                    <p className="truncate font-semibold text-red-800 dark:text-red-300">
                      {analysis.role ||
                        "Resume Analysis"}
                    </p>

                    <p className="mt-1 truncate text-sm text-red-700/80 dark:text-red-300/70">
                      {analysis.filename ||
                        "Resume"}
                    </p>

                    <p className="mt-3 text-xs leading-5 text-red-700/80 sm:text-sm dark:text-red-300/70">
                      The saved analysis and
                      PDF stored in your account
                      will be permanently removed.
                    </p>
                  </div>
                </div>
              </div>

              {deleteError && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                  {deleteError}
                </div>
              )}
            </div>

            {/* Footer */}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 dark:border-slate-800 dark:bg-slate-950/40">

              <button
                type="button"
                onClick={
                  closeDeleteModal
                }
                disabled={deleting}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDelete
                }
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Analysis
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}