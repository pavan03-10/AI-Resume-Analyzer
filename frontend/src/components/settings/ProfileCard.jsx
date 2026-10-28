import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Pencil,
  Camera,
  Loader2,
  Check,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import { supabase } from "@/lib/supabase";

/* =========================================================
   HELPERS
========================================================= */

function getUserName(user) {
  const metadata = user?.user_metadata || {};

  return (
    metadata.name ||
    metadata.full_name ||
    metadata.fullName ||
    ""
  ).trim();
}

function getInitials(name, email) {
  const value = name?.trim();

  if (value) {
    const parts = value.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return parts[0][0].toUpperCase();
  }

  if (email) {
    return email[0].toUpperCase();
  }

  return "U";
}

function getUsername(name, email) {
  if (name?.trim()) {
    const username = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    if (username) {
      return username;
    }
  }

  if (email) {
    return email.split("@")[0];
  }

  return "user";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ProfileCard() {
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =======================================================
     APPLY USER TO STATE
  ======================================================= */

  const applyUser = (currentUser) => {
    const currentName = getUserName(currentUser);
    const currentEmail = currentUser?.email || "";

    setUser(currentUser);
    setName(currentName);
    setEditName(currentName);
    setEmail(currentEmail);
  };

  /* =======================================================
     LOAD USER
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!mounted) {
          return;
        }

        applyUser(currentUser);
      } catch (err) {
        console.error("Failed to load profile:", err);

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load your profile."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    /* =====================================================
       AUTH STATE LISTENER
    ===================================================== */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) {
          return;
        }

        const currentUser = session?.user || null;

        if (currentUser) {
          applyUser(currentUser);
        } else {
          setUser(null);
          setName("");
          setEditName("");
          setEmail("");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     START EDITING
  ======================================================= */

  const handleStartEditing = () => {
    setMessage("");
    setError("");
    setEditName(name);
    setEditing(true);
  };

  /* =======================================================
     CANCEL EDITING
  ======================================================= */

  const handleCancelEditing = () => {
    setEditName(name);
    setMessage("");
    setError("");
    setEditing(false);
  };

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  const handleSaveProfile = async () => {
    const trimmedName = editName.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (trimmedName.length > 80) {
      setError("Name must be 80 characters or less.");
      return;
    }

    if (trimmedName === name.trim()) {
      setEditing(false);
      setMessage("Profile is already up to date.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      /* -----------------------------------------------
         1. Save metadata to Supabase Auth
      ------------------------------------------------ */

      const { error: updateError } =
        await supabase.auth.updateUser({
          data: {
            name: trimmedName,
          },
        });

      if (updateError) {
        throw updateError;
      }

      /* -----------------------------------------------
         2. Refresh the current session
            This makes sure the updated metadata is
            reflected in the active Auth session.
      ------------------------------------------------ */

      const {
        data: refreshedSession,
        error: refreshError,
      } = await supabase.auth.refreshSession();

      if (refreshError) {
        throw refreshError;
      }

      const refreshedUser =
        refreshedSession?.user || null;

      /* -----------------------------------------------
         3. If refresh returned the user, use it.
            Otherwise explicitly fetch the user again.
      ------------------------------------------------ */

      let verifiedUser = refreshedUser;

      if (!verifiedUser) {
        const {
          data: { user: fetchedUser },
          error: fetchError,
        } = await supabase.auth.getUser();

        if (fetchError) {
          throw fetchError;
        }

        verifiedUser = fetchedUser;
      }

      /* -----------------------------------------------
         4. Update UI using the verified Supabase user
      ------------------------------------------------ */

      const verifiedName =
        getUserName(verifiedUser) || trimmedName;

      setUser(verifiedUser || user);
      setName(verifiedName);
      setEditName(verifiedName);
      setEmail(
        verifiedUser?.email ||
          email
      );

      setEditing(false);
      setMessage(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update profile:",
        err
      );

      setError(
        err?.message ||
          "Unable to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  const initials = getInitials(name, email);
  const username = getUsername(name, email);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-8
        shadow-sm
        transition-all
        duration-300
        hover:shadow-xl
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Profile
          </h2>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage your personal information.
          </p>
        </div>

        <div className="rounded-2xl bg-violet-100 p-3 dark:bg-violet-900/30">
          <User className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <div className="mt-10 flex items-center justify-center py-8">
          <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
        </div>
      ) : (
        <>
          {/* =============================================
              AVATAR
          ============================================== */}

          <div className="mt-8 flex items-center gap-5">
            <div className="relative">
              <div
                className="
                  flex
                  h-24
                  w-24
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-violet-600
                  to-fuchsia-600
                  text-3xl
                  font-bold
                  text-white
                  shadow-lg
                "
              >
                {initials}
              </div>

              <button
                type="button"
                aria-label="Change profile picture"
                disabled
                title="Profile photo coming soon"
                className="
                  absolute
                  bottom-0
                  right-0
                  cursor-not-allowed
                  rounded-full
                  bg-white
                  p-2
                  shadow-lg
                  opacity-80
                  dark:bg-slate-800
                "
              >
                <Camera className="h-4 w-4 text-slate-700 dark:text-white" />
              </button>
            </div>

            <div className="min-w-0">
              {editing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) =>
                    setEditName(e.target.value)
                  }
                  maxLength={80}
                  autoFocus
                  disabled={saving}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-violet-300
                    bg-white
                    px-3
                    py-2
                    text-xl
                    font-bold
                    text-slate-900
                    outline-none
                    ring-2
                    ring-violet-100
                    dark:border-violet-700
                    dark:bg-slate-800
                    dark:text-white
                    dark:ring-violet-900/30
                  "
                  placeholder="Enter your name"
                />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {name || "User"}
                </h3>
              )}

              <p className="mt-1 text-slate-500 dark:text-slate-400">
                AI Resume Analyzer User
              </p>
            </div>
          </div>

          {/* =============================================
              INFORMATION
          ============================================== */}

          <div className="mt-8 space-y-5">
            {/* Email */}

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-violet-600 dark:text-violet-400" />

                <div className="min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Email
                  </p>

                  <p className="truncate font-medium text-slate-900 dark:text-white">
                    {email || "No email available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Username */}

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-violet-600 dark:text-violet-400" />

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Username
                  </p>

                  <p className="font-medium text-slate-900 dark:text-white">
                    @{username}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =============================================
              SUCCESS MESSAGE
          ============================================== */}

          {message && (
            <div
              className="
                mt-5
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-emerald-200
                bg-emerald-50
                px-4
                py-3
                text-sm
                text-emerald-700
                dark:border-emerald-900/50
                dark:bg-emerald-900/20
                dark:text-emerald-400
              "
            >
              <Check className="h-4 w-4 shrink-0" />
              {message}
            </div>
          )}

          {/* =============================================
              ERROR MESSAGE
          ============================================== */}

          {error && (
            <div
              className="
                mt-5
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-700
                dark:border-red-900/50
                dark:bg-red-900/20
                dark:text-red-400
              "
            >
              {error}
            </div>
          )}

          {/* =============================================
              BUTTONS
          ============================================== */}

          {editing ? (
            <div className="mt-8 flex gap-3">
              <Button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="
                  flex-1
                  rounded-xl
                  bg-violet-600
                  py-6
                  text-base
                  hover:bg-violet-700
                "
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Save Changes
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEditing}
                disabled={saving}
                className="rounded-xl py-6"
              >
                <X className="mr-2 h-5 w-5" />
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleStartEditing}
              className="
                mt-8
                w-full
                rounded-xl
                bg-violet-600
                py-6
                text-base
                hover:bg-violet-700
              "
            >
              <Pencil className="mr-2 h-5 w-5" />
              Edit Profile
            </Button>
          )}
        </>
      )}
    </motion.div>
  );
}