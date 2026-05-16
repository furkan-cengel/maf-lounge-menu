import type { Venue, Lang } from "@/types/menu";

interface HeroSectionProps {
  venue: Venue;
  tableNumber: string | null;
  lang: Lang;
  tx: (tr: string, en: string) => string;
}

export function HeroSection({ venue, tableNumber, tx }: HeroSectionProps) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, oklch(20% 0.08 295 / 0.6) 0%, transparent 100%)",
        paddingBottom: 8,
      }}
    >
      <div style={{ padding: "4px 20px 18px" }}>
        <div
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 10,
            color: "var(--sub)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {venue?.greeting}
        </div>
        <div
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontWeight: 500,
            fontSize: 36,
            lineHeight: 1,
            marginTop: 4,
            color: "var(--text)",
          }}
        >
          {(venue?.name ?? "").split("&").map((part, i) => (
            <span key={i}>
              {i > 0 && (
                <span style={{ color: "var(--accent)" }}> &amp; </span>
              )}
              {part.trim()}
            </span>
          ))}
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "var(--sub)",
            display: "flex",
            gap: 14,
            alignItems: "center",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "oklch(70% 0.2 140)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            {venue?.status} · {venue?.hours}
          </span>
          {tableNumber && (
            <span
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "3px 10px",
                fontSize: 11,
              }}
            >
              <span style={{ color: "var(--sub)", marginRight: 4 }}>
                {tx("Masa", "Table")}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--accent)",
                }}
              >
                {tableNumber}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
