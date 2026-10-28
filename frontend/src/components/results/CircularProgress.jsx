import { motion, animate } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";

export default function CircularProgress({
  score,
  size = 220,
  strokeWidth = 16,
}) {
  const [displayScore, setDisplayScore] = useState(0);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate(value) {
        setDisplayScore(Math.round(value));
      },
    });

    return () => controls.stop();
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progressOffset =
    circumference - (score / 100) * circumference;

  const trackColor =
    resolvedTheme === "dark"
      ? "#334155"
      : "#E5E7EB";

  const status = useMemo(() => {
    if (score >= 90)
      return {
        label: "Excellent",
        stars: 5,
        color: "#8b5cf6",
      };

    if (score >= 80)
      return {
        label: "Good",
        stars: 4,
        color: "#3b82f6",
      };

    if (score >= 70)
      return {
        label: "Average",
        stars: 3,
        color: "#f59e0b",
      };

    return {
      label: "Needs Work",
      stars: 2,
      color: "#ef4444",
    };
  }, [score]);

  const angle = (score / 100) * 360 - 90;

  const dotX =
    size / 2 +
    radius *
      Math.cos((angle * Math.PI) / 180);

  const dotY =
    size / 2 +
    radius *
      Math.sin((angle * Math.PI) / 180);

  const isExcellent = score >= 90;

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        scale: [0.9, 1.04, 1],
      }}
      whileHover={{
        scale: 1.03,
      }}
      transition={{
        duration: 0.8,
      }}
      className="group relative flex items-center justify-center"
    >
      {/* Background Glow */}

      <motion.div
        className="absolute h-56 w-56 rounded-full bg-gradient-to-r from-violet-500/30 via-fuchsia-500/20 to-blue-500/30 blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      {/* Floating Particles */}

      {[...Array(10)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-2 w-2 rounded-full bg-violet-400"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${15 + Math.random() * 70}%`,
          }}
          animate={{
            y: [-8, 8, -8],
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.4, 0.8],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
          }}
        />
      ))}

      <svg
        width={size}
        height={size}
        className="overflow-visible"
      >
        <defs>
          <linearGradient
            id="atsGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="#8b5cf6"
            />
            <stop
              offset="50%"
              stopColor="#6366f1"
            />
            <stop
              offset="100%"
              stopColor="#3b82f6"
            />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur
              stdDeviation="6"
              result="blur"
            />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress Ring */}

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="url(#atsGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter="url(#glow)"
          initial={{
            strokeDashoffset: circumference,
          }}
          animate={{
            strokeDashoffset: progressOffset,
          }}
          transition={{
            duration: 1.8,
            ease: "easeOut",
          }}
          style={{
            rotate: -90,
            transformOrigin: "50% 50%",
          }}
        />

        {/* Progress Dot */}

        <motion.circle
          cx={dotX}
          cy={dotY}
          r="8"
          fill="#8b5cf6"
          stroke="white"
          strokeWidth="3"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
          }}
        />
              </svg>

      {/* Center Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: [0.8, 1.05, 1],
        }}
        transition={{
          delay: 0.4,
          duration: 0.6,
        }}
        className="absolute flex h-40 w-40 flex-col items-center justify-center rounded-full border border-white/20 bg-white/70 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/70"
      >
        {/* Score */}
        <motion.h2
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.6,
          }}
          className="bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500 bg-clip-text text-6xl font-black leading-none text-transparent"
        >
          {displayScore}%
        </motion.h2>

        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-2 text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400"
        >
          ATS SCORE
        </motion.p>

        {/* Stars */}
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 1,
          }}
          className="mt-3 flex items-center gap-1"
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <motion.span
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 1 + index * 0.08,
                type: "spring",
                stiffness: 300,
              }}
              className={
                index < status.stars
                  ? "text-yellow-400"
                  : "text-slate-300 dark:text-slate-600"
              }
            >
              ★
            </motion.span>
          ))}
        </motion.div>

        {/* Status Badge */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 1.2,
          }}
          className="mt-4"
        >
          <span
            className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-lg ${
              isExcellent ? "animate-pulse" : ""
            }`}
            style={{
              background: `linear-gradient(135deg, ${status.color}, #3b82f6)`,
            }}
          >
            {isExcellent ? "🏆" : "✨"} {status.label}
          </span>
        </motion.div>
      </motion.div>

      {/* Decorative Outer Ring */}
      <motion.div
        className="absolute h-[250px] w-[250px] rounded-full border border-violet-400/20"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Decorative Inner Ring */}
      <motion.div
        className="absolute h-[185px] w-[185px] rounded-full border border-white/20 dark:border-slate-700/40"
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}