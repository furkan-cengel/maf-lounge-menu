"use client";

import { useEffect, useRef } from "react";
import type { Branch, BranchCategory, Lang } from "@/types/menu";

interface BranchNavProps {
  branches: Branch[];
  lang: Lang;
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
}

export function BranchNav({
  branches,
  lang,
  activeBranchId,
  setActiveBranchId,
}: BranchNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const pill = pillRefs.current.get(activeBranchId);
    const nav = navRef.current;
    if (!pill || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();
    const scrollOffset =
      pillRect.left - navRect.left - navRect.width / 2 + pillRect.width / 2;
    nav.scrollBy({ left: scrollOffset, behavior: "auto" });
  }, [activeBranchId]);

  return (
    <div
      ref={navRef}
      style={{
        display: "flex",
        gap: 8,
        padding: "10px 16px",
        overflowX: "auto",
        scrollSnapType: "x mandatory",
      }}
    >
      {branches.map((branch) => {
        const isActive = branch.id === activeBranchId;
        const label = lang === "tr" ? branch.tr : branch.en;
        return (
          <button
            key={branch.id}
            ref={(el) => {
              if (el) pillRefs.current.set(branch.id, el);
            }}
            onClick={() => setActiveBranchId(branch.id)}
            style={{
              flexShrink: 0,
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 12,
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s ease, color 0.15s ease",
              scrollSnapAlign: "start",
              background: isActive ? "var(--accent)" : "var(--surface)",
              color: isActive ? "oklch(10% 0.04 295)" : "var(--text)",
              minHeight: 32,
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {label}
            {branch.comingSoon && (
              <span
                style={{
                  fontSize: 8,
                  letterSpacing: "0.12em",
                  padding: "2px 5px",
                  borderRadius: 999,
                  background: isActive
                    ? "rgba(0,0,0,0.2)"
                    : "oklch(50% 0.18 295 / 0.3)",
                  color: isActive ? "oklch(10% 0.04 295)" : "var(--accent)",
                  fontWeight: 700,
                }}
              >
                YAKINDA
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface CategoryNavProps {
  categories: BranchCategory[];
  lang: Lang;
  activeCategoryId: string;
  setActiveCategoryId: (id: string) => void;
}

export function CategoryNav({
  categories,
  lang,
  activeCategoryId,
  setActiveCategoryId,
}: CategoryNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const pill = pillRefs.current.get(activeCategoryId);
    const nav = navRef.current;
    if (!pill || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();
    const scrollOffset =
      pillRect.left - navRect.left - navRect.width / 2 + pillRect.width / 2;
    nav.scrollBy({ left: scrollOffset, behavior: "auto" });
  }, [activeCategoryId]);

  return (
    <div
      ref={navRef}
      style={{
        display: "flex",
        gap: 8,
        padding: "8px 16px 10px",
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        borderTop: "1px solid var(--border)",
      }}
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeCategoryId;
        const label = lang === "tr" ? cat.tr : cat.en;
        return (
          <button
            key={cat.id}
            ref={(el) => {
              if (el) pillRefs.current.set(cat.id, el);
            }}
            onClick={() => setActiveCategoryId(cat.id)}
            style={{
              flexShrink: 0,
              padding: "5px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s ease, color 0.15s ease",
              scrollSnapAlign: "start",
              background: isActive
                ? `oklch(55% 0.18 ${cat.colorHue})`
                : "var(--surface)",
              color: isActive ? "#fff" : "var(--sub)",
              minHeight: 28,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
