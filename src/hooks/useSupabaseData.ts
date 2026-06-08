// src/hooks/useSupabaseData.ts
// Loads real Supabase data into the Zustand store on mount

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
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const [id, prof] = await Promise.all([getMySchoolId(), getMyProfile()]);

        if (cancelled) return;

        // No school means not logged in or not set up — use mock data
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

        // Load real data into store, replacing mock seed data
        useStore.setState({ students, payments });
        setStatus("loaded");
      } catch (err) {
        console.error("[useSupabaseData] failed:", err);
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { status, schoolId, profile };
}