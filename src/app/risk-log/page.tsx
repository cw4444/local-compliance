"use client";

import { useMemo, useState } from "react";
import { OutputCard } from "@/components/OutputCard";

type Risk = {
  id: string;
  hazard: string;
  category: string;
  likelihood: number;
  impact: number;
  mitigation: string;
  owner: string;
  reviewDate: string;
};

const SEED: Risk[] = [
  { id: cryptoId(), hazard: "Loss of laptop with unencrypted client data", category: "Data protection", likelihood: 2, impact: 4, mitigation: "Enforce full-disk encryption; remote wipe enrolled", owner: "Ops", reviewDate: "" },
  { id: cryptoId(), hazard: "Key person leaves; payroll process undocumented", category: "Operational", likelihood: 3, impact: 4, mitigation: "Document runbook; cross-train backup", owner: "Director", reviewDate: "" },
];

export default function RiskLogPage() {
  const [orgName, setOrgName] = useState("");
  const [risks, setRisks] = useState<Risk[]>(SEED);

  function add() {
    setRisks([
      ...risks,
      { id: cryptoId(), hazard: "", category: "", likelihood: 1, impact: 1, mitigation: "", owner: "", reviewDate: "" },
    ]);
  }
  function update(id: string, patch: Partial<Risk>) {
    setRisks(risks.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function remove(id: string) {
    setRisks(risks.filter((r) => r.id !== id));
  }

  const csv = useMemo(() => buildCsv(risks), [risks]);
  const md = useMemo(() => buildMd(orgName, risks), [orgName, risks]);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Risk log generator</h2>
        <p className="text-sm text-slate-600">A small business risk register. Score likelihood × impact (1–5), assign an owner, diary a review. Export to CSV or Markdown.</p>
      </header>

      <section className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="block text-slate-700 mb-1">Organisation name (optional)</span>
          <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="border border-slate-300 rounded px-2 py-1" />
        </label>
        <button onClick={add} className="ml-auto px-3 py-1 border border-slate-300 rounded text-sm">+ Add risk</button>
      </section>

      <section className="space-y-3">
        {risks.map((r) => {
          const score = r.likelihood * r.impact;
          const band = score >= 16 ? ["bg-red-50 border-red-300 text-red-900", "Severe"]
            : score >= 9 ? ["bg-orange-50 border-orange-300 text-orange-900", "High"]
            : score >= 4 ? ["bg-yellow-50 border-yellow-300 text-yellow-900", "Medium"]
            : ["bg-emerald-50 border-emerald-300 text-emerald-900", "Low"];
          return (
            <div key={r.id} className="bg-white border border-slate-200 rounded-lg p-3 grid sm:grid-cols-12 gap-2 text-sm">
              <div className="sm:col-span-4">
                <Label>Hazard / risk</Label>
                <input type="text" value={r.hazard} onChange={(e) => update(r.id, { hazard: e.target.value })} className="w-full border border-slate-300 rounded px-2 py-1" />
              </div>
              <div className="sm:col-span-2">
                <Label>Category</Label>
                <input type="text" value={r.category} onChange={(e) => update(r.id, { category: e.target.value })} className="w-full border border-slate-300 rounded px-2 py-1" />
              </div>
              <div className="sm:col-span-1">
                <Label>L</Label>
                <input type="number" min={1} max={5} value={r.likelihood} onChange={(e) => update(r.id, { likelihood: clamp(Number(e.target.value)) })} className="w-full border border-slate-300 rounded px-2 py-1" />
              </div>
              <div className="sm:col-span-1">
                <Label>I</Label>
                <input type="number" min={1} max={5} value={r.impact} onChange={(e) => update(r.id, { impact: clamp(Number(e.target.value)) })} className="w-full border border-slate-300 rounded px-2 py-1" />
              </div>
              <div className="sm:col-span-1 flex flex-col">
                <Label>Score</Label>
                <span className={`text-xs px-2 py-1 rounded border text-center font-mono ${band[0]}`}>{score} · {band[1]}</span>
              </div>
              <div className="sm:col-span-3">
                <Label>Review by</Label>
                <input type="date" value={r.reviewDate} onChange={(e) => update(r.id, { reviewDate: e.target.value })} className="w-full border border-slate-300 rounded px-2 py-1" />
              </div>
              <div className="sm:col-span-8">
                <Label>Mitigation / control</Label>
                <input type="text" value={r.mitigation} onChange={(e) => update(r.id, { mitigation: e.target.value })} className="w-full border border-slate-300 rounded px-2 py-1" />
              </div>
              <div className="sm:col-span-3">
                <Label>Owner</Label>
                <input type="text" value={r.owner} onChange={(e) => update(r.id, { owner: e.target.value })} className="w-full border border-slate-300 rounded px-2 py-1" />
              </div>
              <div className="sm:col-span-1 flex items-end">
                <button onClick={() => remove(r.id)} className="text-xs text-red-700 hover:underline">Remove</button>
              </div>
            </div>
          );
        })}
        {risks.length === 0 && <p className="text-sm text-slate-500 italic">No risks yet. Add one above.</p>}
      </section>

      <OutputCard title="Risk register (Markdown)" filename={`risk-log-${orgName ? orgName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}${new Date().toISOString().slice(0,10)}.md`} body={md} containsPersonalData={false} />
      <OutputCard title="Risk register (CSV)" filename={`risk-log-${orgName ? orgName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}${new Date().toISOString().slice(0,10)}.csv`} body={csv} mime="text/csv" />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="block text-xs text-slate-500 mb-0.5">{children}</span>;
}

function clamp(n: number) { return Math.max(1, Math.min(5, n || 1)); }

function cryptoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

function buildMd(org: string, risks: Risk[]) {
  const out: string[] = [`# Risk register${org ? " — " + org : ""}`, ``, `_${risks.length} risk(s). Scores are likelihood × impact, 1–5 each._`, ``,
    `| Hazard | Category | L | I | Score | Mitigation | Owner | Review |`,
    `|---|---|---|---|---|---|---|---|`,
  ];
  risks.forEach((r) => {
    const cells = [r.hazard, r.category, r.likelihood, r.impact, r.likelihood * r.impact, r.mitigation, r.owner, r.reviewDate].map(mdCell);
    out.push(`| ${cells.join(" | ")} |`);
  });
  out.push(``, `_Review at the diaried date. Severe (16+) and High (9–15) should be on the agenda of every leadership meeting until reduced._`);
  return out.join("\n");
}

function mdCell(v: unknown) { return String(v ?? "").replace(/\|/g, "\\|").replace(/\n/g, " "); }

function buildCsv(risks: Risk[]) {
  const esc = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  const header = "Hazard,Category,Likelihood,Impact,Score,Mitigation,Owner,ReviewDate";
  return [header, ...risks.map((r) => [r.hazard, r.category, r.likelihood, r.impact, r.likelihood * r.impact, r.mitigation, r.owner, r.reviewDate].map(esc).join(","))].join("\n");
}
