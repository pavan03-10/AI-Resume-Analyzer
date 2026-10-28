import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Settings2,
  Save,
  Sparkles,
  Bell,
  FileText,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { fadeUp } from "@/lib/animations";

const STORAGE_KEY = "ai-resume-analyzer-preferences";

const DEFAULT_PREFERENCES = {
  autoSave: true,
  aiSuggestions: true,
  notifications: false,
  storeJD: true,
};

export default function PreferencesCard() {
  const [preferencesState, setPreferencesState] = useState(
    DEFAULT_PREFERENCES
  );

  const [loaded, setLoaded] = useState(false);

  // Load saved preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        setPreferencesState({
          ...DEFAULT_PREFERENCES,
          ...parsed,
        });
      }
    } catch (error) {
      console.error(
        "Failed to load preferences:",
        error
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(preferencesState)
      );
    } catch (error) {
      console.error(
        "Failed to save preferences:",
        error
      );
    }
  }, [preferencesState, loaded]);

  const updatePreference = (key, value) => {
    setPreferencesState((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const preferences = [
    {
      key: "autoSave",
      title: "Auto Save Reports",
      description:
        "Automatically save every resume analysis.",
      icon: Save,
    },
    {
      key: "aiSuggestions",
      title: "AI Suggestions",
      description:
        "Generate AI-powered resume improvements.",
      icon: Sparkles,
    },
    {
      key: "notifications",
      title: "Email Notifications",
      description:
        "Receive updates about completed analyses.",
      icon: Bell,
    },
    {
      key: "storeJD",
      title: "Store Job Descriptions",
      description:
        "Save uploaded job descriptions for future comparisons.",
      icon: FileText,
    },
  ];

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
            Preferences
          </h2>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Customize how the application behaves.
          </p>
        </div>

        <div className="rounded-2xl bg-violet-100 p-3 dark:bg-violet-900/30">
          <Settings2 className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
      </div>

      {/* Preference List */}
      <div className="mt-8 space-y-5">
        {preferences.map((item) => {
          const Icon = item.icon;
          const checked = preferencesState[item.key];

          return (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-violet-300 dark:border-slate-700 dark:hover:border-violet-500"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="shrink-0 rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">
                  <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              </div>

              <Switch
                checked={checked}
                onCheckedChange={(value) =>
                  updatePreference(item.key, value)
                }
              />
            </div>
          );
        })}
      </div>

      {/* Saved indicator */}
      {loaded && (
        <p className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
          Preferences are saved automatically.
        </p>
      )}
    </motion.div>
  );
}