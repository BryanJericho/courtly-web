// app/lib/types.ts
// TypeScript interfaces untuk Firestore collections

import { Timestamp } from "firebase/firestore";

// User roles
export type UserRole = 'user' | 'penjaga_lapangan' | 'super_admin';

// Sport types
export type SportType = 'futsal' | 'basket' | 'tenis' | 'badminton' | 'voli';

// Area types for Makassar
export type AreaType = 
  | 'panakkukang' 
  | 'rappocini' 
  | 'tamalanrea' 
  | 'manggala' 
  | 'makassar-tengah' 
  | 'cpi-gowa';

// Environment types
export type EnvironmentType = 'indoor' | 'outdoor';

// Status types
export type CourtStatus = 'available' | 'maintenance' | 'booked';
export type TokoStatus = 'active' | 'inactive' | 'pending_approval';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

// User interface
export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: Timestamp | Date | string;
  provider?: string;
  tokoId?: string; // For penjaga_lapangan only
  profileImage?: string;
}

// Toko (Venue) interface
export interface Toko {
  id: string;
  name: string;
  description: string;
  address: string;
  location: {
    city: string;
    district: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  phone: string;
  email: string;
  operatingHours: {
    open: string;
    close: string;
  };
  images: string[];
  penjagaId: string; // UID of penjaga_lapangan
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
  status: TokoStatus;
}

// Court (Lapangan) interface
export interface Court {
  id: string;
  tokoId: string; // Reference to parent toko
  name: string;
  sport: SportType;
  area: AreaType; // Area/zona lokasi lapangan
  description: string;
  price: number;
  images: string[];
  rating: number;
  totalReviews: number;
  capacity: number;
  environment: EnvironmentType;
  facilities: string[];
  availability: {
    startTime: string; // "08:00"
    endTime: string;   // "22:00"
  };
  status: CourtStatus;
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
  mapsUrl?: string; // Google Maps URL

  // Computed fields (not in Firestore, added in frontend)
  tokoName?: string;
  location?: string;
}

// Booking interface
export interface Booking {
  id: string;
  userId: string;
  courtId: string;
  tokoId: string;
  bookingDate: Timestamp | Date | string;
  timeSlot: {
    start: string; // "10:00"
    end: string;   // "12:00"
  };
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentLink?: string; // URL to payment page
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;

  // Computed fields
  courtName?: string;
  tokoName?: string;
  userName?: string;
  hasReviewed?: boolean; // Check if user has reviewed
}

// Review interface
export interface Review {
  id: string;
  courtId: string;
  userId: string;
  bookingId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Timestamp | Date | string;
  
  // Computed fields
  userName?: string;
  userImage?: string;
}

// Form interfaces for creating/updating

export interface CreateTokoInput {
  name: string;
  description: string;
  address: string;
  location: {
    city: string;
    district: string;
  };
  phone: string;
  email: string;
  operatingHours: {
    open: string;
    close: string;
  };
  images: string[];
}

export interface UpdateTokoInput extends Partial<CreateTokoInput> {
  status?: TokoStatus;
}

export interface CreateCourtInput {
  tokoId: string;
  name: string;
  sport: SportType;
  area: AreaType;
  description: string;
  price: number;
  images: string[];
  capacity: number;
  environment: EnvironmentType;
  facilities: string[];
  availability: {
    startTime: string;
    endTime: string;
  };
}

export interface UpdateCourtInput extends Partial<CreateCourtInput> {
  status?: CourtStatus;
  rating?: number;
  totalReviews?: number;
}

export interface CreateBookingInput {
  courtId: string;
  tokoId: string;
  bookingDate: Date | string;
  timeSlot: {
    start: string;
    end: string;
  };
  totalPrice: number;
}

// Filter interfaces for search
export interface CourtFilters {
  sport?: SportType;
  area?: AreaType;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  environment?: EnvironmentType;
  status?: CourtStatus;
  tokoId?: string;
}

export interface CreateReviewInput {
  courtId: string;
  bookingId: string;
  rating: number;
  comment: string;
}
