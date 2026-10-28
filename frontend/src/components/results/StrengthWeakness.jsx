import { motion } from "framer-motion";
import {
  ThumbsUp,
  TriangleAlert,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function StrengthWeakness({
  strengths = [],
  weaknesses = [],
}) {
  const Item = ({ icon: Icon, text, positive, index }) => (
    <motion.div
      initial={{ opacity: 0, x: positive ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className={`rounded-2xl border p-4 transition-all
      ${
        positive
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-slate-800"
          : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-slate-800"
      }`}
    >
      <div className="flex gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${
            positive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        />
        <p className="leading-6 text-slate-700 dark:text-slate-300">{text}</p>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-100">
              <Sparkles className="h-4 w-4"/>
              Resume Quality Analysis
            </div>
            <h2 className="text-3xl font-bold">Strengths & Improvements</h2>
            <p className="mt-2 text-emerald-100">
              AI evaluation of your resume's strongest areas and opportunities.
            </p>
          </div>

          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
            <ShieldCheck className="mx-auto h-8 w-8"/>
            <p className="mt-2 text-sm font-semibold">AI Reviewed</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-emerald-200 bg-white p-6 dark:border-emerald-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center gap-3">
            <ThumbsUp className="h-7 w-7 text-emerald-600 dark:text-emerald-400"/>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Strengths</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{strengths.length} positive findings</p>
            </div>
          </div>

          <div className="space-y-4">
            {strengths.length ? strengths.map((s,i)=>(
              <Item key={i} icon={CheckCircle2} text={s} positive index={i}/>
            )) : (
              <p className="text-slate-500 dark:text-slate-400">No strengths identified.</p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200 bg-white p-6 dark:border-amber-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center gap-3">
            <TriangleAlert className="h-7 w-7 text-amber-600 dark:text-amber-400"/>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Areas for Improvement</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{weaknesses.length} suggestions</p>
            </div>
          </div>

          <div className="space-y-4">
            {weaknesses.length ? weaknesses.map((w,i)=>(
              <Item key={i} icon={AlertCircle} text={w} index={i}/>
            )) : (
              <p className="text-slate-500 dark:text-slate-400">No improvement areas identified.</p>
            )}
          </div>
        </section>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">Overall Resume Health</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Continue building on your strengths while addressing the improvement areas for better ATS performance.
            </p>
          </div>

          <div className="rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2 font-bold text-white">
            AI Evaluated
          </div>
        </div>
      </div>
    </motion.div>
  );
}