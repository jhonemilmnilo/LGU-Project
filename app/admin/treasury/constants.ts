/**
 * Treasury Hub — Category Constants
 *
 * Categories that belong to the Treasury Hub.
 * To add a new category, add it here ONCE — all queries update automatically.
 *
 * NOTE: This is intentionally a separate file from actions.ts because
 * "use server" files can only export async functions — not constants or objects.
 */
export const TREASURY_CATEGORIES = ["CEDULA", "Business Permit", "Civil Registry"] as const;

export type TreasuryCategory = (typeof TREASURY_CATEGORIES)[number];
