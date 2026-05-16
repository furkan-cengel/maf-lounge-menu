import type { MenuItem } from "@/types/menu";
import { fmt } from "@/utils/fmt";

interface FeaturedCardsProps {
  specials: MenuItem[];
  tx: (tr: string, en: string) => string;
  L: (item: MenuItem) => { name: string; desc: string };
  onItemSelect: (item: MenuItem) => void;
}

export function FeaturedCards({ specials, tx, L, onItemSelect }: FeaturedCardsProps) {
  return (
    <div style={{ paddingBottom: 18 }}>
      {/* Section header */}
      <div
        style={{
          padding: "8px 20px 0",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-cormorant), serif",
            fontWeight: 500,
            fontSize: 22,
            color: "var(--text)",
            lineHeight: 1,
          }}
        >
          {tx("MAF Spesial", "MAF Specials")}
        </h2>
        <span
          style={{
            fontSize: 11,
            color: "var(--sub)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
          }}
        >
          {tx("Şefin önerileri", "Chef's picks")}
        </span>
      </div>

      {/* Horizontal scroll */}
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          padding: "12px 20px 4px",
          scrollSnapType: "x mandatory",
        }}
      >
        {specials.map((item) => {
          const { name, desc } = L(item);
          return (
            <button
              key={item.id}
              onClick={() => onItemSelect(item)}
              style={{
                flex: "0 0 220px",
                scrollSnapAlign: "start",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 18,
                overflow: "hidden",
                padding: 0,
                textAlign: "left",
                cursor: "pointer",
                color: "var(--text)",
              }}
            >
              {/* Placeholder image area */}
              <div
                style={{
                  width: "100%",
                  height: 130,
                  background: `oklch(18% .09 ${item.hue ?? 285} / 0.95)`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(135deg, oklch(45% .14 ${item.hue ?? 285} / .55) 0%, transparent 60%)`,
                  }}
                />
                {item.badge && (
                  <span
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      fontSize: 10,
                      padding: "4px 8px",
                      borderRadius: 999,
                      background: "rgba(0,0,0,.55)",
                      backdropFilter: "blur(6px)",
                      color: "var(--gold)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      fontFamily: "var(--font-inter), system-ui, sans-serif",
                    }}
                  >
                    ★ {item.badge}
                  </span>
                )}
                <span
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 10,
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    fontSize: 11,
                    color: "var(--sub)",
                    letterSpacing: "0.1em",
                    opacity: 0.6,
                    textTransform: "uppercase",
                  }}
                >
                  {name.slice(0, 14).toUpperCase()}
                </span>
              </div>

              <div style={{ padding: "10px 12px 12px" }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: 1.15,
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                  }}
                >
                  {name}
                </div>
                {desc && (
                  <div
                    className="line-clamp-2"
                    style={{
                      fontSize: 11,
                      color: "var(--sub)",
                      marginTop: 4,
                      lineHeight: 1.35,
                      fontFamily: "var(--font-inter), system-ui, sans-serif",
                    }}
                  >
                    {desc}
                  </div>
                )}
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: "var(--font-cormorant), serif",
                    fontWeight: 600,
                    fontSize: 18,
                    color: "var(--accent)",
                  }}
                >
                  {fmt(item.price)}
                </div>
              </div>
            </button>
          );
        })}
        <div style={{ flexShrink: 0, width: 4 }} />
      </div>
    </div>
  );
}
