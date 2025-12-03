// components/HeroSection.tsx

"use client"; 
import React, { useState } from "react";
import { FaMapMarkerAlt, FaFutbol } from "react-icons/fa"; 

export default function HeroSection() {
  const [selectedSport, setSelectedSport] = useState("Lapang Sepak Bola");
  const [selectedLocation, setSelectedLocation] = useState("Rappocini");

  // Path gambar dari folder public.
  const heroStyle = {
    // PASTIKAN FILE ADA DI public/images/hero-background.png
    backgroundImage: "url('/images/hero-background.png')", 
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
  
  // Hitung padding top yang cukup tinggi (misalnya setara pt-24 atau pt-28)
  return (
    <section
      // Gunakan kelas padding top yang valid (pt-24 atau sejenisnya)
      className={`relative h-[450px] md:h-[550px] mt-20`}
      style={heroStyle}
    >
      
      {/* 1. OVERLAY GELAP (Dipertahankan) */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* 2. Kontainer Utama untuk Teks dan Kontrol */}
      <div 
        className="container mx-auto px-4 relative z-10 flex flex-col justify-end h-full pb-8"
      >
        
        {/* Teks Heading Utama */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 max-w-xl leading-tight lg:pl-20">
          Reservasi Lapangan Olahraga <br />
          Cepat, Mudah dan Real-Time
        </h1>
        
        {/* Kontainer untuk Pills dan Tombol */}
        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-3 mb-4 lg:pl-20">
          
          {/* Elemen 'Pill' untuk Olahraga */}
          <button className="flex items-center bg-white p-2 rounded-full shadow-md text-gray-800 text-sm font-medium pr-3">
            <FaFutbol className="text-green-600 ml-2 mr-1" />
            {selectedSport}
          </button>

          {/* Elemen 'Pill' untuk Lokasi */}
          <button className="flex items-center bg-white p-2 rounded-full shadow-md text-gray-800 text-sm font-medium pr-3">
            <FaMapMarkerAlt className="text-green-600 ml-2 mr-1" />
            {selectedLocation}
          </button>

          {/* Tombol Cari Lapangan Lain (PERBAIKAN KELAS GRADIENT) */}
          <button
            className="px-5 py-2 rounded-full shadow-md text-white font-semibold text-sm 
                       bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 transition"
          >
            Cari Lapangan Lain
          </button>
        </div>

        {/* Indikator Carousel (Dots) */}
        {/* Hapus mx-auto agar dots kembali ke kiri (justify-start) */}
        <div className="flex space-x-1 mt-4 justify-start mx-auto">
          <span className="w-2 h-2 bg-white opacity-100 rounded-full"></span>
          <span className="w-2 h-2 bg-white opacity-50 rounded-full"></span>
          <span className="w-2 h-2 bg-white opacity-50 rounded-full"></span>
        </div>
      </div>
    </section>
  );
}