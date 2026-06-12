import { useStore } from "@/lib/store";

type Fees = { term1: number; term2: number; term3: number };

export function buildFeeStructureHtml(
  school: ReturnType<typeof useStore.getState>["schoolProfile"],
  classes: string[],
  fees: Record<string, Fees>,
) {
  const fmt = (n: number) => `KES ${(n || 0).toLocaleString()}`;
  const rows = classes
    .map((c) => {
      const f = fees[c] || { term1: 0, term2: 0, term3: 0 };
      const total = (f.term1 || 0) + (f.term2 || 0) + (f.term3 || 0);
      return `<tr>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb">${c}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right">${fmt(f.term1)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right">${fmt(f.term2)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right">${fmt(f.term3)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">${fmt(total)}</td>
      </tr>`;
    })
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><title>Fee Structure - ${school.name}</title>
  <style>
    body{font-family:ui-sans-serif,system-ui,sans-serif;color:#0f172a;max-width:880px;margin:32px auto;padding:24px;background:#fff}
    .head{display:flex;gap:16px;align-items:center;border-bottom:2px solid #0f172a;padding-bottom:16px;margin-bottom:24px}
    .head img{height:72px;width:72px;object-fit:cover;border-radius:12px}
    h1{margin:0;font-size:22px}
    .muted{color:#475569;font-size:13px;margin-top:4px}
    h2{font-size:18px;margin:24px 0 12px}
    table{width:100%;border-collapse:collapse;font-size:14px}
    th{padding:10px;text-align:left;background:#f1f5f9;border-bottom:2px solid #cbd5e1}
    th.r,td.r{text-align:right}
    .footer{margin-top:32px;font-size:12px;color:#64748b;text-align:center}
    @media print { .noprint{display:none} }
  </style></head><body>
    <div class="head">
      ${school.logo ? `<img src="${school.logo}" alt="logo"/>` : ""}
      <div>
        <h1>${school.name}</h1>
        <div class="muted">${school.address || ""}</div>
        <div class="muted">${[school.phone, school.email].filter(Boolean).join(" • ")}</div>
        ${school.paybill ? `<div class="muted">Paybill: ${school.paybill}</div>` : ""}
      </div>
    </div>
    <h2>Fee Structure</h2>
    <table>
      <thead><tr>
        <th>Class</th>
        <th class="r">Term 1</th>
        <th class="r">Term 2</th>
        <th class="r">Term 3</th>
        <th class="r">Total (Year)</th>
      </tr></thead>
      <tbody>
        ${rows || `<tr><td colspan="5" style="padding:16px;text-align:center;color:#64748b">No classes added yet</td></tr>`}
      </tbody>
    </table>
    <div class="footer">Generated ${new Date().toLocaleDateString()}</div>
    <div class="noprint" style="text-align:center;margin-top:24px">
      <button onclick="window.print()" style="padding:10px 20px;background:#0f172a;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px">Print</button>
    </div>
  </body></html>`;
}
