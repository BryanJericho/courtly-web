"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCourts } from "../hooks/useCourts";
import type { Court, SportType, EnvironmentType } from "../lib/types";

const LOCATIONS = ["Jakarta", "Surabaya", "Bandung", "Makassar", "Medan"];
const SPORTS: SportType[] = ["futsal", "basket", "voli", "tenis", "badminton"];

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
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
      {/* Image */}
      <div className="relative h-40 bg-gray-300">
        <Image
          src={court.images[0] || "/images/default-court.png"}
          alt={court.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute top-3 left-3 bg-yellow-400 text-xs font-semibold px-2 py-1 rounded-full">
          {getSportLabel(court.sport)}
        </div>
        <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
          ⭐ {court.rating.toFixed(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">
          {court.name}
        </h3>

        <p className="text-xs text-gray-600 mb-3">
          {court.availability?.startTime} - {court.availability?.endTime}
        </p>

        {/* Info Row */}
        <div className="flex gap-4 mb-3 text-xs text-gray-700">
          <div className="flex items-center gap-1">
            <FaMapMarkerAlt className="text-green-600" />
            {court.location || "N/A"}
          </div>
          <div className="flex items-center gap-1">
            <FaUsers className="text-green-600" />
            {court.capacity}
          </div>
        </div>

        {/* Price & Button */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-600">Mulai dari</p>
            <p className="text-lg font-bold text-green-600">
              Rp {formattedPrice}
            </p>
          </div>
          <Link href={`/detail/${court.id}`}>
            <button className="bg-blue-600 text-white px-4 py-2 rounded font-medium text-sm hover:bg-blue-700 transition">
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

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<SportType | null>(
    sportFromUrl
  );
  const [priceRange, setPriceRange] = useState<string>("Semua");
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<EnvironmentType | null>(null);

  // Build filters for useCourts
  const filters = {
    sport: selectedSport || undefined,
    city: selectedLocation || undefined,
    environment: selectedEnvironment || undefined,
    minPrice:
      priceRange === "100k-500k"
        ? 100000
        : priceRange === "500k-1jt"
        ? 500000
        : undefined,
    maxPrice:
      priceRange === "100k-500k"
        ? 500000
        : priceRange === "500k-1jt"
        ? 1000000
        : undefined,
    status: "available" as const,
  };

  const { courts, loading, error } = useCourts(filters);

  // Group courts by sport
  const futsalCourts = courts.filter((c) => c.sport === "futsal");
  const basketCourts = courts.filter((c) => c.sport === "basket");
  const tenisCourts = courts.filter((c) => c.sport === "tenis");
  const badmintonCourts = courts.filter((c) => c.sport === "badminton");
  const voliCourts = courts.filter((c) => c.sport === "voli");

  const handleApplyFilter = () => {
    // Filter already applied via useCourts dependency
    console.log("Filters applied:", filters);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex-grow bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Cari Lapangan Olahraga
          </h1>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar Filter - Hidden di mobile, show di lg */}
            <div className="hidden lg:block lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">LOKASI</h3>
                <div className="space-y-2 mb-6">
                  {LOCATIONS.map((loc) => (
                    <label key={loc} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLocation === loc}
                        onChange={() =>
                          setSelectedLocation(
                            selectedLocation === loc ? null : loc
                          )
                        }
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{loc}</span>
                    </label>
                  ))}
                </div>

                <h3 className="font-bold text-gray-900 mb-4">JENIS OLAHRAGA</h3>
                <div className="space-y-2 mb-6">
                  {SPORTS.map((sport) => (
                    <label key={sport} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSport === sport}
                        onChange={() =>
                          setSelectedSport(selectedSport === sport ? null : sport)
                        }
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {sport}
                      </span>
                    </label>
                  ))}
                </div>

                <h3 className="font-bold text-gray-900 mb-4">HARGA</h3>
                <div className="space-y-2 mb-6">
                  {["Semua", "100k-500k", "500k-1jt"].map((price) => (
                    <label key={price} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        checked={priceRange === price}
                        onChange={() => setPriceRange(price)}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {price === "Semua" && "Semua harga"}
                        {price === "100k-500k" && "Rp 100.000 - Rp 500.000"}
                        {price === "500k-1jt" && "Rp 500.000 - Rp 1.000.000"}
                      </span>
                    </label>
                  ))}
                </div>

                <h3 className="font-bold text-gray-900 mb-4">LINGKUNGAN</h3>
                <div className="space-y-2 mb-6">
                  {(["indoor", "outdoor"] as EnvironmentType[]).map((env) => (
                    <label key={env} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEnvironment === env}
                        onChange={() =>
                          setSelectedEnvironment(
                            selectedEnvironment === env ? null : env
                          )
                        }
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {env}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleApplyFilter}
                  className="w-full mt-6 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 w-full">
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                  <p className="mt-4 text-gray-600">Memuat lapangan...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {!loading && !error && courts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">
                    Tidak ada lapangan yang sesuai dengan filter Anda.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedLocation(null);
                      setSelectedSport(null);
                      setPriceRange("Semua");
                      setSelectedEnvironment(null);
                    }}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Reset Filter
                  </button>
                </div>
              )}

              {!loading && !error && courts.length > 0 && (
                <>
                  {/* Lapangan Futsal */}
                  {futsalCourts.length > 0 && (
                    <div className="mb-12">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                        Lapangan Futsal ⚽ ({futsalCourts.length})
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {futsalCourts.map((court) => (
                          <CourtCardSearch key={court.id} court={court} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lapangan Basket */}
                  {basketCourts.length > 0 && (
                    <div className="mb-12">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                        Lapangan Basket 🏀 ({basketCourts.length})
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {basketCourts.map((court) => (
                          <CourtCardSearch key={court.id} court={court} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lapangan Tenis */}
                  {tenisCourts.length > 0 && (
                    <div className="mb-12">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                        Lapangan Tenis 🎾 ({tenisCourts.length})
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {tenisCourts.map((court) => (
                          <CourtCardSearch key={court.id} court={court} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lapangan Badminton */}
                  {badmintonCourts.length > 0 && (
                    <div className="mb-12">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                        Lapangan Badminton 🏸 ({badmintonCourts.length})
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {badmintonCourts.map((court) => (
                          <CourtCardSearch key={court.id} court={court} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lapangan Voli */}
                  {voliCourts.length > 0 && (
                    <div className="mb-12">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                        Lapangan Voli 🏐 ({voliCourts.length})
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {voliCourts.map((court) => (
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
