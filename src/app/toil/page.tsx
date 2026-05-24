"use client";

import { useMemo, useState } from "react";
import { OutputCard } from "@/components/OutputCard";

type Entry = {
  id: string;
  date: string;
  hours: number;
  kind: "accrued" | "taken";
  reason: string;
  approvedBy: string;
};

export default function ToilPage() {
  const [employee, setEmployee] = useState("");
  const [expiryMonths, setExpiryMonths] = useState(3);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState<Entry>(blankEntry("accrued"));

  function addEntry() {
    if (!draft.date || draft.hours <= 0) return;
    setEntries([...entries, { ...draft, id: cryptoId() }]);
    setDraft(blankEntry(draft.kind));
  }
  function remove(id: string) {
    setEntries(entries.filter((e) => e.id !== id));
  }

  const summary = useMemo(() => summarise(entries, expiryMonths), [entries, expiryMonths]);
  const md = useMemo(() => buildMd(employee, expiryMonths, entries, summary), [employee, expiryMonths, entries, summary]);
  const csv = useMemo(() => buildCsv(entries), [entries]);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">TOIL tracker</h2>
        <p className="text-sm text-slate-600">
          Time Off In Lieu — extra hours worked, swapped for paid time off later. One person at a time. Log when hours are accrued and when they are taken; balance updates as you go.
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-lg p-4 grid sm:grid-cols-2 gap-4">
        <Field label="Employee (optional, stays on this device)">
          <input type="text" value={employee} onChange={(e) => setEmployee(e.target.value)} className="border border-slate-300 rounded px-2 py-1 w-full" />
        </Field>
        <Field label="Expiry policy: hours expire after (months)">
          <input type="number" min={0} max={24} value={expiryMonths} onChange={(e) => setExpiryMonths(Math.max(0, Number(e.target.value)))} className="border border-slate-300 rounded px-2 py-1 w-full" />
        </Field>
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="font-medium mb-2">Add entry</h3>
        <div className="grid sm:grid-cols-6 gap-2 text-sm items-end">
          <Field label="Date">
            <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="w-full border border-slate-300 rounded px-2 py-1" />
          </Field>
          <Field label="Hours">
            <input type="number" min={0.25} step={0.25} value={draft.hours} onChange={(e) => setDraft({ ...draft, hours: Number(e.target.value) })} className="w-full border border-slate-300 rounded px-2 py-1" />
          </Field>
          <Field label="Type">
            <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as Entry["kind"] })} className="w-full border border-slate-300 rounded px-2 py-1">
              <option value="accrued">Accrued (extra worked)</option>
              <option value="taken">Taken (time off)</option>
            </select>
          </Field>
          <Field label="Reason / activity">
            <input type="text" value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} className="w-full border border-slate-300 rounded px-2 py-1" />
          </Field>
          <Field label="Approved by">
            <input type="text" value={draft.approvedBy} onChange={(e) => setDraft({ ...draft, approvedBy: e.target.value })} className="w-full border border-slate-300 rounded px-2 py-1" />
          </Field>
          <button onClick={addEntry} className="px-3 py-1 border border-slate-800 bg-slate-800 text-white rounded text-sm">Add</button>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-baseline gap-4 mb-2">
          <h3 className="font-medium">Balance</h3>
          <span className="text-sm">Accrued: <span className="font-mono">{summary.totalAccrued.toFixed(2)}h</span></span>
          <span className="text-sm">Taken: <span className="font-mono">{summary.totalTaken.toFixed(2)}h</span></span>
          <span className="text-sm">Expired: <span className="font-mono">{summary.totalExpired.toFixed(2)}h</span></span>
          <span className="text-sm ml-auto">Available now: <span className="font-mono font-semibold">{summary.available.toFixed(2)}h</span></span>
        </div>
        {summary.warnings.length > 0 && (
          <ul className="text-xs bg-amber-50 border border-amber-200 rounded p-2 text-amber-900 space-y-1 mb-2">
            {summary.warnings.map((w, i) => <li key={i}>⚠ {w}</li>)}
          </ul>
        )}
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No entries yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 text-left">
              <tr><th className="py-1">Date</th><th>Type</th><th>Hours</th><th>Reason</th><th>Approved by</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {summary.rows.map((r) => (
                <tr key={r.entry.id} className="border-t border-slate-100">
                  <td className="py-1 font-mono">{r.entry.date}</td>
                  <td>{r.entry.kind}</td>
                  <td className="font-mono">{r.entry.hours.toFixed(2)}</td>
                  <td>{r.entry.reason}</td>
                  <td>{r.entry.approvedBy}</td>
                  <td className={r.status === "expired" ? "text-amber-700" : "text-slate-600"}>{r.status}</td>
                  <td><button onClick={() => remove(r.entry.id)} className="text-xs text-red-700 hover:underline">Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 space-y-1">
        <p className="font-medium text-slate-900">A few things to remember about TOIL</p>
        <ul className="list-disc list-inside space-y-1">
          <li>TOIL is contractual — your contract or policy should set it out (eligibility, accrual rate, expiry, approval).</li>
          <li>Pay must still meet the National Minimum Wage averaged across the pay reference period. If extra hours are unpaid and TOIL expires, you can drift below NMW. Worth a periodic check.</li>
          <li>Working Time Regulations 1998 cap average weekly hours at 48 over a 17-week reference period unless the worker has opted out.</li>
          <li>Salaried staff often have a "reasonable additional hours" clause — TOIL is the polite way to keep that fair.</li>
        </ul>
      </section>

      <OutputCard
        title="TOIL summary (Markdown)"
        filename={`toil-${employee ? employee.toLowerCase().replace(/\s+/g, "-") + "-" : ""}${new Date().toISOString().slice(0,10)}.md`}
        body={md}
        containsPersonalData
      />
      <OutputCard
        title="TOIL log (CSV)"
        filename={`toil-${employee ? employee.toLowerCase().replace(/\s+/g, "-") + "-" : ""}log.csv`}
        body={csv}
        mime="text/csv"
        containsPersonalData
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block text-slate-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

function blankEntry(kind: Entry["kind"]): Entry {
  return { id: "", date: new Date().toISOString().slice(0, 10), hours: 0, kind, reason: "", approvedBy: "" };
}

function cryptoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

type Summary = {
  totalAccrued: number;
  totalTaken: number;
  totalExpired: number;
  available: number;
  rows: { entry: Entry; status: "active" | "taken" | "expired" }[];
  warnings: string[];
};

function summarise(entries: Entry[], expiryMonths: number): Summary {
  const now = new Date();
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let totalAccrued = 0;
  let totalTaken = 0;
  let totalExpired = 0;
  const rows: Summary["rows"] = sorted.map((e) => {
    if (e.kind === "taken") {
      totalTaken += e.hours;
      return { entry: e, status: "taken" as const };
    }
    totalAccrued += e.hours;
    if (expiryMonths > 0) {
      const accruedOn = new Date(e.date);
      const expiresOn = new Date(accruedOn);
      expiresOn.setMonth(expiresOn.getMonth() + expiryMonths);
      if (expiresOn < now) {
        totalExpired += e.hours;
        return { entry: e, status: "expired" as const };
      }
    }
    return { entry: e, status: "active" as const };
  });
  const available = totalAccrued - totalTaken - totalExpired;
  const warnings: string[] = [];
  if (available < 0) warnings.push(`More TOIL taken than accrued+unexpired (balance ${available.toFixed(2)}h). Check the log.`);
  if (totalExpired > 0) warnings.push(`${totalExpired.toFixed(2)}h has expired unused. If this happens often, your expiry rule may be too tight or extra hours too frequent.`);
  return { totalAccrued, totalTaken, totalExpired, available, rows, warnings };
}

function buildMd(employee: string, expiryMonths: number, entries: Entry[], s: Summary): string {
  const lines: string[] = [
    `# TOIL summary`,
    ``,
    `**Employee:** ${employee || "(not set)"}`,
    `**Expiry policy:** ${expiryMonths > 0 ? `${expiryMonths} month(s) from accrual` : "no expiry"}`,
    `**Generated:** ${new Date().toISOString().slice(0,10)}`,
    ``,
    `## Balance`,
    `- Accrued: **${s.totalAccrued.toFixed(2)}h**`,
    `- Taken: **${s.totalTaken.toFixed(2)}h**`,
    `- Expired unused: **${s.totalExpired.toFixed(2)}h**`,
    `- Available now: **${s.available.toFixed(2)}h**`,
    ``,
  ];
  if (s.warnings.length) {
    lines.push(`## Warnings`, ...s.warnings.map((w) => `- ⚠ ${w}`), ``);
  }
  lines.push(`## Entries`, ``, `| Date | Type | Hours | Reason | Approved by | Status |`, `|---|---|---|---|---|---|`);
  s.rows.forEach((r) => {
    const cells = [r.entry.date, r.entry.kind, r.entry.hours.toFixed(2), r.entry.reason, r.entry.approvedBy, r.status].map((c) => String(c).replace(/\|/g, "\\|"));
    lines.push(`| ${cells.join(" | ")} |`);
  });
  lines.push(``, `_Reminder: TOIL doesn't relieve you of National Minimum Wage or Working Time Regulations duties. Not legal advice._`);
  return lines.join("\n");
}

function buildCsv(entries: Entry[]): string {
  const esc = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  const header = "Date,Type,Hours,Reason,ApprovedBy";
  return [header, ...entries.map((e) => [e.date, e.kind, e.hours, e.reason, e.approvedBy].map(esc).join(","))].join("\n");
}
