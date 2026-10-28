import { motion } from "framer-motion";

import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatsCards from "@/components/dashboard/StatsCards";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentAnalyses from "@/components/dashboard/RecentAnalyses";

import { staggerContainer } from "@/lib/animations";

export default function Dashboard() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-7xl space-y-8"
    >
      <WelcomeBanner />

      <StatsCards />

      <QuickActions />

      <RecentAnalyses />
    </motion.div>
  );
}