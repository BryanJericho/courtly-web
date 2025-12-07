"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import { createBooking, getCourt, checkBookingConflict } from "../../lib/firestore";
import ProtectedRoute from "../../components/ProtectedRoute";
import Header from "../../components/Header";
import Link from "next/link";
import type { Court } from "../../lib/types";

export default function BookingConfirmPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("transfer");

  // Get booking data from URL params
  const courtId = searchParams.get("courtId");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const duration = searchParams.get("duration");

  useEffect(() => {
    const fetchCourt = async () => {
      if (!courtId) {
        setError("Data booking tidak lengkap");
        setLoading(false);
        return;
      }

      try {
        const courtData = await getCourt(courtId);
        if (!courtData) {
          setError("Lapangan tidak ditemukan");
        } else {
          setCourt(courtData);
        }
      } catch (err) {
        console.error("Error fetching court:", err);
        setError("Gagal memuat data lapangan");
      } finally {
        setLoading(false);
      }
    };

    fetchCourt();
  }, [courtId]);

  const calculateTotal = () => {
    if (!court || !duration) return 0;
    return court.price * parseInt(duration);
  };

  const handlePayment = async () => {
    if (!user || !courtId || !date || !time || !duration || !court) {
      setError("Data booking tidak lengkap");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Check for booking conflict before processing payment
      const hasConflict = await checkBookingConflict(
        courtId,
        date,
        time,
        parseInt(duration)
      );

      if (hasConflict) {
        setError(
          "Maaf, waktu yang Anda pilih sudah dibooking oleh pengguna lain. Silakan kembali dan pilih waktu yang berbeda."
        );
        setProcessing(false);
        return;
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Double-check for conflict right before creating booking (race condition prevention)
      const hasConflictAgain = await checkBookingConflict(
        courtId,
        date,
        time,
        parseInt(duration)
      );

      if (hasConflictAgain) {
        setError(
          "Maaf, waktu yang Anda pilih baru saja dibooking oleh pengguna lain. Silakan kembali dan pilih waktu yang berbeda."
        );
        setProcessing(false);
        return;
      }

      // Create booking in Firestore
      const endTime = `${(parseInt(time!.split(':')[0]) + parseInt(duration!)).toString().padStart(2, '0')}:00`;
      
      const bookingId = await createBooking(user.uid, {
        courtId,
        tokoId: court.tokoId,
        bookingDate: date!,
        timeSlot: {
          start: time!,
          end: endTime,
        },
        totalPrice: calculateTotal(),
      });

      // Redirect to success page
      router.push(`/booking/success?bookingId=${bookingId}`);
    } catch (err: any) {
      console.error("Error processing payment:", err);
      setError("Gagal memproses pembayaran. Silakan coba lagi.");
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID").format(price);
  };

  const calculateEndTime = () => {
    if (!time || !duration) return "-";
    const [hours, minutes] = time.split(":").map(Number);
    const endHours = hours + parseInt(duration);
    return `${endHours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link
                href={`/detail/${courtId}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-2 inline-block"
              >
                ← Kembali ke Detail Lapangan
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Konfirmasi Booking
              </h1>
              <p className="mt-2 text-gray-700">
                Periksa detail booking Anda dan pilih metode pembayaran
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : error && !court ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-700 font-medium">{error}</p>
                <Link
                  href="/"
                  className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            ) : court ? (
              <div className="space-y-6">
                {/* Booking Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Detail Booking
                  </h2>

                  <div className="space-y-4">
                    {/* Court Info */}
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

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Tanggal
                        </p>
                        <p className="text-base font-bold text-gray-900">
                          {date
                            ? new Date(date).toLocaleDateString("id-ID", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Waktu
                        </p>
                        <p className="text-base font-bold text-gray-900">
                          {time} - {calculateEndTime()}
                        </p>
                        <p className="text-sm text-gray-700">
                          ({duration} jam)
                        </p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-800 font-medium">
                          Rp {formatPrice(court.price)} x {duration} jam
                        </span>
                        <span className="font-bold text-gray-900">
                          Rp {formatPrice(calculateTotal())}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                        <span className="text-lg font-bold text-gray-900">
                          Total Pembayaran
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          Rp {formatPrice(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Metode Pembayaran
                  </h2>

                  <div className="space-y-3">
                    {/* Bank Transfer */}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        paymentMethod === "transfer"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="transfer"
                        checked={paymentMethod === "transfer"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-green-600"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-semibold text-gray-900">
                          Transfer Bank
                        </p>
                        <p className="text-sm text-gray-700">
                          BCA, Mandiri, BNI, BRI
                        </p>
                      </div>
                      <span className="text-2xl">🏦</span>
                    </label>

                    {/* E-Wallet */}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        paymentMethod === "ewallet"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="ewallet"
                        checked={paymentMethod === "ewallet"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-green-600"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-semibold text-gray-900">
                          E-Wallet
                        </p>
                        <p className="text-sm text-gray-700">
                          GoPay, OVO, Dana, LinkAja
                        </p>
                      </div>
                      <span className="text-2xl">💳</span>
                    </label>

                    {/* Credit Card */}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        paymentMethod === "card"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-green-600"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-semibold text-gray-900">
                          Kartu Kredit/Debit
                        </p>
                        <p className="text-sm text-gray-700">
                          Visa, Mastercard, JCB
                        </p>
                      </div>
                      <span className="text-2xl">💰</span>
                    </label>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Memproses Pembayaran...
                      </span>
                    ) : (
                      `Bayar Rp ${formatPrice(calculateTotal())}`
                    )}
                  </button>

                  <Link
                    href={`/detail/${courtId}`}
                    className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition text-center"
                  >
                    Batal
                  </Link>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    ℹ️ Ini adalah simulasi pembayaran. Pembayaran akan
                    diproses secara otomatis dan booking Anda akan segera
                    dikonfirmasi.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
