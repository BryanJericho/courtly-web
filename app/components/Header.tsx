// components/Header.tsx

import Link from "next/link";
import { plusJakartSans } from "../lib/font";
import React from "react";

// Konstanta untuk warna gradien
const GRADIENT_FROM = "#66C05A";
const GRADIENT_TO = "#2CA3C5";

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <nav className="container mx-auto flex items-center justify-between px-8 py-4 md:px-18 md:py-6">
        {/* Kontainer Kiri: Logo dan Navigasi Dikelompokkan Bersama */}
        <div className="flex items-center space-x-10">
          {" "}
          {/* Menambah space-x-10 antara logo dan navigasi */}
          {/* 1. Logo Courtly */}
          <Link
            href="/"
            className={`${plusJakartSans.className} font-bold text-2xl text-gradient-courtly`}
          >
            Courtly
          </Link>
          {/* 2. Navigasi Tautan (Ditaruh di sini, bukan di tengah) */}
          <div className="flex space-x-8 items-center text-md font-medium">
            <Link
              href="/"
              className="text-gray-800 hover:text-green-600 hidden sm:block"
            >
              Beranda
            </Link>
            <Link
              href="/carilapangan"
              className="text-gray-800 hover:text-green-600 hidden sm:block"
            >
              Cari Lapangan
            </Link>
            <Link
              href="/faq"
              className="text-gray-800 hover:text-green-600 hidden sm:block"
            >
              FAQ
            </Link>
          </div>
        </div>

        {/* Kontainer Kanan: Tombol Masuk & Daftar */}
        <div className="flex space-x-3 items-center">
          <Link href="/login">
            <button
              // Menggunakan kelas kustom + kelas Tailwind dasar
              className="px-4 py-2 rounded-3xl transition duration-200 btn-outline-gradient border-2 border-black"
            >
              Masuk
            </button>
          </Link>

          {/* Tombol Daftar (Menggunakan kelas CSS global) */}
          <Link href="/register">
            <button
              // Menggunakan kelas kustom + kelas Tailwind dasar
              className="px-4 py-2 text-white rounded-3xl shadow-md hover:shadow-lg transition duration-200 btn-solid-gradient"
            >
              Daftar
            </button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
