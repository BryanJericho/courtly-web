"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";
import { updateUser } from "../lib/firestore";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("User tidak ditemukan");
      return;
    }

    setLoading(true);

    try {
      await updateUser(user.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });

      setSuccess("Profil berhasil diperbarui!");

      // Reload page untuk update auth context
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError("Gagal memperbarui profil. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-2 inline-block mt-5"
              >
                ← Kembali ke Beranda
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profil</h1>
              <p className="mt-2 text-gray-700">
                Kelola informasi profil Anda
              </p>
            </div>

            {authLoading || !user ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Profile Info Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-3xl">
                      {user.firstName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h2>
                      <p className="text-gray-700">{user.email}</p>
                      <div className="mt-2">
                        {getRoleBadge(user.role)}
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                        {success}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Nama Depan *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
                          placeholder="John"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Nama Belakang *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Email tidak dapat diubah
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Nomor Telepon *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
                        placeholder="081234567890"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>

                      <Link
                        href="/"
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition text-center"
                      >
                        Batal
                      </Link>
                    </div>
                  </form>
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Informasi Akun
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700 font-medium">User ID</span>
                      <span className="text-gray-900 font-mono">{user.uid.slice(0, 20)}...</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700 font-medium">Role</span>
                      <span>{getRoleBadge(user.role)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-700 font-medium">Terdaftar Sejak</span>
                      <span className="text-gray-900 font-medium">
                        {user.createdAt
                          ? typeof user.createdAt === 'string'
                            ? new Date(user.createdAt).toLocaleDateString("id-ID")
                            : 'toDate' in user.createdAt
                              ? user.createdAt.toDate().toLocaleDateString("id-ID")
                              : user.createdAt.toLocaleDateString("id-ID")
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
