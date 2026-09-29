"use client";
// ─── Re-export all UI primitives from one barrel ──────────────────────────────
// Import from "@/components/ui" to get everything in one shot.

export { Chips } from "./Chips";

// Keep the legacy fmt export so existing imports don't break during migration.
// TODO: replace all `fmt` usages with `formatTime` from "@/lib/utils"
export { formatTime as fmt } from "@/lib/utils";
