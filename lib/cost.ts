import type { ProductType } from "@/lib/types";

/**
 * Resolves a product's effective cost by the agreed precedence:
 *   supplier (cheapest/preferred) → recipe (BOM) → manual cost field.
 * BOM applies to finished products only.
 */
export function resolveProductCost(opts: {
  type: ProductType;
  supplierCost: number | null;
  bomCost: number | null;
  manualCost: number | null;
}): number | null {
  if (opts.supplierCost != null) return opts.supplierCost;
  if (opts.type === "finished" && opts.bomCost != null && opts.bomCost > 0) {
    return opts.bomCost;
  }
  return opts.manualCost;
}
