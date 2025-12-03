"use client"

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react'; // 💡 Tambahkan React di sini jika belum ada
import { useRouter } from 'next/navigation'; // 🚀 Import useRouter untuk navigasi
import { FaFacebookF, FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Pastikan path ini benar ke file konfigurasi Firebase Anda
import { auth } from '../../src/firebaseConfig'; 

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🚀 Inisialisasi router
  const router = useRouter(); 
  
  // URL gambar
  const badmintonCourtImage = 'http://googleusercontent.com/image_collection/image_retrieval/16031492626801100943_0';

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email dan Kata Sandi harus diisi.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log('Login Berhasil! User:', userCredential.user);
      
      // 🚀 NAVIGASI: Push ke root route (halaman utama)
      router.push('/'); 

    } catch (err: any) {
      console.error("Error login:", err.code, err.message);
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Email atau kata sandi salah. Silakan coba lagi.');
          break;
        case 'auth/invalid-email':
          setError('Format email tidak valid.');
          break;
        default:
          setError('Login gagal. Silakan periksa kredensial Anda.');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Kolom Kiri: Form Login */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Masuk
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Input Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900"
                  placeholder="Masukkan email Anda"
                />
              </div>
            </div>

            {/* Input Kata Sandi */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Kata Sandi
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm pr-10 text-gray-900"
                  placeholder="Masukkan kata sandi Anda"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Checkbox Ingatkan Saya */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ingatkan Saya
                </label>
              </div>

              {/* Lupa Kata Sandi */}
              <div className="text-sm">
                <Link href="#" className="font-medium text-red-600 hover:text-red-500">
                  Lupa Kata Sandi?
                </Link>
              </div>
            </div>

            {/* Pesan Error */}
            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            {/* Tombol Masuk */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Memuat...' : 'Masuk'}
              </button>
            </div>
          </form>

          {/* Bagian Daftar Sekarang */}
          <div className="mt-6 text-center text-sm text-black">
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium text-red-600 hover:text-red-500">
              Daftar sekarang
            </Link>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Atau masuk dengan
                </span>
              </div>
            </div>

            {/* Tombol Social Login */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {/* Facebook */}
              <div>
                <Link
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <FaFacebookF className="h-5 w-5 text-blue-600" aria-hidden="true" />
                </Link>
              </div>

              {/* Google */}
              <div>
                <Link
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <FcGoogle className="h-5 w-5" aria-hidden="true" />
                </Link>
              </div>

              {/* Apple */}
              <div>
                <Link
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <FaApple className="h-5 w-5 text-gray-900" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Gambar */}
      <div className="hidden lg:block w-[40%] xl:w-[50%] bg-gray-100 relative overflow-hidden rounded-l-3xl">
        <div className="absolute inset-0">
          <Image
            src={badmintonCourtImage}
            alt="Lapangan Bulu Tangkis Indoor"
            layout="fill"
            objectFit="cover"
            priority 
          />
        </div>
        
        {/* Indikator Slider (titik putih) */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-white opacity-50" />
            <div className="h-2 w-5 rounded-full bg-white" /> 
            <div className="h-2 w-2 rounded-full bg-white opacity-50" />
        </div>
      </div>
    </div>
  );
}