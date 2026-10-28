import { motion } from "framer-motion";
import {
  Monitor,
  Moon,
  Sun,
  Palette,
  Check,
} from "lucide-react";
import { useTheme } from "next-themes";

import { fadeUp } from "@/lib/animations";

export default function AppearanceCard() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: "light",
      label: "Light",
      icon: Sun,
    },
    {
      id: "dark",
      label: "Dark",
      icon: Moon,
    },
    {
      id: "system",
      label: "System",
      icon: Monitor,
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
            Appearance
          </h2>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Personalize the application's appearance.
          </p>
        </div>

        <div className="rounded-2xl bg-violet-100 p-3 dark:bg-violet-900/30">
          <Palette className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
      </div>

      {/* Theme Options */}
      <div className="mt-8 space-y-4">
        {themes.map((option) => {
          const Icon = option.icon;
          const active = theme === option.id;

          return (
            <button
              key={option.id}
              onClick={() => setTheme(option.id)}
              className={`flex w-full items-center justify-between rounded-2xl border p-4 transition-all duration-300 ${
                active
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                  : "border-slate-200 hover:border-violet-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`rounded-xl p-3 ${
                    active
                      ? "bg-violet-100 dark:bg-violet-900/30"
                      : "bg-slate-100 dark:bg-slate-800"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      active
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  />
                </div>

                <div className="text-left">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {option.label}
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {option.id === "light" &&
                      "Always use light mode"}

                    {option.id === "dark" &&
                      "Always use dark mode"}

                    {option.id === "system" &&
                      "Match your device theme"}
                  </p>
                </div>
              </div>

              {active && (
                <div className="rounded-full bg-violet-600 p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}