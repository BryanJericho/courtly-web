"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../lib/AuthContext";
import { getToko, updateToko } from "../../../../lib/firestore";
import type { Toko } from "../../../../lib/types";
import RoleGuard from "../../../../components/RoleGuard";
import Header from "../../../../components/Header";
import Link from "next/link";
import CloudinaryUpload from "../../../../components/CloudinaryUpload";

export default function EditTokoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tokoId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [toko, setToko] = useState<Toko | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    district: "",
    phone: "",
    email: "",
    openTime: "08:00",
    closeTime: "22:00",
    images: [] as string[],
    status: "active" as "active" | "inactive" | "pending_approval",
  });

  useEffect(() => {
    const fetchToko = async () => {
      try {
        const tokoData = await getToko(tokoId);
        if (!tokoData) {
          setError("Toko tidak ditemukan");
          setTimeout(() => router.push("/admin/dashboard"), 2000);
          return;
        }

        setToko(tokoData);
        setFormData({
          name: tokoData.name,
          description: tokoData.description,
          address: tokoData.address,
          city: tokoData.location.city,
          district: tokoData.location.district,
          phone: tokoData.phone,
          email: tokoData.email,
          openTime: tokoData.operatingHours.open,
          closeTime: tokoData.operatingHours.close,
          images: tokoData.images || [],
          status: tokoData.status,
        });
      } catch (err) {
        console.error("Error fetching toko:", err);
        setError("Gagal memuat data toko");
      } finally {
        setFetchingData(false);
      }
    };

    if (tokoId) {
      fetchToko();
    }
  }, [tokoId, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        location: {
          city: formData.city,
          district: formData.district,
        },
        phone: formData.phone,
        email: formData.email,
        operatingHours: {
          open: formData.openTime,
          close: formData.closeTime,
        },
        images: formData.images,
        status: formData.status,
      };

      await updateToko(tokoId, updateData);
      alert("Toko berhasil diupdate!");
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Error updating toko:", err);
      setError("Gagal mengupdate toko. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <RoleGuard allowedRoles={["super_admin"]}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Memuat data toko...</p>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["super_admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/admin/dashboard"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-2 inline-block"
              >
                ← Kembali ke Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Edit Toko</h1>
              <p className="mt-2 text-gray-600">
                Perbarui informasi toko
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informasi Dasar */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Informasi Dasar
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Toko *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Contoh: Arena Futsal Jaya"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Deskripsikan toko Anda..."
                      />
                    </div>
                  </div>
                </div>

                {/* Lokasi */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Lokasi
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat Lengkap *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Jl. Contoh No. 123"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kota *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Jakarta"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kecamatan *
                        </label>
                        <input
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Kebayoran Baru"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kontak */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Informasi Kontak
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor Telepon *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="081234567890"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="toko@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Jam Operasional */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Jam Operasional
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jam Buka *
                      </label>
                      <input
                        type="time"
                        name="openTime"
                        value={formData.openTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jam Tutup *
                      </label>
                      <input
                        type="time"
                        name="closeTime"
                        value={formData.closeTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Status Toko
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                      <option value="pending_approval">Menunggu Persetujuan</option>
                    </select>
                  </div>
                </div>

                {/* Gambar */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Gambar Toko
                  </h2>

                  <CloudinaryUpload
                    onUploadSuccess={(urls) => setFormData({ ...formData, images: urls })}
                    multiple={true}
                    maxFiles={5}
                    existingImages={formData.images}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Menyimpan..." : "Update Toko"}
                  </button>

                  <Link
                    href="/admin/dashboard"
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-center"
                  >
                    Batal
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
