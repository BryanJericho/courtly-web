"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import { getTokoByPenjaga, getCourtsByToko } from "../../lib/firestore";
import type { Toko, Court } from "../../lib/types";
import RoleGuard from "../../components/RoleGuard";
import Header from "../../components/Header";
import Link from "next/link";

export default function PenjagaDashboard() {
  const { user } = useAuth();
  const [toko, setToko] = useState<Toko | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

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
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getStatusBadge = (status: string) => {
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
                    {getStatusBadge(toko.status)}
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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Lapangan</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{courts.length}</p>
                      </div>
                      <div className="text-4xl">🏟️</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Lapangan Tersedia</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">
                          {courts.filter((c) => c.status === "available").length}
                        </p>
                      </div>
                      <div className="text-4xl">✅</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Maintenance</p>
                        <p className="text-3xl font-bold text-yellow-600 mt-1">
                          {courts.filter((c) => c.status === "maintenance").length}
                        </p>
                      </div>
                      <div className="text-4xl">⚠️</div>
                    </div>
                  </div>
                </div>

                {/* Courts List */}
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
                                {getStatusBadge(court.status)}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
