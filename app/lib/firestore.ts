// app/lib/firestore.ts
// Firestore CRUD helper functions

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../src/firebaseConfig";
import type {
  User,
  Toko,
  Court,
  Booking,
  CreateTokoInput,
  UpdateTokoInput,
  CreateCourtInput,
  UpdateCourtInput,
  CreateBookingInput,
  CourtFilters,
  UserRole,
} from "./types";

// ============================================
// USER OPERATIONS
// ============================================

export const getUser = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { uid, ...userSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

export const updateUser = async (
  uid: string,
  data: Partial<User>
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const updateUserRole = async (
  uid: string,
  role: UserRole
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      role,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

// ============================================
// TOKO OPERATIONS
// ============================================

export const createToko = async (
  penjagaId: string,
  data: CreateTokoInput
): Promise<string> => {
  try {
    const tokoRef = collection(db, "tokos");
    const docRef = await addDoc(tokoRef, {
      ...data,
      penjagaId,
      status: "pending_approval", // Default status
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update user's tokoId
    await updateUser(penjagaId, { tokoId: docRef.id });

    return docRef.id;
  } catch (error) {
    console.error("Error creating toko:", error);
    throw error;
  }
};

export const getToko = async (tokoId: string): Promise<Toko | null> => {
  try {
    const tokoRef = doc(db, "tokos", tokoId);
    const tokoSnap = await getDoc(tokoRef);

    if (tokoSnap.exists()) {
      return { id: tokoSnap.id, ...tokoSnap.data() } as Toko;
    }
    return null;
  } catch (error) {
    console.error("Error getting toko:", error);
    throw error;
  }
};

export const getTokoByPenjaga = async (
  penjagaId: string
): Promise<Toko | null> => {
  try {
    const tokosRef = collection(db, "tokos");
    const q = query(tokosRef, where("penjagaId", "==", penjagaId), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Toko;
    }
    return null;
  } catch (error) {
    console.error("Error getting toko by penjaga:", error);
    throw error;
  }
};

export const getAllTokos = async (
  statusFilter?: "active" | "inactive" | "pending_approval"
): Promise<Toko[]> => {
  try {
    const tokosRef = collection(db, "tokos");
    let q;

    if (statusFilter) {
      q = query(
        tokosRef,
        where("status", "==", statusFilter)
      );
    } else {
      q = query(tokosRef);
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Toko[];
  } catch (error) {
    console.error("Error getting all tokos:", error);
    throw error;
  }
};

export const updateToko = async (
  tokoId: string,
  data: UpdateTokoInput
): Promise<void> => {
  try {
    const tokoRef = doc(db, "tokos", tokoId);
    await updateDoc(tokoRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating toko:", error);
    throw error;
  }
};

export const approveToko = async (tokoId: string): Promise<void> => {
  try {
    await updateToko(tokoId, { status: "active" });
  } catch (error) {
    console.error("Error approving toko:", error);
    throw error;
  }
};

export const deleteToko = async (tokoId: string): Promise<void> => {
  try {
    // TODO: Also delete all courts under this toko
    const tokoRef = doc(db, "tokos", tokoId);
    await deleteDoc(tokoRef);
  } catch (error) {
    console.error("Error deleting toko:", error);
    throw error;
  }
};

// ============================================
// COURT OPERATIONS
// ============================================

export const createCourt = async (data: CreateCourtInput): Promise<string> => {
  try {
    const courtRef = collection(db, "courts");
    const docRef = await addDoc(courtRef, {
      ...data,
      rating: 0,
      totalReviews: 0,
      status: "available",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating court:", error);
    throw error;
  }
};

export const getCourt = async (courtId: string): Promise<Court | null> => {
  try {
    const courtRef = doc(db, "courts", courtId);
    const courtSnap = await getDoc(courtRef);

    if (courtSnap.exists()) {
      return { id: courtSnap.id, ...courtSnap.data() } as Court;
    }
    return null;
  } catch (error) {
    console.error("Error getting court:", error);
    throw error;
  }
};

export const getAllCourts = async (filters?: CourtFilters): Promise<Court[]> => {
  try {
    const courtsRef = collection(db, "courts");

    // SIMPLIFIED: Remove orderBy to avoid createdAt field requirement
    let q;

    if (filters?.sport) {
      // If sport filter exists, use it as primary query (most common case)
      q = query(courtsRef, where("sport", "==", filters.sport));
    } else if (filters?.tokoId) {
      // If tokoId filter exists (for penjaga dashboard)
      q = query(courtsRef, where("tokoId", "==", filters.tokoId));
    } else {
      // Default: get all courts
      q = query(courtsRef);
    }

    const querySnapshot = await getDocs(q);

    let courts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Court[];

    // Client-side filtering for other criteria
    if (filters?.environment) {
      courts = courts.filter((court) => court.environment === filters.environment);
    }
    if (filters?.status) {
      courts = courts.filter((court) => court.status === filters.status);
    }
    if (filters?.minPrice !== undefined) {
      courts = courts.filter((court) => court.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      courts = courts.filter((court) => court.price <= filters.maxPrice!);
    }
    if (filters?.city) {
      courts = courts.filter((court) =>
        court.location?.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    if (filters?.district) {
      courts = courts.filter((court) =>
        court.location?.toLowerCase().includes(filters.district!.toLowerCase())
      );
    }

    return courts;
  } catch (error) {
    console.error("Error getting all courts:", error);
    throw error;
  }
};

export const getCourtsByToko = async (tokoId: string): Promise<Court[]> => {
  try {
    const courtsRef = collection(db, "courts");
    const q = query(
      courtsRef,
      where("tokoId", "==", tokoId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Court[];
  } catch (error) {
    console.error("Error getting courts by toko:", error);
    throw error;
  }
};

export const updateCourt = async (
  courtId: string,
  data: UpdateCourtInput
): Promise<void> => {
  try {
    const courtRef = doc(db, "courts", courtId);
    await updateDoc(courtRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating court:", error);
    throw error;
  }
};

export const deleteCourt = async (courtId: string): Promise<void> => {
  try {
    const courtRef = doc(db, "courts", courtId);
    await deleteDoc(courtRef);
  } catch (error) {
    console.error("Error deleting court:", error);
    throw error;
  }
};

// ============================================
// BOOKING OPERATIONS
// ============================================

export const createBooking = async (
  userId: string,
  data: CreateBookingInput
): Promise<string> => {
  try {
    const bookingRef = collection(db, "bookings");
    const docRef = await addDoc(bookingRef, {
      ...data,
      userId,
      status: "pending",
      paymentStatus: "pending",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

export const getBooking = async (bookingId: string): Promise<Booking | null> => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (bookingSnap.exists()) {
      return { id: bookingSnap.id, ...bookingSnap.data() } as Booking;
    }
    return null;
  } catch (error) {
    console.error("Error getting booking:", error);
    throw error;
  }
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    console.error("Error getting user bookings:", error);
    throw error;
  }
};

export const getTokoBookings = async (tokoId: string): Promise<Booking[]> => {
  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("tokoId", "==", tokoId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    console.error("Error getting toko bookings:", error);
    throw error;
  }
};

export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    console.error("Error getting all bookings:", error);
    throw error;
  }
};

export const checkBookingConflict = async (
  courtId: string,
  date: string,
  startTime: string,
  duration: number
): Promise<boolean> => {
  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("courtId", "==", courtId),
      where("date", "==", date),
      where("status", "in", ["pending", "confirmed"])
    );
    const querySnapshot = await getDocs(q);

    // Calculate end time for the requested booking
    const [reqStartHours, reqStartMinutes] = startTime.split(":").map(Number);
    const reqEndHours = reqStartHours + duration;

    // Check if any existing booking conflicts with the requested time
    for (const doc of querySnapshot.docs) {
      const booking = doc.data() as Booking;
      const [existStartHours, existStartMinutes] = booking.startTime
        .split(":")
        .map(Number);
      const existEndHours = existStartHours + booking.duration;

      // Check for overlap
      // Conflict if: (reqStart < existEnd) AND (reqEnd > existStart)
      if (reqStartHours < existEndHours && reqEndHours > existStartHours) {
        return true; // Conflict found
      }
    }

    return false; // No conflict
  } catch (error) {
    console.error("Error checking booking conflict:", error);
    throw error;
  }
};

export const updateBooking = async (
  bookingId: string,
  data: Partial<Booking>
): Promise<void> => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    throw error;
  }
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    await updateBooking(bookingId, {
      status: "cancelled",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
};
