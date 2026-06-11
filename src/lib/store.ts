import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Student, Payment } from "./mock";

export type Staff = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
};

export type Sms = {
  id: string;
  to: string;
  parent: string;
  student: string;
  message: string;
  status: string;
  date: string;
};

export type School = {
  id: number;
  name: string;
  plan: string;
  status: string;
  students: number;
  subscription: string;
  email?: string;
  phone?: string;
};

export type SchoolProfile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  paybill: string;
  logo: string; // data URL
};


type NewStudentInput = {
  name: string;
  admission: string;
  className: string;
  parentName: string;
  parentPhone: string;
};

type NewPaymentInput = {
  admission: string;
  amount: number;
  method: Payment["method"];
  receiptNo: string;
  notes?: string;
  date?: string;
};

type NewStaffInput = { name: string; email: string; role: string };

type NewSmsInput = {
  target: "single" | "class" | "balances";
  studentId?: string;
  className?: string;
  message: string;
};

type NewSchoolInput = {
  name: string;
  email: string;
  phone: string;
  plan: string;
};

type Store = {
  students: Student[];
  payments: Payment[];
  staff: Staff[];
  sms: Sms[];
  schools: School[];
  classes: string[];
  classFees: Record<string, number>;
  setClassFee: (name: string, amount: number) => void;
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (patch: Partial<SchoolProfile>) => void;


  addClass: (name: string) => void;
  deleteClass: (name: string) => void;

  addStudent: (s: NewStudentInput) => Student;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  addPayment: (p: NewPaymentInput) => Payment | null;

  addStaff: (s: NewStaffInput) => void;
  updateStaff: (id: string, patch: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  addSms: (s: NewSmsInput) => number;

  addSchool: (s: NewSchoolInput) => void;
  updateSchool: (id: number, patch: Partial<School>) => void;
  deleteSchool: (id: number) => void;
};

const recalcStatus = (s: Student): Student["status"] =>
  s.balance === 0 ? "Paid" : s.balance > 30000 ? "Overdue" : "Partial";

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      students: [],
      payments: [],
      staff: [],
      sms: [],
      schools: [],
      classes: [],
      classFees: {},
      schoolProfile: {
        name: "My School",
        email: "",
        phone: "",
        address: "",
        paybill: "",
        logo: "",
      },

      setClassFee: (name, amount) =>
        set((s) => ({ classFees: { ...s.classFees, [name]: amount } })),

      updateSchoolProfile: (patch) =>
        set((s) => ({ schoolProfile: { ...s.schoolProfile, ...patch } })),


      addClass: (name) =>
        set((s) =>
          s.classes.includes(name.trim()) || !name.trim()
            ? s
            : { classes: [...s.classes, name.trim()] },
        ),

      deleteClass: (name) =>
        set((s) => ({ classes: s.classes.filter((c) => c !== name) })),

      addStudent: (input) => {
        const student: Student = {
          id: `s-${Date.now()}`,
          name: input.name,
          admission: input.admission,
          className: input.className,
          parentName: input.parentName,
          parentPhone: input.parentPhone,
          expected: 45000,
          paid: 0,
          balance: 45000,
          status: "Overdue",
        };
        set((s) => ({ students: [student, ...s.students] }));
        return student;
      },

      updateStudent: (id, patch) =>
        set((s) => ({
          students: s.students.map((st) => {
            if (st.id !== id) return st;
            const merged = { ...st, ...patch };
            merged.balance = Math.max(0, merged.expected - merged.paid);
            merged.status = recalcStatus(merged);
            return merged;
          }),
        })),

      deleteStudent: (id) =>
        set((s) => ({ students: s.students.filter((st) => st.id !== id) })),

      addPayment: (input) => {
        const student = get().students.find(
          (s) => s.admission.toLowerCase() === input.admission.toLowerCase(),
        );
        if (!student) return null;
        const payment: Payment = {
          id: `p-${Date.now()}`,
          studentId: student.id,
          studentName: student.name,
          admission: student.admission,
          amount: input.amount,
          method: input.method,
          receiptNo: input.receiptNo || `RCT-${Date.now().toString().slice(-6)}`,
          txCode: `Q${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
          recordedBy: "Bursar",
          date: input.date ?? new Date().toISOString(),
          className: student.className,
        };
        set((s) => ({
          payments: [payment, ...s.payments],
          students: s.students.map((st) => {
            if (st.id !== student.id) return st;
            const paid = st.paid + input.amount;
            const balance = Math.max(0, st.expected - paid);
            return { ...st, paid, balance, status: recalcStatus({ ...st, balance }) };
          }),
        }));
        return payment;
      },

      addStaff: (input) =>
        set((s) => ({
          staff: [
            {
              id: `u-${Date.now()}`,
              name: input.name,
              email: input.email,
              role: input.role,
              status: "Active",
              lastLogin: "Just now",
            },
            ...s.staff,
          ],
        })),

      updateStaff: (id, patch) =>
        set((s) => ({
          staff: s.staff.map((st) => (st.id === id ? { ...st, ...patch } : st)),
        })),

      deleteStaff: (id) =>
        set((s) => ({ staff: s.staff.filter((st) => st.id !== id) })),

      addSms: (input) => {
        const all = get().students;
        let targets: Student[] = [];
        if (input.target === "single" && input.studentId) {
          const s = all.find((x) => x.id === input.studentId);
          targets = s ? [s] : [];
        } else if (input.target === "class" && input.className) {
          targets = all.filter((s) => s.className === input.className);
        } else {
          targets = all.filter((s) => s.balance > 0);
        }
        const now = Date.now();
        const newMsgs: Sms[] = targets.map((s, i) => ({
          id: `m-${now}-${i}`,
          to: s.parentPhone,
          parent: s.parentName,
          student: s.name,
          message: input.message
            .replace(/{balance}/g, s.balance.toLocaleString())
            .replace(/{student}/g, s.name),
          status: "Delivered",
          date: new Date().toISOString(),
        }));
        set((s) => ({ sms: [...newMsgs, ...s.sms] }));
        return targets.length;
      },

      addSchool: (input) =>
        set((s) => ({
          schools: [
            {
              id: Date.now(),
              name: input.name,
              email: input.email,
              phone: input.phone,
              plan: input.plan,
              status: "Active",
              students: 0,
              subscription: "Active",
            },
            ...s.schools,
          ],
        })),

      updateSchool: (id, patch) =>
        set((s) => ({
          schools: s.schools.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)),
        })),

      deleteSchool: (id) =>
        set((s) => ({ schools: s.schools.filter((sc) => sc.id !== id) })),
    }),
    {
      name: "asahdpay-store-v2",
      version: 2,
    },
  ),
);

export const useTotals = () => {
  const students = useStore((s) => s.students);
  const payments = useStore((s) => s.payments);
  const expected = students.reduce((a, s) => a + s.expected, 0);
  const collected = students.reduce((a, s) => a + s.paid, 0);
  const outstanding = students.reduce((a, s) => a + s.balance, 0);
  const studentsWithBalance = students.filter((s) => s.balance > 0).length;
  const today = new Date().toDateString();
  const todayCollections = payments
    .filter((p) => new Date(p.date).toDateString() === today)
    .reduce((a, p) => a + p.amount, 0);
  return {
    expected,
    collected,
    outstanding,
    studentsWithBalance,
    todayCollections,
    studentCount: students.length,
    unmatched: 0,
  };
};
