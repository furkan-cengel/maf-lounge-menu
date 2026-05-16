"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { MenuItem } from "@/types/menu";
import { fmt } from "@/utils/fmt";

interface EditValues {
  tr_name: string;
  en_name: string;
  price: string;
  badge: string;
}

interface Props {
  item: MenuItem;
  isEditing: boolean;
  editValues: EditValues;
  onStartEdit: () => void;
  onEditChange: (field: keyof EditValues, val: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

export function SortableItemCard({
  item,
  isEditing,
  editValues,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

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

  return (
    <div ref={setNodeRef} style={cardStyle}>
      {/* Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
        }}
      >
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
            <div
              style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em" }}
            >
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
        <button
          onClick={onDelete}
          style={iconBtn("oklch(65% 0.22 25)")}
          title="Sil"
        >
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
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onCancelEdit} style={actionBtn("var(--surface)", "var(--sub)")}>
              İptal
            </button>
            <button onClick={onSaveEdit} style={actionBtn("var(--accent)", "oklch(10% 0.04 295)")}>
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
