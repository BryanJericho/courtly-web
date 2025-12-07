"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { getUserBookings, getCourt, completeBooking, checkUserReview } from "../lib/firestore";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";
import ReviewModal from "../components/ReviewModal";
import Link from "next/link";
import type { Booking, Court } from "../lib/types";

interface BookingWithCourt extends Booking {
  court?: Court;
  date?: string; // Custom field used in actual implementation
  startTime?: string;
  duration?: number;
}

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [completingBookingId, setCompletingBookingId] = useState<string | null>(null);
  
  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<BookingWithCourt | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        const bookingsData = await getUserBookings(user.uid);

        // Fetch court data for each booking
        const bookingsWithCourts = await Promise.all(
          bookingsData.map(async (booking) => {
            const court = await getCourt(booking.courtId);
            const hasReviewed = await checkUserReview(user.uid, booking.id);
            return { ...booking, court, hasReviewed } as BookingWithCourt;
          })
        );

        setBookings(bookingsWithCourts);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID").format(price);
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = hours + duration;
    return `${endHours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Menunggu Konfirmasi Toko",
      },
      confirmed: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Dikonfirmasi",
      },
      completed: { bg: "bg-blue-100", text: "text-blue-700", label: "Selesai" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Dibatalkan" },
    };

    const badge = badges[status] || badges.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  const isPastBooking = (date: string) => {
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate < today;
  };

  const handleCompleteBooking = async (bookingId: string) => {
    if (!confirm("Apakah Anda yakin sudah selesai bermain?")) return;

    setCompletingBookingId(bookingId);
    try {
      await completeBooking(bookingId);

      // Update local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "completed" as const }
            : booking
        )
      );

      alert("Booking berhasil ditandai sebagai selesai!");
      
      // Open review modal
      const updatedBooking = bookings.find(b => b.id === bookingId);
      if (updatedBooking) {
        setSelectedBookingForReview({ ...updatedBooking, status: "completed" });
        setIsReviewModalOpen(true);
      }
    } catch (error) {
      console.error("Error completing booking:", error);
      alert("Gagal menandai booking sebagai selesai. Silakan coba lagi.");
    } finally {
      setCompletingBookingId(null);
    }
  };

  const handleOpenReviewModal = (booking: BookingWithCourt) => {
    setSelectedBookingForReview(booking);
    setIsReviewModalOpen(true);
  };

  const handleReviewSuccess = async () => {
    // Refresh bookings to update hasReviewed status
    if (!user) return;
    
    try {
      const bookingsData = await getUserBookings(user.uid);
      const bookingsWithCourts = await Promise.all(
        bookingsData.map(async (booking) => {
          const court = await getCourt(booking.courtId);
          const hasReviewed = await checkUserReview(user.uid, booking.id);
          return { ...booking, court, hasReviewed } as BookingWithCourt;
        })
      );
      setBookings(bookingsWithCourts);
    } catch (err) {
      console.error("Error refreshing bookings:", err);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    if (filter === "upcoming") {
      // Upcoming: confirmed bookings yang belum lewat tanggalnya
      return booking.status === "confirmed" && booking.date && !isPastBooking(booking.date);
    }
    if (filter === "past") {
      // Riwayat: completed, cancelled, atau yang sudah lewat tanggalnya
      return (
        booking.status === "completed" ||
        booking.status === "cancelled" ||
        (booking.date && isPastBooking(booking.date))
      );
    }
    return true;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-2 inline-block"
              >
                ← Kembali ke Beranda
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Booking Saya
              </h1>
              <p className="mt-2 text-gray-700">
                Lihat dan kelola semua booking Anda
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-3 font-medium transition border-b-2 ${
                  filter === "all"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter("upcoming")}
                className={`px-6 py-3 font-medium transition border-b-2 ${
                  filter === "upcoming"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Akan Datang
              </button>
              <button
                onClick={() => setFilter("past")}
                className={`px-6 py-3 font-medium transition border-b-2 ${
                  filter === "past"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Riwayat
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Memuat booking...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Belum ada booking
                </h3>
                <p className="text-gray-700 mb-6">
                  Anda belum memiliki booking{" "}
                  {filter === "upcoming"
                    ? "yang akan datang"
                    : filter === "past"
                    ? "sebelumnya"
                    : ""}
                </p>
                <Link
                  href="/carilapangan"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition"
                >
                  Cari Lapangan
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Court Image */}
                      {booking.court && booking.court.images.length > 0 && (
                        <div className="w-full md:w-48 h-48 flex-shrink-0">
                          <img
                            src={booking.court.images[0]}
                            alt={booking.court.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {booking.court?.name || "Lapangan"}
                            </h3>
                            <p className="text-sm text-gray-800 capitalize">
                              {booking.court?.sport} •{" "}
                              {booking.court?.environment}
                            </p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {/* Date */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              📅 Tanggal
                            </p>
                            <p className="text-base font-bold text-gray-900">
                              {booking.date ? new Date(booking.date).toLocaleDateString(
                                "id-ID",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              ) : "-"}
                            </p>
                          </div>

                          {/* Time */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              🕐 Waktu
                            </p>
                            <p className="text-base font-bold text-gray-900">
                              {booking.startTime && booking.duration ? (
                                <>
                                  {booking.startTime} -{" "}
                                  {calculateEndTime(
                                    booking.startTime,
                                    booking.duration
                                  )}
                                </>
                              ) : "-"}
                            </p>
                            <p className="text-xs text-gray-700">
                              ({booking.duration || 0} jam)
                            </p>
                          </div>

                          {/* Total */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              💰 Total
                            </p>
                            <p className="text-base font-bold text-green-600">
                              Rp {formatPrice(booking.totalPrice)}
                            </p>
                          </div>
                        </div>

                        {/* Booking ID */}
                        <div className="text-xs text-gray-600 mb-3">
                          ID: {booking.id}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap">
                          <Link
                            href={`/detail/${booking.courtId}`}
                            className="px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition text-sm"
                          >
                            Lihat Lapangan
                          </Link>
                          
                          {/* Tombol Selesai Bermain - untuk booking yang confirmed */}
                          {booking.status === "confirmed" &&
                            booking.date &&
                            !isPastBooking(booking.date) && (
                              <>
                                <button
                                  className="px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition text-sm"
                                  onClick={() => handleCompleteBooking(booking.id)}
                                  disabled={completingBookingId === booking.id}
                                >
                                  {completingBookingId === booking.id
                                    ? "Memproses..."
                                    : "Selesai Bermain"}
                                </button>
                                <button
                                  className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition text-sm"
                                  onClick={() => {
                                    // TODO: Add cancel booking functionality
                                    alert("Fitur batalkan booking akan segera hadir");
                                  }}
                                >
                                  Batalkan
                                </button>
                              </>
                            )}
                          
                          {/* Tombol Beri Review - untuk booking yang completed dan belum di-review */}
                          {booking.status === "completed" && !booking.hasReviewed && (
                            <button
                              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-500 transition text-sm shadow-md"
                              onClick={() => handleOpenReviewModal(booking)}
                            >
                              ⭐ Beri Review
                            </button>
                          )}
                          
                          {/* Label sudah direview */}
                          {booking.status === "completed" && booking.hasReviewed && (
                            <span className="px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg text-sm flex items-center gap-1">
                              ✓ Sudah Direview
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Review Modal */}
        {selectedBookingForReview && (
          <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => {
              setIsReviewModalOpen(false);
              setSelectedBookingForReview(null);
            }}
            courtId={selectedBookingForReview.courtId}
            bookingId={selectedBookingForReview.id}
            courtName={selectedBookingForReview.court?.name || "Lapangan"}
            onSuccess={handleReviewSuccess}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
