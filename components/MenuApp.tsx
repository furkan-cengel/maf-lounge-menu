"use client";

import { useMemo, useRef, useState } from "react";
import type { Lang, MenuData, MenuItem } from "@/types/menu";
import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { BranchNav, CategoryNav } from "./CategoryNav";
import { CategorySection } from "./CategorySection";
import { Footer } from "./Footer";
import { SearchOverlay } from "./SearchOverlay";
import { Drawer } from "./Drawer";
import { ItemDetail } from "./ItemDetail";

interface MenuAppProps {
  data: MenuData;
  tableNumber: string | null;
}

export function MenuApp({ data, tableNumber }: MenuAppProps) {
  const [lang, setLang] = useState<Lang>("tr");
  const [activeBranchId, setActiveBranchIdRaw] = useState<string>(
    data.branches[0]?.id ?? ""
  );
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    data.branches[0]?.categories[0]?.id ?? ""
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setActiveBranchId(id: string) {
    setActiveBranchIdRaw(id);
    const branch = data.branches.find((b) => b.id === id);
    setActiveCategoryId(branch?.categories[0]?.id ?? "");
  }

  const L = (item: MenuItem) =>
    lang === "tr"
      ? { name: item.tr.name, desc: item.tr.desc ?? "" }
      : { name: item.en.name, desc: item.en.desc ?? "" };

  const tx = (tr: string, en: string) => (lang === "tr" ? tr : en);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  const itemsByCat = useMemo(() => {
    const m: Record<string, MenuItem[]> = {};
    for (const item of data.items) {
      if (!m[item.cat]) m[item.cat] = [];
      m[item.cat].push(item);
    }
    return m;
  }, [data.items]);

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const s = search.toLowerCase();
    return data.items
      .filter((i) =>
        (i.tr.name + " " + i.en.name).toLowerCase().includes(s)
      )
      .slice(0, 30);
  }, [search, data.items]);

  const activeBranch = data.branches.find((b) => b.id === activeBranchId);
  const hasCategoryNav = (activeBranch?.categories.length ?? 0) > 0;
  const activeCategory = activeBranch?.categories.find(
    (c) => c.id === activeCategoryId
  );

  function renderContent() {
    if (!activeBranch) return null;

    if (activeBranch.comingSoon) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            gap: 14,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 48 }}>🪄</span>
          <div
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: 32,
              fontWeight: 600,
              color: "var(--text)",
            }}
          >
            Çok Yakında
          </div>
          <div
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: 14,
              color: "var(--sub)",
            }}
          >
            {tx("Nargile menümüz hazırlanıyor", "Our hookah menu is coming soon")}
          </div>
        </div>
      );
    }

    if (!hasCategoryNav) {
      const items = activeBranch.catIds.flatMap(
        (catId) => itemsByCat[catId] ?? []
      );
      const fakeCategory = {
        id: activeBranch.id,
        tr: activeBranch.tr,
        en: activeBranch.en,
        colorHue: activeBranch.colorHue,
      };
      return (
        <CategorySection
          key={activeBranch.id}
          category={fakeCategory}
          items={items}
          tx={tx}
          L={L}
          onItemSelect={setActiveItem}
        />
      );
    }

    if (!activeCategory) return null;
    return (
      <CategorySection
        key={activeCategory.id}
        category={activeCategory}
        items={itemsByCat[activeCategory.id] ?? []}
        tx={tx}
        L={L}
        onItemSelect={setActiveItem}
      />
    );
  }

  const allCategories = data.branches.flatMap((b) =>
    b.categories.length > 0
      ? b.categories
      : [{ id: b.id, tr: b.tr, en: b.en, colorHue: b.colorHue }]
  );

  return (
    <div style={{ background: "oklch(5% 0.02 295)", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 430,
          margin: "0 auto",
          minHeight: "100vh",
          background: "var(--bg)",
          position: "relative",
        }}
      >
        <Header
          lang={lang}
          onLangToggle={() => setLang(lang === "tr" ? "en" : "tr")}
          onMenuOpen={() => setDrawerOpen(true)}
          onSearchOpen={() => setSearchOpen(true)}
        />

        <HeroSection
          meta={data.meta}
          tableNumber={tableNumber}
          lang={lang}
          tx={tx}
        />

        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            background: "oklch(10% 0.04 295 / 0.9)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <BranchNav
            branches={data.branches}
            lang={lang}
            activeBranchId={activeBranchId}
            setActiveBranchId={setActiveBranchId}
          />

          {hasCategoryNav && activeBranch && (
            <CategoryNav
              categories={activeBranch.categories}
              lang={lang}
              activeCategoryId={activeCategoryId}
              setActiveCategoryId={setActiveCategoryId}
            />
          )}
        </div>

        <main>{renderContent()}</main>

        <Footer tx={tx} />

        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 90,
              left: "50%",
              transform: "translateX(-50%)",
              background: "oklch(20% .02 295 / .95)",
              color: "oklch(96% .01 295)",
              padding: "12px 18px",
              borderRadius: 12,
              fontSize: 13,
              zIndex: 50,
              border: "1px solid var(--border)",
              backdropFilter: "blur(10px)",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              whiteSpace: "nowrap",
              maxWidth: "calc(min(430px, 100vw) - 32px)",
              textAlign: "center",
            }}
          >
            {toast}
          </div>
        )}

        {searchOpen && (
          <SearchOverlay
            search={search}
            setSearch={setSearch}
            filtered={filtered}
            categories={allCategories}
            tx={tx}
            L={L}
            onClose={() => {
              setSearchOpen(false);
              setSearch("");
            }}
            onPick={(item) => {
              setSearchOpen(false);
              setSearch("");
              setActiveItem(item);
            }}
          />
        )}

        {drawerOpen && (
          <Drawer
            meta={data.meta}
            lang={lang}
            setLang={setLang}
            tx={tx}
            onClose={() => setDrawerOpen(false)}
          />
        )}

        {activeItem && (
          <ItemDetail
            item={activeItem}
            L={L}
            tx={tx}
            onClose={() => setActiveItem(null)}
          />
        )}
      </div>
    </div>
  );
}
