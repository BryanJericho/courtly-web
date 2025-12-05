// app/lib/rbac.ts
// Role-Based Access Control utilities

import type { UserRole } from "./types";

// Permission definitions
export const permissions = {
  // User permissions
  user: {
    viewCourts: true,
    searchCourts: true,
    bookCourt: true,
    viewOwnBookings: true,
    cancelOwnBooking: true,
  },

  // Penjaga Lapangan permissions
  penjaga_lapangan: {
    // Inherit all user permissions
    viewCourts: true,
    searchCourts: true,
    bookCourt: true,
    viewOwnBookings: true,
    cancelOwnBooking: true,
    // Additional permissions
    createToko: true,
    updateOwnToko: true,
    deleteOwnToko: true,
    viewOwnToko: true,
    createCourt: true,
    updateOwnCourt: true,
    deleteOwnCourt: true,
    viewOwnCourts: true,
    viewTokoBookings: true,
    updateBookingStatus: true,
  },

  // Super Admin permissions
  super_admin: {
    // Full access
    viewAllUsers: true,
    updateUserRole: true,
    deleteUser: true,
    viewAllTokos: true,
    updateAnyToko: true,
    deleteAnyToko: true,
    approveToko: true,
    viewAllCourts: true,
    updateAnyCourt: true,
    deleteAnyCourt: true,
    viewAllBookings: true,
    updateAnyBooking: true,
    deleteAnyBooking: true,
    // Also has all lower role permissions
    viewCourts: true,
    searchCourts: true,
    bookCourt: true,
  },
};

// Check if a role has a specific permission
export const hasPermission = (
  role: UserRole | null,
  permission: string
): boolean => {
  if (!role) return false;

  const rolePermissions = permissions[role] as Record<string, boolean>;
  return rolePermissions[permission] === true;
};

// Check if user can manage a specific toko
export const canManageToko = (
  role: UserRole | null,
  userTokoId: string | undefined,
  targetTokoId: string
): boolean => {
  if (!role) return false;

  // Super admin can manage any toko
  if (role === "super_admin") return true;

  // Penjaga can only manage their own toko
  if (role === "penjaga_lapangan") {
    return userTokoId === targetTokoId;
  }

  return false;
};

// Check if user can manage a specific court
export const canManageCourt = (
  role: UserRole | null,
  userTokoId: string | undefined,
  courtTokoId: string
): boolean => {
  if (!role) return false;

  // Super admin can manage any court
  if (role === "super_admin") return true;

  // Penjaga can only manage courts in their toko
  if (role === "penjaga_lapangan") {
    return userTokoId === courtTokoId;
  }

  return false;
};

// Get allowed routes based on role
export const getAllowedRoutes = (role: UserRole | null): string[] => {
  const commonRoutes = ["/", "/carilapangan"];

  if (!role) return commonRoutes;

  switch (role) {
    case "user":
      return [...commonRoutes, "/booking", "/profile", "/mybookings"];

    case "penjaga_lapangan":
      return [
        ...commonRoutes,
        "/booking",
        "/profile",
        "/mybookings",
        "/penjaga/dashboard",
        "/penjaga/toko",
        "/penjaga/lapangan",
        "/penjaga/bookings",
      ];

    case "super_admin":
      return [
        ...commonRoutes,
        "/admin/dashboard",
        "/admin/users",
        "/admin/tokos",
        "/admin/courts",
        "/admin/bookings",
      ];

    default:
      return commonRoutes;
  }
};

// Check if route is allowed for role
export const isRouteAllowed = (
  role: UserRole | null,
  route: string
): boolean => {
  const allowedRoutes = getAllowedRoutes(role);

  // Check exact match
  if (allowedRoutes.includes(route)) return true;

  // Check if route starts with any allowed route (for dynamic routes)
  return allowedRoutes.some((allowedRoute) => route.startsWith(allowedRoute));
};

// Get redirect path based on role
export const getDefaultRedirect = (role: UserRole | null): string => {
  switch (role) {
    case "penjaga_lapangan":
      return "/penjaga/dashboard";
    case "super_admin":
      return "/admin/dashboard";
    case "user":
    default:
      return "/";
  }
};
