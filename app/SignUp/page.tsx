"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckSquare } from 'lucide-react';

// Komponen utama untuk halaman pendaftaran
const App = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  // Toggle visibilitas kata sandi
  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setPasswordVisible(!passwordVisible);
    } else if (field === 'confirmPassword') {
      setConfirmPasswordVisible(!confirmPasswordVisible);
    }
  };

  // Handler untuk pendaftaran (fungsionalitas dummy)
  const handleSignUp = (e) => {
    e.preventDefault();
    if (isAgreed) {
      console.log('Pendaftaran berhasil! (Simulasi)');
      // Logika pendaftaran sesungguhnya akan diimplementasikan di sini
    } else {
      console.error('Anda harus menyetujui Syarat dan Ketentuan.');
      // Tampilkan pesan error kepada pengguna
    }
  };

  // Placeholder untuk gambar latar belakang voli
  const imageUrl = "https://placehold.co/1200x800/22c55e/ffffff?text=Lapangan+Voli";

  // Warna-warna utama (diambil dari desain)
  const primaryColor = 'rgb(34, 197, 94)'; // Hijau cerah

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="flex w-full max-w-6xl rounded-xl shadow-2xl overflow-hidden bg-white">
        
        {/* Kolom Kiri: Gambar dan Carousel Indicator */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src={imageUrl}
            alt="Pemain Voli"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/1200x800/10b981/ffffff?text=UI+Design";
            }}
          />
          {/* Lapisan overlay hijau untuk estetika seperti di desain */}
          <div className="absolute inset-0 bg-green-600/30"></div> 
          
          {/* Carousel Indicator (Simulasi) */}
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
            <div className="w-2 h-2 rounded-full bg-white"></div> {/* Indikator aktif */}
            <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
          </div>
        </div>

        {/* Kolom Kanan: Formulir Pendaftaran */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 lg:p-10 xl:p-16 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Daftar</h1>
          <p className="text-gray-600 mb-8">
            Mari kita bantu Anda menyiapkan semua agar Anda dapat mengakses akun pribadi Anda.
          </p>

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Nama Depan & Belakang */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nama Depan</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ramadani"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nama Belakang</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ramadani"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                  />
                </div>
              </div>
            </div>

            {/* Email & Nomor Telepon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="ramadani@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nomor Telepon</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="082198571871"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                  />
                </div>
              </div>
            </div>

            {/* Kata Sandi */}
            <div>
              <label className="text-sm font-medium text-gray-700">Kata Sandi</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="Kata Sandi"
                  required
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => togglePasswordVisibility('password')}
                >
                  {passwordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Kata Sandi */}
            <div>
              <label className="text-sm font-medium text-gray-700">Konfirmasi Kata Sandi</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  placeholder="Konfirmasi Kata Sandi"
                  required
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                >
                  {confirmPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Checkbox Persetujuan */}
            <div className="flex items-start pt-2">
              <input
                id="agreement"
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer mt-1"
                required
              />
              <label htmlFor="agreement" className="ml-2 text-sm text-gray-700">
                Saya setuju dengan semua{' '}
                <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                  Syarat dan Ketentuan
                </a>{' '}
                serta{' '}
                <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                  Kebijakan Privasi
                </a>
                .
              </label>
            </div>

            {/* Tombol Daftar */}
            <button
              type="submit"
              className={`w-full py-3 mt-4 text-white font-semibold rounded-lg shadow-lg transition duration-300 ${
                isAgreed
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!isAgreed}
            >
              Daftar
            </button>
          </form>

          {/* Pemisah atau Divider */}
          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">Atau Daftar dengan</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Opsi Login Sosial */}
          <div className="flex space-x-4">
            {/* Tombol Facebook */}
            <button
              type="button"
              className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150"
            >
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017C2 17.067 5.66 21.328 10.547 22.313V15.071H7.896V12.017H10.547V9.767C10.547 7.072 12.185 5.518 14.694 5.518C15.829 5.518 16.942 5.717 17.5 5.808V8.408H16.11C14.793 8.408 14.5 9.043 14.5 9.875V12.017H17.473L16.993 15.071H14.5V22.313C19.345 21.322 23 17.059 23 12.017C23 6.484 18.523 2 12 2Z" />
              </svg>
              Facebook
            </button>
            {/* Tombol Google */}
            <button
              type="button"
              className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.61 20.083H42V20H24v8h11.346c-1.636 4.417-5.918 7.5-10.346 7.5-6.627 0-12-5.373-12-12s5.373-12 12-12c3.085 0 5.877 1.157 8.083 3.03l5.657-5.657C34.046 6.136 29.28 4 24 4c-11.045 0-20 8.955-20 20s8.955 20 20 20c11.045 0 20-8.955 20-20V20.083z" />
                <path fill="#FF3D00" d="M6.306 14.691L1.649 9.034C3.89 6.88 6.94 5.093 10.426 4.195 14.49 1.45 19.162 0 24 0c11.045 0 20 8.955 20 20v.083H24V20h11.346c-1.636 4.417-5.918 7.5-10.346 7.5-6.627 0-12-5.373-12-12s5.373-12 12-12c3.085 0 5.877 1.157 8.083 3.03l5.657-5.657C34.046 6.136 29.28 4 24 4c-11.045 0-20 8.955-20 20s8.955 20 20 20c11.045 0 20-8.955 20-20V20.083z" />
                <path fill="#4CAF50" d="M43.61 20.083H42V20H24v8h11.346c-1.636 4.417-5.918 7.5-10.346 7.5-6.627 0-12-5.373-12-12s5.373-12 12-12c3.085 0 5.877 1.157 8.083 3.03l5.657-5.657C34.046 6.136 29.28 4 24 4c-11.045 0-20 8.955-20 20s8.955 20 20 20c11.045 0 20-8.955 20-20V20.083z" />
                <path fill="#1976D2" d="M6.306 14.691L1.649 9.034C3.89 6.88 6.94 5.093 10.426 4.195 14.49 1.45 19.162 0 24 0c11.045 0-20 8.955-20 20s8.955 20 20 20c11.045 0 20-8.955 20-20V20.083H24V20h11.346c-1.636 4.417-5.918 7.5-10.346 7.5-6.627 0-12-5.373-12-12s5.373-12 12-12c3.085 0 5.877 1.157 8.083 3.03l5.657-5.657C34.046 6.136 29.28 4 24 4c-11.045 0-20 8.955-20 20s8.955 20 20 20c11.045 0 20-8.955 20-20V20.083z" />
              </svg>
              Google
            </button>
            {/* Tombol Apple */}
            <button
              type="button"
              className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150"
            >
              <svg className="w-5 h-5 mr-2 text-gray-800" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.87 14.24c-.052.12-.132.22-.24.3-.23.16-.49.26-.78.33-.29.07-.59.1-.9.1-.31 0-.61-.03-.9-.1-.29-.07-.56-.17-.78-.33-.23-.16-.42-.36-.55-.59-.14-.23-.23-.5-.28-.78-.05-.28-.06-.57-.03-.86.03-.29.1-.56.24-.81.14-.25.31-.46.52-.63.22-.17.47-.28.74-.35.28-.07.57-.1.86-.09.29 0 .58.03.85.09.27.06.52.17.74.3.22.13.4.29.54.49.14.2.24.41.3.64.05.23.07.47.05.7-.02.23-.08.45-.17.65zm-3.13-1.63c-.02-.27.02-.53.11-.78.09-.25.24-.48.42-.67.19-.19.41-.34.66-.45.26-.11.53-.16.8-.16s.55.05.8.16c.26.11.48.26.66.45.19.19.34.42.42.67.09.25.13.51.11.78-.02.27-.08.53-.19.78-.11.25-.26.48-.45.67-.19.19-.41.34-.66.45-.26.11-.53.16-.8.16s-.55-.05-.8-.16c-.26-.11-.48-.26-.66-.45-.19-.19-.34-.42-.42-.67-.09-.25-.13-.51-.11-.78z" />
              </svg>
              Apple
            </button>
          </div>

          {/* Link Masuk/Login */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Sudah punya akun?{' '}
              <a href="#" className="text-green-600 font-semibold hover:text-green-700 transition duration-150">
                Masuk
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;