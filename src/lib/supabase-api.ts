// src/lib/supabase-api.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
// Fetches real data from Supabase for AsahdPay

import { supabase as supabaseTyped } from "@/integrations/supabase/client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = supabaseTyped;
import type { Student, Payment } from "./mock";

// ─── GET SCHOOL ID FOR LOGGED-IN USER ────────────────────────
export async function getMySchoolId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("staff")
    .select("school_id")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;
  return data.school_id;
}

// ─── GET CURRENT STAFF PROFILE ───────────────────────────────
export async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("staff")
    .select("*, schools(id, name, logo_url, plan, subscription_status)")
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return data;
}

// ─── FETCH STUDENTS ──────────────────────────────────────────
export async function fetchStudents(schoolId: string): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*, classes(name)")
    .eq("school_id", schoolId)
    .eq("status", "active")
    .order("full_name");

  if (error || !data) return [];

  return data.map((s) => ({
    id: s.id,
    name: s.full_name,
    admission: s.admission_number,
    className: s.classes?.name ?? "—",
    parentName: s.parent_name ?? "",
    parentPhone: s.parent_phone ?? "",
    expected: Number(s.term_fee),
    paid: Number(s.total_paid),
    balance: Number(s.balance),
    status:
      Number(s.balance) === 0
        ? "Paid"
        : Number(s.balance) > 30000
        ? "Overdue"
        : "Partial",
  }));
}

// ─── FETCH PAYMENTS ──────────────────────────────────────────
export async function fetchPayments(schoolId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*, students(full_name, admission_number, classes(name))")
    .eq("school_id", schoolId)
    .eq("is_reversed", false)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) return [];

  return data.map((p) => ({
    id: p.id,
    studentId: p.student_id,
    studentName: p.students?.full_name ?? "Unknown",
    admission: p.admission_number,
    amount: Number(p.amount),
    method: mapMethod(p.payment_method),
    receiptNo: p.receipt_number ?? "",
    txCode: p.mpesa_transaction_code ?? "",
    recordedBy: p.recorded_by_name ?? "",
    date: p.created_at,
    className: p.students?.classes?.name ?? "—",
  }));
}

// ─── FETCH DASHBOARD STATS ───────────────────────────────────
export async function fetchDashboardStats(schoolId: string) {
  const today = new Date().toISOString().split("T")[0];

  const [studentsRes, todayRes, unmatchedRes] = await Promise.all([
    supabase
      .from("students")
      .select("term_fee, total_paid, balance")
      .eq("school_id", schoolId)
      .eq("status", "active"),

    supabase
      .from("payments")
      .select("amount")
      .eq("school_id", schoolId)
      .eq("payment_date", today)
      .eq("is_reversed", false),

    supabase
      .from("unmatched_payments")
      .select("id", { count: "exact" })
      .eq("school_id", schoolId)
      .eq("status", "pending"),
  ]);

  const students = studentsRes.data ?? [];
  return {
    totalExpected: students.reduce((s, st) => s + Number(st.term_fee), 0),
    totalCollected: students.reduce((s, st) => s + Number(st.total_paid), 0),
    totalOutstanding: students.reduce((s, st) => s + Number(st.balance), 0),
    studentsWithBalance: students.filter((st) => Number(st.balance) > 0).length,
    todayCollected: (todayRes.data ?? []).reduce((s, p) => s + Number(p.amount), 0),
    unmatchedCount: unmatchedRes.count ?? 0,
  };
}

// ─── FETCH COLLECTIONS BY DAY (last 14 days) ─────────────────
export async function fetchCollectionsByDay(schoolId: string) {
  const from = new Date();
  from.setDate(from.getDate() - 13);

  const { data, error } = await supabase
    .from("payments")
    .select("amount, payment_date")
    .eq("school_id", schoolId)
    .eq("is_reversed", false)
    .gte("payment_date", from.toISOString().split("T")[0]);

  if (error || !data) return [];

  // Group by day
  const map: Record<string, number> = {};
  data.forEach((p) => {
    const day = p.payment_date;
    map[day] = (map[day] ?? 0) + Number(p.amount);
  });

  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().split("T")[0];
    return {
      day: d.toLocaleDateString("en-KE", { weekday: "short", day: "2-digit" }),
      collected: map[key] ?? 0,
      expected: 220000,
    };
  });
}

// ─── FETCH CLASS COLLECTIONS ─────────────────────────────────
export async function fetchClassCollections(schoolId: string) {
  const { data, error } = await supabase
    .from("students")
    .select("balance, total_paid, classes(name)")
    .eq("school_id", schoolId)
    .eq("status", "active");

  if (error || !data) return [];

  const map: Record<string, { collected: number; outstanding: number }> = {};
  data.forEach((s) => {
    const cls = s.classes?.name ?? "Unknown";
    if (!map[cls]) map[cls] = { collected: 0, outstanding: 0 };
    map[cls].collected += Number(s.total_paid);
    map[cls].outstanding += Number(s.balance);
  });

  return Object.entries(map).map(([cls, vals]) => ({
    class: cls,
    ...vals,
  }));
}

// ─── FETCH METHOD BREAKDOWN ──────────────────────────────────
export async function fetchMethodBreakdown(schoolId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("payment_method")
    .eq("school_id", schoolId)
    .eq("is_reversed", false);

  if (error || !data) return [];

  const map: Record<string, number> = {};
  data.forEach((p) => {
    map[p.payment_method] = (map[p.payment_method] ?? 0) + 1;
  });

  const labels: Record<string, string> = {
    mpesa: "M-Pesa", bank: "Bank", cash: "Cash", cheque: "Cheque",
  };

  return Object.entries(map).map(([method, count]) => ({
    name: labels[method] ?? method,
    value: count,
  }));
}

// ─── RECORD PAYMENT ──────────────────────────────────────────
export async function recordPayment(
  schoolId: string,
  input: {
    admission: string;
    amount: number;
    method: string;
    receiptNo: string;
    notes?: string;
    date?: string;
  },
  staffName: string
) {
  // Find student
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*")
    .eq("school_id", schoolId)
    .ilike("admission_number", input.admission)
    .single();

  if (studentError || !student) throw new Error("Student not found");

  const balanceBefore = Number(student.balance);
  const amount = Number(input.amount);
  const balanceAfter = Math.max(0, balanceBefore - amount);
  const paymentDate = input.date ?? new Date().toISOString().split("T")[0];

  // Check duplicate receipt
  if (input.receiptNo) {
    const { data: existing } = await supabase
      .from("receipts")
      .select("id")
      .eq("school_id", schoolId)
      .eq("receipt_number", input.receiptNo)
      .single();
    if (existing) throw new Error("Receipt number already exists");
  }

  // Insert payment
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      school_id: schoolId,
      student_id: student.id,
      admission_number: student.admission_number,
      amount,
      payment_method: input.method.toLowerCase(),
      receipt_number: input.receiptNo,
      payment_date: paymentDate,
      notes: input.notes,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      recorded_by_name: staffName,
    })
    .select()
    .single();

  if (paymentError) throw paymentError;

  // Update student total_paid
  await supabase
    .from("students")
    .update({ total_paid: Number(student.total_paid) + amount })
    .eq("id", student.id);

  // Create receipt
  await supabase.from("receipts").insert({
    school_id: schoolId,
    payment_id: payment.id,
    student_id: student.id,
    receipt_number: input.receiptNo,
    student_name: student.full_name,
    admission_number: student.admission_number,
    amount,
    payment_method: input.method.toLowerCase(),
    previous_balance: balanceBefore,
    new_balance: balanceAfter,
    payment_date: paymentDate,
    recorded_by_name: staffName,
  });

  return { payment, student, balanceBefore, balanceAfter };
}

// ─── HELPER ──────────────────────────────────────────────────
function mapMethod(m: string): Payment["method"] {
  const map: Record<string, Payment["method"]> = {
    mpesa: "M-Pesa", bank: "Bank", cash: "Cash", cheque: "Cheque",
  };
  return map[m?.toLowerCase()] ?? "Cash";
}