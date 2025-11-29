// components/FAQSection.tsx
"use client";
import React, { useState } from "react";
import { FAQItemType } from "../lib/court"; // Pastikan path ini benar

interface FAQItemProps {
  item: FAQItemType;
}

// Sub-komponen untuk setiap item FAQ
const FAQItem: React.FC<FAQItemProps> = ({ item }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className="border-b border-gray-200">
      <button
        className="flex justify-between items-center w-full p-4 text-left hover:bg-gray-50 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-800 font-medium">{item.question}</span>
        <span className="text-2xl text-green-600 font-light transition-transform duration-300 transform">
          {/* Mengganti panah dengan simbol yang lebih umum */}
          {isOpen ? "−" : "›"}
        </span>
      </button>
      {/* Menambahkan efek transisi sederhana untuk konten jawaban */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100 p-4 pt-0" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-gray-600">{item.answer}</p>
      </div>
    </div>
  );
};

const FAQSection: React.FC = () => {
  const faqs: FAQItemType[] = [
    {
      question: "Apa itu sistem reservasi lapangan online Courtly?",
      answer:
        "Courtly adalah platform reservasi lapangan olahraga secara online, memungkinkan Anda memesan dan membayar lapangan secara cepat, mudah, dan real-time.",
    },
    {
      question: "Siapa saja yang bisa menggunakan Courtly?",
      answer:
        "Semua individu dan komunitas olahraga dapat menggunakan Courtly untuk mencari, memesan, dan mengelola jadwal lapangan.",
    },
    {
      question: "Apa saja jenis lapangan yang bisa disewa?",
      answer:
        "Kami menyediakan berbagai jenis lapangan seperti Futsal, Basket, Badminton, dan Voli, tergantung ketersediaan mitra kami.",
    },
    {
      question: "Bagaimana cara melakukan reservasi lapangan?",
      answer:
        "Pilih olahraga favorit Anda, cari lapangan di lokasi terdekat, pilih slot waktu yang tersedia, dan selesaikan pembayaran.",
    },
    {
      question: "Apakah saya harus membuat akun?",
      answer:
        "Ya, pendaftaran akun diperlukan untuk menyimpan riwayat reservasi dan mengakses fitur reward.",
    },
    {
      question: "Apa saja metode pembayaran yang tersedia?",
      answer:
        "Kami menerima pembayaran melalui transfer bank, kartu kredit, dan dompet digital.",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">FAQ</h2>
      <div className="border border-gray-200 rounded-lg">
        {faqs.map((faq, index) => (
          <FAQItem key={index} item={faq} />
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
