// components/HeroSection.tsx

"use client"; // Diperlukan jika menggunakan state atau events
import React, { useState } from "react";
import { FaMapMarkerAlt, FaFutbol } from "react-icons/fa";

export default function HeroSection() {
  const [sport, setSport] = useState("Lapang Sepak Bola");
  const [location, setLocation] = useState("Rappocini");

  // PERHATIKAN: PATH HARUS DIMULAI DARI ROOT (/)
  // Jika gambar ada di public/img/header_backround.png, maka path-nya adalah:
  const heroStyle = {
    backgroundImage: "url('/img/header_backround.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    // Section dimulai setelah SearchBar di layout halaman
    <section
      className="px-8 py-4 md:px-18 md:py-6 bg-red-500 " // mt-[-30px] untuk overlap dengan SearchBar
      style={heroStyle}
    >
      <div className="px-8 py-4 md:px-18 md:py-6 bg-red-500"></div>

      {/* Konten Teks dan Mini-Form */}
      <div className="container mx-auto px-4 relative z-10 flex flex-col justify-end pb-8 h-full">
        {/* Teks Heading Utama */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-lg leading-tight">
          Reservasi Lapangan Olahraga <br />
          Cepat, Mudah dan **Real-Time**
        </h1>

        {/* Mini-Form di Bagian Bawah */}
        <div className="flex items-center space-x-2">
          {/* Input Olahraga */}
          <div className="flex items-center bg-white p-2 rounded-full shadow-lg">
            <FaFutbol className="text-green-600 ml-2 mr-1" />
            <span className="text-gray-800 text-sm pr-2">{sport}</span>
          </div>

          {/* Input Lokasi */}
          <div className="flex items-center bg-white p-2 rounded-full shadow-lg">
            <FaMapMarkerAlt className="text-green-600 ml-2 mr-1" />
            <span className="text-gray-800 text-sm pr-2">{location}</span>
          </div>

          {/* Tombol Cari Lapangan Lain (Gradien) */}
          <button
            className="px-4 py-2 rounded-full shadow-lg text-white font-semibold text-sm
                           bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 transition"
          >
            Cari Lapangan Lain
          </button>
        </div>

        {/* Indikator Carousel (Dots) */}
        <div className="flex space-x-1 mt-4 justify-start">
          <span className="w-2 h-2 bg-white opacity-100 rounded-full"></span>
          <span className="w-2 h-2 bg-white opacity-50 rounded-full"></span>
          <span className="w-2 h-2 bg-white opacity-50 rounded-full"></span>
        </div>
      </div>
    </section>
  );
}
