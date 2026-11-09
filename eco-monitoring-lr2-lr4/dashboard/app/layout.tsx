export const metadata = { title: "ЕкоМоніторинг", description: "Моніторинг якості повітря" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, background: "#f5f7f6", color: "#1a2420" }}>
        <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px" }}>{children}</main>
      </body>
    </html>
  );
}
