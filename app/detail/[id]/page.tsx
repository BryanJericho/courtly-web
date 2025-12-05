"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaMapMarkerAlt, FaUsers, FaClock, FaStar } from "react-icons/fa";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getCourt, getToko } from "../../lib/firestore";
import { useAuth } from "../../lib/AuthContext";
import type { Court, Toko } from "../../lib/types";

export default function CourtDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courtId = params.id as string;

  const [court, setCourt] = useState<Court | null>(null);
  const [toko, setToko] = useState<Toko | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courtData = await getCourt(courtId);
        if (!courtData) {
          setError("Lapangan tidak ditemukan");
          setLoading(false);
          return;
        }

        setCourt(courtData);

        // Fetch toko data
        const tokoData = await getToko(courtData.tokoId);
        setToko(tokoData);

        // Set default date to today
        const today = new Date().toISOString().split("T")[0];
        setSelectedDate(today);
      } catch (err) {
        console.error("Error fetching court:", err);
        setError("Gagal memuat data lapangan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courtId]);

  // Generate time slots
  const generateTimeSlots = () => {
    if (!court) return [];

    const slots = [];
    const [startHour] = court.availability.startTime.split(":").map(Number);
    const [endHour] = court.availability.endTime.split(":").map(Number);

    for (let hour = startHour; hour < endHour; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      slots.push(timeString);
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const calculateTotal = () => {
    if (!court) return 0;
    return court.price * duration;
  };

  const handleBooking = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert("Silakan pilih tanggal dan waktu");
      return;
    }

    // TODO: Implement booking logic
    router.push(
      `/booking/confirm?courtId=${courtId}&date=${selectedDate}&time=${selectedTime}&duration=${duration}`
    );
  };

  const getSportLabel = (sport: string) => {
    const labels: Record<string, string> = {
      futsal: "⚽ Futsal",
      basket: "🏀 Basket",
      tenis: "🎾 Tenis",
      badminton: "🏸 Badminton",
      voli: "🏐 Voli",
    };
    return labels[sport] || sport;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Memuat detail lapangan...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !court) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Lapangan tidak ditemukan"}</p>
            <Link
              href="/carilapangan"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-block"
            >
              Kembali ke Pencarian
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("id-ID").format(court.price);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-4 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">
              Beranda
            </Link>
            <span className="mx-2">›</span>
            <Link href="/carilapangan" className="hover:text-green-600">
              Cari Lapangan
            </Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{court.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Court Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-96">
                  <Image
                    src={court.images[selectedImage] || "/images/default-court.png"}
                    alt={court.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                      {getSportLabel(court.sport)}
                    </span>
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {court.images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {court.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 ${
                          selectedImage === idx
                            ? "border-green-600"
                            : "border-gray-200"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${court.name} ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Court Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {court.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold text-lg">{court.rating.toFixed(1)}</span>
                    <span className="text-gray-700">
                      ({court.totalReviews} ulasan)
                    </span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-800 capitalize font-medium">{court.environment}</span>
                </div>

                {/* Toko Info */}
                {toko && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Dikelola oleh:</p>
                    <p className="font-semibold text-lg text-gray-900">{toko.name}</p>
                    <p className="text-sm text-gray-800 font-medium">
                      📍 {toko.location.city}, {toko.location.district}
                    </p>
                  </div>
                )}

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <FaUsers className="text-green-600 mx-auto mb-2 text-2xl" />
                    <p className="text-sm font-medium text-gray-700">Kapasitas</p>
                    <p className="font-bold text-lg text-gray-900">{court.capacity} orang</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <FaClock className="text-blue-600 mx-auto mb-2 text-2xl" />
                    <p className="text-sm font-medium text-gray-700">Jam Buka</p>
                    <p className="font-bold text-gray-900">
                      {court.availability.startTime} - {court.availability.endTime}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="text-yellow-600 text-2xl">💰</span>
                    <p className="text-sm font-medium text-gray-700">Harga</p>
                    <p className="font-bold text-gray-900">Rp {formattedPrice}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-green-600 text-2xl">🏟️</span>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <p className="font-bold text-lg text-green-600 capitalize">
                      {court.status}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Deskripsi
                  </h2>
                  <p className="text-gray-800 leading-relaxed text-base">
                    {court.description}
                  </p>
                </div>

                {/* Facilities */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Fasilitas
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {court.facilities.map((facility, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold border border-green-300"
                      >
                        ✓ {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Ulasan & Rating
                </h2>

                <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-1">
                      {court.rating.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={
                            star <= Math.round(court.rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {court.totalReviews} ulasan
                    </p>
                  </div>

                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const percentage = Math.random() * 100; // TODO: Get from real data
                      return (
                        <div key={rating} className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-600 w-3">{rating}</span>
                          <FaStar className="text-yellow-400 text-xs" />
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-gray-600 text-center py-4">
                  Belum ada ulasan. Jadilah yang pertama memberikan ulasan!
                </p>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Pesan Lapangan
                </h3>

                {/* Price */}
                <div className="mb-6 pb-6 border-b">
                  <p className="text-sm font-semibold text-gray-700">Harga per jam</p>
                  <p className="text-3xl font-bold text-green-600">
                    Rp {formattedPrice}
                  </p>
                </div>

                {/* Booking Form */}
                <div className="space-y-4 mb-6">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Jam Mulai
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
                    >
                      <option value="">Pilih Jam</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Durasi (Jam)
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
                    >
                      {[1, 2, 3, 4, 5, 6].map((d) => (
                        <option key={d} value={d}>
                          {d} Jam
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Total */}
                <div className="mb-6 p-5 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-800 font-medium">
                      Rp {formattedPrice} x {duration} jam
                    </span>
                    <span className="font-bold text-gray-900">
                      Rp {new Intl.NumberFormat("id-ID").format(calculateTotal())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-xl pt-3 border-t-2 border-green-300">
                    <span className="text-gray-900">Total</span>
                    <span className="text-green-600">
                      Rp {new Intl.NumberFormat("id-ID").format(calculateTotal())}
                    </span>
                  </div>
                </div>

                {/* Booking Button */}
                <button
                  onClick={handleBooking}
                  disabled={court.status !== "available"}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {court.status === "available" ? "Pesan Sekarang" : "Tidak Tersedia"}
                </button>

                {!user && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Silakan login terlebih dahulu untuk melakukan booking
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
