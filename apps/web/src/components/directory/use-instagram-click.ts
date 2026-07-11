"use client";

import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";

import { getVisitorId } from "@/lib/visitor-id";

/**
 * Records a Clic a Instagram — the exact same anonymous, fire-and-forget
 * semantics as the Contact WhatsApp (`useWhatsAppContact`): neither a
 * synchronous throw nor an async rejection can block the navigation to
 * instagram.com. The visitor must always reach Instagram, even if tracking is
 * down or slow (ADR-0001). No toast — the anchor navigates in a new tab.
 */
export function useInstagramClick() {
  const recordClick = useMutation(api.table.events.recordInstagramClick);

  return useCallback(
    (commerceId: Id<"commerces">) => {
      void (async () => {
        try {
          await recordClick({ commerceId, visitorId: getVisitorId() });
        } catch {
          // Navigation happens regardless — the click is lost, not the visit.
        }
      })();
    },
    [recordClick],
  );
}
