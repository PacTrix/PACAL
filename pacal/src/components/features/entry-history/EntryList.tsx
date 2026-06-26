"use client";

import Link from "next/link";

import { api } from "~/trpc/react";
import { ENTRY_CONDITION_LABELS } from "~/server/db/schema";

const formatTimestamp = (date: Date): string =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

export function EntryList() {
  const { data, isPending, isError } = api.entries.list.useQuery();

  if (isPending) {
    return <p className="text-sm text-gray-500">Chargement…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        Erreur lors du chargement de l&apos;historique.
      </p>
    );
  }

  if (!data?.length) {
    return (
      <p className="text-sm text-gray-500">
        Aucune prise enregistrée pour l&apos;instant.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {data.map((entry) => (
        <li key={entry.id}>
          <Link
            href={`/entrees/${entry.id}`}
            className="flex flex-col gap-0.5 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50 active:bg-gray-100"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {formatTimestamp(entry.timestamp)}
              </span>
              <span className="shrink-0 text-xs text-gray-500">
                {ENTRY_CONDITION_LABELS[entry.condition as keyof typeof ENTRY_CONDITION_LABELS] ?? entry.condition}
              </span>
            </div>

            {entry.description && (
              <span className="truncate text-sm text-gray-700">
                {entry.description}
              </span>
            )}

            <div className="flex items-center gap-3 text-xs text-gray-400">
              {entry.calories != null && (
                <span>{entry.calories} kcal</span>
              )}
              {entry.photoPath && <span>📷</span>}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
