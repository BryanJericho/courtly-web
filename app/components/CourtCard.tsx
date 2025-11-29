// components/CourtCard.tsx
import Image from "next/image";
import React from "react";
import { Court } from "../lib/court"; // Pastikan path ini benar

interface CourtCardProps {
  court: Court;
}

const CourtCard: React.FC<CourtCardProps> = ({ court }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden min-w-[280px] max-w-xs transition hover:shadow-xl">
      <div className="h-32 bg-gray-200 relative">
        {/* Contoh penggunaan Image Next.js - pastikan court.imageUrl valid */}
        <Image
          src={court.imageUrl || "/images/default-court.png"} // Fallback image
          alt={court.name}
          fill
          sizes="(max-width: 600px) 100vw, 300px"
          className="object-cover"
        />
        <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-semibold px-2 py-1 rounded-full">
          Sentral Futsal
        </span>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{court.name}</h3>
          <span className="flex items-center text-sm text-yellow-500">
            ⭐ {court.rating.toFixed(1)}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-4">{court.location}</p>

        <div className="flex justify-between items-center text-sm mb-4">
          <div>
            <p className="text-gray-700 font-medium">Rp {court.price}</p>
            <p className="text-xs text-gray-400">/ jam</p>
          </div>
          <button className="px-3 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full hover:bg-green-200 transition">
            Lihat Detail
          </button>
        </div>

        <div className="flex space-x-2 text-xs">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
            Booking
          </span>
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
            Diskon
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourtCard;
