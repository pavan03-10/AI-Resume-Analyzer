import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Search,
  Filter,
  ArrowUpDown,
  Loader2,
  RefreshCw,
  X,
  FileSearch,
  SlidersHorizontal,
} from "lucide-react";

import HistoryCard from "./HistoryCard";

import { getAnalyses } from "@/services/resumeApi";

import { fadeUp } from "@/lib/animations";

/* =========================================================
   CONSTANTS
========================================================= */

const TECHNOLOGIES_ONLY = [
  "java",
  "python",
  "javascript",
  "typescript",
  "react",
  "react.js",
  "reactjs",
  "node",
  "node.js",
  "nodejs",
  "sql",
  "html",
  "css",
  "c",
  "c++",
  "c#",
  "php",
  "go",
  "ruby",
  "swift",
  "kotlin",
];

const BLOCKED_ROLE_TEXT = [
  "job description",
  "responsibilities",
  "requirements",
  "qualifications",
  "experience",
  "about the role",
  "about us",
  "company overview",
  "we are",
  "we're",
  "candidate",
  "applicant",
  "skills",
];

const ROLE_KEYWORDS = [
  "developer",
  "engineer",
  "analyst",
  "scientist",
  "designer",
  "architect",
  "manager",
  "administrator",
  "specialist",
  "consultant",
  "programmer",
  "tester",
  "director",
  "intern",
  "executive",
];

/* =========================================================
   DATE
========================================================= */

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   ROLE EXTRACTION
========================================================= */

function cleanRole(value) {
  return String(value || "")
    .replace(/^[\s:,\-–—]+/, "")
    .replace(/[\s:,\-–—]+$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 70);
}

function isValidRole(value) {
  if (!value) {
    return false;
  }

  const role = value.trim();

  if (role.length < 3) {
    return false;
  }

  if (role.length > 70) {
    return false;
  }

  const lowerRole =
    role.toLowerCase();

  if (
    BLOCKED_ROLE_TEXT.some((text) =>
      lowerRole.includes(text)
    )
  ) {
    return false;
  }

  if (
    TECHNOLOGIES_ONLY.includes(
      lowerRole
    )
  ) {
    return false;
  }

  return true;
}

function looksLikeJobTitle(value) {
  const lowerRole =
    value.toLowerCase();

  if (
    TECHNOLOGIES_ONLY.includes(
      lowerRole
    )
  ) {
    return false;
  }

  return ROLE_KEYWORDS.some(
    (keyword) =>
      lowerRole.includes(keyword)
  );
}

function extractRole(jobDescription) {
  const text = String(
    jobDescription || ""
  )
    .replace(/\r/g, "")
    .trim();

  if (!text) {
    return "Resume Analysis";
  }

  /* -------------------------------------------------------
     Explicit job-title formats
  ------------------------------------------------------- */

  const explicitPatterns = [
    /(?:job\s*title|job\s*role)\s*[:\-]\s*([^\n,.;]+)/i,

    /(?:position|role)\s*[:\-]\s*([^\n,.;]+)/i,

    /(?:hiring\s+for|hiring)\s+(?:a|an|the)?\s*([^\n,.;]+)/i,

    /(?:looking\s+for|seeking)\s+(?:a|an|the)?\s*([^\n,.;]+)/i,

    /(?:position\s+of|role\s+of)\s+(?:a|an|the)?\s*([^\n,.;]+)/i,

    /(?:apply\s+for|applying\s+for)\s+(?:the\s+)?(?:position\s+of\s+)?([^\n,.;]+)/i,
  ];

  for (const pattern of explicitPatterns) {
    const match =
      text.match(pattern);

    if (!match?.[1]) {
      continue;
    }

    const role = cleanRole(
      match[1]
    );

    if (isValidRole(role)) {
      return role;
    }
  }

  /* -------------------------------------------------------
     Technology + role
  ------------------------------------------------------- */

  const technologyRolePatterns = [
    /\b((?:senior|junior|lead|associate|principal)?\s*java\s+(?:developer|engineer|programmer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*python\s+(?:developer|engineer|programmer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*javascript\s+(?:developer|engineer|programmer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*typescript\s+(?:developer|engineer|programmer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*react(?:\.js|js)?\s+(?:developer|engineer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*node(?:\.js|js)?\s+(?:developer|engineer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*php\s+(?:developer|engineer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*c\+\+\s+(?:developer|engineer|programmer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*c#\s+(?:developer|engineer|programmer))\b/i,
  ];

  for (const pattern of technologyRolePatterns) {
    const match =
      text.match(pattern);

    if (!match?.[1]) {
      continue;
    }

    const role = cleanRole(
      match[1]
    );

    if (isValidRole(role)) {
      return role;
    }
  }

  /* -------------------------------------------------------
     Common professional roles
  ------------------------------------------------------- */

  const commonRolePatterns = [
    /\b((?:senior|junior|lead|associate|principal)?\s*software\s+(?:engineer|developer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*frontend\s+(?:engineer|developer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*backend\s+(?:engineer|developer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*full[\s-]?stack\s+(?:engineer|developer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*web\s+(?:developer|designer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*mobile\s+(?:developer|engineer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*data\s+(?:analyst|scientist|engineer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*machine[\s-]?learning\s+(?:engineer|scientist))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*AI\s+(?:engineer|developer|scientist))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*cloud\s+(?:engineer|architect))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*DevOps\s+(?:engineer|developer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*cybersecurity\s+(?:engineer|analyst|specialist))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*business\s+analyst)\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*product\s+manager)\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*project\s+manager)\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*UI\/UX\s+(?:designer|developer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*QA\s+(?:engineer|analyst|tester))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*database\s+(?:administrator|engineer))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*network\s+(?:engineer|administrator))\b/i,

    /\b((?:senior|junior|lead|associate|principal)?\s*security\s+(?:engineer|analyst|specialist))\b/i,
  ];

  for (const pattern of commonRolePatterns) {
    const match =
      text.match(pattern);

    if (!match?.[1]) {
      continue;
    }

    const role = cleanRole(
      match[1]
    );

    if (isValidRole(role)) {
      return role;
    }
  }

  /* -------------------------------------------------------
     Generic role
  ------------------------------------------------------- */

  const genericRolePattern =
    /\b((?:senior|junior|lead|associate|principal)?\s*(?:software|frontend|backend|full[\s-]?stack|web|mobile|react|python|java|AI|data|cloud|DevOps|product|business|database|QA|test|cybersecurity|security)\s+(?:engineer|developer|analyst|scientist|designer|architect|administrator|manager|specialist|consultant|programmer|tester))\b/i;

  const genericMatch =
    text.match(
      genericRolePattern
    );

  if (genericMatch?.[1]) {
    const role = cleanRole(
      genericMatch[1]
    );

    if (isValidRole(role)) {
      return role;
    }
  }

  /* -------------------------------------------------------
     First lines
  ------------------------------------------------------- */

  const firstLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 10);

  for (const line of firstLines) {
    const role = cleanRole(line);

    if (
      isValidRole(role) &&
      looksLikeJobTitle(role)
    ) {
      return role;
    }
  }

  return "Resume Analysis";
}

/* =========================================================
   NORMALIZE ANALYSIS
========================================================= */

function normalizeAnalysis(item) {
  const resume =
    item?.resumes || {};

  const atsScore = Number(
    item?.ats_score ?? 0
  );

  const matchScore = Number(
    item?.match_score ?? 0
  );

  return {
    id: item?.id,

    analysisId: item?.id,

    resumeId:
      item?.resume_id,

    filename:
      resume?.filename ||
      "Resume",

    fileType:
      resume?.file_type ||
      "",

    role: extractRole(
      item?.job_description
    ),

    company: "",

    jobDescription:
      item?.job_description ||
      "",

    score: atsScore,

    atsScore,

    matchScore,

    createdAt:
      item?.created_at,

    date: formatDate(
      item?.created_at
    ),

    analysis: {
      ats_score:
        atsScore,

      match_score:
        matchScore,

      breakdown:
        item?.breakdown ||
        {},

      match_breakdown:
        item?.match_breakdown ||
        {},

      summary:
        item?.summary ||
        "",

      strengths:
        Array.isArray(
          item?.strengths
        )
          ? item.strengths
          : [],

      missing_skills:
        Array.isArray(
          item?.missing_skills
        )
          ? item.missing_skills
          : [],

      weaknesses:
        Array.isArray(
          item?.weaknesses
        )
          ? item.weaknesses
          : [],

      suggestions:
        Array.isArray(
          item?.suggestions
        )
          ? item.suggestions
          : [],
    },
  };
}

/* =========================================================
   SCORE CATEGORY
========================================================= */

function getScoreCategory(score) {
  if (score >= 90) {
    return "excellent";
  }

  if (score >= 80) {
    return "good";
  }

  if (score >= 70) {
    return "average";
  }

  return "poor";
}

/* =========================================================
   LOADING SKELETON
========================================================= */

function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-200 dark:bg-slate-800" />

              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-800" />

                <div className="h-4 w-64 max-w-full rounded bg-slate-200 dark:bg-slate-800" />

                <div className="h-3 w-36 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="h-10 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />

              <div className="h-10 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />

              <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-800" />

              <div className="h-10 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   EMPTY SEARCH STATE
========================================================= */

function FilteredEmptyState({
  onClear,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-950/30">
        <Search className="h-7 w-7 text-violet-500" />
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
        No matching analyses
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        We couldn't find any saved analysis
        matching your current search or
        filter.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
      >
        <X className="h-4 w-4" />

        Clear Filters
      </button>
    </motion.div>
  );
}

/* =========================================================
   NO HISTORY STATE
========================================================= */

function EmptyHistoryState() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-950/30">
        <FileSearch className="h-7 w-7 text-violet-500" />
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
        No analyses yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        Once you analyze a resume, your ATS
        scores, job matches, and AI insights
        will appear here.
      </p>
    </motion.div>
  );
}

/* =========================================================
   ERROR STATE
========================================================= */

function HistoryError({
  error,
  onRetry,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20"
    >
      <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
        Couldn't load history
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-red-600 dark:text-red-300">
        {error}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
      >
        <RefreshCw className="h-4 w-4" />

        Try Again
      </button>
    </motion.div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function HistoryList() {
  const [
    historyData,
    setHistoryData,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState("all");

  const [
    sort,
    setSort,
  ] = useState("latest");

  /* =======================================================
     LOAD HISTORY
  ======================================================= */

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAnalyses(100);

      const items =
        Array.isArray(
          response?.analyses
        )
          ? response.analyses
          : [];

      setHistoryData(
        items.map(
          normalizeAnalysis
        )
      );
    } catch (err) {
      console.error(
        "Failed to load analysis history:",
        err
      );

      setError(
        err?.response?.data
          ?.detail ||
          err?.message ||
          "Unable to load analysis history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredData = useMemo(() => {
    let data = [
      ...historyData,
    ];

    const query =
      search
        .trim()
        .toLowerCase();

    /* Search */

    if (query) {
      data = data.filter(
        (item) => {
          const searchableText = [
            item.filename,
            item.role,
            item.company,
            item.jobDescription,
            item.date,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            query
          );
        }
      );
    }

    /* ATS Filter */

    if (filter !== "all") {
      data = data.filter(
        (item) =>
          getScoreCategory(
            item.atsScore
          ) === filter
      );
    }

    /* Sort */

    if (sort === "highest") {
      data.sort(
        (a, b) =>
          b.atsScore -
          a.atsScore
      );
    } else if (
      sort === "lowest"
    ) {
      data.sort(
        (a, b) =>
          a.atsScore -
          b.atsScore
      );
    } else if (
      sort === "match"
    ) {
      data.sort(
        (a, b) =>
          b.matchScore -
          a.matchScore
      );
    } else {
      data.sort(
        (a, b) => {
          const dateA =
            new Date(
              a.createdAt ||
                0
            ).getTime();

          const dateB =
            new Date(
              b.createdAt ||
                0
            ).getTime();

          return (
            dateB - dateA
          );
        }
      );
    }

    return data;
  }, [
    historyData,
    search,
    filter,
    sort,
  ]);

  /* =======================================================
     FILTER STATE
  ======================================================= */

  const hasActiveFilters =
    search.trim().length > 0 ||
    filter !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
    setSort("latest");
  };

  /* =======================================================
     RESULT TEXT
  ======================================================= */

  const resultCount =
    filteredData.length;

  const totalCount =
    historyData.length;

  const resultLabel =
    resultCount === 1
      ? "analysis"
      : "analyses";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <motion.div
      variants={fadeUp}
      className="space-y-6"
    >
      {/* =================================================
          FILTER PANEL
      ================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">

        {/* Header */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-violet-500" />

              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Analysis History
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Search, filter, and sort your
              saved resume analyses.
            </p>
          </div>

          {!loading &&
            totalCount > 0 && (
              <div className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:bg-violet-950/30 dark:text-violet-300">
                {totalCount} saved{" "}
                {totalCount === 1
                  ? "analysis"
                  : "analyses"}
              </div>
            )}
        </div>

        {/* Controls */}

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">

          {/* Search */}

          <div className="relative md:col-span-2 lg:col-span-1">
            <Search
              aria-hidden="true"
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            />

            <input
              id="history-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search resume or job..."
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* ATS Filter */}

          <div className="relative">
            <Filter
              aria-hidden="true"
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            />

            <select
              aria-label="Filter by ATS score"
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">
                All ATS Scores
              </option>

              <option value="excellent">
                Excellent · 90+
              </option>

              <option value="good">
                Good · 80–89
              </option>

              <option value="average">
                Average · 70–79
              </option>

              <option value="poor">
                Needs Work · &lt;70
              </option>
            </select>
          </div>

          {/* Sort */}

          <div className="relative">
            <ArrowUpDown
              aria-hidden="true"
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            />

            <select
              aria-label="Sort analyses"
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value
                )
              }
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="latest">
                Latest First
              </option>

              <option value="highest">
                Highest ATS
              </option>

              <option value="lowest">
                Lowest ATS
              </option>

              <option value="match">
                Highest Job Match
              </option>
            </select>
          </div>
        </div>

        {/* Active filter chips */}

        {(search ||
          filter !== "all" ||
          sort !== "latest") && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active:
            </span>

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-100 dark:bg-violet-950/30 dark:text-violet-300 dark:hover:bg-violet-950/50"
              >
                Search:{" "}
                <span className="max-w-32 truncate">
                  {search}
                </span>

                <X className="h-3 w-3" />
              </button>
            )}

            {filter !== "all" && (
              <button
                type="button"
                onClick={() =>
                  setFilter("all")
                }
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-100 dark:bg-violet-950/30 dark:text-violet-300"
              >
                ATS:{" "}
                {filter ===
                "excellent"
                  ? "90+"
                  : filter === "good"
                  ? "80–89"
                  : filter ===
                    "average"
                  ? "70–79"
                  : "<70"}

                <X className="h-3 w-3" />
              </button>
            )}

            {sort !== "latest" && (
              <button
                type="button"
                onClick={() =>
                  setSort("latest")
                }
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Sort:{" "}
                {sort ===
                "highest"
                  ? "Highest ATS"
                  : sort ===
                    "lowest"
                  ? "Lowest ATS"
                  : "Highest Match"}

                <X className="h-3 w-3" />
              </button>
            )}

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="ml-auto text-xs font-semibold text-violet-600 transition hover:text-violet-700 dark:text-violet-400"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Bottom status */}

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">

          <div className="text-sm text-slate-500 dark:text-slate-400">
            {loading ? (
              "Loading saved analyses..."
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {resultCount}
                </span>{" "}
                {resultLabel}

                {hasActiveFilters &&
                  totalCount !==
                    resultCount && (
                    <>
                      {" "}
                      of{" "}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {totalCount}
                      </span>
                    </>
                  )}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={
              loadHistory
            }
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}

            Refresh
          </button>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================== */}

      <section className="space-y-5">

        {/* Loading */}

        {loading && (
          <HistorySkeleton />
        )}

        {/* Error */}

        {!loading &&
          error && (
            <HistoryError
              error={error}
              onRetry={
                loadHistory
              }
            />
          )}

        {/* Cards */}

        {!loading &&
          !error &&
          filteredData.length >
            0 && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="space-y-5"
            >
              {filteredData.map(
                (analysis) => (
                  <HistoryCard
                    key={
                      analysis.id
                    }
                    analysis={
                      analysis
                    }
                  />
                )
              )}
            </motion.div>
          )}

        {/* Filtered empty */}

        {!loading &&
          !error &&
          filteredData.length ===
            0 &&
          historyData.length >
            0 &&
          hasActiveFilters && (
            <FilteredEmptyState
              onClear={
                clearFilters
              }
            />
          )}

        {/* Completely empty */}

        {!loading &&
          !error &&
          historyData.length ===
            0 && (
            <EmptyHistoryState />
          )}
      </section>
    </motion.div>
  );
}