"use client"

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FaFacebookF, FaApple } from 'react-icons/fa'; // 💡 Tambah ikon Facebook dan Apple
import { FcGoogle } from 'react-icons/fc';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// 💡 Tambah fungsi Google Auth dan getDoc untuk cek Firestore
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; 

import { auth, db } from '../../src/firebaseConfig'; 

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreedToTerms: false,
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const volleyballImage = 'http://googleusercontent.com/image_collection/image_retrieval/16031492626801100943_0'; 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Fungsi untuk pendaftaran Email/Password
    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        
        if (formData.password !== formData.confirmPassword) {
            setError('Konfirmasi kata sandi tidak cocok.');
            return;
        }
        if (!formData.agreedToTerms) {
            setError('Anda harus menyetujui Syarat dan Ketentuan.');
            return;
        }
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;
            
            const fullName = `${formData.firstName} ${formData.lastName}`;
            await updateProfile(user, { displayName: fullName });

            // Simpan data ke Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                createdAt: new Date().toISOString(),
            });

            console.log('Pendaftaran berhasil!', user.uid);
            setSuccessMessage(true);
            
            // Redirect ke / setelah 2 detik
            setTimeout(() => {
                router.push('/');
            }, 2000);

        } catch (err: any) {
            console.error("Error:", err.code, err.message);
            switch (err.code) {
                case 'auth/email-already-in-use': setError('Email ini sudah terdaftar.'); break;
                case 'auth/weak-password': setError('Kata sandi minimal 6 karakter.'); break;
                default: setError('Pendaftaran gagal. Silakan coba lagi.'); break;
            }
        } finally {
            setLoading(false);
        }
    };
    
    // 🚀 Fungsi untuk Sign-in dengan Google
    const handleGoogleSignIn = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const provider = new GoogleAuthProvider();
        
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Cek apakah user sudah ada di Firestore
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                // Jika user baru (pertama kali login dengan Google), simpan ke Firestore
                const fullName = user.displayName?.split(' ') || ['', ''];
                const firstName = fullName[0];
                const lastName = fullName.slice(1).join(' ');

                await setDoc(userRef, {
                    uid: user.uid,
                    firstName: firstName,
                    lastName: lastName,
                    email: user.email,
                    phone: '', // Nomor telepon harus diisi manual jika menggunakan Google Auth
                    createdAt: new Date().toISOString(),
                    provider: 'google'
                });
            }

            console.log('Google Sign-in/up berhasil!', user.uid);
            router.push('/'); 

        } catch (err: any) {
            console.error("Error Google Auth:", err.code, err.message);
            setError('Pendaftaran dengan Google gagal. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            {/* Kolom Kiri: Gambar */}
            <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 bg-gray-100 relative overflow-hidden rounded-r-3xl">
                <Image
                    src={volleyballImage}
                    alt="Volleyball"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    <div className="h-2 w-5 rounded-full bg-white" /> 
                    <div className="h-2 w-2 rounded-full bg-white opacity-50" />
                    <div className="h-2 w-2 rounded-full bg-white opacity-50" />
                </div>
            </div>

            {/* Kolom Kanan: Form */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-7">
                    <div className="w-full max-w-lg mx-auto">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Daftar</h1>
                        <p className="text-gray-500 text-sm mb-7">
                            Siapkan akun untuk mengakses layanan.
                        </p>

                        <form onSubmit={handleRegister} className="space-y-4">
                            
                            {/* Nama Depan & Belakang */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Depan</label>
                                    <input type="text" name="firstName" required 
                                        value={formData.firstName} onChange={handleChange}
                                        placeholder="Budi" 
                                        className="w-full px-2.5 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Belakang</label>
                                    <input type="text" name="lastName" required 
                                        value={formData.lastName} onChange={handleChange}
                                        placeholder="Santoso" 
                                        className="w-full px-2.5 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Email & Nomor Telepon */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" name="email" required 
                                        value={formData.email} onChange={handleChange}
                                        placeholder="nama@domain.com" 
                                        className="w-full px-2.5 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">No. Telepon</label>
                                    <input type="tel" name="phone" required 
                                        value={formData.phone} onChange={handleChange}
                                        placeholder="0812xxxxxxxx" 
                                        className="w-full px-2.5 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Kata Sandi */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Kata Sandi</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} name="password" required 
                                        value={formData.password} onChange={handleChange}
                                        placeholder="Minimal 6 karakter"
                                        className="w-full px-2.5 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-9 placeholder-gray-400"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-500 hover:text-gray-700">
                                        {showPassword ? (<EyeSlashIcon className="h-4 w-4" />) : (<EyeIcon className="h-4 w-4" />)}
                                    </button>
                                </div>
                            </div>

                            {/* Konfirmasi Kata Sandi */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Konfirmasi Kata Sandi</label>
                                <div className="relative">
                                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" required 
                                        value={formData.confirmPassword} onChange={handleChange}
                                        placeholder="Ulangi kata sandi"
                                        className="w-full px-2.5 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-9 placeholder-gray-400"
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-500 hover:text-gray-700">
                                        {showConfirmPassword ? (<EyeSlashIcon className="h-4 w-4" />) : (<EyeIcon className="h-4 w-4" />)}
                                    </button>
                                </div>
                            </div>

                            {/* Checkbox */}
                            <div className="flex items-start pt-0.5">
                                <div className="flex items-center h-4">
                                    <input id="agreedToTerms" name="agreedToTerms" type="checkbox" 
                                        checked={formData.agreedToTerms} onChange={handleChange}
                                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    />
                                </div>
                                <div className="ml-2 text-xs">
                                    <label htmlFor="agreedToTerms" className="text-gray-700">
                                        Saya setuju dengan <Link href="#" className="font-medium text-red-600 hover:text-red-500">Syarat</Link> dan <Link href="#" className="font-medium text-red-600 hover:text-red-500">Privasi</Link>
                                    </label>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <p className="text-xs text-red-600 font-medium">{error}</p>
                            )}

                            {/* Success Message */}
                            {successMessage && (
                                <div className="p-3 rounded-md bg-green-50 border border-green-200">
                                    <p className="text-sm font-medium text-green-800">✓ Pendaftaran berhasil! Mengalihkan...</p>
                                </div>
                            )}

                            {/* Tombol Daftar */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2 px-4 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 transition disabled:opacity-50 mt-4"
                            >
                                {loading ? 'Memproses...' : 'Daftar'}
                            </button>
                        </form>

                        {/* Sudah Punya Akun */}
                        <div className="mt-5 text-center text-sm text-black">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
                                Masuk
                            </Link>
                        </div>

                        {/* Divider */}
                        <div className="mt-5 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Atau daftar dengan</span>
                            </div>
                        </div>

                        {/* Social Buttons - Dikembalikan ke 3 kolom */}
                        <div className="mt-5">

                            {/* Google Button dengan Auth Logic */}
                            <div>
                                <Link 
                                    href="#" 
                                    onClick={handleGoogleSignIn} 
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                                >
                                    <FcGoogle className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}