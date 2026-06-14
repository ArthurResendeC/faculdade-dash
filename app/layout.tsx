import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IA Absenteismo Pro",
  description: "Dashboard preditivo para gestao de absenteismo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
