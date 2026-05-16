"use client";

import { useEffect, useRef } from "react";
import type { BranchCategory, MenuItem } from "@/types/menu";
import { fmt } from "@/utils/fmt";
import { Icon } from "./Icon";

interface SearchOverlayProps {
  search: string;
  setSearch: (v: string) => void;
  filtered: MenuItem[] | null;
  categories: BranchCategory[];
  tx: (tr: string, en: string) => string;
  L: (item: MenuItem) => { name: string; desc: string };
  onClose: () => void;
  onPick: (item: MenuItem) => void;
}

const POPULAR = ["Latte", "Tost", "Burger", "Limonata", "Tatlı", "Kahvaltı"];

export function SearchOverlay({
  search,
  setSearch,
  filtered,
  categories,
  tx,
  L,
  onClose,
  onPick,
}: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 30,
        background: "oklch(5% 0.02 295)",
        display: "flex",
        flexDirection: "column",
        animation: "slidefade .2s ease-out",
      }}
    >
      {/* Search bar */}
      <div
        style={{
          padding: "14px 14px 10px",
          display: "flex",
          gap: 8,
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--surface)",
            borderRadius: 12,
            padding: "0 12px",
            height: 44,
            border: "1px solid var(--border)",
          }}
        >
          <Icon name="search" size={18} />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tx("Yemek, içecek ara…", "Search dishes, drinks…")}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text)",
              fontSize: 15,
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
          />
        </div>
        <button
          onClick={onClose}
          style={{
            height: 44,
            padding: "0 14px",
            borderRadius: 999,
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text)",
            cursor: "pointer",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          {tx("İptal", "Cancel")}
        </button>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {!search.trim() && (
          <div style={{ padding: "24px 20px", color: "var(--sub)", fontSize: 13 }}>
            <div
              style={{
                marginBottom: 8,
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
              }}
            >
              {tx("Popüler aramalar", "Popular searches")}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {POPULAR.map((q) => (
                <button
                  key={q}
                  onClick={() => setSearch(q)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 999,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {filtered && filtered.length === 0 && (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--sub)",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
          >
            {tx("Sonuç bulunamadı", "No results")}
          </div>
        )}

        {filtered &&
          filtered.map((item) => {
            const { name } = L(item);
            const cat = catMap[item.cat];
            const catName = cat ? (tx(cat.tr, cat.en)) : "";
            return (
              <button
                key={item.id}
                onClick={() => onPick(item)}
                style={{
                  width: "100%",
                  display: "flex",
                  gap: 12,
                  padding: "10px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "var(--text)",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 10,
                    background: `oklch(18% .09 ${item.hue ?? cat?.colorHue ?? 285} / 0.95)`,
                    flex: "0 0 56px",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "var(--font-inter), system-ui, sans-serif",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--sub)",
                      marginTop: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontFamily: "var(--font-inter), system-ui, sans-serif",
                    }}
                  >
                    {catName}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-cormorant), serif",
                    fontWeight: 600,
                    color: "var(--accent)",
                    fontSize: 16,
                    alignSelf: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmt(item.price)}
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
