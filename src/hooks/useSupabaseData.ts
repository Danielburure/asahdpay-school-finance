// src/hooks/useSupabaseData.ts
// Loads real Supabase data into the Zustand store — CLIENT SIDE ONLY

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import {
  fetchStudents,
  fetchPayments,
  getMySchoolId,
  getMyProfile,
} from "@/lib/supabase-api";

export type LoadingState = "idle" | "loading" | "loaded" | "error";

export function useSupabaseData() {
  const [status, setStatus] = useState<LoadingState>("idle");
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Guard: only run in browser, never during SSR
    if (typeof window === "undefined") return;

    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const [id, prof] = await Promise.all([
          getMySchoolId(),
          getMyProfile(),
        ]);

        if (cancelled) return;

        // Not logged in or school not set up — keep mock data, show dashboard anyway
        if (!id) {
          setStatus("loaded");
          return;
        }

        setSchoolId(id);
        setProfile(prof);

        const [students, payments] = await Promise.all([
          fetchStudents(id),
          fetchPayments(id),
        ]);

        if (cancelled) return;

        // Replace mock data in store with real Supabase data
        useStore.setState({ students, payments });
        setStatus("loaded");
      } catch (err) {
        console.error("[useSupabaseData] failed:", err);
        if (!cancelled) {
          // On error, still show dashboard with mock data
          setStatus("loaded");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, schoolId, profile };
}