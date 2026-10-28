import { Skeleton } from "@/components/ui/skeleton";

export default function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Skeleton className="h-12 w-72 rounded-xl" />

      {/* ATS + Match Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>

      {/* Skills */}
      <Skeleton className="h-80 rounded-3xl" />

      {/* Suggestions */}
      <Skeleton className="h-72 rounded-3xl" />

      {/* Strengths */}
      <Skeleton className="h-72 rounded-3xl" />
    </div>
  );
}