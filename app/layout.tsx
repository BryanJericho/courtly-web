// app/layout.tsx

import React from "react";
import "./globals.css";
import { poppins } from "./lib/font";

interface RootLayoutProps {
  children: React.ReactNode;
}

// Definisikan dan export fungsi sebagai default
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">
      {/* Terapkan kelas font Poppins ke body */}
      <body className={poppins.className}>
        {/* Konten halaman Anda (page.tsx) akan dimasukkan di sini */}
        {children}
      </body>
    </html>
  );
}
