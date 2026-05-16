"use client";

import { useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { MenuItem } from "@/types/menu";
import { fmt } from "@/utils/fmt";
import { Thumbnail } from "@/components/Thumbnail";

interface EditValues {
  tr_name: string;
  en_name: string;
  price: string;
  badge: string;
}

interface Props {
  item: MenuItem;
  colorHue: number;
  password: string;
  isEditing: boolean;
  editValues: EditValues;
  onStartEdit: () => void;
  onEditChange: (field: keyof EditValues, val: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onImageChange: (val: string | null) => void;
}

export function SortableItemCard({
  item,
  colorHue,
  password,
  isEditing,
  editValues,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onImageChange,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const cardStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
    position: "relative",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
    boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.5)" : "none",
  };

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setWarnings([]);

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadError("Sadece JPG, PNG veya WEBP formatı desteklenir.");
      e.target.value = "";
      return;
    }

    const sizeKB = Math.round(file.size / 1024);
    if (file.size > 500 * 1024) {
      setUploadError(`Görsel 500 KB'dan küçük olmalıdır. Seçilen dosya: ${sizeKB} KB`);
      e.target.value = "";
      return;
    }

    await new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const w: string[] = [];
          if (img.width < 300 || img.height < 300)
            w.push("Görsel kalitesi düşük olabilir. 400×400 px önerilir.");
          if (img.width !== img.height)
            w.push("Kare görsel önerilir (örn. 400×400 px).");
          setWarnings(w);
          resolve();
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Bilinmeyen hata");
      }
      const { base64 } = await res.json();
      onImageChange(base64);
    } catch {
      setUploadError("Yükleme başarısız, tekrar deneyin.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div ref={setNodeRef} style={cardStyle}>
      {/* Row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px" }}>
        {/* Drag handle */}
        <span
          {...attributes}
          {...listeners}
          style={{
            touchAction: "none",
            cursor: isDragging ? "grabbing" : "grab",
            fontSize: 16,
            color: "var(--sub)",
            flexShrink: 0,
            lineHeight: 1,
            userSelect: "none",
            padding: "2px 4px",
          }}
        >
          ⠿
        </span>

        {/* Name + badge */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text)",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.tr.name}
            {item.badge && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 10,
                  color: "var(--gold)",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                ★ {item.badge}
              </span>
            )}
          </div>
          {item.section && (
            <div style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em" }}>
              ↑ section: {item.section}
            </div>
          )}
        </div>

        {/* Price */}
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--accent)",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {fmt(item.price)}
        </span>

        {/* Edit button */}
        <button
          onClick={isEditing ? onCancelEdit : onStartEdit}
          style={iconBtn(isEditing ? "var(--accent)" : "var(--sub)")}
          title={isEditing ? "İptal" : "Düzenle"}
        >
          {isEditing ? "✕" : "✎"}
        </button>

        {/* Delete button */}
        <button onClick={onDelete} style={iconBtn("oklch(65% 0.22 25)")} title="Sil">
          🗑
        </button>
      </div>

      {/* Inline edit form */}
      {isEditing && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: "oklch(12% 0.04 295)",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <Field
              label="TR Adı"
              value={editValues.tr_name}
              onChange={(v) => onEditChange("tr_name", v)}
              style={{ flex: 2 }}
            />
            <Field
              label="EN Adı"
              value={editValues.en_name}
              onChange={(v) => onEditChange("en_name", v)}
              style={{ flex: 2 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Field
              label="Fiyat (₺)"
              value={editValues.price}
              onChange={(v) => onEditChange("price", v)}
              type="number"
              style={{ flex: 1 }}
            />
            <Field
              label="Rozet"
              value={editValues.badge}
              onChange={(v) => onEditChange("badge", v)}
              style={{ flex: 1 }}
              placeholder="örn: imza"
            />
          </div>

          {/* Image section */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              paddingTop: 4,
            }}
          >
            {/* Thumbnail preview */}
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: 12,
                overflow: "hidden",
                flexShrink: 0,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--surface)",
              }}
            >
              {uploading ? (
                <>
                  <style>{`@keyframes maf-spin { to { transform: rotate(360deg); } }`}</style>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      border: "3px solid var(--border)",
                      borderTopColor: "var(--accent)",
                      borderRadius: "50%",
                      animation: "maf-spin 0.8s linear infinite",
                    }}
                  />
                </>
              ) : item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.tr.name}
                  style={{ width: 150, height: 150, objectFit: "cover" }}
                />
              ) : (
                <Thumbnail colorHue={colorHue} label={item.tr.name} size={150} />
              )}
            </div>

            {/* Upload controls */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Upload button */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: 12,
                  background: "var(--surface)",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 20 }}>📁</span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--sub)",
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  Görsel Yükle
                </span>
              </div>

              {/* Remove button */}
              {item.image && !uploading && (
                <button
                  onClick={() => {
                    onImageChange(null);
                    setUploadError(null);
                    setWarnings([]);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--sub)",
                    fontSize: 11,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 0",
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                  }}
                >
                  🗑 Görseli Kaldır
                </button>
              )}

              {/* Error */}
              {uploadError && (
                <div
                  style={{
                    fontSize: 11,
                    color: "oklch(70% 0.2 25)",
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    lineHeight: 1.4,
                  }}
                >
                  {uploadError}
                </div>
              )}

              {/* Warnings */}
              {warnings.map((w, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 11,
                    color: "oklch(80% 0.18 85)",
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    lineHeight: 1.4,
                  }}
                >
                  ⚠ {w}
                </div>
              ))}

              {/* Info text */}
              <div
                style={{
                  fontSize: 10,
                  color: "var(--sub)",
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  lineHeight: 1.5,
                  opacity: 0.7,
                }}
              >
                Önerilen boyut: 400×400 px · Maks: 500 KB · Format: JPG, PNG, WEBP
              </div>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onCancelEdit} style={actionBtn("var(--surface)", "var(--sub)")}>
              İptal
            </button>
            <button
              onClick={onSaveEdit}
              style={actionBtn("var(--accent)", "oklch(10% 0.04 295)")}
            >
              Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
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
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "7px 10px",
          color: "var(--text)",
          fontSize: 13,
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          outline: "none",
          width: "100%",
        }}
      />
    </div>
  );
}

function iconBtn(color: string): React.CSSProperties {
  return {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "transparent",
    color,
    cursor: "pointer",
    fontSize: 14,
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexShrink: 0,
    padding: 0,
  };
}

function actionBtn(bg: string, color: string): React.CSSProperties {
  return {
    padding: "7px 16px",
    borderRadius: 8,
    border: "none",
    background: bg,
    color,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
  };
}
