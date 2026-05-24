"use client";

import { useMemo, useState } from "react";
import { OutputCard } from "@/components/OutputCard";

export default function AbsencePage() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl font-semibold">Absence policy checker</h2>
        <p className="text-sm text-slate-600">Three things in one place: SSP eligibility prompts, a Bradford Factor calculator, and a return-to-work meeting template.</p>
      </header>
      <SSPEligibility />
      <BradfordFactor />
      <ReturnToWork />
    </div>
  );
}

function SSPEligibility() {
  const [employee, setEmployee] = useState(true);
  const [earnsAboveLEL, setEarnsAboveLEL] = useState<boolean | null>(null);
  const [illDaysInARow, setIllDaysInARow] = useState(0);
  const [hasSicknote, setHasSicknote] = useState<boolean | null>(null);

  const verdict = useMemo(() => {
    const reasons: string[] = [];
    let eligible = true;
    if (!employee) { eligible = false; reasons.push("Not classed as an employee — SSP is for employees only. Workers/self-employed are not eligible."); }
    if (earnsAboveLEL === false) { eligible = false; reasons.push("Average earnings below the Lower Earnings Limit (currently £125/week, 2025-26 — confirm rate)."); }
    if (illDaysInARow < 4) { eligible = false; reasons.push("Fewer than 4 consecutive days off sick (including non-working days). First 3 are 'waiting days' with no SSP."); }
    if (illDaysInARow >= 8 && hasSicknote === false) { reasons.push("After 7 calendar days off, a fit note from GP/hospital is normally required as evidence."); }
    return { eligible, reasons };
  }, [employee, earnsAboveLEL, illDaysInARow, hasSicknote]);

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
      <h3 className="font-medium">SSP eligibility — quick check</h3>
      <p className="text-xs text-slate-600">Statutory Sick Pay is the minimum. Many employers offer enhanced sick pay on top; that is contractual and is whatever you wrote down.</p>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <Toggle label="Person is classed as an employee" value={employee} onChange={setEmployee} />
        <Tri label="Average earnings ≥ Lower Earnings Limit" value={earnsAboveLEL} onChange={setEarnsAboveLEL} />
        <label className="block">
          <span className="block text-slate-700 mb-1">Consecutive days off sick (incl. non-working days)</span>
          <input type="number" min={0} value={illDaysInARow} onChange={(e) => setIllDaysInARow(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1 w-full" />
        </label>
        <Tri label="Has a fit note (if 8+ days)" value={hasSicknote} onChange={setHasSicknote} />
      </div>
      <div className={`text-sm rounded p-2 ${verdict.eligible ? "bg-emerald-50 text-emerald-900 border border-emerald-200" : "bg-amber-50 text-amber-900 border border-amber-200"}`}>
        <strong>{verdict.eligible ? "Looks eligible." : "Probably not eligible — or not yet."}</strong>
        {verdict.reasons.length > 0 && (
          <ul className="list-disc list-inside mt-1">{verdict.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
        )}
      </div>
      <p className="text-xs text-slate-500">Rates and thresholds change each April. Always confirm the current SSP weekly rate and LEL on gov.uk before paying.</p>
    </section>
  );
}

function BradfordFactor() {
  const [instances, setInstances] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [employeeName, setEmployeeName] = useState("");
  const [periodLabel, setPeriodLabel] = useState("rolling 12 months");
  const score = instances * instances * totalDays;
  const band = score < 50 ? "low" : score < 125 ? "elevated" : score < 450 ? "high" : "very high";

  const markdown = [
    `# Bradford Factor — ${employeeName || "(not set)"}`,
    ``,
    `**Period:** ${periodLabel}`,
    `**Absence instances (S):** ${instances}`,
    `**Total days absent (D):** ${totalDays}`,
    `**Score (S² × D):** ${score}`,
    `**Band (illustrative):** ${band}`,
    ``,
    `> The Bradford Factor weights frequency over duration. It is an _input_ to a conversation, not a verdict. High scores can flag protected reasons (disability, pregnancy, mental health) — do not act on the number alone.`,
  ].join("\n");

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
      <h3 className="font-medium">Bradford Factor calculator</h3>
      <p className="text-xs text-slate-600">Frequency-weighted absence score: S² × D. Use as a conversation prompt, not a trigger for automatic action.</p>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <Field label="Employee (stays on this device)">
          <input type="text" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="border border-slate-300 rounded px-2 py-1 w-full" />
        </Field>
        <Field label="Period label">
          <input type="text" value={periodLabel} onChange={(e) => setPeriodLabel(e.target.value)} className="border border-slate-300 rounded px-2 py-1 w-full" />
        </Field>
        <Field label="Number of separate absence instances (S)">
          <input type="number" min={0} value={instances} onChange={(e) => setInstances(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1 w-full" />
        </Field>
        <Field label="Total days absent across all instances (D)">
          <input type="number" min={0} value={totalDays} onChange={(e) => setTotalDays(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1 w-full" />
        </Field>
      </div>
      <div className="text-sm">
        Score: <span className="font-mono">{score}</span> · Band: <span className="font-mono">{band}</span>
      </div>
      <OutputCard
        title="Markdown summary"
        filename={`bradford-${employeeName ? employeeName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}${new Date().toISOString().slice(0,10)}.md`}
        body={markdown}
        containsPersonalData
      />
    </section>
  );
}

function ReturnToWork() {
  const template = `# Return-to-work meeting

**Employee:**
**Date of meeting:**
**Period of absence:**
**Reason given:**

## Questions to cover
- How are you feeling now? Is there anything still ongoing?
- Did you see a GP / get a fit note? Any recommendations on adjustments?
- Is there anything at work that contributed, or that you'd like to change?
- Is this related to a longer-term condition we should be aware of? (Note: may engage Equality Act 2010 disability duties.)
- Are there any reasonable adjustments that would help?
- What support, if any, would you like from us?

## Practical
- Confirm SSP / company sick pay calculation was correct.
- Update absence record (date, reason category, days).
- Diary any follow-up review.
- Note any patterns since last conversation.

## Manager notes


## Agreed actions
- [ ]
- [ ]

_Confidential. Store with HR records, retain per your retention schedule. Do not paste this into third-party AI tools without authority._
`;
  return (
    <OutputCard
      title="Return-to-work meeting template"
      filename="return-to-work-template.md"
      body={template}
      containsPersonalData
    />
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

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Tri({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean | null) => void }) {
  return (
    <div>
      <span className="block text-slate-700 mb-1">{label}</span>
      <div className="flex gap-2">
        {[
          { v: true, l: "Yes" },
          { v: false, l: "No" },
          { v: null, l: "Unsure" },
        ].map((o) => (
          <button
            key={o.l}
            type="button"
            onClick={() => onChange(o.v)}
            className={`text-xs px-2 py-1 rounded border ${value === o.v ? "bg-slate-800 text-white border-slate-800" : "border-slate-300"}`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}
