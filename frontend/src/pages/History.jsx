import { motion } from "framer-motion";

import HistoryHeader from "@/components/history/HistoryHeader";
import HistoryList from "@/components/history/HistoryList";

import { staggerContainer } from "@/lib/animations";

export default function History() {
  return (
    <motion.main
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-7xl space-y-8 px-2 sm:px-4 lg:px-6"
    >
      <HistoryHeader />

      <HistoryList />
    </motion.main>
  );
}