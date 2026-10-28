import { motion } from "framer-motion";
import {
  Sparkles,
  Award,
  BarChart3,
  FileText,
  Search,
  BookOpen,
  LayoutPanelTop,
  ShieldCheck,
  Target,
  BrainCircuit,
  BriefcaseBusiness,
} from "lucide-react";

import CircularProgress from "./CircularProgress";
import StatusBadge from "./StatusBadge";

export default function AIAnalysisOverview({
  atsScore = 0,
  matchScore = 0,
  breakdown = {},
  matchBreakdown = {},
  matchedSkills = [],
  missingSkills = [],
  suggestions = [],
}) {
  const atsMetrics = [
    {
      label: "Formatting",
      value: breakdown.formatting ?? 0,
      description: "Structure & visual consistency",
      icon: FileText,
      iconClass: "text-violet-500",
      iconBg: "bg-violet-500/10",
    },
    {
      label: "Keywords",
      value: breakdown.keywords ?? 0,
      description: "Role-specific keyword optimization",
      icon: Search,
      iconClass: "text-sky-500",
      iconBg: "bg-sky-500/10",
    },
    {
      label: "Readability",
      value: breakdown.readability ?? 0,
      description: "Clear & recruiter-friendly content",
      icon: BookOpen,
      iconClass: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "Sections",
      value: breakdown.sections ?? 0,
      description: "Resume organization",
      icon: LayoutPanelTop,
      iconClass: "text-amber-500",
      iconBg: "bg-amber-500/10",
    },
  ];

  /*
   * Individual skills remain in SkillsComparison below.
   * These are high-level job-match metrics returned by Gemini.
   */

  const jobMetrics = [
    {
      label: "Skills Match",
      value: matchBreakdown.skills ?? 0,
      color: "from-emerald-500 to-green-500",
    },
    {
      label: "Keyword Relevance",
      value: matchBreakdown.keywords ?? 0,
      color: "from-violet-500 to-indigo-500",
    },
    {
      label: "Experience Match",
      value: matchBreakdown.experience ?? 0,
      color: "from-sky-500 to-cyan-500",
    },
    {
      label: "Education Match",
      value: matchBreakdown.education ?? 0,
      color: "from-amber-500 to-orange-500",
    },
  ];

  const readiness = getReadiness(atsScore, matchScore);
  const matchLabel = getMatchLabel(matchScore);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
    >
      {/* =========================================================
          HEADER
      ========================================================== */}

      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 px-6 py-8 sm:px-8">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">
                AI Powered Analysis
              </span>
            </div>

            <h2 className="text-3xl font-bold text-white">
              ATS & Resume Match Analysis
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100 sm:text-base">
              One unified view of your resume quality and compatibility with
              the target job.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <Award className="h-6 w-6 text-yellow-300" />
            </div>

            <div>
              <p className="text-xs text-violet-100">Overall Readiness</p>
              <p className="font-bold text-white">{readiness}</p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          SCORE HERO
      ========================================================== */}

      <div className="p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ATS SCORE */}

          <ScoreCard
            title="ATS Score"
            subtitle="Applicant Tracking System compatibility"
            score={atsScore}
            icon={BarChart3}
            iconClass="text-violet-500"
            iconBg="bg-violet-500/10"
            gradient="from-violet-600 via-indigo-500 to-cyan-500"
          >
            <div className="mt-6 flex flex-col items-center">
              <CircularProgress score={atsScore} />

              <div className="mt-5">
                <StatusBadge score={atsScore} />
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>{getATSLabel(atsScore)}</span>
              </div>
            </div>
          </ScoreCard>

          {/* RESUME MATCH */}

          <ScoreCard
            title="Resume Match"
            subtitle="Compatibility with the target job description"
            score={matchScore}
            icon={Target}
            iconClass="text-cyan-500"
            iconBg="bg-cyan-500/10"
            gradient="from-cyan-500 via-blue-500 to-violet-600"
          >
            <div className="mt-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Overall Job Compatibility
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {matchLabel}
                  </p>
                </div>

                <span className="text-4xl font-black text-cyan-500">
                  {matchScore}%
                </span>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${clamp(matchScore)}%` }}
                  transition={{ duration: 1, delay: 0.15 }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600"
                />
              </div>

              <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
                <div className="flex items-start gap-3">
                  <BriefcaseBusiness className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400" />

                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                    Your resume has a{" "}
                    <span className="font-bold text-cyan-700 dark:text-cyan-300">
                      {matchScore}%
                    </span>{" "}
                    overall alignment with this role.
                  </p>
                </div>
              </div>
            </div>
          </ScoreCard>
        </div>

        {/* =========================================================
            BREAKDOWN
        ========================================================== */}

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          {/* ATS PERFORMANCE */}

          <AnalysisPanel
            title="ATS Performance"
            description="Your resume performance across key ATS factors."
            icon={BarChart3}
            iconClass="text-violet-500"
            iconBg="bg-violet-500/10"
          >
            <div className="space-y-2.5">
              {atsMetrics.map((metric, index) => {
                const Icon = metric.icon;
                const value = clamp(metric.value);

                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${metric.iconBg}`}
                      >
                        <Icon className={`h-4.5 w-4.5 ${metric.iconClass}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {metric.label}
                          </span>

                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {value}%
                          </span>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${value}%` }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.75,
                              delay: index * 0.06,
                            }}
                            className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnalysisPanel>

          {/* JOB COMPATIBILITY */}

          <AnalysisPanel
            title="Job Compatibility"
            description="How closely your resume aligns with this role."
            icon={Target}
            iconClass="text-cyan-500"
            iconBg="bg-cyan-500/10"
          >
            <div className="space-y-4">
              {jobMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {metric.label}
                    </span>

                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {clamp(metric.value)}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${clamp(metric.value)}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.75,
                        delay: index * 0.06,
                      }}
                      className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-800 dark:bg-cyan-900/20">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />

              <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                Detailed skill matching is shown in the section below, so this
                panel stays focused on high-level role alignment.
              </p>
            </div>
          </AnalysisPanel>
        </div>

        {/* =========================================================
            SNAPSHOT
        ========================================================== */}

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Analysis Snapshot
              </h3>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              Live AI results
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
            <StatCard
              label="ATS Score"
              value={`${atsScore}%`}
              className="text-violet-600 dark:text-violet-400"
            />

            <StatCard
              label="Job Match"
              value={`${matchScore}%`}
              className="text-cyan-600 dark:text-cyan-400"
            />

            <StatCard
              label="Matched"
              value={matchedSkills.length}
              className="text-emerald-600 dark:text-emerald-400"
            />

            <StatCard
              label="Missing"
              value={missingSkills.length}
              className="text-rose-600 dark:text-rose-400"
            />

            <StatCard
              label="AI Tips"
              value={suggestions.length}
              className="text-amber-600 dark:text-amber-400"
            />
          </div>
        </div>

        {/* =========================================================
            INSIGHT + READINESS
        ========================================================== */}

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_260px]">
          <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-cyan-50 px-5 py-4 dark:border-violet-800 dark:from-violet-900/20 dark:via-indigo-900/20 dark:to-cyan-900/20">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                <BrainCircuit className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    AI Hiring Insight
                  </h3>

                  <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-300">
                    AI
                  </span>
                </div>

                <p className="mt-1.5 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {getHiringInsight(atsScore, matchScore)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 text-white dark:from-slate-800 dark:to-slate-700">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Application Readiness
                </p>

                <p className="mt-1 text-xl font-black">
                  {getReadiness(atsScore, matchScore)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function ScoreCard({
  title,
  subtitle,
  score,
  icon: Icon,
  iconClass,
  iconBg,
  gradient,
  children,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-700 dark:bg-slate-800/50"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/5 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconClass}`} />
          </div>

          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        <span
          className={`bg-gradient-to-r ${gradient} bg-clip-text text-4xl font-black text-transparent`}
        >
          {score}%
        </span>
      </div>

      {children}
    </motion.div>
  );
}

function AnalysisPanel({
  title,
  description,
  icon: Icon,
  iconClass,
  iconBg,
  children,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {title}
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:flex ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>
      </div>

      {children}
    </div>
  );
}

function StatCard({ label, value, className }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800">
      <p className={`text-2xl font-black ${className}`}>{value}</p>

      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

function clamp(value) {
  const numeric = Number(value) || 0;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function getATSLabel(score) {
  if (score >= 90) return "Excellent ATS compatibility";
  if (score >= 75) return "Strong ATS compatibility";
  if (score >= 60) return "Moderate ATS compatibility";
  return "ATS optimization recommended";
}

function getMatchLabel(score) {
  if (score >= 85) return "Excellent Match";
  if (score >= 70) return "Strong Match";
  if (score >= 50) return "Good Match";
  return "Needs Improvement";
}

function getReadiness(atsScore, matchScore) {
  const average = (Number(atsScore) + Number(matchScore)) / 2;

  if (average >= 85) return "Application Ready";
  if (average >= 70) return "Nearly Ready";
  if (average >= 55) return "Needs Optimization";
  return "Needs Work";
}

function getHiringInsight(atsScore, matchScore) {
  if (atsScore >= 85 && matchScore >= 85) {
    return "Your resume has strong ATS compatibility and excellent alignment with the target role. You are in a strong position to apply, while continuing to tailor the resume for each opportunity.";
  }

  if (atsScore >= 75 && matchScore >= 70) {
    return "Your resume has a solid foundation and good job alignment. Focus on role-specific keywords, measurable achievements, and the requirements that are currently missing.";
  }

  if (atsScore >= 60 || matchScore >= 60) {
    return "Your resume shows useful strengths, but there is room to improve ATS compatibility and job alignment. Tailoring keywords and strengthening achievement statements should be the priority.";
  }

  return "Your resume would benefit from significant tailoring before applying. Focus first on structure, relevant keywords, measurable achievements, and alignment with the target role.";
}