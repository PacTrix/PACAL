"use client";

interface NutriscoreDisplayProps {
  nutriscore: string | null;
  nova: number | null;
  greenscore: string | null;
}

function nutriscoreColor(grade: string | null): string {
  if (!grade) return "text-gray-400";
  const g = grade.toLowerCase();
  if (g === "a" || g === "b") return "text-green-600";
  if (g === "c") return "text-orange-500";
  return "text-red-600"; // d, e
}

function novaColor(group: number | null): string {
  if (group === null) return "text-gray-400";
  if (group <= 2) return "text-green-600";
  if (group === 3) return "text-orange-500";
  return "text-red-600"; // 4
}

export function NutriscoreDisplay({ nutriscore, nova, greenscore }: NutriscoreDisplayProps) {
  const ns = nutriscore?.toUpperCase() ?? "_";
  const nv = nova !== null ? String(nova) : "_";
  const gs = greenscore?.toUpperCase() ?? "_";

  return (
    <span className="inline-flex items-center gap-0.5 font-mono text-sm font-semibold">
      <span className={nutriscoreColor(nutriscore)}>{ns}</span>
      <span className="text-gray-400">·</span>
      <span className={novaColor(nova)}>{nv}</span>
      <span className="text-gray-400">·</span>
      <span className={nutriscoreColor(greenscore)}>{gs}</span>
    </span>
  );
}
