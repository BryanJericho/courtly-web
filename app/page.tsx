// app/page.tsx
import Head from "next/head";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import FeaturedCourts from "./components/FeaturedCourt";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer";
import type { NextPage } from "next";

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
      <div className="min-h-screen bg-[#F6F7F9]">
        <Header />
        <main>
          <HeroSection />
          {/* Fetch courts dari Firestore berdasarkan sport type */}
          <FeaturedCourts
            title="Lapangan Futsal Populer ⚽"
            sport="futsal"
          />
          <FeaturedCourts
            title="Lapangan Basket Populer 🏀"
            sport="basket"
          />
          <FeaturedCourts
            title="Lapangan Tenis Populer 🎾"
            sport="tenis"
          />
          <FAQSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
