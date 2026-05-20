export type BedType = "TWIN" | "DOUBLE" | "QUEEN" | "KING" | "SOFA_BED" | "BUNK";

export const BED_LABELS: Record<BedType, string> = {
  TWIN: "Individual",
  DOUBLE: "Matrimonial",
  QUEEN: "Queen",
  KING: "King",
  SOFA_BED: "Sofá cama",
  BUNK: "Litera",
};

export const BED_TYPES = ["TWIN", "DOUBLE", "QUEEN", "KING", "SOFA_BED", "BUNK"] as const;

export function summarizeBeds(
  beds: { type: BedType; quantity: number }[]
): string {
  if (beds.length === 0) return "Sin información de camas";
  return beds
    .map(
      (b) =>
        `${b.quantity} ${BED_LABELS[b.type].toLowerCase()}${b.quantity > 1 ? "s" : ""}`
    )
    .join(" · ");
}
