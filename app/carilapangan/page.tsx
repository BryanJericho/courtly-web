"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCourts } from "../hooks/useCourts";
import type { Court, SportType, EnvironmentType, AreaType } from "../lib/types";

const SPORTS: SportType[] = ["futsal", "basket", "tenis", "badminton"];
const AREAS: { value: AreaType; label: string }[] = [
  { value: "panakkukang", label: "Panakkukang & Sekitarnya" },
  { value: "rappocini", label: "Rappocini & AP Pettarani" },
  { value: "tamalanrea", label: "Tamalanrea & BTP" },
  { value: "manggala", label: "Manggala & Antang" },
  { value: "makassar-tengah", label: "Makassar Tengah & Mamajang" },
  { value: "cpi-gowa", label: "CPI & Gowa" },
];

// CourtCard Component untuk halaman Cari Lapangan
function CourtCardSearch({ court }: { court: Court }) {
  const formattedPrice = new Intl.NumberFormat("id-ID").format(court.price);

  const getSportLabel = (sport: string) => {
    const labels: Record<string, string> = {
      futsal: "⚽ Futsal",
      basket: "🏀 Basket",
      tenis: "🎾 Tenis",
      badminton: "🏸 Badminton",
      voli: "🏐 Voli",
    };
    return labels[sport] || sport;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        <Image
          src={court.images[0] || "/images/default-court.png"}
          alt={court.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          {getSportLabel(court.sport)}
        </div>
        <div className="absolute top-3 right-3 bg-white text-yellow-500 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          ⭐ {court.rating.toFixed(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 text-lg">
          {court.name}
        </h3>

        <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            🕐 {court.availability?.startTime} - {court.availability?.endTime}
          </span>
        </div>

        {/* Info Row */}
        <div className="flex gap-4 mb-4 text-sm text-gray-700">
          <div className="flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-green-500" />
            <span className="line-clamp-1">{court.location || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaUsers className="text-blue-500" />
            <span>{court.capacity}</span>
          </div>
        </div>

        {/* Price & Button */}
        <div className="flex justify-between items-end pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Mulai dari</p>
            <p className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Rp {formattedPrice}
            </p>
          </div>
          <Link href={`/detail/${court.id}`}>
            <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg">
              Lihat Detail
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CariLapanganPage() {
  const searchParams = useSearchParams();
  const sportFromUrl = searchParams.get("sport") as SportType | null;
  const searchFromUrl = searchParams.get("search") || "";

  const [selectedSport, setSelectedSport] = useState<SportType | null>(
    sportFromUrl
  );
  const [selectedArea, setSelectedArea] = useState<AreaType | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<EnvironmentType | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);

  // Build filters for useCourts
  const filters = {
    sport: selectedSport || undefined,
    area: selectedArea || undefined,
    environment: selectedEnvironment || undefined,
    status: "available" as const,
  };

  const { courts, loading, error } = useCourts(filters);

  // Filter courts based on search query
  const filteredCourts = courts.filter((court) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const matchName = court.name.toLowerCase().includes(query);
    const matchSport = court.sport.toLowerCase().includes(query);
    const matchLocation = court.location?.toLowerCase().includes(query);
    const matchDescription = court.description?.toLowerCase().includes(query);

    return matchName || matchSport || matchLocation || matchDescription;
  });

  // Group courts by sport
  const futsalCourts = filteredCourts.filter((c) => c.sport === "futsal");
  const basketCourts = filteredCourts.filter((c) => c.sport === "basket");
  const tenisCourts = filteredCourts.filter((c) => c.sport === "tenis");
  const badmintonCourts = filteredCourts.filter((c) => c.sport === "badminton");
  const voliCourts = filteredCourts.filter((c) => c.sport === "voli");

  const handleApplyFilter = () => {
    // Filter already applied via useCourts dependency
    console.log("Filters applied:", filters);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Cari Lapangan Olahraga
            </h1>
            <p className="text-gray-600">Temukan lapangan favorit Anda untuk berolahraga</p>
          </div>

          {/* Search Info */}
          {searchQuery && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-green-500 rounded-lg shadow-sm">
              <p className="text-sm text-gray-700">
                Menampilkan hasil pencarian untuk: <span className="font-bold text-green-600">"{searchQuery}"</span>
                {filteredCourts.length > 0 ? (
                  <span className="text-gray-600"> - {filteredCourts.length} lapangan ditemukan</span>
                ) : (
                  <span className="text-red-600"> - Tidak ada hasil yang ditemukan</span>
                )}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  window.history.replaceState({}, "", "/carilapangan");
                }}
                className="text-sm text-green-600 hover:text-green-700 font-medium mt-2 flex items-center gap-1"
              >
                ✕ Hapus pencarian
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar Filter - Enhanced */}
            <div className="hidden lg:block lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 sticky top-24">
                <h3 className="font-bold text-xl mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Filter Pencarian
                </h3>

                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>⚽</span> JENIS OLAHRAGA
                </h4>
                <div className="space-y-2 mb-6">
                  {SPORTS.map((sport) => (
                    <label key={sport} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedSport === sport}
                        onChange={() =>
                          setSelectedSport(selectedSport === sport ? null : sport)
                        }
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize group-hover:text-green-600 transition-colors">
                        {sport}
                      </span>
                    </label>
                  ))}
                </div>

                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📍</span> AREA MAKASSAR
                </h4>
                <div className="space-y-2 mb-6">
                  {AREAS.map((area) => (
                    <label key={area.value} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedArea === area.value}
                        onChange={() =>
                          setSelectedArea(selectedArea === area.value ? null : area.value)
                        }
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 group-hover:text-green-600 transition-colors">
                        {area.label}
                      </span>
                    </label>
                  ))}
                </div>

                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>🏞️</span> LINGKUNGAN
                </h4>
                <div className="space-y-2 mb-6">
                  {(["indoor", "outdoor"] as EnvironmentType[]).map((env) => (
                    <label key={env} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedEnvironment === env}
                        onChange={() =>
                          setSelectedEnvironment(
                            selectedEnvironment === env ? null : env
                          )
                        }
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize group-hover:text-green-600 transition-colors">
                        {env}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleApplyFilter}
                  className="w-full mt-6 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2.5 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 w-full">
              {loading && (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
                  <p className="mt-6 text-gray-600 text-lg font-medium">Memuat lapangan...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-16 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-red-600 text-lg mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-md font-medium"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {!loading && !error && courts.length === 0 && (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-700 text-lg mb-6">
                    Tidak ada lapangan yang sesuai dengan filter Anda.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedLocation(null);
                      setSelectedSport(null);
                      setPriceRange("Semua");
                      setSelectedEnvironment(null);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-md font-medium"
                  >
                    Reset Semua Filter
                  </button>
                </div>
              )}

              {!loading && !error && courts.length > 0 && (
                <>
                  {/* Lapangan Futsal */}
                  {futsalCourts.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                          <span>⚽</span> Lapangan Futsal
                          <span className="text-sm font-normal text-gray-500">({futsalCourts.length})</span>
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {futsalCourts.map((court) => (
                          <CourtCardSearch key={court.id} court={court} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lapangan Basket */}
                  {basketCourts.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                          <span>🏀</span> Lapangan Basket
                          <span className="text-sm font-normal text-gray-500">({basketCourts.length})</span>
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {basketCourts.map((court) => (
                          <CourtCardSearch key={court.id} court={court} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lapangan Tenis */}
                  {tenisCourts.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                          <span>🎾</span> Lapangan Tenis
                          <span className="text-sm font-normal text-gray-500">({tenisCourts.length})</span>
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {tenisCourts.map((court) => (
                          <CourtCardSearch key={court.id} court={court} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lapangan Badminton */}
                  {badmintonCourts.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                          <span>🏸</span> Lapangan Badminton
                          <span className="text-sm font-normal text-gray-500">({badmintonCourts.length})</span>
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {badmintonCourts.map((court) => (
                          <CourtCardSearch key={court.id} court={court} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
