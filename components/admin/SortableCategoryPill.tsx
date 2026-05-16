"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BranchCategory } from "@/types/menu";

interface Props {
  category: BranchCategory;
  isActive: boolean;
  onClick: () => void;
}

export function SortableCategoryPill({ category, isActive, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
        flexShrink: 0,
        padding: "6px 14px",
        borderRadius: 999,
        fontSize: 12,
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        fontWeight: 600,
        textTransform: "uppercase" as const,
        letterSpacing: "1.2px",
        border: "none",
        background: isActive
          ? `oklch(55% 0.18 ${category.colorHue})`
          : "var(--surface)",
        color: isActive ? "#fff" : "var(--sub)",
        boxShadow: isDragging ? "0 4px 16px rgba(0,0,0,0.4)" : "none",
        whiteSpace: "nowrap" as const,
        position: "relative" as const,
        zIndex: isDragging ? 999 : undefined,
      }}
    >
      {category.tr}
    </button>
  );
}
