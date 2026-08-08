export interface GoldFormSpec {
    gramsPerUnit: number | null;
    karat: number | null;
    counted: boolean;
}
export declare const GOLD_FORMS: Record<string, GoldFormSpec>;
export declare const GOLD_FORM_KEYS: string[];
export declare function roundGrams(g: number): number;
