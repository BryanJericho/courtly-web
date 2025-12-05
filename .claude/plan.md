# Implementation Plan: Firebase Integration dengan Multi-Role System

## 🎯 Tujuan
Mengubah data static court cards menjadi dynamic data dari Firebase Firestore dengan sistem role-based access control (RBAC) untuk 3 role: User, Penjaga Lapangan, dan Super Admin.

## 📊 Database Schema (Firestore)

### Collection: `users`
```typescript
{
  uid: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  role: 'user' | 'penjaga_lapangan' | 'super_admin',
  createdAt: timestamp,
  provider?: string,
  // Untuk penjaga lapangan
  tokoId?: string  // Reference ke toko yang dikelola
}
```

### Collection: `tokos` (Toko/Venue)
```typescript
{
  id: string,
  name: string,
  description: string,
  address: string,
  location: {
    city: string,
    district: string,
    coordinates?: { lat: number, lng: number }
  },
  phone: string,
  email: string,
  operatingHours: {
    open: string,
    close: string
  },
  images: string[],
  penjagaId: string,  // UID dari penjaga lapangan
  createdAt: timestamp,
  updatedAt: timestamp,
  status: 'active' | 'inactive'
}
```

### Collection: `courts` (Lapangan)
```typescript
{
  id: string,
  tokoId: string,  // Reference ke toko parent
  name: string,
  sport: 'futsal' | 'basket' | 'tenis' | 'badminton' | 'voli',
  description: string,
  price: number,
  images: string[],
  rating: number,
  totalReviews: number,
  capacity: number,
  environment: 'indoor' | 'outdoor',
  facilities: string[],
  availability: {
    startTime: string,  // "08:00"
    endTime: string     // "22:00"
  },
  status: 'available' | 'maintenance' | 'booked',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: `bookings` (Reservasi)
```typescript
{
  id: string,
  userId: string,
  courtId: string,
  tokoId: string,
  bookingDate: timestamp,
  timeSlot: {
    start: string,
    end: string
  },
  totalPrice: number,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  paymentStatus: 'pending' | 'paid' | 'refunded',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🔐 Role-Based Access Control

### User (Customer)
- ✅ Lihat semua lapangan
- ✅ Search & filter lapangan
- ✅ Booking lapangan
- ✅ Lihat history booking
- ❌ Tidak bisa tambah/edit lapangan

### Penjaga Lapangan (Venue Owner)
- ✅ Semua akses User
- ✅ Tambah/edit/hapus toko sendiri
- ✅ Tambah/edit/hapus lapangan di toko sendiri
- ✅ Lihat booking untuk lapangan sendiri
- ✅ Manage status lapangan (available/maintenance)
- ❌ Tidak bisa akses toko/lapangan lain

### Super Admin
- ✅ Full access ke semua data
- ✅ Manage semua users, tokos, courts
- ✅ Lihat semua bookings
- ✅ Analytics & reports

## 📁 File Structure Changes

```
app/
├── (auth)/
│   ├── login/page.tsx          # Update: tambah role handling
│   └── register/page.tsx       # Update: default role = 'user'
├── (user)/
│   ├── page.tsx                # Homepage - fetch courts from Firestore
│   ├── carilapangan/page.tsx   # Update: fetch & filter dari Firestore
│   ├── detail/[id]/page.tsx    # NEW: Detail lapangan
│   └── booking/[id]/page.tsx   # NEW: Booking page
├── (penjaga)/
│   ├── dashboard/page.tsx      # NEW: Dashboard penjaga
│   ├── toko/page.tsx           # NEW: Manage toko
│   └── lapangan/page.tsx       # NEW: Manage lapangan
├── (admin)/
│   ├── dashboard/page.tsx      # NEW: Admin dashboard
│   ├── users/page.tsx          # NEW: Manage users
│   ├── tokos/page.tsx          # NEW: Manage tokos
│   └── courts/page.tsx         # NEW: Manage courts
├── components/
│   ├── CourtCard.tsx           # Update: accept Firestore data
│   ├── ProtectedRoute.tsx      # NEW: Route guard
│   └── RoleGuard.tsx           # NEW: Role-based component guard
├── lib/
│   ├── court.ts                # Update: interfaces sesuai schema
│   ├── firestore.ts            # NEW: Firestore helper functions
│   ├── auth.ts                 # NEW: Auth context & hooks
│   └── rbac.ts                 # NEW: Role check utilities
└── hooks/
    ├── useCourts.ts            # NEW: Fetch courts hook
    ├── useTokos.ts             # NEW: Fetch tokos hook
    └── useAuth.ts              # NEW: Auth state hook
```

## 🚀 Implementation Steps

### Phase 1: Setup Firebase & Auth Context
1. Update Firestore security rules
2. Create auth context dengan role state
3. Update login/register untuk set default role
4. Create useAuth hook untuk manage auth state

### Phase 2: Update Data Layer
1. Create TypeScript interfaces sesuai schema
2. Create Firestore helper functions (CRUD operations)
3. Create custom hooks untuk fetch data (useCourts, useTokos)
4. Seed initial data ke Firestore (script)

### Phase 3: Update Existing Pages
1. Update Homepage (page.tsx):
   - Fetch courts dari Firestore
   - Filter by sport category
   - Real-time updates
2. Update Cari Lapangan (carilapangan/page.tsx):
   - Fetch & filter dari Firestore
   - Apply filters (location, sport, price, environment)
3. Update CourtCard component untuk terima Firestore data

### Phase 4: Role-Based Features
1. Create ProtectedRoute & RoleGuard components
2. Create Penjaga Lapangan dashboard & CRUD pages
3. Create Super Admin dashboard & management pages
4. Add role-based navigation in Header

### Phase 5: Booking System (Optional - Phase 1)
1. Create court detail page
2. Create booking page dengan time slot picker
3. Create booking confirmation & payment flow
4. User booking history

## ❓ Clarifications Needed

Sebelum implementasi, saya butuh konfirmasi beberapa hal:

1. **Role Assignment**:
   - Apakah semua user yang register default jadi role 'user'?
   - Bagaimana cara assign role 'penjaga_lapangan' dan 'super_admin'?
   - Apakah Super Admin yang assign manual atau ada form khusus?

2. **Data Initial**:
   - Apakah perlu saya buatkan seed script untuk populate data dummy tokos & courts?
   - Berapa banyak data dummy yang dibutuhkan untuk testing?

3. **Penjaga Lapangan Flow**:
   - Apakah 1 penjaga bisa manage multiple tokos atau hanya 1 toko?
   - Apakah ada approval process dari admin untuk toko baru?

4. **Image Upload**:
   - Apakah akan pakai Firebase Storage untuk upload gambar?
   - Atau masih pakai URL external/placeholder dulu?

5. **Payment Integration**:
   - Apakah booking system perlu terintegrasi dengan payment gateway sekarang?
   - Atau cukup status 'pending' dulu?

6. **Priority**:
   - Apakah semua role perlu diimplementasi sekaligus?
   - Atau fokus ke User flow dulu (fetch courts + basic booking)?

## 🎯 Recommended Approach

Saran saya mulai dengan **MVP (Minimum Viable Product)**:

**Phase 1 (Priority High):**
- Setup Firestore collections & security rules
- Auth context dengan role state
- Update homepage & cari lapangan dengan data dari Firestore
- Basic CRUD untuk Penjaga Lapangan (manage toko & lapangan)

**Phase 2 (Priority Medium):**
- Super Admin dashboard
- Booking system untuk User
- Role-based routing & guards

**Phase 3 (Priority Low):**
- Payment integration
- Reviews & ratings
- Analytics dashboard

Apakah pendekatan ini sesuai dengan kebutuhan Anda?
