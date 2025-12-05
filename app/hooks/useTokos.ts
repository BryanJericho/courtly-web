// app/hooks/useTokos.ts
"use client";

import { useState, useEffect } from "react";
import { getAllTokos } from "../lib/firestore";
import type { Toko, TokoStatus } from "../lib/types";

export const useTokos = (statusFilter?: TokoStatus) => {
  const [tokos, setTokos] = useState<Toko[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokos = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAllTokos(statusFilter);
        setTokos(data);
      } catch (err) {
        console.error("Error fetching tokos:", err);
        setError("Gagal memuat data toko");
      } finally {
        setLoading(false);
      }
    };

    fetchTokos();
  }, [statusFilter]);

  return { tokos, loading, error, refetch: () => {} };
};
