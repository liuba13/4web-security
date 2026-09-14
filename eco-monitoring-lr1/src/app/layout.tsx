export const metadata = {
  title: "ЕкоМоніторинг",
  description: "Система моніторингу якості повітря",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, background: "#f4f6f8" }}>
        {children}
      </body>
    </html>
  );
}
