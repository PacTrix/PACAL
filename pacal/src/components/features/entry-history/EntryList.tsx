"use client";

import Link from "next/link";

import { api } from "~/trpc/react";
import { ENTRY_CONDITION_LABELS, type EntryCondition } from "~/server/db/schema";

const formatTimestamp = (date: Date): string =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

export function EntryList() {
  const utils = api.useUtils();
  const { data, isPending, isError } = api.entries.list.useQuery();

  const deleteMutation = api.entries.delete.useMutation({
    onSuccess: () => utils.entries.list.invalidate(),
  });

  const duplicateMutation = api.entries.create.useMutation({
    onSuccess: () => utils.entries.list.invalidate(),
  });

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

  const handleDelete = (id: number) => {
    if (!window.confirm("Supprimer cette entrée ? Cette action est irréversible.")) return;
    deleteMutation.mutate({ id });
  };

  const handleDuplicate = (entry: typeof data[number]) => {
    duplicateMutation.mutate({
      timestamp: new Date(),
      condition: entry.condition as EntryCondition,
      description: entry.description ?? undefined,
      weightG: entry.weightG ?? undefined,
      calories: entry.calories ?? undefined,
      note: entry.note ?? undefined,
    });
  };

  const isBusy = deleteMutation.isPending || duplicateMutation.isPending;

  return (
    <ul className="flex flex-col gap-2">
      {data.map((entry) => (
        <li key={entry.id} className="flex items-stretch gap-0 rounded-lg border border-gray-200">
          <Link
            href={`/entrees/${entry.id}`}
            className="flex flex-1 flex-col gap-0.5 px-4 py-3 hover:bg-gray-50 active:bg-gray-100"
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

          <div className="flex flex-col gap-1 border-l border-gray-100 px-2 py-2">
            <button
              onClick={() => handleDuplicate(entry)}
              disabled={isBusy}
              className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40"
              title="Dupliquer"
            >
              Dupliquer
            </button>
            <button
              onClick={() => handleDelete(entry.id)}
              disabled={isBusy}
              className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
              title="Supprimer"
            >
              Supprimer
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
