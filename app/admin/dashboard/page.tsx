"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import { getAllUsers, getAllTokos, getAllCourts, getAllBookings, approveToko, deleteToko, updateUserRole, deleteUser } from "../../lib/firestore";
import type { User, Toko, Court, Booking } from "../../lib/types";
import RoleGuard from "../../components/RoleGuard";
import Header from "../../components/Header";
import Link from "next/link";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [tokos, setTokos] = useState<Toko[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "tokos" | "users">("overview");
  const [processingTokoId, setProcessingTokoId] = useState<string | null>(null);
  const [deletingTokoId, setDeletingTokoId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editUserRole, setEditUserRole] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, tokosData, courtsData, bookingsData] = await Promise.all([
        getAllUsers(),
        getAllTokos(),
        getAllCourts(),
        getAllBookings(),
      ]);

      setUsers(usersData);
      setTokos(tokosData);
      setCourts(courtsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveToko = async (tokoId: string) => {
    if (!confirm("Apakah Anda yakin ingin menyetujui toko ini?")) return;

    try {
      setProcessingTokoId(tokoId);
      await approveToko(tokoId);

      // Update local state
      setTokos(tokos.map(toko =>
        toko.id === tokoId ? { ...toko, status: "active" } : toko
      ));

      alert("Toko berhasil disetujui!");
    } catch (error) {
      console.error("Error approving toko:", error);
      alert("Gagal menyetujui toko");
    } finally {
      setProcessingTokoId(null);
    }
  };

  const handleDeleteToko = async (tokoId: string, tokoName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus toko "${tokoName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      setDeletingTokoId(tokoId);
      await deleteToko(tokoId);

      // Update local state
      setTokos(tokos.filter(t => t.id !== tokoId));
      alert("Toko berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting toko:", error);
      alert("Gagal menghapus toko. Silakan coba lagi.");
    } finally {
      setDeletingTokoId(null);
    }
  };

  const handleEditUserRole = async (userId: string, currentRole: string) => {
    setEditingUserId(userId);
    setEditUserRole(currentRole);
  };

  const handleSaveUserRole = async (userId: string) => {
    if (!editUserRole) return;

    try {
      await updateUserRole(userId, editUserRole as any);
      
      // Update local state
      setUsers(users.map(u => 
        u.uid === userId ? { ...u, role: editUserRole as any } : u
      ));
      
      setEditingUserId(null);
      alert("Role user berhasil diubah!");
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Gagal mengubah role user.");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      setDeletingUserId(userId);
      await deleteUser(userId);

      // Update local state
      setUsers(users.filter(u => u.uid !== userId));
      alert("User berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Gagal menghapus user. Silakan coba lagi.");
    } finally {
      setDeletingUserId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: "bg-green-100", text: "text-green-700", label: "Aktif" },
      inactive: { bg: "bg-gray-100", text: "text-gray-700", label: "Nonaktif" },
      pending_approval: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Menunggu Persetujuan" },
    };

    const badge = badges[status] || badges.inactive;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      user: { bg: "bg-blue-100", text: "text-blue-700", label: "User" },
      penjaga_lapangan: { bg: "bg-purple-100", text: "text-purple-700", label: "Penjaga Lapangan" },
      super_admin: { bg: "bg-red-100", text: "text-red-700", label: "Super Admin" },
    };

    const badge = badges[role] || badges.user;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // Statistics
  const stats = {
    totalUsers: users.length,
    totalTokos: tokos.length,
    activeTokos: tokos.filter(t => t.status === "active").length,
    pendingTokos: tokos.filter(t => t.status === "pending_approval").length,
    totalCourts: courts.length,
    availableCourts: courts.filter(c => c.status === "available").length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === "pending").length,
    confirmedBookings: bookings.filter(b => b.status === "confirmed").length,
    completedBookings: bookings.filter(b => b.status === "completed").length,
    totalRevenue: bookings
      .filter(b => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + b.totalPrice, 0),
    usersByRole: {
      user: users.filter(u => u.role === "user").length,
      penjaga: users.filter(u => u.role === "penjaga_lapangan").length,
      admin: users.filter(u => u.role === "super_admin").length,
    },
    courtsBySport: {
      futsal: courts.filter(c => c.sport === "futsal").length,
      basket: courts.filter(c => c.sport === "basket").length,
      tenis: courts.filter(c => c.sport === "tenis").length,
      badminton: courts.filter(c => c.sport === "badminton").length,
      voli: courts.filter(c => c.sport === "voli").length,
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <RoleGuard allowedRoles={["super_admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mt-5">Dashboard Admin</h1>
              <p className="mt-2 text-gray-700">
                Kelola seluruh sistem Courtly
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "overview"
                          ? "border-green-500 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab("tokos")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "tokos"
                          ? "border-green-500 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Kelola Toko
                      {stats.pendingTokos > 0 && (
                        <span className="ml-2 px-2 py-1 bg-red-500 text-white rounded-full text-xs">
                          {stats.pendingTokos}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("users")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "users"
                          ? "border-green-500 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Kelola User
                    </button>
                  </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Total User</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                              {stats.totalUsers}
                            </p>
                          </div>
                          <div className="text-4xl">👥</div>
                        </div>
                        <div className="mt-4 text-xs text-gray-600">
                          User: {stats.usersByRole.user} | Penjaga: {stats.usersByRole.penjaga} | Admin: {stats.usersByRole.admin}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Toko Aktif</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                              {stats.activeTokos}
                            </p>
                          </div>
                          <div className="text-4xl">🏪</div>
                        </div>
                        <div className="mt-4 text-xs text-gray-600">
                          Total: {stats.totalTokos} toko
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Pending Approval</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                              {stats.pendingTokos}
                            </p>
                          </div>
                          <div className="text-4xl">⏳</div>
                        </div>
                        <div className="mt-4 text-xs text-gray-600">
                          Toko menunggu persetujuan
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Total Lapangan</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                              {stats.totalCourts}
                            </p>
                          </div>
                          <div className="text-4xl">🏟</div>
                        </div>
                        <div className="mt-4 text-xs text-gray-600">
                          Tersedia: {stats.availableCourts} lapangan
                        </div>
                      </div>
                    </div>

                    {/* Additional Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Total Booking</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                              {stats.totalBookings}
                            </p>
                          </div>
                          <div className="text-4xl">📅</div>
                        </div>
                        <div className="mt-4 text-xs text-gray-600">
                          Pending: {stats.pendingBookings} | Confirmed: {stats.confirmedBookings}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              {formatPrice(stats.totalRevenue)}
                            </p>
                          </div>
                          <div className="text-4xl">💰</div>
                        </div>
                        <div className="mt-4 text-xs text-gray-600">
                          Dari {stats.confirmedBookings + stats.completedBookings} booking selesai
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Booking Selesai</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                              {stats.completedBookings}
                            </p>
                          </div>
                          <div className="text-4xl">✅</div>
                        </div>
                        <div className="mt-4 text-xs text-gray-600">
                          Booking yang sudah selesai
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Avg. per Booking</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              {stats.totalBookings > 0 
                                ? formatPrice(stats.totalRevenue / (stats.confirmedBookings + stats.completedBookings || 1))
                                : "Rp 0"}
                            </p>
                          </div>
                          <div className="text-4xl">📊</div>
                        </div>
                        <div className="mt-4 text-xs text-gray-600">
                          Rata-rata nilai booking
                        </div>
                      </div>
                    </div>

                    {/* Courts by Sport Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h2 className="text-lg font-bold text-gray-900 mb-4">Lapangan per Jenis Olahraga</h2>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-3xl mb-2">⚽</div>
                          <div className="text-2xl font-bold text-gray-900">{stats.courtsBySport.futsal}</div>
                          <div className="text-sm text-gray-600">Futsal</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-3xl mb-2">🏀</div>
                          <div className="text-2xl font-bold text-gray-900">{stats.courtsBySport.basket}</div>
                          <div className="text-sm text-gray-600">Basket</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-3xl mb-2">🎾</div>
                          <div className="text-2xl font-bold text-gray-900">{stats.courtsBySport.tenis}</div>
                          <div className="text-sm text-gray-600">Tenis</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-3xl mb-2">🏸</div>
                          <div className="text-2xl font-bold text-gray-900">{stats.courtsBySport.badminton}</div>
                          <div className="text-sm text-gray-600">Badminton</div>
                        </div>
                        <div className="text-center p-4 bg-pink-50 rounded-lg">
                          <div className="text-3xl mb-2">🏐</div>
                          <div className="text-2xl font-bold text-gray-900">{stats.courtsBySport.voli}</div>
                          <div className="text-sm text-gray-600">Voli</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                          onClick={() => setActiveTab("tokos")}
                          className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition text-left"
                        >
                          <div className="text-2xl mb-2">✅</div>
                          <div className="font-semibold text-gray-900">Approve Toko</div>
                          <div className="text-sm text-gray-600">{stats.pendingTokos} menunggu</div>
                        </button>

                        <button
                          onClick={() => setActiveTab("users")}
                          className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition text-left"
                        >
                          <div className="text-2xl mb-2">👥</div>
                          <div className="font-semibold text-gray-900">Kelola User</div>
                          <div className="text-sm text-gray-600">{stats.totalUsers} user terdaftar</div>
                        </button>

                        <button
                          onClick={() => setActiveTab("tokos")}
                          className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition text-left"
                        >
                          <div className="text-2xl mb-2">🏪</div>
                          <div className="font-semibold text-gray-900">Lihat Semua Toko</div>
                          <div className="text-sm text-gray-600">{stats.totalTokos} toko</div>
                        </button>
                      </div>
                    </div>

                    {/* Recent Pending Tokos */}
                    {stats.pendingTokos > 0 && (
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                          Toko Menunggu Persetujuan
                        </h2>
                        <div className="space-y-3">
                          {tokos
                            .filter(t => t.status === "pending_approval")
                            .slice(0, 5)
                            .map((toko) => (
                              <div
                                key={toko.id}
                                className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{toko.name}</p>
                                  <p className="text-sm text-gray-700">
                                    📍 {toko.location.city}, {toko.location.district}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    📧 {toko.email} | 📞 {toko.phone}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleApproveToko(toko.id)}
                                  disabled={processingTokoId === toko.id}
                                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {processingTokoId === toko.id ? "Processing..." : "Approve"}
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tokos Tab */}
                {activeTab === "tokos" && (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b">
                      <h2 className="text-lg font-bold text-gray-900">Semua Toko</h2>
                      <p className="text-sm text-gray-700 mt-1">
                        Total: {tokos.length} toko | Aktif: {stats.activeTokos} | Pending: {stats.pendingTokos}
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Nama Toko
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Lokasi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Kontak
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tokos.map((toko) => (
                            <tr key={toko.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-gray-900">{toko.name}</div>
                                <div className="text-sm text-gray-700">{toko.description}</div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-800">
                                {toko.location.city}, {toko.location.district}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-800">
                                <div>📧 {toko.email}</div>
                                <div>📞 {toko.phone}</div>
                              </td>
                              <td className="px-6 py-4">
                                {getStatusBadge(toko.status)}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center gap-2">
                                  {toko.status === "pending_approval" && (
                                    <button
                                      onClick={() => handleApproveToko(toko.id)}
                                      disabled={processingTokoId === toko.id}
                                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium disabled:opacity-50"
                                    >
                                      {processingTokoId === toko.id ? "..." : "Approve"}
                                    </button>
                                  )}
                                  {toko.status === "active" && (
                                    <>
                                      <span className="text-green-600 font-medium mr-2">✓ Approved</span>
                                      <Link
                                        href={`/admin/toko/edit/${toko.id}`}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                      >
                                        Edit
                                      </Link>
                                      <span className="text-gray-300">|</span>
                                      <button
                                        onClick={() => handleDeleteToko(toko.id, toko.name)}
                                        disabled={deletingTokoId === toko.id}
                                        className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                                      >
                                        {deletingTokoId === toko.id ? "..." : "Hapus"}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b">
                      <h2 className="text-lg font-bold text-gray-900">Semua User</h2>
                      <p className="text-sm text-gray-700 mt-1">
                        Total: {stats.totalUsers} user terdaftar
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Nama
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((u) => (
                            <tr key={u.uid} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-gray-900">
                                  {u.firstName} {u.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  UID: {u.uid.substring(0, 8)}...
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-800">
                                {u.email}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-800">
                                {u.phone || "-"}
                              </td>
                              <td className="px-6 py-4">
                                {editingUserId === u.uid ? (
                                  <select
                                    value={editUserRole}
                                    onChange={(e) => setEditUserRole(e.target.value)}
                                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  >
                                    <option value="user">User</option>
                                    <option value="penjaga_lapangan">Penjaga Lapangan</option>
                                    <option value="super_admin">Super Admin</option>
                                  </select>
                                ) : (
                                  getRoleBadge(u.role)
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center gap-2">
                                  {editingUserId === u.uid ? (
                                    <>
                                      <button
                                        onClick={() => handleSaveUserRole(u.uid)}
                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium"
                                      >
                                        Simpan
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingUserId(null);
                                          setEditUserRole("");
                                        }}
                                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition font-medium"
                                      >
                                        Batal
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleEditUserRole(u.uid, u.role)}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                      >
                                        Edit Role
                                      </button>
                                      <span className="text-gray-300">|</span>
                                      <button
                                        onClick={() => handleDeleteUser(u.uid, `${u.firstName} ${u.lastName}`)}
                                        disabled={deletingUserId === u.uid}
                                        className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                                      >
                                        {deletingUserId === u.uid ? "..." : "Hapus"}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}