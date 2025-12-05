// components/FeaturedCourts.tsx
"use client";

import React from "react";
import CourtCard from "./CourtCard";
import type { SportType } from "../lib/types";
import { useCourts } from "../hooks/useCourts";
import Link from "next/link";

interface FeaturedCourtsProps {
  title: string;
  sport: SportType;
}

const FeaturedCourts: React.FC<FeaturedCourtsProps> = ({ title, sport }) => {
  // Fetch courts from Firestore with sport filter
  const { courts, loading, error } = useCourts({ sport, status: "available" });

  // Limit to first 6 courts untuk homepage
  const featuredCourts = courts.slice(0, 6);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8 md:px-18 md:py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg min-w-[280px] h-64 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto px-4 py-8 md:px-18 md:py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Gagal memuat data lapangan. Silakan refresh halaman.</p>
        </div>
      </section>
    );
  }

  if (featuredCourts.length === 0) {
    return (
      <section className="container mx-auto px-4 py-8 md:px-18 md:py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Belum ada lapangan tersedia untuk kategori ini.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8 md:px-18 md:py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <Link
          href={`/carilapangan?sport=${sport}`}
          className="text-sm text-green-600 hover:underline"
        >
          Lihat Lainnya
        </Link>
      </div>

      {/* Area untuk Carousel/Scrollable Courts */}
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {featuredCourts.map((court) => (
          <CourtCard key={court.id} court={court} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCourts;
