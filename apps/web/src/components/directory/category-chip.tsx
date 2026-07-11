"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { CategoryChip as CategoryChipToken, CategoryKey } from "@/lib/categories";

export type CategoryChipProps = {
  chip: CategoryChipToken;
  active?: boolean;
  onSelect?: (key: CategoryKey) => void;
  className?: string;
};

/**
 * Vertical category filter chip: delivered circular icon over a short label.
 * Selection is a plain image swap — light version resting, navy version when
 * selected — reinforced by a soft navy halo around the icon and a bold navy
 * label. Both variants stay mounted (opacity toggle) so the first selection
 * never flashes while the navy PNG loads.
 */
function CategoryChip({ chip, active = false, onSelect, className }: CategoryChipProps) {
  const { icon, label } = chip;

  return (
    <button
      type="button"
      data-slot="category-chip"
      data-active={active}
      onClick={() => onSelect?.(chip.key)}
      className={cn(
        "flex w-16 shrink-0 cursor-pointer flex-col items-center gap-[7px] border-none bg-transparent",
        className,
      )}
    >
      <span
        aria-hidden
        className="relative size-[52px] rounded-full transition-shadow"
        style={{
          // Soft halo in the brand navy (#1C2E4A) marking the active category.
          boxShadow: active ? "0 3px 12px rgba(28, 46, 74, 0.45)" : undefined,
        }}
      >
        <Image
          src={icon.light}
          alt=""
          width={52}
          height={52}
          className={cn("absolute inset-0", active && "opacity-0")}
        />
        <Image
          src={icon.navy}
          alt=""
          width={52}
          height={52}
          className={cn("absolute inset-0", !active && "opacity-0")}
        />
      </span>
      <span
        className={cn(
          "text-[11px] whitespace-nowrap",
          active ? "font-bold text-ink" : "font-medium text-ink-muted",
        )}
      >
        {label}
      </span>
    </button>
  );
}

export { CategoryChip };
