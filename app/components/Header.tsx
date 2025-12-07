// components/Header.tsx
"use client";

import Link from "next/link";
import { plusJakartSans } from "../lib/font";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../lib/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../src/firebaseConfig";
import { useRouter } from "next/navigation";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { getAllCourts } from "../lib/firestore";
import type { Court } from "../lib/types";
import Image from "next/image";

// Konstanta untuk warna gradien
const GRADIENT_FROM = "#66C05A";
const GRADIENT_TO = "#2CA3C5";

const Header: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Court[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle search query changes with debounce
  useEffect(() => {
    const searchCourts = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const allCourts = await getAllCourts();
        const filtered = allCourts.filter((court) => {
          const query = searchQuery.toLowerCase();
          return (
            court.name.toLowerCase().includes(query) ||
            court.sport.toLowerCase().includes(query) ||
            court.location?.toLowerCase().includes(query)
          );
        });
        setSearchResults(filtered.slice(0, 5)); // Limit to 5 results
        setShowSearchDropdown(filtered.length > 0);
      } catch (error) {
        console.error("Error searching courts:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchCourts, 300); // Debounce 300ms
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/carilapangan?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
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
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 md:px-8 md:py-6">
        {/* Mobile: Hamburger - Logo - Profile */}
        {/* Desktop: Logo+Nav - Spacer - Search - Profile */}
        
        {/* Hamburger Menu Button - Mobile Only */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-gray-800 hover:text-green-600 p-2"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <FaTimes className="w-6 h-6" />
          ) : (
            <FaBars className="w-6 h-6" />
          )}
        </button>

        {/* Left Section - Logo and Navigation (Desktop) */}
        <div className="flex items-center space-x-10">
          {/* Logo Courtly */}
          <Link
            href="/"
            className={`${plusJakartSans.className} font-bold text-2xl text-gradient-courtly flex items-center`}
          >
            Courtly
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 text-md font-medium">
            <Link
              href="/"
              className="text-gray-800 hover:text-green-600 flex items-center"
            >
              Beranda
            </Link>
            <Link
              href="/carilapangan"
              className="text-gray-800 hover:text-green-600 flex items-center"
            >
              Cari Lapangan
            </Link>

            {/* Dashboard link (hanya untuk penjaga & admin) */}
            {user && (user.role === "penjaga_lapangan" || user.role === "super_admin") && (
              <Link
                href={getDashboardLink()}
                className="text-gray-800 hover:text-green-600 flex items-center"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Spacer - Desktop Only */}
        <div className="flex-1 hidden md:block"></div>

        {/* Search Bar with Autocomplete - Desktop Only */}
        <div ref={searchRef} className="hidden md:flex items-center relative mr-3">
          <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
              placeholder="Cari lapangan..."
              className="bg-transparent outline-none text-gray-700 placeholder-gray-500 w-48"
            />
          </form>

          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-600"></div>
                  <p className="mt-2 text-sm">Mencari...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((court) => (
                    <Link
                      key={court.id}
                      href={`/detail/${court.id}`}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                    >
                      {/* Court Image */}
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        {court.images && court.images.length > 0 ? (
                          <Image
                            src={court.images[0]}
                            alt={court.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaSearch />
                          </div>
                        )}
                      </div>

                      {/* Court Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {court.name}
                        </h4>
                        <p className="text-xs text-gray-600 capitalize">
                          {court.sport} • {court.environment}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {court.location}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-green-600">
                          Rp {new Intl.NumberFormat("id-ID").format(court.price)}
                        </p>
                        <p className="text-xs text-gray-500">/jam</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Kontainer Kanan: Auth Buttons atau Profile Menu */}
        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : user ? (
            // Profile Dropdown Menu
            <div className="relative flex items-center">
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
                  className={`w-4 h-4 transition-transform hidden md:block ${
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
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
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

                  {(user.role === "user" || !user.role || (user.role !== "penjaga_lapangan" && user.role !== "super_admin")) && (
                    <Link
                      href="/bookings"
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
            <div className="flex items-center space-x-3">
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
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Search Bar Mobile */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <FaSearch className="text-gray-500 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari lapangan..."
                  className="bg-transparent outline-none text-gray-700 placeholder-gray-500 w-full"
                />
              </form>
            </div>

            {/* Navigation Links */}
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-3 px-4 text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              🏠 Beranda
            </Link>
            <Link
              href="/carilapangan"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-3 px-4 text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              🔍 Cari Lapangan
            </Link>

            {user && (
              <>
                {(user.role === "penjaga_lapangan" || user.role === "super_admin") && (
                  <Link
                    href={getDashboardLink()}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 px-4 text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition"
                  >
                    📊 Dashboard
                  </Link>
                )}
                
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-4 text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition"
                >
                  👤 Edit Profil
                </Link>

                {(user.role === "user" || !user.role || (user.role !== "penjaga_lapangan" && user.role !== "super_admin")) && (
                  <Link
                    href="/bookings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 px-4 text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition"
                  >
                    📅 Booking Saya
                  </Link>
                )}

                <div className="border-t border-gray-200 my-2"></div>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
                >
                  🚪 Keluar
                </button>
              </>
            )}

            {!user && !loading && (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-4 text-center bg-white border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-4 text-center bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
