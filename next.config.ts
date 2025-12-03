/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... Pengaturan Next.js lainnya (jika ada)

  images: {
    // 💡 Tambahkan hostname di sini. 
    // Hapus 'http://' atau 'https://' dan path setelah domain.
    domains: ['googleusercontent.com'], 
  },
};

module.exports = nextConfig;