// pages/index.tsx
import Head from "next/head";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import FeaturedCourts from "./components/FeaturedCourt";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer";
import type { NextPage } from "next";
import SearchBar from "./components/SearchBar";

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Courtly - Reservasi Lapangan Olahraga Online</title>
        <meta
          name="description"
          content="Reservasi Lapangan Olahraga Cepat, Mudah, dan Real-Time"
        />
      </Head>
      <div className="min-h-screen bg-white">
        {/* Mengasumsikan semua komponen ini sudah dikonversi ke TSX */}
        <Header />
        <main>
          <HeroSection />
          {/* Menggunakan prop untuk judul dan kategori */}
          <FeaturedCourts
            title="Lapangan Futsal Populer ⚽"
            category="futsal"
          />
          <FeaturedCourts
            title="Lapangan Basket Populer 🏀"
            category="basket"
          />
          <FAQSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
