"use client";

import type { MenuItem } from "@/types/menu";
import { fmt } from "@/utils/fmt";
import { Icon } from "./Icon";

interface ItemDetailProps {
  item: MenuItem;
  L: (item: MenuItem) => { name: string; desc: string };
  tx: (tr: string, en: string) => string;
  onClose: () => void;
}

export function ItemDetail({ item, L, tx, onClose }: ItemDetailProps) {
  const { name } = L(item);
  const hue = item.hue ?? 285;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 45 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,.6)",
          backdropFilter: "blur(3px)",
        }}
      />

      {/* Bottom sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          maxWidth: 430,
          marginLeft: "auto",
          marginRight: "auto",
          background: "oklch(8% 0.02 295)",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTop: "1px solid var(--border)",
          maxHeight: "85%",
          overflowY: "auto",
          animation: "slideUp .26s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {/* Hero image area */}
        <div
          style={{
            position: "relative",
            height: 260,
            background: `oklch(18% .09 ${hue} / 0.95)`,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: "hidden",
          }}
        >
          {/* Gradient overlays for visual depth */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg, oklch(45% .14 ${hue} / .55) 0%, transparent 60%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,.4) 0%, transparent 40%, transparent 60%, rgba(0,0,0,.45) 100%)",
            }}
          />

          {/* Drag handle */}
          <div
            style={{
              position: "absolute",
              left: 14,
              top: 14,
              width: 40,
              height: 5,
              borderRadius: 4,
              background: "rgba(255,255,255,.7)",
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 36,
              height: 36,
              borderRadius: 999,
              border: "none",
              background: "rgba(0,0,0,.5)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Icon name="close" size={18} />
          </button>

          {/* Item name watermark */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 14,
              right: 14,
              fontSize: 11,
              color: "rgba(255,255,255,.45)",
              fontFamily: "ui-monospace, monospace",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            — {name.toUpperCase()} —
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "18px 22px 32px" }}>
          {item.badge && (
            <span
              style={{
                display: "inline-block",
                fontSize: 10,
                padding: "4px 9px",
                borderRadius: 999,
                background: "rgba(255,255,255,.08)",
                border: "1px solid var(--border)",
                color: "var(--gold)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 600,
                fontFamily: "var(--font-inter), system-ui, sans-serif",
              }}
            >
              ★ {item.badge}
            </span>
          )}

          <h2
            style={{
              margin: "8px 0 4px",
              fontFamily: "var(--font-cormorant), serif",
              fontWeight: 600,
              fontSize: 26,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color: "var(--text)",
            }}
          >
            {name}
          </h2>

          <div
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: 20,
              fontWeight: 600,
              color: "var(--accent)",
            }}
          >
            {fmt(item.price)}
          </div>
        </div>
      </div>
    </div>
  );
}
