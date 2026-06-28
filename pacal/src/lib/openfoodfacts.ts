// Seul fichier autorisé à effectuer des appels réseau vers OpenFoodFacts (NFR3)

export interface OFFProduct {
  name: string | null;
  nutriscore: string | null;
  nova: number | null;
  greenscore: string | null;
  kcalPer100g: number | null;
  kcalPerPortion: number | null;
}

interface OFFApiResponse {
  status: number;
  product?: {
    product_name?: string;
    nutriscore_grade?: string;
    nova_group?: number;
    ecoscore_grade?: string;
    nutriments?: {
      "energy-kcal_100g"?: number;
      "energy-kcal_serving"?: number;
    };
  };
}

export async function lookupProduct(barcode: string): Promise<OFFProduct | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
      { signal: controller.signal }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as OFFApiResponse;
    if (data.status === 0 || !data.product) return null;

    const p = data.product;
    const grade = (v: string | undefined): string | null =>
      v && v !== "unknown" && v !== "not-applicable" ? v.toLowerCase() : null;

    return {
      name: p.product_name ?? null,
      nutriscore: grade(p.nutriscore_grade),
      nova: p.nova_group ?? null,
      greenscore: grade(p.ecoscore_grade),
      kcalPer100g: p.nutriments?.["energy-kcal_100g"] ?? null,
      kcalPerPortion: p.nutriments?.["energy-kcal_serving"] ?? null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
