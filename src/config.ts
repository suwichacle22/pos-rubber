/**
 * Product IDs for easier maintenance.
 * Update these when product IDs change (e.g., after DB reseed).
 * Add new entries as you add products to the system.
 */
export const productIds = {
	palm: "1ea3415d-8c9d-4fea-9a56-d74fb236a9f9",
	// Add more as needed, e.g.:
	// latex: "uuid-here",
	// rubberSheet: "uuid-here",
	// cupRubber: "uuid-here",
} as const;

export type ProductIdKey = keyof typeof productIds;
