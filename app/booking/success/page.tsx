"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getBooking, getCourt } from "../../lib/firestore";
import ProtectedRoute from "../../components/ProtectedRoute";
import Header from "../../components/Header";
import Link from "next/link";
import type { Booking, Court } from "../../lib/types";
import { Timestamp } from "firebase/firestore";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const bookingData = await getBooking(bookingId);
        if (bookingData) {
          setBooking(bookingData);

          // Fetch court data
          const courtData = await getCourt(bookingData.courtId);
          setCourt(courtData);
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();

    // Auto-refresh booking status untuk QRIS/e-wallet (polling setiap 3 detik)
    const interval = setInterval(() => {
      if (bookingId && booking?.paymentStatus === 'pending') {
        fetchBookingData();
      }
    }, 3000);

    // Stop polling setelah 2 menit
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [bookingId, booking?.paymentStatus]);

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Memuat data booking...</p>
              </div>
            ) : !booking ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-700 font-medium">
                  Booking tidak ditemukan
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Success/Pending Icon */}
                <div className="text-center">
                  {booking.paymentStatus === 'paid' ? (
                    <>
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <svg
                          className="w-12 h-12 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Pembayaran Berhasil!
                      </h1>
                      <p className="text-gray-700">
                        Booking Anda telah dikonfirmasi
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Menunggu Pembayaran
                      </h1>
                      <p className="text-gray-700">
                        Mohon selesaikan pembayaran Anda
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                        <span className="animate-pulse text-blue-600">●</span>
                        <span className="text-sm text-blue-700">Auto-refresh setiap 3 detik...</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Booking Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Detail Booking
                  </h2>

                  <div className="space-y-4">
                    {/* Booking ID */}
                    <div className="pb-4 border-b">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        ID Booking
                      </p>
                      <p className="text-base font-mono font-bold text-gray-900">
                        {bookingId}
                      </p>
                    </div>

                    {/* Court Info */}
                    {court && (
                      <div className="pb-4 border-b">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Lapangan
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {court.name}
                        </p>
                        <p className="text-sm text-gray-800 capitalize">
                          {court.sport} • {court.environment}
                        </p>
                      </div>
                    )}

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Tanggal
                        </p>
                        <p className="text-base font-bold text-gray-900">
                          {new Date(
                            booking.bookingDate instanceof Timestamp 
                              ? booking.bookingDate.toDate() 
                              : booking.bookingDate
                          ).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Waktu
                        </p>
                        <p className="text-base font-bold text-gray-900">
                          {booking.timeSlot.start} - {booking.timeSlot.end}
                        </p>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="pb-4 border-b">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Status Pembayaran
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.paymentStatus === 'paid' ? 'Lunas' : 'Menunggu Pembayaran'}
                        </span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        Total Pembayaran
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        Rp {formatPrice(booking.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    📧 Email konfirmasi telah dikirim ke alamat email Anda.
                    Silakan datang 10-15 menit sebelum waktu bermain.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/bookings"
                    className="py-3 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition text-center"
                  >
                    Lihat Semua Booking
                  </Link>
                  <Link
                    href="/"
                    className="py-3 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition text-center"
                  >
                    Kembali ke Beranda
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
