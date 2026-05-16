"use client";

interface FloatingButtonProps {
  onCallWaiter: () => void;
  tx: (tr: string, en: string) => string;
}

export function FloatingButton({ onCallWaiter, tx }: FloatingButtonProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(430px, 100vw)",
        pointerEvents: "none",
        zIndex: 25,
      }}
    >
      <button
        onClick={onCallWaiter}
        aria-label={tx("Garson çağır", "Call staff")}
        style={{
          position: "absolute",
          bottom: 22,
          right: 16,
          pointerEvents: "all",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--accent)",
          borderRadius: 999,
          padding: "14px 18px",
          border: "none",
          cursor: "pointer",
          color: "oklch(10% 0.04 295)",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: 1,
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)",
          minHeight: 44,
        }}
      >
        <BellIcon />
        {tx("Garson", "Call staff")}
      </button>
    </div>
  );
}

function BellIcon() {
  return (
    <svg
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 1C5.24 1 3 3.24 3 6v4.5l-1 1V13h12v-1.5l-1-1V6c0-2.76-2.24-5-5-5zm0 15c.83 0 1.5-.67 1.5-1.5h-3C6.5 15.33 7.17 16 8 16z"
        fill="currentColor"
      />
    </svg>
  );
}
