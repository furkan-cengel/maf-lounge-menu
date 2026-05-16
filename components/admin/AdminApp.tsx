"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Branch, BranchCategory, MenuData, MenuItem, Venue } from "@/types/menu";
import { SortableItemCard } from "./SortableItemCard";
import { SortableCategoryPill } from "./SortableCategoryPill";

const DRAFT_KEY = "maf_admin_draft";
const HINT_KEY = "maf_drag_hint_seen";

const DEFAULT_VENUE: Venue = {
  name: "MAF Lounge Cafe",
  subtitle: "Coffee & Lounge",
  greeting: "Hoş Geldiniz",
  status: "Açık",
  hours: "08:00 – 02:00",
  wifi: { networkName: "MAF_Guest", password: "" },
  instagram: "@mafcoffeelounge",
  phone: "+90 531 423 2757",
  workingHours: [
    { days: "Pzt – Per", hours: "08:00 – 02:00" },
    { days: "Cum – Cmt", hours: "08:00 – 03:00" },
    { days: "Pazar", hours: "09:00 – 01:00" },
  ],
};

function normalizeData(content: unknown): MenuData {
  const d = content as MenuData & { meta?: unknown };
  if (!d.venue) d.venue = DEFAULT_VENUE;
  return d as MenuData;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function reorderCatItems(
  items: MenuItem[],
  catId: string,
  activeId: string,
  overId: string
): MenuItem[] {
  const catItems = items.filter((i) => i.cat === catId);
  const oldIdx = catItems.findIndex((i) => i.id === activeId);
  const newIdx = catItems.findIndex((i) => i.id === overId);
  if (oldIdx < 0 || newIdx < 0) return items;
  const reordered = arrayMove(catItems, oldIdx, newIdx);
  const positions: number[] = [];
  items.forEach((item, idx) => { if (item.cat === catId) positions.push(idx); });
  const next = [...items];
  positions.forEach((pos, i) => { next[pos] = reordered[i]; });
  return next;
}

function reorderBranchCats(
  branches: Branch[],
  branchId: string,
  activeId: string,
  overId: string
): Branch[] {
  return branches.map((b) => {
    if (b.id !== branchId) return b;
    const oldIdx = b.categories.findIndex((c) => c.id === activeId);
    const newIdx = b.categories.findIndex((c) => c.id === overId);
    if (oldIdx < 0 || newIdx < 0) return b;
    const cats = arrayMove(b.categories, oldIdx, newIdx);
    return { ...b, categories: cats, catIds: cats.map((c) => c.id) };
  });
}

function genId() {
  return "item-" + Date.now().toString(36);
}

// ─── AdminApp ────────────────────────────────────────────────────────────────

export function AdminApp() {
  // Auth
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [pwInput, setPwInput] = useState("");
  const [authError, setAuthError] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Data
  const [data, setData] = useState<MenuData | null>(null);
  const [sha, setSha] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Nav
  const [activeBranchId, setActiveBranchId] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("");

  // Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ tr_name: "", en_name: "", price: "", badge: "" });
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ tr_name: "", en_name: "", price: "", badge: "" });

  // Mode
  const [adminMode, setAdminMode] = useState<"menu" | "venue">("menu");

  // UI
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [dragHintSeen, setDragHintSeen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  // ── Toast helper ────────────────────────────────────────────────────────
  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  // ── Auth ────────────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(false);
    try {
      const res = await fetch("/api/admin/menu", {
        headers: { "x-admin-password": pwInput },
      });
      if (res.status === 401) { setAuthError(true); return; }
      if (!res.ok) throw new Error("Server error");
      const { content, sha: ghSha } = await res.json();
      setPassword(pwInput);
      setSha(ghSha);
      // Check draft
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        try {
          const draft = JSON.parse(raw);
          setData(normalizeData(draft.data));
          if (draft.sha) setSha(draft.sha);
          setHasDraft(true);
        } catch {
          setData(normalizeData(content));
        }
      } else {
        setData(normalizeData(content));
      }
      setDragHintSeen(!!localStorage.getItem(HINT_KEY));
      setAuthed(true);
    } catch {
      showToast("Bağlantı hatası", false);
    } finally {
      setAuthLoading(false);
    }
  }

  // ── Set active branch/cat on data load ────────────────────────────────
  useEffect(() => {
    if (!data || activeBranchId) return;
    const first = data.branches[0];
    if (!first) return;
    setActiveBranchId(first.id);
    setActiveCategoryId(first.categories[0]?.id ?? "");
  }, [data, activeBranchId]);

  function selectBranch(id: string) {
    if (!data) return;
    const branch = data.branches.find((b) => b.id === id);
    setActiveBranchId(id);
    setActiveCategoryId(branch?.categories[0]?.id ?? "");
    setEditingId(null);
    setAddingItem(false);
  }

  function selectCategory(id: string) {
    setActiveCategoryId(id);
    setEditingId(null);
    setAddingItem(false);
  }

  // ── Derived ─────────────────────────────────────────────────────────────
  const activeBranch = data?.branches.find((b) => b.id === activeBranchId);
  const hasCatNav = (activeBranch?.categories.length ?? 0) > 0;
  const currentCatId = hasCatNav ? activeCategoryId : (activeBranch?.catIds[0] ?? "");
  const visibleItems = data?.items.filter((i) => i.cat === currentCatId) ?? [];
  const catColorHue =
    data?.branches.flatMap((b) => b.categories).find((c) => c.id === currentCatId)?.colorHue ?? 295;

  // ── Draft / Publish ──────────────────────────────────────────────────────
  function saveDraft() {
    if (!data) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, sha }));
    setHasDraft(true);
    showToast("Taslak kaydedildi ✓");
  }

  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setLoading(true);
    fetch("/api/admin/menu", { headers: { "x-admin-password": password } })
      .then((r) => r.json())
      .then(({ content, sha: ghSha }) => {
        setData(normalizeData(content));
        setSha(ghSha);
        setActiveBranchId("");
      })
      .catch(() => showToast("Yenileme hatası", false))
      .finally(() => setLoading(false));
  }

  async function doPublish() {
    if (!data) return;
    setPublishing(true);
    try {
      let currentSha = sha;
      if (!currentSha) {
        const r = await fetch("/api/admin/menu", { headers: { "x-admin-password": password } });
        const { sha: s } = await r.json();
        currentSha = s;
      }
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "x-admin-password": password, "Content-Type": "application/json" },
        body: JSON.stringify({ content: data, sha: currentSha }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { sha: newSha } = await res.json();
      setSha(newSha);
      localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
      showToast("Başarıyla yayınlandı ✓");
    } catch (e) {
      showToast("Yayınlama hatası: " + String(e), false);
    } finally {
      setPublishing(false);
      setShowPublishConfirm(false);
    }
  }

  // ── Item editing ─────────────────────────────────────────────────────────
  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setEditValues({
      tr_name: item.tr.name,
      en_name: item.en.name,
      price: String(item.price),
      badge: item.badge ?? "",
    });
    setAddingItem(false);
  }

  function saveEdit() {
    if (!data || !editingId) return;
    setData({
      ...data,
      items: data.items.map((i) =>
        i.id === editingId
          ? {
              ...i,
              tr: { ...i.tr, name: editValues.tr_name },
              en: { ...i.en, name: editValues.en_name },
              price: Number(editValues.price) || i.price,
              badge: editValues.badge || undefined,
            }
          : i
      ),
    });
    setEditingId(null);
  }

  function deleteItem(id: string) {
    if (!data) return;
    setData({ ...data, items: data.items.filter((i) => i.id !== id) });
    if (editingId === id) setEditingId(null);
  }

  function handleImageChange(itemId: string, val: string | null) {
    if (!data) return;
    setData({
      ...data,
      items: data.items.map((i) => (i.id === itemId ? { ...i, image: val } : i)),
    });
  }

  // ── Venue editing ─────────────────────────────────────────────────────────
  function setVenueField<K extends keyof Venue>(field: K, val: Venue[K]) {
    if (!data) return;
    setData({ ...data, venue: { ...data.venue, [field]: val } });
  }

  function setWifiField(field: "networkName" | "password", val: string) {
    if (!data) return;
    setData({ ...data, venue: { ...data.venue, wifi: { ...data.venue.wifi, [field]: val } } });
  }

  function addHoursRow() {
    if (!data) return;
    setData({
      ...data,
      venue: { ...data.venue, workingHours: [...data.venue.workingHours, { days: "", hours: "" }] },
    });
  }

  function removeHoursRow(idx: number) {
    if (!data) return;
    setData({
      ...data,
      venue: { ...data.venue, workingHours: data.venue.workingHours.filter((_, i) => i !== idx) },
    });
  }

  function updateHoursRow(idx: number, field: "days" | "hours", val: string) {
    if (!data) return;
    setData({
      ...data,
      venue: {
        ...data.venue,
        workingHours: data.venue.workingHours.map((r, i) => (i === idx ? { ...r, [field]: val } : r)),
      },
    });
  }

  function addItem() {
    if (!data || !newItem.tr_name || !newItem.price) return;
    const item: MenuItem = {
      id: genId(),
      cat: currentCatId,
      price: Number(newItem.price),
      tr: { name: newItem.tr_name, desc: null },
      en: { name: newItem.en_name || newItem.tr_name, desc: null },
      badge: newItem.badge || undefined,
    };
    setData({ ...data, items: [...data.items, item] });
    setNewItem({ tr_name: "", en_name: "", price: "", badge: "" });
    setAddingItem(false);
  }

  // ── Drag end handlers ────────────────────────────────────────────────────
  function onItemDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id || !data) return;
    setData({
      ...data,
      items: reorderCatItems(data.items, currentCatId, String(active.id), String(over.id)),
    });
    if (!dragHintSeen) {
      localStorage.setItem(HINT_KEY, "1");
      setDragHintSeen(true);
    }
  }

  function onCatDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id || !data) return;
    setData({
      ...data,
      branches: reorderBranchCats(data.branches, activeBranchId, String(active.id), String(over.id)),
    });
    if (!dragHintSeen) {
      localStorage.setItem(HINT_KEY, "1");
      setDragHintSeen(true);
    }
  }

  // ── Render: password gate ────────────────────────────────────────────────
  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "oklch(5% 0.02 295)",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "36px 32px",
            width: 320,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="MAF" style={{ height: 48, width: "auto" }} />
          </div>
          <div
            style={{
              textAlign: "center",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: 12,
              color: "var(--sub)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Admin Paneli
          </div>
          <input
            type="password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            placeholder="Şifre"
            autoFocus
            style={inputStyle()}
          />
          {authError && (
            <div style={{ fontSize: 12, color: "oklch(65% 0.22 25)", textAlign: "center" }}>
              Hatalı şifre
            </div>
          )}
          <button
            type="submit"
            disabled={authLoading || !pwInput}
            style={{
              ...actionBtnStyle("var(--accent)", "oklch(10% 0.04 295)"),
              opacity: authLoading || !pwInput ? 0.5 : 1,
            }}
          >
            {authLoading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "oklch(5% 0.02 295)",
          color: "var(--sub)",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        }}
      >
        Yükleniyor…
      </div>
    );
  }

  // ── Main admin UI ────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "oklch(5% 0.02 295)",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto", paddingBottom: 80 }}>

        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            background: "oklch(8% 0.03 295 / 0.95)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--border)",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MAF" style={{ height: 32, width: "auto" }} />
          {/* Mode toggle */}
          <div
            style={{
              flex: 1,
              display: "flex",
              gap: 4,
              background: "var(--surface)",
              borderRadius: 10,
              padding: 3,
              maxWidth: 160,
            }}
          >
            {(["menu", "venue"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setAdminMode(m)}
                style={{
                  flex: 1,
                  padding: "5px 0",
                  borderRadius: 8,
                  border: "none",
                  background: adminMode === m ? "var(--accent)" : "transparent",
                  color: adminMode === m ? "oklch(10% 0.04 295)" : "var(--sub)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {m === "menu" ? "Menü" : "Mekan"}
              </button>
            ))}
          </div>
          <button
            onClick={saveDraft}
            style={actionBtnStyle("var(--surface)", "var(--text)")}
          >
            Kaydet
          </button>
          <button
            onClick={() => setShowPublishConfirm(true)}
            disabled={publishing}
            style={{
              ...actionBtnStyle("oklch(65% .18 145)", "#fff"),
              opacity: publishing ? 0.6 : 1,
            }}
          >
            Yayınla
          </button>
        </div>

        {/* Draft banner */}
        {hasDraft && (
          <div
            style={{
              background: "oklch(30% 0.12 60 / 0.25)",
              border: "1px solid oklch(65% 0.15 60 / 0.4)",
              borderRadius: 12,
              margin: "12px 16px 0",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
              color: "oklch(82% 0.11 85)",
            }}
          >
            <span style={{ flex: 1 }}>
              Kaydedilmemiş taslak yüklendi — yayınlamak için Yayınla butonunu kullanın.
            </span>
            <button
              onClick={discardDraft}
              style={{
                background: "transparent",
                border: "1px solid oklch(65% 0.15 60 / 0.4)",
                borderRadius: 8,
                color: "oklch(82% 0.11 85)",
                fontSize: 11,
                padding: "4px 10px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Taslağı Sil
            </button>
          </div>
        )}

        {/* ── Venue settings ─────────────────────────────────────────────── */}
        {adminMode === "venue" && (
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8 }}>

            <VenueSectionHeading>Genel</VenueSectionHeading>
            <NewField label="Karşılama" value={data.venue.greeting} onChange={(v) => setVenueField("greeting", v)} />
            <NewField label="Mekan Adı" value={data.venue.name} onChange={(v) => setVenueField("name", v)} />
            <NewField label="Alt Başlık" value={data.venue.subtitle} onChange={(v) => setVenueField("subtitle", v)} />
            <div style={{ display: "flex", gap: 8 }}>
              <NewField label="Durum" value={data.venue.status} onChange={(v) => setVenueField("status", v)} style={{ flex: 1 }} />
              <NewField label="Açık Saat" value={data.venue.hours} onChange={(v) => setVenueField("hours", v)} style={{ flex: 2 }} />
            </div>

            <VenueDivider />

            <VenueSectionHeading>WiFi</VenueSectionHeading>
            <NewField label="Ağ Adı" value={data.venue.wifi.networkName} onChange={(v) => setWifiField("networkName", v)} />
            <NewField label="Şifre (boş = misafirler görmez)" value={data.venue.wifi.password} onChange={(v) => setWifiField("password", v)} placeholder="Şifresiz ağ" />

            <VenueDivider />

            <VenueSectionHeading>İletişim</VenueSectionHeading>
            <NewField label="Instagram" value={data.venue.instagram} onChange={(v) => setVenueField("instagram", v)} placeholder="@mafcoffee" />
            <NewField label="Telefon (WhatsApp)" value={data.venue.phone} onChange={(v) => setVenueField("phone", v)} placeholder="+90 555 123 4567" />

            <VenueDivider />

            <VenueSectionHeading>Çalışma Saatleri</VenueSectionHeading>
            {data.venue.workingHours.map((row, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 8 }}>
                <NewField label="Günler" value={row.days} onChange={(v) => updateHoursRow(idx, "days", v)} style={{ flex: 2 }} />
                <NewField label="Saat" value={row.hours} onChange={(v) => updateHoursRow(idx, "hours", v)} style={{ flex: 2 }} />
                <button
                  onClick={() => removeHoursRow(idx)}
                  title="Sil"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "oklch(65% 0.22 25)",
                    cursor: "pointer",
                    fontSize: 14,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 2,
                  }}
                >
                  🗑
                </button>
              </div>
            ))}
            <button onClick={addHoursRow} style={actionBtnStyle("var(--surface)", "var(--accent)")}>
              + Satır Ekle
            </button>
          </div>
        )}

        {/* ── Menu editor (hidden when venue mode) ──────────────────────── */}
        {adminMode === "menu" && (
        <>

        {/* Branch tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "12px 16px 0",
            overflowX: "auto",
          }}
        >
          {data.branches.map((b) => (
            <button
              key={b.id}
              onClick={() => selectBranch(b.id)}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                border: "none",
                cursor: "pointer",
                background: b.id === activeBranchId ? "var(--accent)" : "var(--surface)",
                color: b.id === activeBranchId ? "oklch(10% 0.04 295)" : "var(--text)",
                whiteSpace: "nowrap",
              }}
            >
              {b.tr}
            </button>
          ))}
        </div>

        {/* Category pills (sortable) */}
        {hasCatNav && activeBranch && (
          <div style={{ padding: "10px 16px 0" }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onCatDragEnd}
            >
              <SortableContext
                items={activeBranch.categories.map((c) => c.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                  {activeBranch.categories.map((cat) => (
                    <SortableCategoryPill
                      key={cat.id}
                      category={cat}
                      isActive={cat.id === activeCategoryId}
                      onClick={() => selectCategory(cat.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Items */}
        <div style={{ padding: "16px 16px 0" }}>
          {/* Category header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "var(--sub)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {visibleItems.length} ürün
            </div>
            <button
              onClick={() => { setAddingItem(!addingItem); setEditingId(null); }}
              style={actionBtnStyle("var(--surface)", "var(--accent)")}
            >
              {addingItem ? "✕ İptal" : "+ Yeni Ürün"}
            </button>
          </div>

          {/* Drag hint */}
          {!dragHintSeen && visibleItems.length > 1 && (
            <div
              style={{
                textAlign: "center",
                fontSize: 11,
                color: "var(--sub)",
                padding: "6px 0 10px",
                letterSpacing: "0.06em",
              }}
            >
              Sıralamak için ⠿ simgesini sürükleyin
            </div>
          )}

          {/* Sortable item list */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onItemDragEnd}
          >
            <SortableContext
              items={visibleItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {visibleItems.map((item) => (
                <SortableItemCard
                  key={item.id}
                  item={item}
                  colorHue={catColorHue}
                  password={password}
                  isEditing={editingId === item.id}
                  editValues={editValues}
                  onStartEdit={() => startEdit(item)}
                  onEditChange={(f, v) => setEditValues((prev) => ({ ...prev, [f]: v }))}
                  onSaveEdit={saveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={() => deleteItem(item.id)}
                  onImageChange={(val) => handleImageChange(item.id, val)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {visibleItems.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "var(--sub)",
                fontSize: 13,
              }}
            >
              Bu kategoride ürün yok
            </div>
          )}

          {/* Add item form */}
          {addingItem && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "14px",
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--accent)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: 2,
                }}
              >
                Yeni Ürün
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <NewField
                  label="TR Adı *"
                  value={newItem.tr_name}
                  onChange={(v) => setNewItem((p) => ({ ...p, tr_name: v }))}
                  style={{ flex: 2 }}
                />
                <NewField
                  label="EN Adı"
                  value={newItem.en_name}
                  onChange={(v) => setNewItem((p) => ({ ...p, en_name: v }))}
                  style={{ flex: 2 }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <NewField
                  label="Fiyat (₺) *"
                  value={newItem.price}
                  onChange={(v) => setNewItem((p) => ({ ...p, price: v }))}
                  type="number"
                  style={{ flex: 1 }}
                />
                <NewField
                  label="Rozet"
                  value={newItem.badge}
                  onChange={(v) => setNewItem((p) => ({ ...p, badge: v }))}
                  placeholder="örn: imza"
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setAddingItem(false)}
                  style={actionBtnStyle("transparent", "var(--sub)")}
                >
                  İptal
                </button>
                <button
                  onClick={addItem}
                  disabled={!newItem.tr_name || !newItem.price}
                  style={{
                    ...actionBtnStyle("var(--accent)", "oklch(10% 0.04 295)"),
                    opacity: !newItem.tr_name || !newItem.price ? 0.4 : 1,
                  }}
                >
                  Ekle
                </button>
              </div>
            </div>
          )}
        </div>

        </> /* end adminMode === "menu" */
        )}

      </div>

      {/* Publish confirm dialog */}
      {showPublishConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowPublishConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "oklch(10% 0.04 295)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "28px 24px",
              width: "100%",
              maxWidth: 360,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--text)",
                fontFamily: "var(--font-cormorant), serif",
                textAlign: "center",
              }}
            >
              Yayınlamak istiyor musunuz?
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--sub)",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              Değişiklikler canlı siteye yayınlanacak. Emin misiniz?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowPublishConfirm(false)}
                style={{ ...actionBtnStyle("var(--surface)", "var(--text)"), flex: 1 }}
              >
                İptal
              </button>
              <button
                onClick={doPublish}
                disabled={publishing}
                style={{
                  ...actionBtnStyle("oklch(65% .18 145)", "#fff"),
                  flex: 1,
                  opacity: publishing ? 0.6 : 1,
                }}
              >
                {publishing ? "Yayınlanıyor…" : "Yayınla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.ok ? "oklch(20% .04 145 / .95)" : "oklch(20% .08 25 / .95)",
            color: toast.ok ? "oklch(85% .15 145)" : "oklch(85% .15 25)",
            border: `1px solid ${toast.ok ? "oklch(50% .18 145 / .4)" : "oklch(55% .18 25 / .4)"}`,
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 60,
            whiteSpace: "nowrap",
            backdropFilter: "blur(10px)",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── tiny inline components ──────────────────────────────────────────────────

function NewField({
  label,
  value,
  onChange,
  type = "text",
  style,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, ...style }}>
      <label
        style={{
          fontSize: 10,
          color: "var(--sub)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle()}
      />
    </div>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "8px 10px",
    color: "var(--text)",
    fontSize: 13,
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    outline: "none",
    width: "100%",
  };
}

function actionBtnStyle(bg: string, color: string): React.CSSProperties {
  return {
    padding: "8px 16px",
    borderRadius: 10,
    border: "none",
    background: bg,
    color,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    whiteSpace: "nowrap",
  };
}

function VenueSectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: "var(--sub)",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        fontWeight: 600,
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        marginBottom: 10,
        marginTop: 2,
      }}
    >
      {children}
    </div>
  );
}

function VenueDivider() {
  return (
    <div
      style={{
        height: 1,
        background: "var(--border)",
        margin: "20px 0 16px",
      }}
    />
  );
}
