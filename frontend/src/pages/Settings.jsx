import { motion } from "framer-motion";

import ProfileCard from "@/components/settings/ProfileCard";
import AppearanceCard from "@/components/settings/AppearanceCard";
import PreferencesCard from "@/components/settings/PreferencesCard";
import SecurityCard from "@/components/settings/SecurityCard";
import DangerZone from "@/components/settings/DangerZone";

export default function Settings() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-7xl space-y-8 px-2 sm:px-4 lg:px-6"
    >
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Manage your account, preferences, appearance and security.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard />
        <AppearanceCard />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PreferencesCard />
        <SecurityCard />
      </div>

      <DangerZone />
    </motion.main>
  );
}