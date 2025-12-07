"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaMapMarkerAlt, FaUsers, FaClock, FaStar } from "react-icons/fa";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getCourt, getToko, checkBookingConflict, getReviewsByCourtId } from "../../lib/firestore";
import { useAuth } from "../../lib/AuthContext";
import type { Court, Toko, Review } from "../../lib/types";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../src/firebaseConfig";

export default function CourtDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courtId = params.id as string;

  const [court, setCourt] = useState<Court | null>(null);
  const [toko, setToko] = useState<Toko | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

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

        // Fetch reviews
        const reviewsData = await getReviewsByCourtId(courtId);
        setReviews(reviewsData);

        // Generate next 7 days
        const dates = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          dates.push(date.toISOString().split("T")[0]);
        }
        setAvailableDates(dates);
        setSelectedDate(dates[0]);
      } catch (err) {
        console.error("Error fetching court:", err);
        setError("Gagal memuat data lapangan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courtId]);

  // Fetch booked slots when date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate || !courtId) return;

      setLoadingSlots(true);
      try {
        const bookingsRef = collection(db, "bookings");
        const q = query(
          bookingsRef,
          where("courtId", "==", courtId),
          where("date", "==", selectedDate),
          where("status", "in", ["pending", "confirmed"])
        );
        const querySnapshot = await getDocs(q);

        const booked: string[] = [];
        querySnapshot.forEach((doc) => {
          const booking = doc.data();
          booked.push(booking.startTime);
        });

        setBookedSlots(booked);
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, courtId]);

  // Generate time slots with end time
  const generateTimeSlots = () => {
    if (!court) return [];

    const slots = [];
    const [startHour] = court.availability.startTime.split(":").map(Number);
    const [endHour] = court.availability.endTime.split(":").map(Number);

    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${hour.toString().padStart(2, "0")}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
      slots.push({
        value: startTime,
        label: `${startTime} - ${endTime}`
      });
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const toggleTimeSlot = (time: string) => {
    setSelectedTimeSlots((prev) => {
      if (prev.includes(time)) {
        return prev.filter((t) => t !== time);
      } else {
        return [...prev, time].sort();
      }
    });
  };

  const calculateTotal = () => {
    if (!court) return 0;
    return court.price * selectedTimeSlots.length;
  };

  const handleBooking = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!selectedDate || selectedTimeSlots.length === 0) {
      alert("Silakan pilih tanggal dan minimal 1 slot waktu");
      return;
    }

    // Check for booking conflict for each selected slot
    try {
      for (const timeSlot of selectedTimeSlots) {
        const hasConflict = await checkBookingConflict(
          courtId,
          selectedDate,
          timeSlot,
          1 // Each slot is 1 hour
        );

        if (hasConflict) {
          alert(
            `Maaf, slot waktu ${timeSlot} sudah dibooking. Silakan hapus slot tersebut atau pilih waktu lain.`
          );
          return;
        }
      }

      // All slots available, proceed to booking confirmation
      const duration = selectedTimeSlots.length;
      const startTime = selectedTimeSlots[0];
      router.push(
        `/booking/confirm?courtId=${courtId}&date=${selectedDate}&time=${startTime}&duration=${duration}`
      );
    } catch (error) {
      console.error("Error checking booking conflict:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hari Ini";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Besok";
    } else {
      return date.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
    }
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
          <div className="mb-6 text-sm text-gray-600">
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

              {/* Toko Info Card - Prominent */}
              {toko && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-md p-6 border-2 border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-3xl">
                      🏪
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">Dikelola oleh</p>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{toko.name}</h2>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-green-600">📍</span>
                          <span className="font-medium">{toko.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-green-600">🏙️</span>
                          <span>{toko.location.city}, {toko.location.district}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-green-600">📞</span>
                          <span>{toko.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-green-600">📧</span>
                          <span>{toko.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-green-600">🕐</span>
                          <span className="font-semibold">
                            Buka: {toko.operatingHours.open} - {toko.operatingHours.close}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {toko.description && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-sm text-gray-700">{toko.description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Court Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {court.name}
                </h1>

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
                  {/* Date Tabs */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Pilih Tanggal
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableDates.map((date) => (
                        <button
                          key={date}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedTimeSlots([]);
                          }}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border-2 transition ${
                            selectedDate === date
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
                          }`}
                        >
                          {formatDateLabel(date)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Pilih Slot Waktu {loadingSlots && "(Memuat...)"}
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {timeSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot.value);
                        const isSelected = selectedTimeSlots.includes(slot.value);
                        return (
                          <button
                            key={slot.value}
                            onClick={() => !isBooked && toggleTimeSlot(slot.value)}
                            disabled={isBooked}
                            className={`px-3 py-2 text-xs font-medium rounded-lg border-2 transition ${
                              isBooked
                                ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                                : isSelected
                                ? "bg-green-500 text-white border-green-500"
                                : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
                            }`}
                          >
                            {slot.label}
                            {isBooked && (
                              <span className="block text-[10px] mt-0.5">Sudah Dipesan</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Slots Info */}
                  {selectedTimeSlots.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        Slot Terpilih ({selectedTimeSlots.length} jam):
                      </p>
                      <div className="text-xs text-blue-800">
                        {selectedTimeSlots.map((time, idx) => {
                          const slot = timeSlots.find(s => s.value === time);
                          return (
                            <span key={time}>
                              {slot?.label || time}
                              {idx < selectedTimeSlots.length - 1 && ", "}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="mb-6 p-5 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-800 font-medium">
                      Rp {formattedPrice} x {selectedTimeSlots.length || 0} jam
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
                  disabled={court.status !== "available" || selectedTimeSlots.length === 0}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {court.status !== "available"
                    ? "Tidak Tersedia"
                    : selectedTimeSlots.length === 0
                    ? "Pilih Slot Waktu"
                    : "Pesan Sekarang"}
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

        {/* Reviews Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ulasan & Rating</h2>
            
            {/* Rating Summary */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {court?.rating.toFixed(1) || "0.0"}
                  </div>
                  <div className="flex gap-1 text-yellow-400 text-xl mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= Math.round(court?.rating || 0) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {court?.totalReviews || 0} ulasan
                  </div>
                </div>

                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r: any) => r.rating === star).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    
                    return (
                      <div key={star} className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-600 w-8">{star}</span>
                        <span className="text-yellow-400">★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                  <div className="text-gray-400 text-5xl mb-4">💭</div>
                  <p className="text-gray-600">Belum ada ulasan. Jadilah yang pertama memberikan ulasan!</p>
                </div>
              ) : (
                reviews.map((review: any) => (
                  <div key={review.id} className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {review.userName?.[0]?.toUpperCase() || "U"}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{review.userName || "User"}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt.seconds * 1000).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex gap-1 text-yellow-400 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star}>{star <= review.rating ? "★" : "☆"}</span>
                          ))}
                        </div>

                        {/* Comment */}
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
