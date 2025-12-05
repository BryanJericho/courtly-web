"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import { getTokoByPenjaga, getCourtsByToko, getTokoBookings, updateBooking, getCourt } from "../../lib/firestore";
import type { Toko, Court, Booking } from "../../lib/types";
import RoleGuard from "../../components/RoleGuard";
import Header from "../../components/Header";
import Link from "next/link";

interface BookingWithCourt extends Booking {
  court?: Court;
}

export default function PenjagaDashboard() {
  const { user } = useAuth();
  const [toko, setToko] = useState<Toko | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<BookingWithCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "courts" | "bookings">("overview");
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch toko milik penjaga
        const tokoData = await getTokoByPenjaga(user.uid);
        setToko(tokoData);

        // Fetch lapangan dari toko (jika toko sudah ada)
        if (tokoData) {
          const courtsData = await getCourtsByToko(tokoData.id);
          setCourts(courtsData);

          // Fetch bookings dari toko
          const bookingsData = await getTokoBookings(tokoData.id);

          // Fetch court data for each booking
          const bookingsWithCourts = await Promise.all(
            bookingsData.map(async (booking) => {
              const court = await getCourt(booking.courtId);
              return { ...booking, court };
            })
          );

          setBookings(bookingsWithCourts);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleApproveBooking = async (bookingId: string) => {
    if (!confirm("Apakah Anda yakin ingin menyetujui booking ini?")) return;

    try {
      setProcessingBookingId(bookingId);
      await updateBooking(bookingId, { status: "confirmed" });

      // Update local state
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: "confirmed" } : booking
        )
      );

      alert("Booking berhasil dikonfirmasi!");
    } catch (error) {
      console.error("Error approving booking:", error);
      alert("Gagal mengkonfirmasi booking. Silakan coba lagi.");
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    if (!confirm("Apakah Anda yakin ingin menolak booking ini?")) return;

    try {
      setProcessingBookingId(bookingId);
      await updateBooking(bookingId, { status: "cancelled" });

      // Update local state
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
        )
      );

      alert("Booking berhasil ditolak!");
    } catch (error) {
      console.error("Error rejecting booking:", error);
      alert("Gagal menolak booking. Silakan coba lagi.");
    } finally {
      setProcessingBookingId(null);
    }
  };

  const getTokoStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: "bg-green-100", text: "text-green-700", label: "Aktif" },
      inactive: { bg: "bg-gray-100", text: "text-gray-700", label: "Nonaktif" },
      pending_approval: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Menunggu Persetujuan" },
    };

    const badge = badges[status] || badges.inactive;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getBookingStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Menunggu Konfirmasi" },
      confirmed: { bg: "bg-green-100", text: "text-green-700", label: "Dikonfirmasi" },
      completed: { bg: "bg-blue-100", text: "text-blue-700", label: "Selesai" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Dibatalkan" },
    };

    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID").format(price);
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = hours + duration;
    return `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <RoleGuard allowedRoles={["penjaga_lapangan"]}>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Penjaga Lapangan</h1>
              <p className="mt-2 text-gray-600">
                Kelola toko dan lapangan olahraga Anda
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : !toko ? (
              // Belum punya toko - Show CTA
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl mb-4">🏟️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Belum Punya Toko
                </h2>
                <p className="text-gray-600 mb-6">
                  Daftarkan toko Anda untuk mulai mengelola lapangan olahraga
                </p>
                <Link
                  href="/penjaga/toko/create"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-600 transition"
                >
                  Daftar Toko Sekarang
                </Link>
              </div>
            ) : (
              // Sudah punya toko - Show Dashboard
              <div className="space-y-6">
                {/* Toko Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{toko.name}</h2>
                      <p className="text-sm text-gray-600 mt-1">{toko.description}</p>
                    </div>
                    {getTokoStatusBadge(toko.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">📍 Alamat</p>
                      <p className="font-medium">{toko.address}</p>
                      <p className="text-gray-500">{toko.location.city}, {toko.location.district}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">📞 Kontak</p>
                      <p className="font-medium">{toko.phone}</p>
                      <p className="text-gray-500">{toko.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">🕐 Jam Operasional</p>
                      <p className="font-medium">
                        {toko.operatingHours.open} - {toko.operatingHours.close}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Link
                      href="/penjaga/toko/edit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      Edit Toko
                    </Link>
                  </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-2 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-6 py-3 font-medium transition border-b-2 ${
                      activeTab === "overview"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("courts")}
                    className={`px-6 py-3 font-medium transition border-b-2 ${
                      activeTab === "courts"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Lapangan ({courts.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className={`px-6 py-3 font-medium transition border-b-2 relative ${
                      activeTab === "bookings"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Booking ({bookings.length})
                    {pendingBookings.length > 0 && (
                      <span className="absolute -top-1 -right-1 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        {pendingBookings.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-700 font-medium">Total Lapangan</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{courts.length}</p>
                          </div>
                          <div className="text-4xl">🏟️</div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-700 font-medium">Booking Pending</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-1">
                              {pendingBookings.length}
                            </p>
                          </div>
                          <div className="text-4xl">⏳</div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-700 font-medium">Booking Aktif</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">
                              {confirmedBookings.length}
                            </p>
                          </div>
                          <div className="text-4xl">✅</div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-700 font-medium">Total Pendapatan</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">
                              Rp {formatPrice(totalRevenue)}
                            </p>
                          </div>
                          <div className="text-4xl">💰</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link
                        href="/penjaga/lapangan/create"
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-5xl">➕</div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Tambah Lapangan</h3>
                            <p className="text-sm text-gray-700">Daftarkan lapangan baru</p>
                          </div>
                        </div>
                      </Link>

                      <button
                        onClick={() => setActiveTab("bookings")}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-5xl">📋</div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Kelola Booking</h3>
                            <p className="text-sm text-gray-700">
                              {pendingBookings.length} booking menunggu konfirmasi
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "courts" && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Daftar Lapangan</h3>
                    <Link
                      href="/penjaga/lapangan/create"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                    >
                      + Tambah Lapangan
                    </Link>
                  </div>

                  {courts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Belum ada lapangan. Tambahkan lapangan pertama Anda!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Nama Lapangan
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Olahraga
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Harga
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {courts.map((court) => (
                            <tr key={court.id}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {court.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                                {court.sport}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                Rp {court.price.toLocaleString("id-ID")}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  court.status === "available"
                                    ? "bg-green-100 text-green-700"
                                    : court.status === "maintenance"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}>
                                  {court.status === "available" ? "Tersedia" : court.status === "maintenance" ? "Maintenance" : "Tidak Tersedia"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <Link
                                  href={`/penjaga/lapangan/edit/${court.id}`}
                                  className="text-blue-600 hover:text-blue-700 font-medium mr-3"
                                >
                                  Edit
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                )}

                {activeTab === "bookings" && (
                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">📅</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Belum Ada Booking
                        </h3>
                        <p className="text-gray-700">
                          Booking dari pelanggan akan muncul di sini
                        </p>
                      </div>
                    ) : (
                      bookings.map((booking) => (
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
                                    {booking.court?.sport} • {booking.court?.environment}
                                  </p>
                                </div>
                                {getBookingStatusBadge(booking.status)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {/* Date */}
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-1">
                                    📅 Tanggal
                                  </p>
                                  <p className="text-base font-bold text-gray-900">
                                    {new Date(booking.date).toLocaleDateString("id-ID", {
                                      weekday: "short",
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>

                                {/* Time */}
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-1">
                                    🕐 Waktu
                                  </p>
                                  <p className="text-base font-bold text-gray-900">
                                    {booking.startTime} - {calculateEndTime(booking.startTime, booking.duration)}
                                  </p>
                                  <p className="text-xs text-gray-700">
                                    ({booking.duration} jam)
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
                              {booking.status === "pending" && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApproveBooking(booking.id!)}
                                    disabled={processingBookingId === booking.id}
                                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {processingBookingId === booking.id
                                      ? "Memproses..."
                                      : "✓ Terima Booking"}
                                  </button>
                                  <button
                                    onClick={() => handleRejectBooking(booking.id!)}
                                    disabled={processingBookingId === booking.id}
                                    className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {processingBookingId === booking.id
                                      ? "Memproses..."
                                      : "✕ Tolak"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
