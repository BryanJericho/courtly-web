// app/hooks/useCourts.ts
"use client";

import { useState, useEffect } from "react";
import { getAllCourts } from "../lib/firestore";
import type { Court, CourtFilters } from "../lib/types";

export const useCourts = (filters?: CourtFilters) => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourts = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAllCourts(filters);
        setCourts(data);
      } catch (err) {
        console.error("Error fetching courts:", err);
        setError("Gagal memuat data lapangan");
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.sport, filters?.status, filters?.tokoId, filters?.environment, filters?.area]);

  return { courts, loading, error, refetch: () => {} };
};
