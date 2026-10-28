import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import ResumeUpload from "@/components/upload/ResumeUpload";
import UploadedFile from "@/components/upload/UploadedFile";
import JobDescription from "@/components/upload/JobDescription";
import AnalyzeButton from "@/components/upload/AnalyzeButton";
import AnalysisModal from "@/components/upload/AnalysisModal";

import { analyzeResume } from "@/services/resumeApi";

const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10 MB

const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => item?.msg || item)
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  if (typeof detail === "string" && detail.trim()) {
    return detail.trim();
  }

  if (status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (status === 413) {
    return "The resume file is too large. Please upload a smaller PDF.";
  }

  if (status === 422) {
    return "The uploaded resume or job description could not be processed.";
  }

  if (status >= 500) {
    return "The server encountered an error while analyzing your resume. Please try again.";
  }

  if (
    error?.code === "ERR_NETWORK" ||
    error?.message === "Network Error"
  ) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  if (error?.message) {
    return error.message;
  }

  return "Resume analysis failed. Please try again.";
};

export default function UploadResume() {
  const navigate = useNavigate();
  const location = useLocation();

  /*
   * Re-analyze flow can send an already downloaded File
   * through React Router state.
   */
  const incomingResumeFile =
    location.state?.resumeFile || null;

  const isReanalyze =
    Boolean(location.state?.reanalyze);

  const sourceAnalysisId =
    location.state?.sourceAnalysisId || null;

  const [resumeFile, setResumeFile] = useState(
    incomingResumeFile
  );

  const [jobDescription, setJobDescription] =
    useState("");

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] =
    useState(false);

  const [analysisComplete, setAnalysisComplete] =
    useState(false);

  const [analysisError, setAnalysisError] =
    useState("");

  const errorTimerRef = useRef(null);

  /*
   * If navigation state changes while this page is mounted,
   * synchronize the incoming resume.
   */
  useEffect(() => {
    if (incomingResumeFile) {
      setResumeFile(incomingResumeFile);
    }
  }, [incomingResumeFile]);

  /*
   * Clean up pending error timer.
   */
  useEffect(() => {
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  const isReady =
    Boolean(resumeFile) &&
    Boolean(jobDescription.trim()) &&
    !loading;

  const validateResume = () => {
    if (!resumeFile) {
      return "Please upload a resume.";
    }

    const fileName =
      resumeFile.name?.toLowerCase() || "";

    const isPdf =
      resumeFile.type === "application/pdf" ||
      fileName.endsWith(".pdf");

    if (!isPdf) {
      return "Please upload your resume in PDF format.";
    }

    if (resumeFile.size <= 0) {
      return "The selected resume file appears to be empty.";
    }

    if (resumeFile.size > MAX_RESUME_SIZE) {
      return "Resume file is too large. Please upload a PDF smaller than 10 MB.";
    }

    return "";
  };

  const handleAnalyze = async () => {
    if (loading) {
      return;
    }

    const resumeError = validateResume();

    if (resumeError) {
      window.alert(resumeError);
      return;
    }

    if (!jobDescription.trim()) {
      window.alert("Please enter a job description.");
      return;
    }

    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }

    try {
      setLoading(true);
      setShowModal(true);
      setAnalysisComplete(false);
      setAnalysisError("");

      const result = await analyzeResume(
        resumeFile,
        jobDescription.trim()
      );

      if (!result?.analysis) {
        throw new Error(
          "The server completed the request but did not return an analysis."
        );
      }

      setAnalysisComplete(true);

      await new Promise((resolve) =>
        setTimeout(resolve, 850)
      );

      setShowModal(false);

      await new Promise((resolve) =>
        setTimeout(resolve, 250)
      );

      navigate("/results", {
        state: {
          analysis: result.analysis,

          analysisId:
            result.analysis_id ||
            result.analysisId ||
            result.analysis?.analysis_id ||
            result.analysis?.analysisId ||
            result.analysis?.id ||
            null,

          resumeFile,
        },
      });
    } catch (error) {
      console.error(
        "Resume analysis failed:",
        error
      );

      const message =
        getErrorMessage(error);

      setAnalysisComplete(false);
      setAnalysisError(message);
      setShowModal(true);

      errorTimerRef.current =
        setTimeout(() => {
          setShowModal(false);
          setAnalysisError("");
          errorTimerRef.current = null;
        }, 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnalysisModal
        open={showModal}
        analysisComplete={analysisComplete}
        error={analysisError}
      />

      <motion.main
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
        className="mx-auto max-w-5xl space-y-8 px-6 py-8"
      >
        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isReanalyze
              ? "Re-analyze Resume"
              : "Upload Resume"}
          </h1>

          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            {isReanalyze
              ? "Your previous resume is ready. Enter a new job description to run another AI analysis."
              : "Upload your resume and compare it with a job description using AI."}
          </p>
        </div>

        {/* =====================================================
            RESUME UPLOAD
        ====================================================== */}

        <ResumeUpload
          resumeFile={resumeFile}
          setResumeFile={setResumeFile}
        />

        {/* =====================================================
            JOB DESCRIPTION
        ====================================================== */}

        <JobDescription
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
        />

        {/* =====================================================
            SELECTED FILE
        ====================================================== */}

        {resumeFile && (
          <UploadedFile
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
          />
        )}

        {/* =====================================================
            ANALYZE BUTTON
        ====================================================== */}

        <AnalyzeButton
          loading={loading}
          disabled={!isReady}
          onClick={handleAnalyze}
        />
      </motion.main>
    </>
  );
}