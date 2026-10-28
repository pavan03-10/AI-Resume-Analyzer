import api from "./api";
import { supabase } from "@/lib/supabase";

/**
 * ============================================================
 * Authentication
 * ============================================================
 *
 * Get the currently logged-in user's Supabase access token.
 *
 * This token is sent to FastAPI so the backend can identify
 * which authenticated user is making the request.
 */
const getAuthHeaders = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.access_token) {
    throw new Error("You must be logged in to continue.");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
};


/**
 * ============================================================
 * Analyze Resume
 * ============================================================
 *
 * POST /upload/
 */
export const analyzeResume = async (
  resume,
  jobDescription
) => {
  if (!resume) {
    throw new Error("Resume file is required.");
  }

  if (!jobDescription?.trim()) {
    throw new Error("Job description is required.");
  }

  const formData = new FormData();

  formData.append("resume", resume);
  formData.append(
    "job_description",
    jobDescription.trim()
  );

  const authHeaders = await getAuthHeaders();

  const response = await api.post(
    "/upload/",
    formData,
    {
      headers: {
        ...authHeaders,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};


/**
 * ============================================================
 * Get Analysis History
 * ============================================================
 *
 * GET /analyses/
 */
export const getAnalyses = async (limit = 20) => {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const authHeaders = await getAuthHeaders();

  const response = await api.get(
    "/analyses/",
    {
      params: {
        limit: safeLimit,
      },
      headers: authHeaders,
    }
  );

  return response.data;
};


/**
 * ============================================================
 * Get One Analysis
 * ============================================================
 *
 * GET /analyses/{analysis_id}
 */
export const getAnalysisById = async (
  analysisId
) => {
  if (!analysisId) {
    throw new Error("analysisId is required.");
  }

  const authHeaders = await getAuthHeaders();

  const response = await api.get(
    `/analyses/${encodeURIComponent(analysisId)}`,
    {
      headers: authHeaders,
    }
  );

  return response.data;
};


/**
 * ============================================================
 * Delete One Analysis
 * ============================================================
 *
 * DELETE /analyses/{analysis_id}
 */
export const deleteAnalysis = async (
  analysisId
) => {
  if (!analysisId) {
    throw new Error("analysisId is required.");
  }

  const authHeaders = await getAuthHeaders();

  const response = await api.delete(
    `/analyses/${encodeURIComponent(analysisId)}`,
    {
      headers: authHeaders,
    }
  );

  return response.data;
};


/**
 * ============================================================
 * Get Resume Signed URL
 * ============================================================
 *
 * GET /analyses/{analysis_id}/resume-url
 *
 * Used for:
 * - PDF Preview
 * - Re-analyze
 */
export const getResumeSignedUrl = async (
  analysisId
) => {
  if (!analysisId) {
    throw new Error("analysisId is required.");
  }

  const authHeaders = await getAuthHeaders();

  const response = await api.get(
    `/analyses/${encodeURIComponent(analysisId)}/resume-url`,
    {
      headers: authHeaders,
    }
  );

  if (!response.data?.signed_url) {
    throw new Error(
      "Unable to retrieve the resume for re-analysis."
    );
  }

  return response.data;
};


/**
 * ============================================================
 * Delete Entire Account
 * ============================================================
 *
 * DELETE /analyses/account
 *
 * The backend handles:
 * - deleting analyses
 * - deleting resume records
 * - deleting resume files from Storage
 * - deleting the Supabase Auth user
 */
export const deleteAccount = async () => {
  const authHeaders = await getAuthHeaders();

  const response = await api.delete(
    "/analyses/account",
    {
      headers: authHeaders,
    }
  );

  return response.data;
};