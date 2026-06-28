/**
 * Calcule les kcal d'une portion à partir des données OpenFoodFacts.
 * Retourne null si les données nécessaires sont absentes.
 */
export function computeKcal(
  quantity: number | null,
  unit: string | null,
  kcalPer100g: number | null,
  kcalPerPortion: number | null
): number | null {
  if (!unit || quantity === null || quantity <= 0) return null;

  if (unit === "portion") {
    return kcalPerPortion !== null ? Math.floor(kcalPerPortion) : null;
  }

  if (kcalPer100g === null) return null;

  let grams: number | null = null;
  if (unit === "g") grams = quantity;
  else if (unit === "kg") grams = quantity * 1000;
  else if (unit === "dl") grams = quantity * 100;
  else if (unit === "l") grams = quantity * 1000;

  if (grams === null) return null;
  return Math.floor((grams * kcalPer100g) / 100);
}

/**
 * Indique si le champ kcal doit être grisé (portion sans kcalPerPortion connu).
 */
export function isKcalUnavailable(
  unit: string | null,
  kcalPerPortion: number | null,
  hasOffData: boolean
): boolean {
  return hasOffData && unit === "portion" && kcalPerPortion === null;
}
