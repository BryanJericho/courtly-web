// components/CourtCard.tsx
import Image from "next/image";
import Link from "next/link";
import React from "react";
import type { Court } from "../lib/types";

interface CourtCardProps {
  court: Court;
}

const CourtCard: React.FC<CourtCardProps> = ({ court }) => {
  // Format price untuk display
  const formattedPrice = new Intl.NumberFormat("id-ID").format(court.price);

  // Get sport label dengan emoji
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden min-w-[280px] max-w-xs transition hover:shadow-xl">
      <div className="h-32 bg-gray-200 relative">
        <Image
          src={court.images[0] || "/images/default-court.png"}
          alt={court.name}
          fill
          sizes="(max-width: 600px) 100vw, 300px"
          className="object-cover"
        />
        <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-semibold px-2 py-1 rounded-full">
          {getSportLabel(court.sport)}
        </span>
        <span className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          ⭐ {court.rating.toFixed(1)}
        </span>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
            {court.name}
          </h3>
          {court.tokoName && (
            <p className="text-xs text-gray-500">{court.tokoName}</p>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-3">
          📍 {court.location || "Lokasi tidak tersedia"}
        </p>

        <div className="flex justify-between items-center text-sm mb-4">
          <div>
            <p className="text-xs text-gray-600">Mulai dari</p>
            <p className="text-lg font-bold text-green-600">
              Rp {formattedPrice}
            </p>
            <p className="text-xs text-gray-400">/ jam</p>
          </div>
          <Link href={`/detail/${court.id}`}>
            <button className="px-3 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full hover:bg-green-200 transition">
              Lihat Detail
            </button>
          </Link>
        </div>

        <div className="flex space-x-2 text-xs">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full capitalize">
            {court.environment}
          </span>
          {court.status === "available" && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
              Tersedia
            </span>
          )}
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
            👥 {court.capacity}
            </span>
        </div>
      </div>
    </div>
  );
};

export default CourtCard;
