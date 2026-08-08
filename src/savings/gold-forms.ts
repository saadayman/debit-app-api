/**
 * Standard gold "forms" a user can hold. Coins (counted forms) are entered by
 * quantity and carry a fixed per-unit weight and karat, so the total grams can
 * be derived accurately without weighing. Bars/jewellery are entered by gram.
 *
 * Reference weights: Ottoman "Rashadi" gold lira ≈ 7.2 g; British sovereign
 * (guinea / جنيه إنجليزي) ≈ 7.99 g. Karat per local trading convention.
 */
export interface GoldFormSpec {
  /** Grams per single unit, or null when the form is weighed by gram. */
  gramsPerUnit: number | null;
  /** Fixed karat for counted forms, or null when the user picks the karat. */
  karat: number | null;
  /** true for coins entered by quantity; false for bars/jewellery by gram. */
  counted: boolean;
}

export const GOLD_FORMS: Record<string, GoldFormSpec> = {
  RASHADI_LIRA: { gramsPerUnit: 7.216, karat: 21, counted: true },
  SOVEREIGN: { gramsPerUnit: 7.99, karat: 22, counted: true },
  BAR: { gramsPerUnit: null, karat: null, counted: false },
  JEWELLERY: { gramsPerUnit: null, karat: null, counted: false },
};

export const GOLD_FORM_KEYS = Object.keys(GOLD_FORMS);

/** Round grams to the schema's 3-decimal precision. */
export function roundGrams(g: number): number {
  return Math.round(g * 1000) / 1000;
}
