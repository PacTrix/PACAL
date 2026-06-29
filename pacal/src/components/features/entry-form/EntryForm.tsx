"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { api } from "~/trpc/react";
import {
  ENTRY_CONDITION_LABELS,
  ENTRY_CONDITIONS,
  ENTRY_UNITS,
  NOTE_TYPES,
} from "~/server/db/schema";
import { BarcodeScanner } from "./BarcodeScanner";
import { NutriscoreDisplay } from "./NutriscoreDisplay";
import type { OFFProduct } from "~/lib/openfoodfacts";
import { computeKcal, isKcalUnavailable } from "~/lib/kcal";

const LAST_CONTEXT_KEY = "pacal_last_context";

const formatDatetimeLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};

type PhotoSlot = { file: File | null; previewUrl: string | null };
const emptySlot = (): PhotoSlot => ({ file: null, previewUrl: null });

// Widget photos compact — 4 boutons sur une ligne, previews en dessous
function PhotosWidget({
  slot1,
  slot2,
  onChangeSlot1,
  onChangeSlot2,
}: {
  slot1: PhotoSlot;
  slot2: PhotoSlot;
  onChangeSlot1: (s: PhotoSlot) => void;
  onChangeSlot2: (s: PhotoSlot) => void;
}) {
  const cam1Ref = useRef<HTMLInputElement>(null);
  const gal1Ref = useRef<HTMLInputElement>(null);
  const cam2Ref = useRef<HTMLInputElement>(null);
  const gal2Ref = useRef<HTMLInputElement>(null);

  const handleFile = (slot: PhotoSlot, onChange: (s: PhotoSlot) => void, file: File | null) => {
    if (slot.previewUrl) URL.revokeObjectURL(slot.previewUrl);
    onChange(file ? { file, previewUrl: URL.createObjectURL(file) } : emptySlot());
  };

  return (
    <div className="flex flex-col gap-2">
      <input ref={cam1Ref} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(slot1, onChangeSlot1, e.target.files?.[0] ?? null)} />
      <input ref={gal1Ref} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(slot1, onChangeSlot1, e.target.files?.[0] ?? null)} />
      <input ref={cam2Ref} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(slot2, onChangeSlot2, e.target.files?.[0] ?? null)} />
      <input ref={gal2Ref} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(slot2, onChangeSlot2, e.target.files?.[0] ?? null)} />
      <div className="grid grid-cols-4 gap-1.5">
        <button type="button" onClick={() => cam1Ref.current?.click()} className="flex flex-col items-center gap-0.5 rounded border border-brand-marine px-1 py-2 text-xs text-brand-marine hover:bg-blue-50">
          <span>📷</span><span>Photo 1</span>
        </button>
        <button type="button" onClick={() => gal1Ref.current?.click()} className="flex flex-col items-center gap-0.5 rounded border border-brand-marine px-1 py-2 text-xs text-brand-marine hover:bg-blue-50">
          <span>🖼</span><span>Galerie 1</span>
        </button>
        <button type="button" onClick={() => cam2Ref.current?.click()} className="flex flex-col items-center gap-0.5 rounded border border-brand-marine px-1 py-2 text-xs text-brand-marine hover:bg-blue-50">
          <span>📷</span><span>Photo 2</span>
        </button>
        <button type="button" onClick={() => gal2Ref.current?.click()} className="flex flex-col items-center gap-0.5 rounded border border-brand-marine px-1 py-2 text-xs text-brand-marine hover:bg-blue-50">
          <span>🖼</span><span>Galerie 2</span>
        </button>
      </div>
      {(slot1.previewUrl ?? slot2.previewUrl) && (
        <div className="flex gap-2">
          {slot1.previewUrl && (
            <div className="flex flex-1 flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slot1.previewUrl} alt="Photo 1" className="h-24 w-full rounded border border-gray-200 object-cover" />
              <button type="button" onClick={() => handleFile(slot1, onChangeSlot1, null)} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600">Retirer 1</button>
            </div>
          )}
          {slot2.previewUrl && (
            <div className="flex flex-1 flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slot2.previewUrl} alt="Photo 2" className="h-24 w-full rounded border border-gray-200 object-cover" />
              <button type="button" onClick={() => handleFile(slot2, onChangeSlot2, null)} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600">Retirer 2</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

async function uploadPhoto(file: File): Promise<string | undefined> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/photos", { method: "POST", body: fd });
  if (!res.ok) return undefined;
  const data = (await res.json()) as { path: string };
  return data.path;
}

export function EntryForm() {
  const searchParams = useSearchParams();

  // Pré-remplissage depuis duplication (query params) ou depuis localStorage
  const dupCondition = searchParams.get("condition") ?? "";
  const savedContext =
    typeof window !== "undefined"
      ? (localStorage.getItem(LAST_CONTEXT_KEY) ?? "")
      : "";
  const initialCondition = dupCondition || savedContext || "chez_moi";

  // Reconstruction offData depuis params de duplication
  const dupNutriscore = searchParams.get("nutriscore");
  const dupNova = searchParams.get("nova");
  const dupGreenscore = searchParams.get("greenscore");
  const dupKcalPer100g = searchParams.get("kcalPer100g");
  const dupKcalPerPortion = searchParams.get("kcalPerPortion");
  const initialOffData: OFFProduct | null =
    dupNutriscore ?? dupNova ?? dupGreenscore
      ? {
          name: null,
          nutriscore: dupNutriscore as OFFProduct["nutriscore"],
          nova: dupNova ? (parseInt(dupNova, 10) as OFFProduct["nova"]) : null,
          greenscore: dupGreenscore as OFFProduct["greenscore"],
          kcalPer100g: dupKcalPer100g ? parseFloat(dupKcalPer100g) : null,
          kcalPerPortion: dupKcalPerPortion ? parseFloat(dupKcalPerPortion) : null,
        }
      : null;

  const [timestamp, setTimestamp] = useState(formatDatetimeLocal(new Date()));
  const [condition, setCondition] = useState<string>(initialCondition);
  const [description, setDescription] = useState(searchParams.get("description") ?? "");
  const [quantity, setQuantity] = useState(searchParams.get("quantity") ?? "");
  const [unit, setUnit] = useState(searchParams.get("unit") ?? "");
  const [calories, setCalories] = useState(searchParams.get("calories") ?? "");
  const [note, setNote] = useState(searchParams.get("note") ?? "");
  const [noteType, setNoteType] = useState(searchParams.get("noteType") ?? "");
  const [barcode, setBarcode] = useState(searchParams.get("barcode") ?? "");
  const [offData, setOffData] = useState<OFFProduct | null>(initialOffData);
  const [offError, setOffError] = useState<string | null>(null);
  const [ofIncomplete, setOfIncomplete] = useState(false);
  const [kcalManual, setKcalManual] = useState(false);
  const [photo1, setPhoto1] = useState<PhotoSlot>(emptySlot());
  const [photo2, setPhoto2] = useState<PhotoSlot>(emptySlot());
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [lookupBarcode, setLookupBarcode] = useState("");
  const lookup = api.products.lookup.useQuery(
    { barcode: lookupBarcode },
    { enabled: lookupBarcode.length > 0, retry: false }
  );

  useEffect(() => {
    if (!lookup.data && !lookup.isError && !lookup.isFetching) return;
    if (lookup.isFetching) return;
    if (lookup.isError || lookup.data === null || lookup.data === undefined) {
      setOffData(null);
      setOfIncomplete(true);
      setOffError("Produit non trouvé dans OpenFoodFacts.");
      return;
    }
    const d = lookup.data;
    setOffData(d);
    setOfIncomplete(false);
    setOffError(null);
    if (d.name && !description) setDescription(d.name);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookup.data, lookup.isError, lookup.isFetching]);

  const triggerLookup = (code: string) => {
    const trimmed = code.trim();
    if (trimmed.length < 4) return;
    setLookupBarcode(trimmed);
  };

  // Calcul automatique des kcal depuis données OFF (FR-39)
  useEffect(() => {
    if (!offData || kcalManual) return;
    const qty = quantity !== "" ? parseFloat(quantity) : null;
    const computed = computeKcal(qty, unit || null, offData.kcalPer100g, offData.kcalPerPortion);
    if (computed !== null) {
      setCalories(String(computed));
    } else if (isKcalUnavailable(unit || null, offData.kcalPerPortion, true)) {
      setCalories("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, unit, offData, kcalManual]);

  // Mise à jour du contexte depuis localStorage si pas de duplication en cours
  useEffect(() => {
    if (!dupCondition && !condition) {
      const saved = localStorage.getItem(LAST_CONTEXT_KEY) ?? "";
      if (saved) setCondition(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createEntry = api.entries.create.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimestamp(formatDatetimeLocal(new Date()));
      // Conserver le contexte (ne pas remettre à vide — FR-29)
      setDescription("");
      setQuantity("");
      setUnit("");
      setCalories("");
      setNote("");
      setNoteType("");
      setBarcode("");
      setOffData(null);
      setOffError(null);
      setOfIncomplete(false);
      setLookupBarcode("");
      setKcalManual(false);
      if (photo1.previewUrl) URL.revokeObjectURL(photo1.previewUrl);
      if (photo2.previewUrl) URL.revokeObjectURL(photo2.previewUrl);
      setPhoto1(emptySlot());
      setPhoto2(emptySlot());
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!condition) return;

    setIsUploading(true);
    try {
      const [path1, path2] = await Promise.all([
        photo1.file ? uploadPhoto(photo1.file) : Promise.resolve(undefined),
        photo2.file ? uploadPhoto(photo2.file) : Promise.resolve(undefined),
      ]);

      await createEntry.mutateAsync({
        timestamp: new Date(timestamp),
        condition: condition as (typeof ENTRY_CONDITIONS)[number],
        description: description.trim() || undefined,
        quantity: quantity !== "" ? parseInt(quantity, 10) : undefined,
        unit: unit !== "" ? (unit as (typeof ENTRY_UNITS)[number]) : undefined,
        calories: calories !== "" ? parseFloat(calories) : undefined,
        note: note.trim() || undefined,
        noteType: noteType !== "" ? (noteType as (typeof NOTE_TYPES)[number]) : undefined,
        photoPath1: path1,
        photoPath2: path2,
        barcode: barcode.trim() || undefined,
        nutriscore: offData?.nutriscore ?? undefined,
        nova: offData?.nova ?? undefined,
        greenscore: offData?.greenscore ?? undefined,
        kcalPer100g: offData?.kcalPer100g ?? undefined,
        kcalPerPortion: offData?.kcalPerPortion ?? undefined,
        ofIncomplete: ofIncomplete || undefined,
      });

      // Persister le dernier contexte (FR-29)
      localStorage.setItem(LAST_CONTEXT_KEY, condition);
    } finally {
      setIsUploading(false);
    }
  };

  const isPending = isUploading || createEntry.isPending;

  const noteRef = useRef<HTMLTextAreaElement>(null);
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    const rows = e.target.value.split("\n").length;
    if (noteRef.current) noteRef.current.rows = rows >= 2 ? 3 : 1;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Ligne 1 : Date + ↺ + Contexte (FR-28, FR-4) */}
      <div className="flex items-end gap-2">
        <input
          id="timestamp"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          required
          className="rounded border border-gray-300 px-2 py-2 text-sm text-brand-marine"
          style={{ width: "11rem" }}
        />
        <button
          type="button"
          onClick={() => setTimestamp(formatDatetimeLocal(new Date()))}
          className="shrink-0 rounded border border-gray-300 px-2 py-2 text-base text-gray-500 hover:bg-gray-50"
          title="Actualiser à maintenant"
        >
          ↺
        </button>
        <select
          id="condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          required
          className="flex-1 rounded border border-gray-300 px-2 py-2 text-sm text-brand-marine"
        >
          <option value="">Contexte…</option>
          {ENTRY_CONDITIONS.map((c) => (
            <option key={c} value={c}>{ENTRY_CONDITION_LABELS[c]}</option>
          ))}
        </select>
      </div>

      {/* Description (FR-3) */}
      <input
        id="description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (ex : salade niçoise, cappuccino…)"
        className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
      />

      {/* Code-barres + Scan + scores inline (FR-36, FR-37, FR-38) */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            id="barcode"
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onBlur={() => triggerLookup(barcode)}
            placeholder="Code-barres EAN"
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
          />
          <BarcodeScanner onDetected={(code) => { setBarcode(code); triggerLookup(code); }} />
          {offData && (
            <NutriscoreDisplay
              nutriscore={offData.nutriscore}
              nova={offData.nova}
              greenscore={offData.greenscore}
            />
          )}
        </div>
        {lookup.isFetching && <p className="text-xs text-gray-400">Recherche OpenFoodFacts…</p>}
        {offError && <p className="text-xs text-orange-500">{offError}</p>}
      </div>

      {/* Quantité + Unité + Calories (FR-30, FR-39) */}
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="quantity" className="text-xs text-gray-500">Quantité</label>
          <input
            id="quantity"
            type="number"
            min="0"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
          />
        </div>
        <div className="flex flex-col gap-1" style={{ width: "5.5rem" }}>
          <label htmlFor="unit" className="text-xs text-gray-500">Unité</label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="rounded border border-gray-300 px-2 py-2 text-sm text-brand-marine"
          >
            <option value="">—</option>
            {ENTRY_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1" style={{ width: "5.5rem" }}>
          <label htmlFor="calories" className="flex items-center gap-1 text-xs text-gray-500">
            Kcal {kcalManual && offData && <span className="text-orange-400">✎</span>}
          </label>
          {isKcalUnavailable(unit || null, offData?.kcalPerPortion ?? null, offData !== null) ? (
            <div className="rounded border border-gray-200 bg-gray-50 px-2 py-2 text-sm text-gray-400">---</div>
          ) : (
            <input
              id="calories"
              type="number"
              min="0"
              step="any"
              value={calories}
              onChange={(e) => { setCalories(e.target.value); if (offData) setKcalManual(true); }}
              placeholder="0"
              className="rounded border border-gray-300 px-2 py-2 text-sm text-brand-marine"
            />
          )}
        </div>
      </div>

      {/* Note auto-expand + type (FR-31) */}
      <div className="flex gap-2">
        <textarea
          ref={noteRef}
          id="note"
          value={note}
          onChange={handleNoteChange}
          rows={1}
          placeholder="Note (optionnel)…"
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
          style={{ resize: "none" }}
        />
        <select
          id="noteType"
          value={noteType}
          onChange={(e) => setNoteType(e.target.value)}
          className="rounded border border-gray-300 px-2 py-2 text-sm text-gray-500"
          style={{ width: "7.5rem" }}
        >
          <option value="">Type…</option>
          {NOTE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Photos 4 boutons compacts (FR-33) */}
      <PhotosWidget slot1={photo1} slot2={photo2} onChangeSlot1={setPhoto1} onChangeSlot2={setPhoto2} />

      <button
        type="submit"
        disabled={isPending || !condition}
        className="mt-2 rounded bg-brand-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "Enregistrement…" : saved ? "✓ Enregistré" : "Enregistrer"}
      </button>

      {createEntry.isError && (
        <p className="text-sm text-red-600">
          Erreur lors de l&apos;enregistrement. Réessayez.
        </p>
      )}
    </form>
  );
}
