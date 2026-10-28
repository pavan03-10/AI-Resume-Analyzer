import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  FileText,
} from "lucide-react";

import { Document, Page, pdfjs } from "react-pdf";

import api from "@/services/api";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function getDirectFile(source) {
  if (source instanceof File || source instanceof Blob) {
    return source;
  }

  if (typeof source === "string") {
    return /^(https?:|blob:|data:|\/)/i.test(source) ? source : null;
  }

  if (!source || typeof source !== "object") {
    return null;
  }

  const directUrl =
    source.signed_url ||
    source.signedUrl ||
    source.resume_url ||
    source.resumeUrl ||
    source.url ||
    source.file_url ||
    source.fileUrl;

  return typeof directUrl === "string" ? directUrl : null;
}

function getAccessToken() {
  const directToken =
    localStorage.getItem("access_token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token");

  if (directToken) {
    return directToken;
  }

  const supabaseAuthKey = Object.keys(localStorage).find(
    (key) => key.startsWith("sb-") && key.endsWith("-auth-token")
  );

  if (!supabaseAuthKey) {
    return null;
  }

  try {
    const session = JSON.parse(localStorage.getItem(supabaseAuthKey) || "{}");

    return session.access_token || session.currentSession?.access_token || null;
  } catch {
    return null;
  }
}

export default function ResumePreviewModal({
  open,
  onClose,
  file,
  analysisId,
}) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [resumeSource, setResumeSource] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    let objectUrl;

    async function loadResume() {
      if (!open) {
        return;
      }

      setPageNumber(1);
      setNumPages(0);
      setLoadError("");

      const directFile = getDirectFile(file);

      if (directFile) {
        if (directFile instanceof Blob) {
          objectUrl = URL.createObjectURL(directFile);
        }

        if (isCurrent) {
          setResumeSource(objectUrl || directFile);
          setIsLoading(false);
        }

        return;
      }

      if (!analysisId) {
        if (isCurrent) {
          setResumeSource(null);
          setLoadError("No resume is available to preview.");
          setIsLoading(false);
        }

        return;
      }

      setResumeSource(null);
      setIsLoading(true);

      try {
        const accessToken = getAccessToken();

        if (!accessToken) {
          throw new Error("Authentication required. Please sign in.");
        }

        const response = await api.get(
          `/analyses/${encodeURIComponent(analysisId)}/resume-url`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const signedUrl =
          response.data?.signed_url ||
          response.data?.signedUrl ||
          response.data?.url;

        if (!signedUrl) {
          throw new Error("The resume preview link could not be created.");
        }

        if (isCurrent) {
          setResumeSource(signedUrl);
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            error.response?.data?.detail ||
              error.message ||
              "Unable to load this resume."
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadResume();

    return () => {
      isCurrent = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [analysisId, file, open]);

  function onDocumentLoadSuccess({ numPages: loadedPages }) {
    setNumPages(loadedPages);
    setPageNumber((currentPage) => Math.min(currentPage, loadedPages));
  }

  function onDocumentLoadError() {
    setLoadError("Unable to load PDF");
  }

  function handleDownload() {
    if (typeof resumeSource === "string") {
      window.open(resumeSource, "_blank", "noopener,noreferrer");
    }
  }

  if (!open) return null;

  const isUnavailable = Boolean(loadError);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
        >
          {/* ================= HEADER ================= */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 px-8 py-5 text-white dark:border-slate-700">
            {/* Left */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <FileText className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-2xl font-bold">Resume Preview</h2>
                <p className="mt-1 text-sm text-violet-100">
                  Review your uploaded resume while analyzing AI feedback
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              {/* Download */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={!resumeSource || isLoading || isUnavailable}
                className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 font-medium transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-5 w-5" />
                Download
              </button>

              {/* Zoom Out */}
              <button
                type="button"
                onClick={() => setScale((prev) => Math.max(0.8, prev - 0.1))}
                className="rounded-xl bg-white/15 p-3 transition hover:bg-white/25"
              >
                <ZoomOut className="h-5 w-5" />
              </button>

              {/* Zoom */}
              <div className="min-w-[70px] rounded-xl bg-white/15 px-4 py-3 text-center font-semibold">
                {Math.round(scale * 100)}%
              </div>

              {/* Zoom In */}
              <button
                type="button"
                onClick={() => setScale((prev) => Math.min(2.5, prev + 0.1))}
                className="rounded-xl bg-white/15 p-3 transition hover:bg-white/25"
              >
                <ZoomIn className="h-5 w-5" />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-red-500/80 p-3 transition hover:bg-red-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ================= PDF AREA ================= */}
          <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-100 p-8 dark:bg-slate-950">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            >
              {isLoading && (
                <div className="flex h-[500px] w-[420px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
                    <p className="text-slate-500">Loading Resume...</p>
                  </div>
                </div>
              )}

              {!isLoading && isUnavailable && (
                <div className="flex h-[500px] w-[420px] items-center justify-center">
                  <div className="text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-red-500" />
                    <p className="font-semibold text-red-600">Unable to load PDF</p>
                    <p className="mt-2 max-w-xs text-sm text-slate-500">
                      {loadError}
                    </p>
                  </div>
                </div>
              )}

              {!isLoading && !isUnavailable && resumeSource && (
                <Document
                  file={resumeSource}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="flex h-[500px] w-[420px] items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
                        <p className="text-slate-500">Loading Resume...</p>
                      </div>
                    </div>
                  }
                  error={
                    <div className="flex h-[500px] w-[420px] items-center justify-center">
                      <div className="text-center">
                        <FileText className="mx-auto mb-4 h-12 w-12 text-red-500" />
                        <p className="font-semibold text-red-600">
                          Unable to load PDF
                        </p>
                      </div>
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderAnnotationLayer
                    renderTextLayer
                  />
                </Document>
              )}
            </motion.div>
          </div>

          {/* ================= FOOTER ================= */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-8 py-4 dark:border-slate-700 dark:bg-slate-900">
            {/* Previous */}
            <button
              type="button"
              disabled={pageNumber <= 1 || isLoading || isUnavailable}
              onClick={() => setPageNumber((p) => p - 1)}
              className="rounded-xl border border-slate-300 px-5 py-2 font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Previous
            </button>

            {/* Page Indicator */}
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Page {pageNumber} of {numPages || 1}
            </div>

            {/* Next */}
            <button
              type="button"
              disabled={
                pageNumber >= numPages || isLoading || isUnavailable || !numPages
              }
              onClick={() => setPageNumber((p) => p + 1)}
              className="rounded-xl border border-slate-300 px-5 py-2 font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}