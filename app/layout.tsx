// app/layout.tsx

import React from "react";
import "./globals.css";
import { poppins } from "./lib/font";
import { AuthProvider } from "./lib/AuthContext";

interface RootLayoutProps {
  children: React.ReactNode;
}

// Definisikan dan export fungsi sebagai default
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">
      {/* Terapkan kelas font Poppins ke body */}
      <body className={poppins.className}>
        {/* Wrap dengan AuthProvider untuk auth state management */}
        <AuthProvider>
          {/* Konten halaman Anda (page.tsx) akan dimasukkan di sini */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
