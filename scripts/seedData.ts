// scripts/seedData.ts
// Script untuk populate data dummy ke Firestore

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Gunakan Firebase config yang sama
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data dummy tokos
const dummyTokos = [
  {
    name: "Sentral Futsal Arena",
    description: "Lapangan futsal berkualitas dengan fasilitas lengkap",
    address: "Jl. Sudirman No. 123",
    location: {
      city: "Jakarta",
      district: "Rappocini",
    },
    phone: "081234567890",
    email: "sentral@futsal.com",
    operatingHours: {
      open: "08:00",
      close: "22:00",
    },
    images: [
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800",
    ],
    penjagaId: "dummy_penjaga_1",
    status: "active",
  },
  {
    name: "Basketball Arena Pro",
    description: "Arena basket dengan standar internasional",
    address: "Jl. Gatot Subroto No. 45",
    location: {
      city: "Surabaya",
      district: "Gubeng",
    },
    phone: "081234567891",
    email: "pro@basketball.com",
    operatingHours: {
      open: "07:00",
      close: "23:00",
    },
    images: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    ],
    penjagaId: "dummy_penjaga_2",
    status: "active",
  },
  {
    name: "Tenis Center Bandung",
    description: "Lapangan tenis outdoor dan indoor tersedia",
    address: "Jl. Dago No. 88",
    location: {
      city: "Bandung",
      district: "Coblong",
    },
    phone: "081234567892",
    email: "info@teniscenter.com",
    operatingHours: {
      open: "06:00",
      close: "21:00",
    },
    images: [
      "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=800",
    ],
    penjagaId: "dummy_penjaga_3",
    status: "active",
  },
  {
    name: "Badminton Hall Makassar",
    description: "Gedung badminton ber-AC dengan 10 lapangan",
    address: "Jl. A.P. Pettarani No. 200",
    location: {
      city: "Makassar",
      district: "Rappocini",
    },
    phone: "081234567893",
    email: "hall@badminton.com",
    operatingHours: {
      open: "08:00",
      close: "22:00",
    },
    images: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    ],
    penjagaId: "dummy_penjaga_4",
    status: "active",
  },
];

// Generate 20 courts spread across tokos
const generateCourts = (tokoIds: string[]) => {
  const sports = ["futsal", "basket", "tenis", "badminton", "voli"];
  const environments = ["indoor", "outdoor"];
  const facilities = [
    "Ruang Ganti",
    "Toilet",
    "Kantin",
    "Parkir Luas",
    "Mushola",
    "AC",
    "CCTV",
    "Sound System",
  ];

  const courts = [];

  for (let i = 0; i < 20; i++) {
    const tokoIndex = i % tokoIds.length;
    const sportIndex = i % sports.length;
    const sport = sports[sportIndex];
    const environment = environments[i % 2];

    courts.push({
      tokoId: tokoIds[tokoIndex],
      name: `Lapangan ${sport.charAt(0).toUpperCase() + sport.slice(1)} ${
        i + 1
      }`,
      sport: sport as any,
      description: `Lapangan ${sport} ${environment} dengan fasilitas modern`,
      price: (i % 3 === 0 ? 100000 : i % 3 === 1 ? 150000 : 200000) + (i * 5000),
      images: [
        `https://images.unsplash.com/photo-${
          1459865264687 + i * 1000
        }-595d652de67e?w=800`,
      ],
      rating: 4 + Math.random(),
      totalReviews: Math.floor(Math.random() * 100) + 10,
      capacity: sport === "tenis" ? 4 : sport === "futsal" ? 10 : 12,
      environment: environment as any,
      facilities: facilities.slice(0, Math.floor(Math.random() * 5) + 3),
      availability: {
        startTime: i % 2 === 0 ? "08:00" : "09:00",
        endTime: i % 2 === 0 ? "22:00" : "23:00",
      },
      status: "available",
    });
  }

  return courts;
};

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // 1. Seed Tokos
    console.log("📍 Seeding tokos...");
    const tokoIds: string[] = [];

    for (const toko of dummyTokos) {
      const docRef = await addDoc(collection(db, "tokos"), {
        ...toko,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      tokoIds.push(docRef.id);
      console.log(`  ✅ Created toko: ${toko.name} (${docRef.id})`);
    }

    // 2. Seed Courts
    console.log("🏟️  Seeding courts...");
    const courts = generateCourts(tokoIds);

    for (const court of courts) {
      const docRef = await addDoc(collection(db, "courts"), {
        ...court,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`  ✅ Created court: ${court.name} (${docRef.id})`);
    }

    console.log("\n✨ Database seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Tokos: ${tokoIds.length}`);
    console.log(`   - Courts: ${courts.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Run the seed function
seedDatabase();
