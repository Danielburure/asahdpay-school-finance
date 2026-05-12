// Mock data for AsahdPay demo

export type Student = {
  id: string;
  name: string;
  admission: string;
  className: string;
  parentName: string;
  parentPhone: string;
  expected: number;
  paid: number;
  balance: number;
  status: "Paid" | "Partial" | "Overdue";
};

export type Payment = {
  id: string;
  studentId: string;
  studentName: string;
  admission: string;
  amount: number;
  method: "M-Pesa" | "Bank" | "Cash" | "Cheque";
  receiptNo: string;
  txCode: string;
  recordedBy: string;
  date: string;
  className: string;
};

const firstNames = ["Brian","Joy","Wanjiru","Kevin","Cynthia","Mwangi","Achieng","Otieno","Faith","Brenda","Daniel","Esther","Samuel","Mercy","Kelvin","Stacy","Peter","Naomi","Ian","Sharon","Collins","Lydia","Victor","Caroline","Dennis","Janet","Elvis","Trizah","Moses","Pauline"];
const lastNames = ["Kamau","Otieno","Mwangi","Achieng","Wanjala","Kiprop","Njoroge","Ouma","Hassan","Wafula","Mutua","Cherono","Kariuki","Atieno","Owino","Maina","Chebet","Korir","Were","Nyongesa"];
const classes = ["Form 1A","Form 1B","Form 2A","Form 2B","Form 3A","Form 3B","Form 4A","Form 4B"];

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const r = rand(42);

export const students: Student[] = Array.from({ length: 64 }, (_, i) => {
  const name = `${firstNames[Math.floor(r() * firstNames.length)]} ${lastNames[Math.floor(r() * lastNames.length)]}`;
  const expected = 45000;
  const paid = Math.round((r() * expected) / 500) * 500;
  const balance = Math.max(0, expected - paid);
  const status: Student["status"] = balance === 0 ? "Paid" : balance > 30000 ? "Overdue" : "Partial";
  return {
    id: `s${i + 1}`,
    name,
    admission: `ADM${(2024000 + i + 1).toString()}`,
    className: classes[Math.floor(r() * classes.length)],
    parentName: `${firstNames[Math.floor(r() * firstNames.length)]} ${lastNames[Math.floor(r() * lastNames.length)]}`,
    parentPhone: `+2547${Math.floor(10000000 + r() * 89999999)}`,
    expected,
    paid,
    balance,
    status,
  };
});

const methods: Payment["method"][] = ["M-Pesa","M-Pesa","M-Pesa","Bank","Cash","Cheque"];
const staff = ["Grace Bursar","John Accountant","Mary Bursar","Principal Otieno"];

export const payments: Payment[] = Array.from({ length: 80 }, (_, i) => {
  const s = students[Math.floor(r() * students.length)];
  const amount = Math.round((r() * 20000 + 1000) / 500) * 500;
  const date = new Date(Date.now() - Math.floor(r() * 30 * 24 * 3600 * 1000)).toISOString();
  const method = methods[Math.floor(r() * methods.length)];
  return {
    id: `p${i + 1}`,
    studentId: s.id,
    studentName: s.name,
    admission: s.admission,
    amount,
    method,
    receiptNo: `RCT-${10000 + i}`,
    txCode: `Q${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
    recordedBy: staff[Math.floor(r() * staff.length)],
    date,
    className: s.className,
  };
}).sort((a, b) => +new Date(b.date) - +new Date(a.date));

export const paymentsForStudent = (id: string) => payments.filter((p) => p.studentId === id);

export const totals = {
  expected: students.reduce((a, s) => a + s.expected, 0),
  collected: students.reduce((a, s) => a + s.paid, 0),
  outstanding: students.reduce((a, s) => a + s.balance, 0),
  studentsWithBalance: students.filter((s) => s.balance > 0).length,
  todayCollections: payments.slice(0, 8).reduce((a, p) => a + p.amount, 0),
  unmatched: 7,
};

export const collectionsByDay = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return {
    day: d.toLocaleDateString("en-KE", { weekday: "short", day: "2-digit" }),
    collected: Math.floor(r() * 180000 + 40000),
    expected: 220000,
  };
});

export const methodBreakdown = [
  { name: "M-Pesa", value: 68 },
  { name: "Bank", value: 18 },
  { name: "Cash", value: 9 },
  { name: "Cheque", value: 5 },
];

export const classCollections = classes.map((c) => ({
  class: c,
  collected: Math.floor(r() * 800000 + 200000),
  outstanding: Math.floor(r() * 300000 + 50000),
}));

export const unmatchedPayments = Array.from({ length: 7 }, (_, i) => ({
  id: `u${i}`,
  payer: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
  phone: `+2547${Math.floor(10000000 + Math.random() * 89999999)}`,
  wrongAccount: `ADM${Math.floor(1000000 + Math.random() * 9000000)}`,
  amount: Math.round(Math.random() * 15000 + 1000),
  txCode: `Q${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
  date: new Date(Date.now() - i * 3600 * 1000 * 8).toISOString(),
}));

export const smsMessages = Array.from({ length: 24 }, (_, i) => ({
  id: `m${i}`,
  to: students[i % students.length].parentPhone,
  parent: students[i % students.length].parentName,
  student: students[i % students.length].name,
  message: `Dear Parent, kindly clear the outstanding balance of KES ${students[i % students.length].balance.toLocaleString()} for ${students[i % students.length].name}. Paybill 522533. Thank you.`,
  status: i % 9 === 0 ? "Failed" : "Delivered",
  date: new Date(Date.now() - i * 3600 * 1000 * 5).toISOString(),
}));

export const staffList = [
  { id: "u1", name: "Grace Wambui", email: "grace@asahdpay.demo", role: "Bursar", status: "Active", lastLogin: "2h ago" },
  { id: "u2", name: "John Otieno", email: "john@asahdpay.demo", role: "Accountant", status: "Active", lastLogin: "1d ago" },
  { id: "u3", name: "Mary Njeri", email: "mary@asahdpay.demo", role: "Bursar", status: "Active", lastLogin: "Just now" },
  { id: "u4", name: "Principal Mwangi", email: "principal@asahdpay.demo", role: "Principal", status: "Active", lastLogin: "5h ago" },
  { id: "u5", name: "Auditor Kelvin", email: "audit@asahdpay.demo", role: "Viewer", status: "Disabled", lastLogin: "3w ago" },
];

export const auditLogs = Array.from({ length: 18 }, (_, i) => ({
  id: `a${i}`,
  action: ["Payment Recorded","Balance Edited","Receipt Corrected","Report Exported","Student Added","SMS Sent"][i % 6],
  user: staff[i % staff.length],
  record: `RCT-${10000 + i}`,
  oldValue: i % 2 === 0 ? "KES 12,000" : "—",
  newValue: i % 2 === 0 ? "KES 15,000" : "Created",
  timestamp: new Date(Date.now() - i * 3600 * 1000 * 3).toISOString(),
}));

export const schools = [
  { id: 1, name: "Mang'u High School", plan: "Enterprise", status: "Active", students: 1840, subscription: "Active" },
  { id: 2, name: "Alliance Girls", plan: "Pro", status: "Active", students: 1260, subscription: "Active" },
  { id: 3, name: "Maseno School", plan: "Pro", status: "Trial", students: 980, subscription: "Trial" },
  { id: 4, name: "Starehe Boys Centre", plan: "Enterprise", status: "Active", students: 1420, subscription: "Active" },
  { id: 5, name: "Pangani Girls", plan: "Standard", status: "Overdue", students: 720, subscription: "Overdue" },
  { id: 6, name: "Kenya High", plan: "Pro", status: "Active", students: 1100, subscription: "Active" },
  { id: 7, name: "Lenana School", plan: "Standard", status: "Suspended", students: 540, subscription: "Suspended" },
];
