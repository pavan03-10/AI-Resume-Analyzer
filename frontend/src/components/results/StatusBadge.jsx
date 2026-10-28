import { motion } from "framer-motion";
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Sparkles,
} from "lucide-react";

export default function StatusBadge({ score }) {
  const getStatus = () => {
    if (score >= 90) {
      return {
        label: "Excellent",
        icon: CheckCircle2,
        gradient: "from-emerald-500 to-green-400",
        glow: "shadow-emerald-500/30",
        ring: "ring-emerald-200 dark:ring-emerald-800",
      };
    }

    if (score >= 80) {
      return {
        label: "Strong",
        icon: ShieldCheck,
        gradient: "from-violet-600 to-indigo-500",
        glow: "shadow-violet-500/30",
        ring: "ring-violet-200 dark:ring-violet-800",
      };
    }

    if (score >= 70) {
      return {
        label: "Average",
        icon: AlertTriangle,
        gradient: "from-amber-500 to-orange-400",
        glow: "shadow-amber-500/30",
        ring: "ring-amber-200 dark:ring-amber-800",
      };
    }

    return {
      label: "Needs Improvement",
      icon: XCircle,
      gradient: "from-red-500 to-rose-500",
      glow: "shadow-red-500/30",
      ring: "ring-red-200 dark:ring-red-800",
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.35 }}
      className="inline-flex"
    >
      <div
        className={`
          group
          relative
          overflow-hidden
          rounded-full
          p-[1px]
          bg-gradient-to-r
          ${status.gradient}
          ${status.glow}
          shadow-lg
        `}
      >
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent)",
          }}
        />

        <div
          className={`
            relative
            flex
            items-center
            gap-2
            rounded-full
            bg-white/90
            px-5
            py-2.5
            backdrop-blur-xl
            ring-1
            ${status.ring}
            dark:bg-slate-900/90
          `}
        >
          <div
            className={`
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              ${status.gradient}
              text-white
            `}
          >
            <Icon size={16} />
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
              ATS Status
            </span>

            <span className="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white">
              {status.label}
              {score >= 90 && (
                <Sparkles
                  size={14}
                  className="text-yellow-500"
                />
              )}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}