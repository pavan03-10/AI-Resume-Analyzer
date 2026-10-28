import {
  Loader2,
  Sparkles,
} from "lucide-react";

export default function AnalyzeButton({
  loading,
  disabled,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        group
        relative
        w-full
        overflow-hidden
        rounded-2xl
        py-4
        text-lg
        font-semibold
        text-white
        transition-all
        duration-300

        ${
          loading || disabled
            ? `
              cursor-not-allowed
              bg-slate-600
              opacity-60
              shadow-none
            `
            : `
              bg-gradient-to-r
              from-violet-600
              via-purple-600
              to-indigo-600

              shadow-lg
              shadow-violet-500/25

              hover:-translate-y-0.5
              hover:shadow-xl
              hover:shadow-violet-500/40
            `
        }
      `}
    >
      {/* Glow Effect */}
      {!loading && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 via-white/10 to-indigo-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}

      <span className="relative flex items-center justify-center gap-3">

        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing Resume...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Analyze Resume with AI
          </>
        )}

      </span>

    </button>
  );
}