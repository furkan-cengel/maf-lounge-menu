interface FooterProps {
  tx: (tr: string, en: string) => string;
}

export function Footer({ tx }: FooterProps) {
  return (
    <footer
      style={{
        padding: "28px 20px 90px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        textAlign: "center",
        color: "var(--sub)",
        fontSize: 11,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="MAF Coffee & Lounge" style={{ height: 96, width: "auto" }} />
      <p style={{ marginTop: 8, lineHeight: 1.6 }}>
        {tx("Tüm fiyatlara KDV dahildir", "All prices include VAT")}
      </p>
      <p style={{ opacity: 0.6, lineHeight: 1.6 }}>
        {tx(
          "Alerjen bilgisi için garsonumuza danışın",
          "Ask staff for allergen info"
        )}
      </p>
    </footer>
  );
}

