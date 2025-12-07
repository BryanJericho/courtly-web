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
        "Courtly adalah platform reservasi lapangan olahraga berbasis website yang memudahkan Anda memesan lapangan futsal, badminton, basket, voli, tenis, dan mini soccer secara online. Dengan Courtly, Anda dapat melihat jadwal ketersediaan secara real-time, memilih waktu yang sesuai, melakukan pembayaran, dan menerima bukti reservasi—semuanya tanpa perlu datang langsung ke lokasi.",
    },
    {
      question: "Apa saja manfaat menggunakan sistem Courtly?",
      answer:
        "Courtly memberikan kemudahan maksimal dalam reservasi lapangan: (1) Praktis - pesan kapan saja 24/7 dari mana saja, (2) Transparan - lihat jadwal ketersediaan lapangan secara real-time, (3) Cepat - proses booking hanya dalam hitungan menit, (4) Aman - sistem pembayaran yang terjamin keamanannya, dan (5) Efisien - tidak perlu antri atau datang langsung ke lokasi.",
    },
    {
      question: "Siapa saja yang bisa menggunakan Courtly?",
      answer: "Courtly dapat digunakan oleh siapa saja! Baik Anda pemain casual yang ingin olahraga santai, komunitas atau klub olahraga yang rutin latihan, maupun penyelenggara event atau turnamen. Courtly dirancang untuk memenuhi kebutuhan reservasi lapangan semua kalangan dengan mudah dan praktis.",
    },
    {
      question: "Apa saja jenis lapangan yang bisa dipesan?",
      answer: "Courtly menyediakan berbagai jenis lapangan olahraga sesuai kebutuhan Anda, termasuk Lapangan Futsal, Lapangan Badminton, Lapangan Basket, Lapangan Voli, Lapangan Tenis, dan Mini Soccer. Ketersediaan jenis lapangan dapat bervariasi tergantung pada lokasi dan pengelola lapangan yang terdaftar di platform kami.",
    },
    {
      question: "Bagaimana cara melakukan reservasi lapangan?",
      answer: "Sangat mudah! (1) Buka website Courtly dan login ke akun Anda, (2) Pilih jenis olahraga dan lokasi yang diinginkan, (3) Lihat jadwal ketersediaan lapangan, (4) Pilih tanggal, waktu, dan durasi bermain, (5) Lakukan pembayaran melalui metode yang tersedia, (6) Terima konfirmasi booking dan bukti reservasi via email. Selesai! Anda siap bermain.",
    },
    {
      question: "Apakah saya harus membuat akun?",
      answer: "Ya, Anda perlu membuat akun untuk melakukan reservasi di Courtly. Proses registrasi sangat cepat dan mudah—hanya perlu email dan password. Dengan memiliki akun, Anda dapat melihat riwayat booking, mengelola reservasi yang akan datang, dan mendapatkan notifikasi penting terkait pemesanan Anda.",
    },
    {
      question: "Apa saja metode pembayaran yang tersedia?",
      answer: "Courtly menyediakan berbagai metode pembayaran untuk kemudahan Anda: Transfer Bank (BCA, Mandiri, BNI, BRI), E-Wallet (GoPay, OVO, Dana, ShopeePay), Virtual Account, dan QRIS. Semua transaksi dijamin aman dan terenkripsi. Setelah pembayaran dikonfirmasi, Anda akan langsung menerima bukti reservasi.",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12 md:px-18 md:py-6">
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
