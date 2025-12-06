// components/HeroSection.tsx

"use client";
import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaFutbol } from "react-icons/fa";

export default function HeroSection() {
  const [selectedSport, setSelectedSport] = useState("Lapang Sepak Bola");
  const [selectedLocation, setSelectedLocation] = useState("Rappocini");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Array gambar untuk carousel
  const slides = [
    "/img/futsal.webp",
    "/img/badminton.jpg",
    "/img/tennis.jpeg",
  ];

  // Auto slide setiap 5 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative h-[450px] md:h-[550px] mt-20 overflow-hidden">
      {/* Carousel Images */}
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="min-w-full h-full"
            style={{
              backgroundImage: `url('${slide}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0  bg-opacity-20"></div>

      {/* 2. Kontainer Utama untuk Teks dan Kontrol */}
      <div 
        className="container mx-auto px-4 relative z-10 flex flex-col justify-end h-full pb-8"
      >
        
        {/* Teks Heading Utama */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 max-w-xl leading-tight lg:pl-14">
          Reservasi Lapangan Olahraga <br />
          Cepat, Mudah dan Real-Time
        </h1>
        
        {/* Kontainer untuk Pills dan Tombol */}
        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-3 mb-4 lg:pl-14">
          
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

        {/* Indikator Carousel (Dots) - Interactive */}
        <div className="flex space-x-2 mt-4 justify-start lg:pl-14">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-opacity ${
                currentSlide === index ? "bg-white opacity-100" : "bg-white opacity-50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}