"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/AuthContext";
import { createCourt, getTokoByPenjaga } from "../../../lib/firestore";
import type { Toko, SportType, EnvironmentType, AreaType } from "../../../lib/types";
import RoleGuard from "../../../components/RoleGuard";
import Header from "../../../components/Header";
import Link from "next/link";
import CloudinaryUpload from "../../../components/CloudinaryUpload";

export default function CreateLapanganPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toko, setToko] = useState<Toko | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    sport: "" as SportType,
    area: "" as AreaType,
    description: "",
    location: "",
    price: "",
    capacity: "",
    environment: "" as EnvironmentType,
    images: [] as string[],
    facilities: [] as string[],
    startTime: "08:00",
    endTime: "22:00",
  });

  const [facilityInput, setFacilityInput] = useState("");

  useEffect(() => {
    const fetchToko = async () => {
      if (!user) return;

      try {
        const tokoData = await getTokoByPenjaga(user.uid);
        if (!tokoData) {
          setError("Anda belum memiliki toko. Silakan daftar toko terlebih dahulu.");
          setTimeout(() => router.push("/penjaga/toko/create"), 2000);
        } else {
          setToko(tokoData);
        }
      } catch (err) {
        console.error("Error fetching toko:", err);
        setError("Gagal memuat data toko");
      }
    };

    fetchToko();
  }, [user, router]);

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

    if (!toko) {
      setError("Toko tidak ditemukan");
      return;
    }

    setLoading(true);

    try {
      const courtData = {
        tokoId: toko.id,
        name: formData.name,
        sport: formData.sport,
        area: formData.area,
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
      };

      await createCourt(courtData);
      router.push("/penjaga/dashboard");
    } catch (err: any) {
      console.error("Error creating court:", err);
      setError("Gagal membuat lapangan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Tambah Lapangan Baru</h1>
              <p className="mt-2 text-gray-600">
                Lengkapi informasi lapangan olahraga
              </p>
              {toko && (
                <p className="mt-1 text-sm text-gray-500">
                  Toko: <span className="font-medium">{toko.name}</span>
                </p>
              )}
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {toko ? (
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
                          Area Lokasi *
                        </label>
                        <select
                          name="area"
                          value={formData.area}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        >
                          <option value="">Pilih Area</option>
                          <option value="panakkukang">📍 Panakkukang & Sekitarnya</option>
                          <option value="rappocini">📍 Rappocini & AP Pettarani</option>
                          <option value="tamalanrea">📍 Tamalanrea & BTP</option>
                          <option value="manggala">📍 Manggala & Antang</option>
                          <option value="makassar-tengah">📍 Makassar Tengah & Mamajang</option>
                          <option value="cpi-gowa">📍 CPI & Gowa</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Pilih zona area yang paling dekat dengan lokasi lapangan
                        </p>
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
                      {loading ? "Menyimpan..." : "Tambah Lapangan"}
                    </button>

                    <Link
                      href="/penjaga/dashboard"
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-center"
                    >
                      Batal
                    </Link>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Memuat data toko...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
