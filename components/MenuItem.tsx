"use client";

import { useState } from "react";
import type { MenuItem } from "@/types/menu";
import { Thumbnail } from "./Thumbnail";
import { fmt } from "@/utils/fmt";

interface MenuItemCardProps {
  item: MenuItem;
  colorHue: number;
  L: (item: MenuItem) => { name: string; desc: string };
  onSelect: (item: MenuItem) => void;
}

export function MenuItemCard({ item, colorHue, L, onSelect }: MenuItemCardProps) {
  const [pressed, setPressed] = useState(false);
  const { name } = L(item);

  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onClick={() => onSelect(item)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 8,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        height: 96,
        transition: "transform 0.12s ease, opacity 0.12s ease",
        transform: pressed ? "scale(0.98)" : "scale(1)",
        opacity: pressed ? 0.8 : 1,
        cursor: "pointer",
        userSelect: "none",
        textAlign: "left",
        color: "var(--text)",
        width: "100%",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          borderRadius: 10,
          overflow: "hidden",
          width: 78,
          height: 78,
        }}
      >
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Thumbnail colorHue={colorHue} label={name} size={78} />
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          minWidth: 0,
          paddingTop: 4,
          paddingBottom: 4,
          height: 78,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text)",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.3,
            }}
          >
            {name}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--accent)",
              lineHeight: 1,
            }}
          >
            {fmt(item.price)}
          </span>
        </div>
      </div>
    </button>
  );
}
