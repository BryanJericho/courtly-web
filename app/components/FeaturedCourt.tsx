// components/FeaturedCourts.tsx
import React from "react";
import CourtCard from "./CourtCard";
import { Court } from "../lib/court"; // Asumsi Court interface ada di sini

// 1. Definisikan Interface untuk Props
interface FeaturedCourtsProps {
  title: string;
  // Menambahkan tipe union untuk kategori yang diharapkan
  category: "futsal" | "basket" | "lainnya";
}

// Data Dummy dengan tipe Court[]
const dummyCourts: Court[] = [
  {
    id: 1,
    name: "Gedung A",
    location: "Jaksel",
    price: "80.000",
    rating: 4.8,
    imageUrl: "/path/1.png",
    isFutsal: true, // Tambahkan properti ini untuk filtering
    isBasket: false,
  },
  {
    id: 2,
    name: "Gedung B",
    location: "Jakbar",
    price: "95.000",
    rating: 4.7,
    imageUrl: "/path/2.png",
    isFutsal: false,
    isBasket: true,
  },
  {
    id: 3,
    name: "City Court C",
    location: "Jaksel",
    price: "100.000",
    rating: 4.9,
    imageUrl: "/path/3.png",
    isFutsal: true,
    isBasket: false,
  },
  {
    id: 4,
    name: "Sports Hall D",
    location: "Bekasi",
    price: "120.000",
    rating: 4.6,
    imageUrl: "/path/4.png",
    isFutsal: false,
    isBasket: true,
  },
];

// 2. Terapkan Filtering untuk Mengatasi Error 'category is never read'
const FeaturedCourts: React.FC<FeaturedCourtsProps> = ({ title, category }) => {
  // Logika Filtering: Gunakan 'category' untuk memfilter data dummy
  const filteredCourts = dummyCourts.filter((court) => {
    if (category === "futsal") {
      return court.isFutsal;
    }
    if (category === "basket") {
      return court.isBasket;
    }
    // Jika 'category' adalah 'lainnya' atau tidak didefinisikan, tampilkan semua
    return true;
  });

  return (
    <section className="container mx-auto px-4 py-8 md:px-18 md:py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <a href="#" className="text-sm text-green-600 hover:underline">
          Lihat Lainnya
        </a>
      </div>

      {/* Area untuk Carousel/Scrollable Courts */}
      {/* Scrollbar-hide adalah kelas kustom atau dari plugin tailwind */}
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {filteredCourts.map((court) => (
          <CourtCard key={court.id} court={court} />
        ))}
        {/* Tambahkan beberapa card tambahan untuk efek scrolling */}
        {filteredCourts.slice(0, 2).map((court, index) => (
          <CourtCard
            key={`extra-${index}`}
            court={{ ...court, id: `extra-${index}` }}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCourts;
