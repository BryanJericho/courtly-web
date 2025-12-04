"use client";

import React, { useState } from "react";
import { FaMapMarkerAlt, FaClock, FaStar, FaUsers } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface Court {
  id: number;
  name: string;
  location: string;
  sport: string;
  rating: number;
  price: number;
  image: string;
  availability: string;
  capacity: number;
}

const COURTS_DATA: Court[] = [
  {
    id: 1,
    name: "Stadion Futsal",
    location: "Rappocini",
    sport: "Futsal",
    rating: 4.8,
    price: 150000,
    image: "/images/court-1.jpg",
    availability: "Mulai dari 10:00 / jam",
    capacity: 10,
  },
  {
    id: 2,
    name: "Stadion Futsal",
    location: "Rappocini",
    sport: "Futsal",
    rating: 4.8,
    price: 150000,
    image: "/images/court-2.jpg",
    availability: "Mulai dari 10:00 / jam",
    capacity: 10,
  },
  {
    id: 3,
    name: "Stadion Futsal",
    location: "Rappocini",
    sport: "Futsal",
    rating: 4.8,
    price: 150000,
    image: "/images/court-3.jpg",
    availability: "Mulai dari 10:00 / jam",
    capacity: 10,
  },
  {
    id: 4,
    name: "Stadion Futsal",
    location: "Jakarta",
    sport: "Futsal",
    rating: 4.7,
    price: 140000,
    image: "/images/court-4.jpg",
    availability: "Mulai dari 09:00 / jam",
    capacity: 10,
  },
  {
    id: 5,
    name: "Stadion Futsal",
    location: "Jakarta",
    sport: "Futsal",
    rating: 4.7,
    price: 140000,
    image: "/images/court-5.jpg",
    availability: "Mulai dari 09:00 / jam",
    capacity: 10,
  },
  {
    id: 6,
    name: "Stadion Futsal",
    location: "Jakarta",
    sport: "Futsal",
    rating: 4.7,
    price: 140000,
    image: "/images/court-6.jpg",
    availability: "Mulai dari 09:00 / jam",
    capacity: 10,
  },
  {
    id: 7,
    name: "Stadion Basket",
    location: "Surabaya",
    sport: "Basket",
    rating: 4.9,
    price: 200000,
    image: "/images/court-7.jpg",
    availability: "Mulai dari 08:00 / jam",
    capacity: 12,
  },
  {
    id: 8,
    name: "Stadion Basket",
    location: "Surabaya",
    sport: "Basket",
    rating: 4.9,
    price: 200000,
    image: "/images/court-8.jpg",
    availability: "Mulai dari 08:00 / jam",
    capacity: 12,
  },
  {
    id: 9,
    name: "Stadion Basket",
    location: "Surabaya",
    sport: "Basket",
    rating: 4.9,
    price: 200000,
    image: "/images/court-9.jpg",
    availability: "Mulai dari 08:00 / jam",
    capacity: 12,
  },
  {
    id: 10,
    name: "Stadion Tenis",
    location: "Bandung",
    sport: "Tenis",
    rating: 4.6,
    price: 250000,
    image: "/images/court-10.jpg",
    availability: "Mulai dari 09:00 / jam",
    capacity: 4,
  },
  {
    id: 11,
    name: "Stadion Tenis",
    location: "Bandung",
    sport: "Tenis",
    rating: 4.6,
    price: 250000,
    image: "/images/court-11.jpg",
    availability: "Mulai dari 09:00 / jam",
    capacity: 4,
  },
  {
    id: 12,
    name: "Stadion Tenis",
    location: "Bandung",
    sport: "Tenis",
    rating: 4.6,
    price: 250000,
    image: "/images/court-12.jpg",
    availability: "Mulai dari 09:00 / jam",
    capacity: 4,
  },
];

const LOCATIONS = [
  "Jakarta",
  "Surabaya",
  "Bandung",
  "Rappocini",
  "Medan",
  "Semarang",
];
const SPORTS = [
  "Futsal",
  "Basket",
  "Voli",
  "Tenis",
  "Badminton",
  "Bulu Tangkis",
];

// --- CourtCard Component ---
function CourtCard({ court }: { court: Court }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
      {/* Image */}
      <div className="relative h-40 bg-gray-300">
        <img
          src={court.image}
          alt={court.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/300x200?text=" +
              encodeURIComponent(court.name);
          }}
        />
        <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
          <FaStar size={12} /> {court.rating}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-green-50">
        <h3 className="font-bold text-gray-900 mb-2">{court.name}</h3>

        <p className="text-xs text-gray-600 mb-3">{court.availability}</p>

        {/* Info Row 1 */}
        <div className="flex gap-4 mb-3 text-xs text-gray-700">
          <div className="flex items-center gap-1">
            <FaMapMarkerAlt className="text-green-600" />
            {court.location}
          </div>
          <div className="flex items-center gap-1">
            <FaUsers className="text-green-600" />
            {court.capacity}
          </div>
        </div>

        {/* Info Row 2 */}
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-xs text-gray-600">Mulai dari</p>
            <p className="text-lg font-bold text-green-600">
              Rp {court.price.toLocaleString("id-ID")}
            </p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded font-medium text-sm hover:bg-blue-700 transition">
            Pesan
          </button>
        </div>
      </div>
    </div>
  );
}
// --- End CourtCard Component ---

export default function CariLapanganPage() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState("Semua");
  const [capacity, setCapacity] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<string | null>(null);

  const filteredCourts = COURTS_DATA.filter((court) => {
    const locationMatch =
      !selectedLocation || court.location === selectedLocation;
    const sportMatch = !selectedSport || court.sport === selectedSport;
    const priceMatch =
      priceRange === "Semua" ||
      (priceRange === "100k-500k" &&
        court.price >= 100000 &&
        court.price <= 500000) ||
      (priceRange === "500k-1jt" &&
        court.price > 500000 &&
        court.price <= 1000000);

    return locationMatch && sportMatch && priceMatch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex-grow bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
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
                          setSelectedSport(
                            selectedSport === sport ? null : sport
                          )
                        }
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{sport}</span>
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
                <div className="space-y-2">
                  {["Indoor", "Outdoor"].map((env) => (
                    <label key={env} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={environment === env}
                        onChange={() =>
                          setEnvironment(environment === env ? null : env)
                        }
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{env}</span>
                    </label>
                  ))}
                </div>

                <button className="w-full mt-6 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition">
                  Filter
                </button>
              </div>
            </div>

            {/* Main Content - Full width di mobile */}
            <div className="flex-1 w-full">
              {/* Section 1: Lapangan Futsal Populer */}
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                  Lapangan Futsal Populer ⚽
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredCourts
                    .filter((c) => c.sport === "Futsal")
                    .slice(0, 3)
                    .map((court) => (
                      <CourtCard key={court.id} court={court} />
                    ))}
                </div>
              </div>

              {/* Section 2: Lapangan Basket Populer */}
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                  Lapangan Basket Populer 🏀
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredCourts
                    .filter((c) => c.sport === "Basket")
                    .slice(0, 3)
                    .map((court) => (
                      <CourtCard key={court.id} court={court} />
                    ))}
                </div>
              </div>

              {/* Section 3: Lapangan Tenis Populer */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                  Lapangan Tenis Populer 🎾
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredCourts
                    .filter((c) => c.sport === "Tenis")
                    .slice(0, 3)
                    .map((court) => (
                      <CourtCard key={court.id} court={court} />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}