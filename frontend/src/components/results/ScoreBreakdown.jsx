import { motion, animate } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  BookOpen,
  Layout,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const defaultScores = [
  { title: "Formatting", score: 92 },
  { title: "Keywords", score: 85 },
  { title: "Readability", score: 90 },
  { title: "Sections", score: 88 },
];

function AnimatedPercentage({ score }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate(v) {
        setValue(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [score]);

  return (
    <span className="bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-2xl font-bold text-transparent">
      {value}%
    </span>
  );
}

export default function ScoreBreakdown({ scores = defaultScores }) {
  const getIcon = (title) => ({
    Formatting: FileText,
    Keywords: Search,
    Readability: BookOpen,
    Sections: Layout,
  }[title] || FileText);

  const getGradient = (score) => {
    if (score >= 90) return "from-emerald-500 to-green-400";
    if (score >= 80) return "from-violet-500 to-indigo-500";
    if (score >= 70) return "from-amber-500 to-orange-500";
    return "from-red-500 to-rose-500";
  };

  const getStatus = (score) => {
    if (score >= 90)
      return { label: "Excellent", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" };
    if (score >= 80)
      return { label: "Good", icon: CheckCircle2, color: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" };
    if (score >= 70)
      return { label: "Average", icon: AlertCircle, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" };
    return { label: "Needs Work", icon: AlertCircle, color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" };
  };

  const average = Math.round(scores.reduce((a,b)=>a+b.score,0)/scores.length);

  return (
    <motion.div
      initial={{opacity:0,y:20}}
      animate={{opacity:1,y:0}}
      className="group relative mt-10 overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-7 shadow-xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60"
    >
      <motion.div
        className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-cyan-500/10"
        animate={{opacity:[0.3,0.7,0.3]}}
        transition={{duration:5,repeat:Infinity}}
      />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-lg">
          📊
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">ATS Breakdown</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Performance across key resume metrics</p>
        </div>
      </div>

      <div className="space-y-6">
        {scores.map((item,index)=>{
          const Icon=getIcon(item.title);
          const status=getStatus(item.score);
          const StatusIcon=status.icon;
          return (
            <motion.div
              key={item.title}
              initial={{opacity:0,y:20}}
              animate={{opacity:1,y:0}}
              transition={{delay:index*0.12}}
              whileHover={{y:-6,scale:1.02}}
              className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                    <Icon size={20}/>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Resume Quality</p>
                  </div>
                </div>
                <AnimatedPercentage score={item.score}/>
              </div>

              <div className="relative h-3.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <motion.div
                  initial={{width:0}}
                  animate={{width:`${item.score}%`}}
                  transition={{duration:1.2,delay:index*0.12}}
                  className={`h-full rounded-full bg-gradient-to-r ${getGradient(item.score)}`}
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>
                  <StatusIcon size={14}/>
                  {status.label}
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{item.score}/100</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-900/20">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Overall Resume Quality</span>
          <span className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-1 font-bold text-white">
            {average}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}