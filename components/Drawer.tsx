"use client";

import type { Lang, MenuMeta } from "@/types/menu";
import { Icon } from "./Icon";

interface DrawerProps {
  meta: MenuMeta;
  lang: Lang;
  setLang: (l: Lang) => void;
  tx: (tr: string, en: string) => string;
  onClose: () => void;
}

export function Drawer({ meta, lang, setLang, tx, onClose }: DrawerProps) {
  const hours = [
    [tx("Pzt – Per", "Mon – Thu"), "08:00 – 02:00"],
    [tx("Cum – Cmt", "Fri – Sat"), "08:00 – 03:00"],
    [tx("Pazar", "Sunday"), "09:00 – 01:00"],
  ];

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 40 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,.55)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "82%",
          maxWidth: 320,
          background: "oklch(8% 0.02 295)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          animation: "slideRight .25s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: 20,
              fontWeight: 600,
              color: "var(--text)",
            }}
          >
            MAF Lounge Cafe
          </span>
          <button onClick={onClose} style={ghostBtn()}>
            <Icon name="close" size={18} />
          </button>
        </div>

        <div style={{ padding: "16px 20px 20px", flex: 1, overflowY: "auto" }}>
          {/* WiFi */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "var(--accent)",
              }}
            >
              <Icon name="wifi" size={20} />
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                }}
              >
                {tx("Wifi", "WiFi")}
              </span>
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text)",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
              }}
            >
              {meta.wifi.name}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <DrawerRow
              icon="instagram"
              label={"@" + meta.instagram}
              hint="Instagram"
            />
            <DrawerRow
              icon="phone"
              label={meta.phone}
              hint={tx("Rezervasyon · WhatsApp", "Reservation · WhatsApp")}
              onClick={() => {
                const num = meta.phone.replace(/\D/g, "");
                window.open(`https://wa.me/${num}`, "_blank");
              }}
            />
            <DrawerRow
              icon="globe"
              label={lang === "tr" ? "English" : "Türkçe"}
              hint={tx("Dil değiştir", "Switch language")}
              onClick={() => {
                setLang(lang === "tr" ? "en" : "tr");
                onClose();
              }}
            />
          </div>

          {/* Hours */}
          <div
            style={{
              marginTop: 22,
              padding: 16,
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--sub)",
                fontWeight: 600,
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                marginBottom: 10,
              }}
            >
              {tx("Çalışma saatleri", "Hours")}
            </div>
            {hours.map(([day, time]) => (
              <div
                key={day}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 6,
                  fontSize: 13,
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                }}
              >
                <span style={{ color: "var(--sub)" }}>{day}</span>
                <span style={{ fontFamily: "ui-monospace, monospace", color: "var(--text)" }}>
                  {time}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 22,
              textAlign: "center",
              color: "var(--sub)",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
          >
            {tx("Tüm hakları saklıdır", "All rights reserved")} · MAF © 2026
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawerRow({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: string;
  label: string;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        color: "var(--text)",
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
        width: "100%",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "rgba(255,255,255,.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--accent)",
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
        {hint && (
          <div
            style={{
              fontSize: 10,
              color: "var(--sub)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: 2,
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
          >
            {hint}
          </div>
        )}
      </div>
      {onClick && <Icon name="chev" size={14} />}
    </button>
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
