"use client";

import type { Lang } from "@/types/menu";
import { Icon } from "./Icon";

interface HeaderProps {
  lang: Lang;
  onLangToggle: () => void;
  onMenuOpen: () => void;
  onSearchOpen: () => void;
}

export function Header({
  lang,
  onLangToggle,
  onMenuOpen,
  onSearchOpen,
}: HeaderProps) {
  return (
    <div style={{ padding: "16px 16px 10px", position: "relative", zIndex: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onMenuOpen} style={ghostBtn()} aria-label="Menu">
          <Icon name="menu" size={20} />
        </button>

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <MafLogo />
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onSearchOpen} style={ghostBtn()} aria-label="Ara">
            <Icon name="search" size={18} />
          </button>
          <button
            onClick={onLangToggle}
            style={{
              ...ghostBtn(),
              minWidth: 44,
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.1em",
              color: "var(--text)",
            }}
          >
            {lang === "tr" ? "EN" : "TR"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ghostBtn() {
  return {
    height: 36,
    minWidth: 36,
    padding: "0 10px",
    borderRadius: 999,
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text)",
    display: "inline-flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    cursor: "pointer",
  };
}

function MafLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="MAF Coffee & Lounge" style={{ height: 78, width: "auto" }} />
  );
}
