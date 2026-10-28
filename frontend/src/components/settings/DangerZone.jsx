import { motion } from "framer-motion";
import {
  AlertTriangle,
  Trash2,
  LogOut,
  ShieldAlert,
  Loader2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import { supabase } from "@/lib/supabase";
import {
  getAnalyses,
  deleteAnalysis,
  deleteAccount,
} from "@/services/resumeApi";

export default function DangerZone() {
  const navigate = useNavigate();

  const [signingOut, setSigningOut] = useState(false);
  const [deletingReports, setDeletingReports] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showDeleteAccountModal, setShowDeleteAccountModal] =
    useState(false);

  const [deleteConfirmation, setDeleteConfirmation] =
    useState("");

  // ==========================================================
  // Sign Out
  // ==========================================================

  const handleSignOut = async () => {
    if (signingOut || deletingReports || deletingAccount) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to sign out?"
    );

    if (!confirmed) return;

    try {
      setSigningOut(true);
      setError("");
      setMessage("");

      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      navigate("/login", {
        replace: true,
      });
    } catch (err) {
      console.error("Sign out failed:", err);

      setError(
        err?.message ||
          "Unable to sign out. Please try again."
      );

      setSigningOut(false);
    }
  };

  // ==========================================================
  // Delete Reports
  // ==========================================================

  const handleDeleteReports = async () => {
    if (deletingReports || deletingAccount) {
      return;
    }

    const confirmed = window.confirm(
      "Delete all reports?\n\n" +
        "This will permanently delete your saved analyses " +
        "and their associated resume files from Storage.\n\n" +
        "This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingReports(true);
      setError("");
      setMessage("");

      const analyses = await getAnalyses(100);

      const items = Array.isArray(analyses)
        ? analyses
        : Array.isArray(analyses?.analyses)
        ? analyses.analyses
        : Array.isArray(analyses?.data)
        ? analyses.data
        : [];

      if (items.length === 0) {
        setMessage("You don't have any saved reports.");
        return;
      }

      let deletedCount = 0;

      for (const analysis of items) {
        const analysisId =
          analysis?.analysis_id ||
          analysis?.analysisId ||
          analysis?.id ||
          analysis?.analysis?.id;

        if (!analysisId) {
          continue;
        }

        await deleteAnalysis(analysisId);
        deletedCount += 1;
      }

      setMessage(
        deletedCount === 1
          ? "1 report was deleted successfully."
          : `${deletedCount} reports were deleted successfully.`
      );
    } catch (err) {
      console.error(
        "Failed to delete reports:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to delete your reports. Please try again."
      );
    } finally {
      setDeletingReports(false);
    }
  };

  // ==========================================================
  // Open Delete Account Modal
  // ==========================================================

  const handleOpenDeleteAccount = () => {
    if (
      signingOut ||
      deletingReports ||
      deletingAccount
    ) {
      return;
    }

    setMessage("");
    setError("");
    setDeleteConfirmation("");
    setShowDeleteAccountModal(true);
  };

  // ==========================================================
  // Close Delete Account Modal
  // ==========================================================

  const handleCloseDeleteAccount = () => {
    if (deletingAccount) {
      return;
    }

    setShowDeleteAccountModal(false);
    setDeleteConfirmation("");
    setError("");
  };

  // ==========================================================
  // Delete Entire Account
  // ==========================================================

  const handleDeleteAccount = async () => {
    if (deletingAccount) {
      return;
    }

    if (deleteConfirmation.trim() !== "DELETE ACCOUNT") {
      setError(
        'Please type "DELETE ACCOUNT" exactly to confirm.'
      );
      return;
    }

    try {
      setDeletingAccount(true);
      setError("");
      setMessage("");

      // Backend performs the actual destructive operation:
      //
      // - deletes analyses
      // - deletes resume records
      // - deletes resume Storage files
      // - deletes Supabase Auth user
      await deleteAccount();

      // The Auth user has now been removed by the backend.
      // Clear the local Supabase session as well.
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.warn(
          "Local sign-out after account deletion failed:",
          signOutError
        );
      }

      setShowDeleteAccountModal(false);
      setDeleteConfirmation("");

      navigate("/login", {
        replace: true,
        state: {
          accountDeleted: true,
        },
      });
    } catch (err) {
      console.error(
        "Account deletion failed:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to delete your account. Please try again."
      );

      setDeletingAccount(false);
    }
  };

  return (
    <>
      {/* ======================================================
          Danger Zone
      ======================================================= */}

      <motion.div
        variants={fadeUp}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-red-900/40 dark:bg-red-950/20"
      >
        {/* Header */}
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-red-700 dark:text-red-300">
              Danger Zone
            </h2>

            <p className="mt-2 text-red-600 dark:text-red-400">
              These actions are irreversible. Please proceed
              carefully.
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6 dark:border-red-900/40 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" />

            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              Deleting your reports permanently removes your
              saved analyses and associated resume files.
              Deleting your account permanently removes your
              account and associated application data. These
              actions cannot be undone.
            </p>
          </div>
        </div>

        {/* Success */}
        {message && (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">
            {message}
          </div>
        )}

        {/* Error */}
        {error && !showDeleteAccountModal && (
          <div className="mt-5 rounded-2xl border border-red-300 bg-red-100 p-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {/* Sign Out */}
          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            disabled={
              signingOut ||
              deletingReports ||
              deletingAccount
            }
            className="h-14 rounded-2xl border-slate-300 bg-white text-slate-700 transition-all duration-300 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {signingOut ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing Out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </>
            )}
          </Button>

          {/* Delete Reports */}
          <Button
            type="button"
            variant="outline"
            onClick={handleDeleteReports}
            disabled={
              deletingReports ||
              signingOut ||
              deletingAccount
            }
            className="h-14 rounded-2xl border-red-300 bg-white text-red-600 transition-all duration-300 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-700 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {deletingReports ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-5 w-5" />
                Delete Reports
              </>
            )}
          </Button>

          {/* Delete Account */}
          <Button
            type="button"
            onClick={handleOpenDeleteAccount}
            disabled={
              signingOut ||
              deletingReports ||
              deletingAccount
            }
            className="h-14 rounded-2xl bg-red-600 text-white transition-all duration-300 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deletingAccount ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Deleting Account...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-5 w-5" />
                Delete Account
              </>
            )}
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-red-500 dark:text-red-400">
          Account deletion permanently removes your account
          and associated application data.
        </p>
      </motion.div>

      {/* ======================================================
          Delete Account Confirmation Modal
      ======================================================= */}

      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-7 shadow-2xl dark:border-red-900/50 dark:bg-slate-900"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
                  <Trash2 className="h-7 w-7 text-red-600 dark:text-red-400" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Delete Account
                  </h3>

                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    This action is permanent.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDeleteAccount}
                disabled={deletingAccount}
                aria-label="Close delete account dialog"
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Warning */}
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/40 dark:bg-red-950/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

                <div className="text-sm leading-6 text-red-700 dark:text-red-300">
                  <p className="font-semibold">
                    You are about to permanently delete your
                    account.
                  </p>

                  <p className="mt-2">
                    This will remove your saved analyses,
                    resume records, uploaded resume files, and
                    your authentication account.
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation */}
            <div className="mt-6">
              <label
                htmlFor="delete-account-confirmation"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Type{" "}
                <span className="font-bold text-red-600 dark:text-red-400">
                  DELETE ACCOUNT
                </span>{" "}
                to confirm.
              </label>

              <input
                id="delete-account-confirmation"
                type="text"
                value={deleteConfirmation}
                onChange={(event) => {
                  setDeleteConfirmation(
                    event.target.value
                  );
                  setError("");
                }}
                placeholder="DELETE ACCOUNT"
                autoComplete="off"
                disabled={deletingAccount}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            {/* Modal Error */}
            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Modal Buttons */}
            <div className="mt-7 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 rounded-xl py-6"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleDeleteAccount}
                disabled={
                  deletingAccount ||
                  deleteConfirmation.trim() !==
                    "DELETE ACCOUNT"
                }
                className="flex-1 rounded-xl bg-red-600 py-6 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingAccount ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-5 w-5" />
                    Permanently Delete
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}