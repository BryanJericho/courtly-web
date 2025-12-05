// components/Header.tsx
"use client";

import Link from "next/link";
import { plusJakartSans } from "../lib/font";
import React, { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../src/firebaseConfig";
import { useRouter } from "next/navigation";

// Konstanta untuk warna gradien
const GRADIENT_FROM = "#66C05A";
const GRADIENT_TO = "#2CA3C5";

const Header: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "super_admin":
        return "/admin/dashboard";
      case "penjaga_lapangan":
        return "/penjaga/dashboard";
      default:
        return "/";
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      user: "User",
      penjaga_lapangan: "Penjaga Lapangan",
      super_admin: "Super Admin",
    };
    return labels[role] || role;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <nav className="container mx-auto flex items-center justify-between px-8 py-4 md:px-18 md:py-6">
        {/* Kontainer Kiri: Logo dan Navigasi */}
        <div className="flex items-center space-x-10">
          {/* Logo Courtly */}
          <Link
            href="/"
            className={`${plusJakartSans.className} font-bold text-2xl text-gradient-courtly`}
          >
            Courtly
          </Link>

          {/* Navigasi Tautan */}
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

            {/* Dashboard link (hanya untuk penjaga & admin) */}
            {user && (user.role === "penjaga_lapangan" || user.role === "super_admin") && (
              <Link
                href={getDashboardLink()}
                className="text-gray-800 hover:text-green-600 hidden sm:block"
              >
                Dashboard
              </Link>
            )}

            <Link
              href="/faq"
              className="text-gray-800 hover:text-green-600 hidden sm:block"
            >
              FAQ
            </Link>
          </div>
        </div>

        {/* Kontainer Kanan: Auth Buttons atau Profile Menu */}
        <div className="flex space-x-3 items-center">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : user ? (
            // Profile Dropdown Menu
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                  {user.firstName?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-gray-800 hidden md:block">
                  {user.firstName || "User"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      {getRoleLabel(user.role)}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit Profil
                  </Link>

                  {user.role === "user" && (
                    <Link
                      href="/mybookings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Booking Saya
                    </Link>
                  )}

                  {(user.role === "penjaga_lapangan" || user.role === "super_admin") && (
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                  )}

                  <div className="border-t border-gray-200 mt-2"></div>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Login & Register Buttons (when not logged in)
            <>
              <Link href="/login">
                <button className="px-4 py-2 rounded-3xl transition duration-200 btn-outline-gradient border-2 border-black">
                  Masuk
                </button>
              </Link>

              <Link href="/register">
                <button className="px-4 py-2 text-white rounded-3xl shadow-md hover:shadow-lg transition duration-200 btn-solid-gradient">
                  Daftar
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
