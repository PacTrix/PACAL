"use client";

import { useEffect, useRef, useState } from "react";

import { api } from "~/trpc/react";
import { ENTRY_CONDITION_LABELS, ENTRY_CONDITIONS } from "~/server/db/schema";

const formatDatetimeLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};

const extractFilename = (photoPath: string): string =>
  photoPath.split("/").pop() ?? "";

export function EntryEditForm({ id }: { id: number }) {
  const { data: entry, isPending, isError } = api.entries.getById.useQuery({ id });

  const [timestamp, setTimestamp] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [weightG, setWeightG] = useState("");
  const [calories, setCalories] = useState("");
  const [note, setNote] = useState("");
  // null = conserve la photo existante ; undefined = supprimée ; string = nouveau chemin après upload
  const [existingPhotoPath, setExistingPhotoPath] = useState<string | null>(null);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreviewUrl, setNewPhotoPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Pré-remplissage dès que l'entrée est chargée
  useEffect(() => {
    if (!entry) return;
    setTimestamp(formatDatetimeLocal(new Date(entry.timestamp)));
    setCondition(entry.condition);
    setDescription(entry.description ?? "");
    setWeightG(entry.weightG != null ? String(entry.weightG) : "");
    setCalories(entry.calories != null ? String(entry.calories) : "");
    setNote(entry.note ?? "");
    setExistingPhotoPath(entry.photoPath ?? null);
  }, [entry]);

  const updateEntry = api.entries.update.useMutation({
    onSuccess: () => {
      setSaved(true);
      if (newPhotoPreviewUrl) URL.revokeObjectURL(newPhotoPreviewUrl);
      setNewPhotoFile(null);
      setNewPhotoPreviewUrl(null);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleNewPhoto = (file: File | null) => {
    if (newPhotoPreviewUrl) URL.revokeObjectURL(newPhotoPreviewUrl);
    if (file) {
      setNewPhotoFile(file);
      setNewPhotoPreviewUrl(URL.createObjectURL(file));
    } else {
      setNewPhotoFile(null);
      setNewPhotoPreviewUrl(null);
    }
  };

  const handleRemovePhoto = () => {
    handleNewPhoto(null);
    setExistingPhotoPath(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!condition) return;

    setIsUploading(true);
    let finalPhotoPath: string | null | undefined = existingPhotoPath;

    try {
      if (newPhotoFile) {
        const fd = new FormData();
        fd.append("file", newPhotoFile);
        const res = await fetch("/api/photos", { method: "POST", body: fd });
        if (res.ok) {
          const data = (await res.json()) as { path: string };
          finalPhotoPath = data.path;
        }
      } else if (existingPhotoPath === null) {
        // Photo explicitement supprimée
        finalPhotoPath = null;
      }

      await updateEntry.mutateAsync({
        id,
        timestamp: new Date(timestamp),
        condition: condition as (typeof ENTRY_CONDITIONS)[number],
        description: description.trim() || undefined,
        weightG: weightG !== "" ? parseFloat(weightG) : undefined,
        calories: calories !== "" ? parseFloat(calories) : undefined,
        note: note.trim() || undefined,
        photoPath: finalPhotoPath ?? undefined,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isPending) return <p className="text-sm text-gray-500">Chargement…</p>;
  if (isError) return <p className="text-sm text-red-600">Entrée introuvable.</p>;

  const isPending2 = isUploading || updateEntry.isPending;

  // Photo à afficher : nouvelle (preview local) > existante (via serve route)
  const showNewPreview = !!newPhotoPreviewUrl;
  const existingFilename = existingPhotoPath ? extractFilename(existingPhotoPath) : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Horodatage */}
      <div className="flex flex-col gap-1">
        <label htmlFor="edit-timestamp" className="text-sm font-medium">
          Date et heure
        </label>
        <input
          id="edit-timestamp"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Condition */}
      <div className="flex flex-col gap-1">
        <label htmlFor="edit-condition" className="text-sm font-medium">
          Contexte <span className="text-red-500">*</span>
        </label>
        <select
          id="edit-condition"
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

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label htmlFor="edit-description" className="text-sm font-medium">
          Description{" "}
          <span className="text-xs font-normal text-gray-500">(optionnel)</span>
        </label>
        <input
          id="edit-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Poids + calories */}
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="edit-weight" className="text-sm font-medium">
            Poids (g){" "}
            <span className="text-xs font-normal text-gray-500">(optionnel)</span>
          </label>
          <input
            id="edit-weight"
            type="number"
            min="0"
            step="any"
            value={weightG}
            onChange={(e) => setWeightG(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="edit-calories" className="text-sm font-medium">
            Calories (kcal){" "}
            <span className="text-xs font-normal text-gray-500">(optionnel)</span>
          </label>
          <input
            id="edit-calories"
            type="number"
            min="0"
            step="any"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Note */}
      <div className="flex flex-col gap-1">
        <label htmlFor="edit-note" className="text-sm font-medium">
          Note{" "}
          <span className="text-xs font-normal text-gray-500">(optionnel)</span>
        </label>
        <textarea
          id="edit-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Photo */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Photo{" "}
          <span className="text-xs font-normal text-gray-500">(optionnel)</span>
        </span>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleNewPhoto(e.target.files?.[0] ?? null)}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleNewPhoto(e.target.files?.[0] ?? null)}
        />

        {showNewPreview ? (
          <div className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={newPhotoPreviewUrl!}
              alt="Nouvelle photo"
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
                onClick={handleRemovePhoto}
                className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-600"
              >
                Retirer
              </button>
            </div>
          </div>
        ) : existingFilename ? (
          <div className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/photos/${existingFilename}`}
              alt="Photo existante"
              className="h-40 w-full rounded border border-gray-200 object-cover"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm"
              >
                Remplacer
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-600"
              >
                Supprimer
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

      <button
        type="submit"
        disabled={isPending2 || !condition}
        className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isPending2
          ? "Enregistrement…"
          : saved
            ? "✓ Enregistré"
            : "Enregistrer les modifications"}
      </button>

      {updateEntry.isError && (
        <p className="text-sm text-red-600">
          Erreur lors de l&apos;enregistrement. Réessayez.
        </p>
      )}
    </form>
  );
}
