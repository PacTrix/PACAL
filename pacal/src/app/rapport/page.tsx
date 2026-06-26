"use client";

import { useState } from "react";

export default function RapportPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleGenerate = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());
    const query = params.size > 0 ? `?${params.toString()}` : "";
    window.location.href = `/api/rapport${query}`;
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">Rapport PDF</h1>

      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Le rapport regroupe vos prises jour par jour, avec les valeurs de
          poids et calories marquées comme estimées ou mesurées.
        </p>

        <div className="flex flex-col gap-3 rounded border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium">Période (optionnel)</p>

          <div className="flex flex-col gap-1">
            <label htmlFor="rapport-from" className="text-sm text-gray-600">
              Du
            </label>
            <input
              id="rapport-from"
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="rapport-to" className="text-sm text-gray-600">
              Au
            </label>
            <input
              id="rapport-to"
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Générer le rapport (.pdf)
        </button>

        {!from && !to && (
          <p className="text-xs text-gray-500">
            Sans filtre de période, toutes les entrées sont incluses dans le
            rapport.
          </p>
        )}
      </div>
    </main>
  );
}
