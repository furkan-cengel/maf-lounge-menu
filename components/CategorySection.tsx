import type { BranchCategory, MenuItem } from "@/types/menu";
import { MenuItemCard } from "./MenuItem";

interface CategorySectionProps {
  category: BranchCategory;
  items: MenuItem[];
  tx: (tr: string, en: string) => string;
  L: (item: MenuItem) => { name: string; desc: string };
  onItemSelect: (item: MenuItem) => void;
}

export function CategorySection({
  category,
  items,
  tx,
  L,
  onItemSelect,
}: CategorySectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <div
        style={{
          padding: "20px 16px 4px",
          display: "flex",
          alignItems: "baseline",
          gap: 10,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: 22,
            fontWeight: 600,
            color: "var(--text)",
            lineHeight: 1.2,
          }}
        >
          {tx(category.tr, category.en)}
        </h2>
        <span
          style={{
            fontSize: 10,
            color: "var(--sub)",
            textTransform: "uppercase",
            letterSpacing: "1.8px",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
          }}
        >
          {items.length} {tx("ürün", "items")}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "10px 16px",
        }}
      >
        {items.map((item) => (
          <div key={item.id}>
            {item.section && (
              <div
                style={{
                  marginBottom: 10,
                  marginTop: 4,
                  fontSize: 11,
                  color: "var(--sub)",
                  textTransform: "uppercase",
                  letterSpacing: "1.8px",
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    flex: 1,
                    height: 1,
                    background: "var(--border)",
                    display: "block",
                  }}
                />
                {item.section}
                <span
                  style={{
                    flex: 1,
                    height: 1,
                    background: "var(--border)",
                    display: "block",
                  }}
                />
              </div>
            )}
            <MenuItemCard
              item={item}
              colorHue={category.colorHue}
              L={L}
              onSelect={onItemSelect}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
