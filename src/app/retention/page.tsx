"use client";

import { useMemo, useState } from "react";
import { OutputCard } from "@/components/OutputCard";

type Row = {
  category: string;
  record: string;
  period: string;
  basis: string;
  include: boolean;
};

const DEFAULTS: Omit<Row, "include">[] = [
  // HR / payroll
  { category: "HR", record: "Personnel file (active employees)", period: "Duration of employment", basis: "Contract performance; legitimate interest" },
  { category: "HR", record: "Personnel file (leavers)", period: "6 years after leaving", basis: "Limitation Act 1980 — possible claims period" },
  { category: "HR", record: "Right to work documents", period: "Employment + 2 years", basis: "Home Office — Code of Practice on preventing illegal working" },
  { category: "HR", record: "Recruitment records (unsuccessful)", period: "6 months", basis: "Limitation period for tribunal claims (with buffer)" },
  { category: "HR", record: "Sickness absence records", period: "3 years", basis: "SSP record-keeping; HMRC" },
  { category: "HR", record: "Maternity / paternity pay records", period: "3 years after end of tax year", basis: "HMRC SMP / SPP regs" },
  { category: "HR", record: "Working time / opt-out records", period: "2 years", basis: "Working Time Regulations 1998" },
  { category: "HR", record: "Disciplinary / grievance records", period: "6 years after closure", basis: "Limitation Act 1980" },
  { category: "HR", record: "Accident book entries", period: "3 years after entry (longer if minor)", basis: "RIDDOR; Social Security regs" },
  { category: "HR", record: "DBS check records", period: "6 months after decision", basis: "DBS Code of Practice" },

  // Payroll / finance
  { category: "Payroll", record: "Payroll records (P11, P32, etc.)", period: "6 years", basis: "HMRC (3 years minimum, 6 years recommended)" },
  { category: "Payroll", record: "P60s, P45s, P11Ds", period: "6 years", basis: "HMRC" },
  { category: "Finance", record: "Accounting records (Ltd company)", period: "6 years", basis: "Companies Act 2006 s.388" },
  { category: "Finance", record: "Accounting records (sole trader)", period: "5 years after 31 Jan submission deadline", basis: "HMRC self-assessment" },
  { category: "Finance", record: "VAT records", period: "6 years", basis: "HMRC" },
  { category: "Finance", record: "Bank statements, invoices", period: "6 years", basis: "Companies Act / HMRC" },

  // Pension / benefits
  { category: "Pension", record: "Auto-enrolment compliance records", period: "6 years", basis: "Pensions Act 2008 / TPR guidance" },
  { category: "Pension", record: "Opt-out notices", period: "4 years", basis: "TPR guidance" },

  // Data protection / governance
  { category: "Data protection", record: "Records of processing activities (ROPA)", period: "Whilst in force; review annually", basis: "UK GDPR Article 30" },
  { category: "Data protection", record: "DPIAs", period: "Life of processing + 3 years", basis: "ICO guidance" },
  { category: "Data protection", record: "Data subject rights requests (SARs)", period: "3 years after response", basis: "Defensive evidence; ICO best practice" },
  { category: "Data protection", record: "Personal data breach log", period: "Indefinite (or business lifetime)", basis: "UK GDPR Article 33(5)" },
  { category: "Data protection", record: "Marketing consent records", period: "Until consent withdrawn + 2 years", basis: "UK GDPR / PECR" },
  { category: "Data protection", record: "Cookie consent records", period: "12 months", basis: "PECR / ICO guidance" },

  // H&S / facilities
  { category: "Health & safety", record: "Risk assessments", period: "Whilst in force + 5 years", basis: "MHSWR 1999; HSE guidance" },
  { category: "Health & safety", record: "COSHH assessments", period: "40 years if exposure data, else 5 years", basis: "COSHH 2002" },
  { category: "Facilities", record: "CCTV footage", period: "30 days (default)", basis: "ICO CCTV code; data minimisation" },
  { category: "Facilities", record: "Visitor logs", period: "12 months", basis: "Legitimate interest / safety" },

  // Commercial
  { category: "Commercial", record: "Customer contracts (simple)", period: "6 years post-termination", basis: "Limitation Act 1980" },
  { category: "Commercial", record: "Customer contracts (executed as deed)", period: "12 years post-termination", basis: "Limitation Act 1980" },
  { category: "Commercial", record: "Supplier contracts", period: "6 years post-termination", basis: "Limitation Act 1980" },
];

export default function RetentionPage() {
  const [orgName, setOrgName] = useState("");
  const [rows, setRows] = useState<Row[]>(DEFAULTS.map((r) => ({ ...r, include: true })));

  const csv = useMemo(() => buildCsv(rows.filter((r) => r.include)), [rows]);
  const md = useMemo(() => buildMd(orgName, rows.filter((r) => r.include)), [orgName, rows]);

  function toggleAll(v: boolean) {
    setRows(rows.map((r) => ({ ...r, include: v })));
  }
  function updateRow(i: number, patch: Partial<Row>) {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows([...rows, { category: "Custom", record: "", period: "", basis: "", include: true }]);
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Data retention prompts</h2>
        <p className="text-sm text-slate-600">A starting schedule of UK retention periods. Tick what applies, edit anything, add your own rows. Export to share with your DPO / accountant.</p>
      </header>

      <section className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="block text-slate-700 mb-1">Organisation name (optional)</span>
          <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="border border-slate-300 rounded px-2 py-1" />
        </label>
        <div className="flex gap-2 ml-auto text-sm">
          <button onClick={() => toggleAll(true)} className="px-2 py-1 border rounded border-slate-300">Include all</button>
          <button onClick={() => toggleAll(false)} className="px-2 py-1 border rounded border-slate-300">Exclude all</button>
          <button onClick={addRow} className="px-2 py-1 border rounded border-slate-300">+ Custom row</button>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase text-slate-600">
            <tr>
              <th className="px-2 py-2 w-8"></th>
              <th className="px-2 py-2">Category</th>
              <th className="px-2 py-2">Record</th>
              <th className="px-2 py-2">Retention</th>
              <th className="px-2 py-2">Basis</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-slate-100 align-top">
                <td className="px-2 py-1"><input type="checkbox" checked={r.include} onChange={(e) => updateRow(i, { include: e.target.checked })} /></td>
                <td className="px-2 py-1"><input type="text" value={r.category} onChange={(e) => updateRow(i, { category: e.target.value })} className="w-full bg-transparent" /></td>
                <td className="px-2 py-1"><input type="text" value={r.record} onChange={(e) => updateRow(i, { record: e.target.value })} className="w-full bg-transparent" /></td>
                <td className="px-2 py-1"><input type="text" value={r.period} onChange={(e) => updateRow(i, { period: e.target.value })} className="w-full bg-transparent" /></td>
                <td className="px-2 py-1"><input type="text" value={r.basis} onChange={(e) => updateRow(i, { basis: e.target.value })} className="w-full bg-transparent" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <OutputCard title="Retention schedule (Markdown)" filename={`retention-${orgName ? orgName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}schedule.md`} body={md} />
      <OutputCard title="Retention schedule (CSV)" filename={`retention-${orgName ? orgName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}schedule.csv`} body={csv} mime="text/csv" />
    </div>
  );
}

function buildMd(org: string, rows: Row[]) {
  const groups: Record<string, Row[]> = {};
  rows.forEach((r) => {
    if (!groups[r.category]) groups[r.category] = [];
    groups[r.category].push(r);
  });
  const out: string[] = [`# Data retention schedule${org ? " — " + org : ""}`, ``, `_Starting schedule. Not legal advice. Review with your DPO/legal and tailor to actual processing._`, ``];
  Object.keys(groups).sort().forEach((cat) => {
    out.push(`## ${cat}`);
    groups[cat].forEach((r) => {
      out.push(`- **${r.record}** — ${r.period}  \n  _Basis: ${r.basis}_`);
    });
    out.push(``);
  });
  return out.join("\n");
}

function buildCsv(rows: Row[]) {
  const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
  const header = "Category,Record,Retention,Basis";
  return [header, ...rows.map((r) => [r.category, r.record, r.period, r.basis].map(esc).join(","))].join("\n");
}
