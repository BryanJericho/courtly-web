"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../lib/AuthContext";
import { getCourt, updateCourt } from "../../../../lib/firestore";
import type { Court, SportType, EnvironmentType } from "../../../../lib/types";
import RoleGuard from "../../../../components/RoleGuard";
import Header from "../../../../components/Header";
import Link from "next/link";
import CloudinaryUpload from "../../../../components/CloudinaryUpload";

export default function EditLapanganPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courtId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [court, setCourt] = useState<Court | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    sport: "" as SportType,
    description: "",
    location: "",
    price: "",
    capacity: "",
    environment: "" as EnvironmentType,
    images: [] as string[],
    facilities: [] as string[],
    startTime: "08:00",
    endTime: "22:00",
    status: "available" as "available" | "unavailable" | "maintenance",
  });

  const [facilityInput, setFacilityInput] = useState("");

  useEffect(() => {
    const fetchCourt = async () => {
      try {
        const courtData = await getCourt(courtId);
        if (!courtData) {
          setError("Lapangan tidak ditemukan");
          setTimeout(() => router.push("/penjaga/dashboard"), 2000);
          return;
        }

        setCourt(courtData);
        setFormData({
          name: courtData.name,
          sport: courtData.sport,
          description: courtData.description,
          location: courtData.location || "",
          price: courtData.price.toString(),
          capacity: courtData.capacity.toString(),
          environment: courtData.environment,
          images: courtData.images || [],
          facilities: courtData.facilities || [],
          startTime: courtData.availability.startTime,
          endTime: courtData.availability.endTime,
          status: courtData.status || "available",
        });
      } catch (err) {
        console.error("Error fetching court:", err);
        setError("Gagal memuat data lapangan");
      } finally {
        setFetchingData(false);
      }
    };

    if (courtId) {
      fetchCourt();
    }
  }, [courtId, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addFacility = () => {
    if (facilityInput.trim() && !formData.facilities.includes(facilityInput.trim())) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, facilityInput.trim()],
      });
      setFacilityInput("");
    }
  };

  const removeFacility = (facility: string) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter((f) => f !== facility),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        sport: formData.sport,
        description: formData.description,
        location: formData.location,
        price: parseInt(formData.price),
        capacity: parseInt(formData.capacity),
        environment: formData.environment,
        images: formData.images,
        facilities: formData.facilities,
        availability: {
          startTime: formData.startTime,
          endTime: formData.endTime,
        },
        status: formData.status,
      };

      await updateCourt(courtId, updateData);
      alert("Lapangan berhasil diupdate!");
      router.push("/penjaga/dashboard");
    } catch (err: any) {
      console.error("Error updating court:", err);
      setError("Gagal mengupdate lapangan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <RoleGuard allowedRoles={["penjaga_lapangan"]}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Memuat data lapangan...</p>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["penjaga_lapangan"]}>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/penjaga/dashboard"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-2 inline-block"
              >
                ← Kembali ke Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Edit Lapangan</h1>
              <p className="mt-2 text-gray-600">
                Perbarui informasi lapangan olahraga
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
                        Nama Lapangan *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        placeholder="Contoh: Lapangan Futsal A"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jenis Olahraga *
                        </label>
                        <select
                          name="sport"
                          value={formData.sport}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        >
                          <option value="">Pilih Olahraga</option>
                          <option value="futsal">⚽ Futsal</option>
                          <option value="basket">🏀 Basket</option>
                          <option value="tenis">🎾 Tenis</option>
                          <option value="badminton">🏸 Badminton</option>
                          <option value="voli">🏐 Voli</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lingkungan *
                        </label>
                        <select
                          name="environment"
                          value={formData.environment}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        >
                          <option value="">Pilih Lingkungan</option>
                          <option value="indoor">Indoor</option>
                          <option value="outdoor">Outdoor</option>
                        </select>
                      </div>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        placeholder="Deskripsikan lapangan Anda..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lokasi *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        placeholder="Contoh: Jl. Merdeka No. 10, Bandung"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Masukkan nama jalan atau daerah lokasi lapangan
                      </p>
                    </div>
                  </div>
                </div>

                {/* Harga & Kapasitas */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Harga & Kapasitas
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga per Jam (Rp) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        placeholder="150000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kapasitas (Orang) *
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        placeholder="10"
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
                        Jam Mulai *
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jam Selesai *
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Status Lapangan
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    >
                      <option value="available">Tersedia</option>
                      <option value="unavailable">Tidak Tersedia</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                {/* Fasilitas */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Fasilitas
                  </h2>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={facilityInput}
                      onChange={(e) => setFacilityInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addFacility();
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="Contoh: Ruang Ganti"
                    />
                    <button
                      type="button"
                      onClick={addFacility}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      Tambah
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {facility}
                        <button
                          type="button"
                          onClick={() => removeFacility(facility)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gambar */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Gambar Lapangan
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
                    {loading ? "Menyimpan..." : "Update Lapangan"}
                  </button>

                  <Link
                    href="/penjaga/dashboard"
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
