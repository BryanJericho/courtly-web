// components/Footer.tsx
import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-black md:px-18 md:py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 border-b border-gray-700 pb-8">
          {/* Kolom 1: Logo & Deskripsi */}
          <div className="col-span-2 lg:col-span-2 pr-8">
            <h3 className="text-2xl font-bold text-green-500 mb-3">Courtly</h3>
            <p className="text-sm text-black mb-4 max-w-sm">
              Sistem reservasi lapangan olahraga online terkemuka di Indonesia.
              Cari dan pesan lapangan Futsal, Basket, Badminton, dan lainnya
              dengan cepat dan mudah.
            </p>
            {/* Informasi Kontak Dasar */}
            <div className="text-sm text-black space-y-1">
              <p>
                Email:{" "}
                <a
                  href="mailto:info@courtly.id"
                  className="hover:text-green-500"
                >
                  info@courtly.id
                </a>
              </p>
              <p>
                Telepon:{" "}
                <a href="tel:+628123456789" className="hover:text-green-500">
                  +62 812-3456-789
                </a>
              </p>
            </div>
          </div>

          {/* Kolom 2: Tautan Cepat */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Informasi Tambahan</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-black hover:text-green-500 transition"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-black hover:text-green-500 transition"
                >
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/rewards"
                  className="text-black hover:text-green-500 transition"
                >
                  Rewards
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-black hover:text-green-500 transition"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/karir"
                  className="text-black hover:text-green-500 transition"
                >
                  Karir
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Layanan & Kebijakan */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Layanan & Kebijakan</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-black hover:text-green-500 transition"
                >
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-black hover:text-green-500 transition"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap"
                  className="text-black hover:text-green-500 transition"
                >
                  Peta Situs
                </Link>
              </li>
              <li>
                <Link
                  href="/mitra"
                  className="text-black hover:text-green-500 transition"
                >
                  Jadilah Mitra
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-black hover:text-green-500 transition"
                >
                  Login Sistem
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Sosial Media (Jika ada di desain asli) */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-lg font-semibold mb-4">Ikuti Kami</h4>
            <div className="flex space-x-3">
              {/* Tempat untuk ikon sosial media (misal: Facebook, Instagram, Twitter) */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-green-500 text-2xl"
              >
                {/* Ganti dengan ikon SVG/Font Awesome/Lucide */}
                📸
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-green-500 text-2xl"
              >
                📘
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-green-500 text-2xl"
              >
                🐦
              </a>
            </div>
          </div>
        </div>

        {/* Hak Cipta & Disclaimer */}
        <div className="pt-4 text-center text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Courtly. Hak Cipta Dilindungi.
          </p>
          <p className="mt-1">
            Design inspired by sport field reservation website template.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
