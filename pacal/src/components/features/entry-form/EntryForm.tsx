"use client";

import { useRef, useState } from "react";

import { api } from "~/trpc/react";
import { ENTRY_CONDITION_LABELS, ENTRY_CONDITIONS } from "~/server/db/schema";

const formatDatetimeLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};

export function EntryForm() {
  const [timestamp, setTimestamp] = useState(formatDatetimeLocal(new Date()));
  const [condition, setCondition] = useState<string>("");
  const [description, setDescription] = useState("");
  const [weightG, setWeightG] = useState("");
  const [calories, setCalories] = useState("");
  const [note, setNote] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const createEntry = api.entries.create.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimestamp(formatDatetimeLocal(new Date()));
      setCondition("");
      setDescription("");
      setWeightG("");
      setCalories("");
      setNote("");
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
      setPhotoFile(null);
      setPhotoPreviewUrl(null);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handlePhotoChange = (file: File | null) => {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    if (file) {
      setPhotoFile(file);
      setPhotoPreviewUrl(URL.createObjectURL(file));
    } else {
      setPhotoFile(null);
      setPhotoPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!condition) return;

    setIsUploading(true);
    let photoPath: string | undefined;

    try {
      if (photoFile) {
        const fd = new FormData();
        fd.append("file", photoFile);
        const res = await fetch("/api/photos", { method: "POST", body: fd });
        if (res.ok) {
          const data = (await res.json()) as { path: string };
          photoPath = data.path;
        }
      }

      await createEntry.mutateAsync({
        timestamp: new Date(timestamp),
        condition: condition as (typeof ENTRY_CONDITIONS)[number],
        description: description.trim() || undefined,
        weightG: weightG !== "" ? parseFloat(weightG) : undefined,
        calories: calories !== "" ? parseFloat(calories) : undefined,
        note: note.trim() || undefined,
        photoPath,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const isPending = isUploading || createEntry.isPending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Horodatage (FR-2) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="timestamp" className="text-sm font-medium">
          Date et heure
        </label>
        <input
          id="timestamp"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Condition de prise (FR-4) — obligatoire */}
      <div className="flex flex-col gap-1">
        <label htmlFor="condition" className="text-sm font-medium">
          Contexte <span className="text-red-500">*</span>
        </label>
        <select
          id="condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Choisir…</option>
          {ENTRY_CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {ENTRY_CONDITION_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      {/* Description (FR-3) — optionnelle */}
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description{" "}
          <span className="text-xs font-normal text-gray-500">(optionnel)</span>
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex : salade niçoise, cappuccino…"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Poids et calories (FR-3) — optionnels */}
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="weightG" className="text-sm font-medium">
            Poids (g){" "}
            <span className="text-xs font-normal text-gray-500">(optionnel)</span>
          </label>
          <input
            id="weightG"
            type="number"
            min="0"
            step="any"
            value={weightG}
            onChange={(e) => setWeightG(e.target.value)}
            placeholder="0"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="calories" className="text-sm font-medium">
            Calories (kcal){" "}
            <span className="text-xs font-normal text-gray-500">(optionnel)</span>
          </label>
          <input
            id="calories"
            type="number"
            min="0"
            step="any"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="0"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Note libre (FR-6) — optionnelle, sans limite */}
      <div className="flex flex-col gap-1">
        <label htmlFor="note" className="text-sm font-medium">
          Note{" "}
          <span className="text-xs font-normal text-gray-500">(optionnel)</span>
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Remarques libres…"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Photo (FR-5) — optionnelle */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Photo{" "}
          <span className="text-xs font-normal text-gray-500">(optionnel)</span>
        </span>

        {/* Inputs cachés */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
        />

        {photoPreviewUrl ? (
          <div className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreviewUrl}
              alt="Aperçu"
              className="h-40 w-full rounded border border-gray-200 object-cover"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm"
              >
                Changer
              </button>
              <button
                type="button"
                onClick={() => handlePhotoChange(null)}
                className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-600"
              >
                Retirer
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
            >
              📷 Prendre une photo
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
            >
              🖼 Depuis la galerie
            </button>
          </div>
        )}
      </div>

      {/* Bouton submit — indicateur discret de chargement (NFR-4) */}
      <button
        type="submit"
        disabled={isPending || !condition}
        className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isPending
          ? "Enregistrement…"
          : saved
            ? "✓ Enregistré"
            : "Enregistrer"}
      </button>

      {createEntry.isError && (
        <p className="text-sm text-red-600">
          Erreur lors de l&apos;enregistrement. Réessayez.
        </p>
      )}
    </form>
  );
}
