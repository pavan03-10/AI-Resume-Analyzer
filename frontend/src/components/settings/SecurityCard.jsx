import { motion } from "framer-motion";
import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Smartphone,
  Monitor,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { fadeUp } from "@/lib/animations";
import { supabase } from "@/lib/supabase";

export default function SecurityCard() {
  const [twoFactor, setTwoFactor] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleOpenPasswordForm = () => {
    setSuccessMessage("");
    setErrorMessage("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordForm(true);
  };

  const handleCancelPasswordChange = () => {
    if (changingPassword) return;

    setShowPasswordForm(false);
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
  };

  const handleChangePassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!newPassword) {
      setErrorMessage("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);

      setSuccessMessage(
        "Your password has been changed successfully."
      );
    } catch (error) {
      console.error("Password update failed:", error);

      setErrorMessage(
        error?.message ||
          "Unable to change your password. Please try again."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const toggleTwoFactor = () => {
    /*
     * This only changes the UI state.
     * Real Supabase MFA enrollment will be implemented
     * separately so we don't falsely claim that 2FA is active.
     */
    setTwoFactor((current) => !current);
  };

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Security
          </h2>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Protect your account and manage security settings.
          </p>
        </div>

        <div className="rounded-2xl bg-violet-100 p-3 dark:bg-violet-900/30">
          <ShieldCheck className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
      </div>

      {/* Security Status */}
      <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />

          <div>
            <h3 className="font-semibold text-green-700 dark:text-green-300">
              Account Protected
            </h3>

            <p className="text-sm text-green-600 dark:text-green-400">
              Your account security status is healthy.
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />

          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            {successMessage}
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Change Password */}
      {!showPasswordForm ? (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-violet-300 dark:border-slate-700 dark:hover:border-violet-500">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">
              <Lock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Change Password
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Update your password regularly for better security.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleOpenPasswordForm}
            className="rounded-xl"
          >
            Update
          </Button>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/50 p-5 dark:border-violet-900/50 dark:bg-violet-900/10">
          {/* Password Form Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Change Password
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Choose a new password for your account.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancelPasswordChange}
              disabled={changingPassword}
              aria-label="Close password form"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* New Password */}
          <div className="mt-5">
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              New Password
            </label>

            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={changingPassword}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword((current) => !current)
                }
                disabled={changingPassword}
                aria-label={
                  showNewPassword
                    ? "Hide new password"
                    : "Show new password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Minimum 8 characters.
            </p>
          </div>

          {/* Confirm Password */}
          <div className="mt-4">
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Confirm New Password
            </label>

            <div className="relative">
              <input
                id="confirm-password"
                type={
                  showConfirmPassword ? "text" : "password"
                }
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={changingPassword}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                disabled={changingPassword}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Password Buttons */}
          <div className="mt-5 flex gap-3">
            <Button
              type="button"
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="flex-1 rounded-xl bg-violet-600 py-5 hover:bg-violet-700"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancelPasswordChange}
              disabled={changingPassword}
              className="rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Two Factor Authentication */}
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-violet-300 dark:border-slate-700 dark:hover:border-violet-500">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">
            <Smartphone className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Two-Factor Authentication
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add an extra layer of protection to your account.
            </p>
          </div>
        </div>

        <Switch
          checked={twoFactor}
          onCheckedChange={toggleTwoFactor}
        />
      </div>

      {/* Active Sessions */}
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-violet-300 dark:border-slate-700 dark:hover:border-violet-500">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">
            <Monitor className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Active Sessions
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              View devices currently signed into your account.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled
          title="Session management coming soon"
          className="flex cursor-not-allowed items-center gap-2 text-sm font-medium text-violet-600 opacity-70 dark:text-violet-400"
        >
          Manage
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}