import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  Target,
  Check,
  Plus,
} from "lucide-react";

export default function SkillsComparison({
  matchedSkills = [],
  missingSkills = [],
}) {
  const totalSkills = matchedSkills.length + missingSkills.length;

  const matchPercent =
    totalSkills === 0
      ? 100
      : Math.round((matchedSkills.length / totalSkills) * 100);

  const SkillChip = ({ skill, positive }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        y: -4,
        scale: 1.04,
      }}
      transition={{
        type: "spring",
        stiffness: 250,
      }}
      className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-300

      ${
        positive
          ? "border-emerald-200 bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-emerald-300/40"
          : "border-red-200 bg-gradient-to-r from-rose-500 to-red-500 text-white hover:shadow-red-300/40"
      }

      hover:shadow-lg`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">

        {positive ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}

      </span>

      {skill}
    </motion.div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
    >

      {/* ================= HEADER ================= */}

      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 p-8">

        <div className="absolute inset-0 opacity-20">

          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white blur-3xl" />

          <div className="absolute -bottom-16 left-0 h-56 w-56 rounded-full bg-cyan-300 blur-3xl" />

        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">

              <Sparkles className="h-5 w-5 text-white" />

              <span className="text-sm font-semibold text-white">
                AI Skill Matching
              </span>

            </div>

            <h2 className="text-3xl font-bold text-white md:text-4xl">

              Skills Comparison

            </h2>

            <p className="mt-3 max-w-2xl text-violet-100 leading-7">

              AI compared your resume skills with the job description and
              identified matched skills and missing requirements that can
              improve your ATS score.

            </p>

          </div>

          {/* Match Card */}

          <div className="rounded-3xl border border-white/20 bg-white/10 px-7 py-6 backdrop-blur">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">

                <Target className="h-8 w-8 text-yellow-300" />

              </div>

              <div>

                <h2 className="text-5xl font-bold text-white">

                  {matchPercent}%

                </h2>

                <p className="mt-1 text-sm text-violet-100">

                  Skill Match

                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Progress */}

        <div className="mt-8">

          <div className="h-3 overflow-hidden rounded-full bg-white/20">

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${matchPercent}%` }}
              transition={{ duration: 1 }}
              className="h-full rounded-full bg-white"
            />

          </div>

        </div>

      </div>

      {/* ================= CONTENT ================= */}

      <div className="grid gap-8 p-8 lg:grid-cols-2">

        {/* ================= MATCHED SKILLS ================= */}
                <motion.div
          initial={{ opacity: 0, x: -25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-7 shadow-sm dark:border-emerald-900 dark:from-emerald-900/20 dark:via-slate-900 dark:to-slate-900"
        >

          <div className="mb-6 flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">

              <CheckCircle2 className="h-7 w-7 text-emerald-500" />

            </div>

            <div>

              <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                Matched Skills
              </h3>

              <p className="text-sm text-slate-500">
                {matchedSkills.length} skills detected
              </p>

            </div>

          </div>

          <div className="flex flex-1 flex-wrap content-start gap-3">

            {matchedSkills.length ? (
              matchedSkills.map((skill) => (
                <SkillChip
                  key={skill}
                  skill={skill}
                  positive
                />
              ))
            ) : (
              <div className="flex w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 p-10 text-slate-500 dark:border-slate-700">
                No matched skills found.
              </div>
            )}

          </div>

        </motion.div>

        {/* ================= MISSING SKILLS ================= */}

        <motion.div
          initial={{ opacity: 0, x: 25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-white p-7 shadow-sm dark:border-red-900 dark:from-red-900/20 dark:via-slate-900 dark:to-slate-900"
        >

          <div className="mb-6 flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">

              <XCircle className="h-7 w-7 text-red-500" />

            </div>

            <div>

              <h3 className="text-2xl font-bold text-red-700 dark:text-red-300">
                Missing Skills
              </h3>

              <p className="text-sm text-slate-500">
                {missingSkills.length} skills recommended
              </p>

            </div>

          </div>

          <div className="flex flex-1 flex-wrap content-start gap-3">

            {missingSkills.length ? (
              missingSkills.map((skill) => (
                <SkillChip
                  key={skill}
                  skill={skill}
                />
              ))
            ) : (
              <div className="flex w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 p-10 text-slate-500 dark:border-slate-700">
                Excellent! No missing skills detected.
              </div>
            )}

          </div>

        </motion.div>

      </div>

      {/* ================= BOTTOM SECTION ================= */}

      <div className="grid gap-6 px-8 pb-8 lg:grid-cols-2">

        {/* Strength */}

        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-6 dark:border-emerald-800 dark:from-emerald-900/20 dark:to-slate-900">

          <div className="mb-4 flex items-center gap-3">

            <CheckCircle2 className="h-6 w-6 text-emerald-500" />

            <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              Resume Strength
            </h3>

          </div>

          <p className="leading-7 text-slate-600 dark:text-slate-300">

            Your resume already includes many relevant technical skills
            recognized by ATS systems. Maintaining this alignment improves
            recruiter visibility and increases interview opportunities.

          </p>

        </div>

        {/* Recommendation */}

        <div className="rounded-3xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white p-6 dark:border-violet-800 dark:from-violet-900/20 dark:to-slate-900">

          <div className="mb-4 flex items-center gap-3">

            <TrendingUp className="h-6 w-6 text-violet-500" />

            <h3 className="text-lg font-bold text-violet-700 dark:text-violet-300">
              AI Recommendation
            </h3>

          </div>

          <p className="leading-7 text-slate-600 dark:text-slate-300">

            Add the missing skills through projects, certifications,
            internships, or measurable work experience. Tailoring your resume
            for every application can noticeably improve your ATS score and
            recruiter match percentage.

          </p>

        </div>

      </div>

    </motion.section>
  );
}