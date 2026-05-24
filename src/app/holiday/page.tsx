"use client";

import { useMemo, useState } from "react";
import { OutputCard } from "@/components/OutputCard";

type Pattern = "regular" | "irregular";
type BankHolidays = "included" | "additional";

const STATUTORY_WEEKS = 5.6;
const STATUTORY_CAP_DAYS = 28;
const IRREGULAR_RATE = 0.1207;

export default function HolidayPage() {
  const [employeeName, setEmployeeName] = useState("");
  const [pattern, setPattern] = useState<Pattern>("regular");
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [hoursPerWeek, setHoursPerWeek] = useState(37.5);
  const [bankHolidays, setBankHolidays] = useState<BankHolidays>("included");
  const [bankHolidayCount, setBankHolidayCount] = useState(8);
  const [leaveYearStart, setLeaveYearStart] = useState("2026-04-01");
  const [startDate, setStartDate] = useState("");

  const result = useMemo(() => calculate({
    pattern,
    daysPerWeek,
    hoursPerWeek,
    bankHolidays,
    bankHolidayCount,
    leaveYearStart,
    startDate,
  }), [pattern, daysPerWeek, hoursPerWeek, bankHolidays, bankHolidayCount, leaveYearStart, startDate]);

  const markdown = buildMarkdown({ employeeName, pattern, daysPerWeek, hoursPerWeek, bankHolidays, bankHolidayCount, leaveYearStart, startDate, result });

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Holiday entitlement explainer</h2>
        <p className="text-sm text-slate-600">UK statutory minimum is 5.6 weeks per year, capped at 28 days. This works out a sensible starting point for one person — read the workings, don&apos;t just trust the number.</p>
      </header>

      <section className="bg-white border border-slate-200 rounded-lg p-4 grid sm:grid-cols-2 gap-4">
        <Field label="Employee name (optional, stays on this device)">
          <input type="text" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="border border-slate-300 rounded px-2 py-1 w-full" />
        </Field>

        <Field label="Working pattern">
          <select value={pattern} onChange={(e) => setPattern(e.target.value as Pattern)} className="border border-slate-300 rounded px-2 py-1 w-full">
            <option value="regular">Regular days/week</option>
            <option value="irregular">Irregular hours / part-year</option>
          </select>
        </Field>

        {pattern === "regular" ? (
          <Field label="Days worked per week">
            <input type="number" min={0.5} max={7} step={0.5} value={daysPerWeek} onChange={(e) => setDaysPerWeek(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1 w-full" />
          </Field>
        ) : (
          <Field label="Typical hours per week (for hours-equivalent)">
            <input type="number" min={0} step={0.5} value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1 w-full" />
          </Field>
        )}

        <Field label="Bank holidays">
          <select value={bankHolidays} onChange={(e) => setBankHolidays(e.target.value as BankHolidays)} className="border border-slate-300 rounded px-2 py-1 w-full">
            <option value="included">Included in entitlement</option>
            <option value="additional">Additional to entitlement</option>
          </select>
        </Field>

        <Field label="Bank holidays in leave year">
          <input type="number" min={0} max={15} value={bankHolidayCount} onChange={(e) => setBankHolidayCount(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1 w-full" />
        </Field>

        <Field label="Leave year starts">
          <input type="date" value={leaveYearStart} onChange={(e) => setLeaveYearStart(e.target.value)} className="border border-slate-300 rounded px-2 py-1 w-full" />
        </Field>

        <Field label="Start date (optional, for pro-rata)">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-slate-300 rounded px-2 py-1 w-full" />
        </Field>
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="font-medium mb-2">Result</h3>
        <dl className="grid sm:grid-cols-2 gap-y-1 text-sm">
          {result.lines.map((l) => (
            <div key={l.k} className="contents">
              <dt className="text-slate-500">{l.k}</dt>
              <dd className="font-mono">{l.v}</dd>
            </div>
          ))}
        </dl>
        {result.notes.length > 0 && (
          <ul className="mt-3 text-xs text-slate-600 list-disc list-inside space-y-1">
            {result.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        )}
      </section>

      <OutputCard
        title="Markdown summary"
        filename={`holiday-${employeeName ? employeeName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}${leaveYearStart}.md`}
        body={markdown}
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

type Inputs = {
  pattern: Pattern;
  daysPerWeek: number;
  hoursPerWeek: number;
  bankHolidays: BankHolidays;
  bankHolidayCount: number;
  leaveYearStart: string;
  startDate: string;
};

function calculate(i: Inputs) {
  const lines: { k: string; v: string }[] = [];
  const notes: string[] = [];

  if (i.pattern === "regular") {
    const rawDays = i.daysPerWeek * STATUTORY_WEEKS;
    const statutoryDays = Math.min(rawDays, STATUTORY_CAP_DAYS);
    lines.push({ k: "Days/week", v: i.daysPerWeek.toString() });
    lines.push({ k: "Raw entitlement (days/week × 5.6)", v: rawDays.toFixed(2) + " days" });
    if (rawDays > STATUTORY_CAP_DAYS) {
      lines.push({ k: "Capped at statutory minimum", v: STATUTORY_CAP_DAYS + " days" });
      notes.push("Statutory cap of 28 days applies — you can offer more contractually if you like.");
    }

    if (i.bankHolidays === "additional") {
      lines.push({ k: "Plus bank holidays", v: i.bankHolidayCount + " days" });
      lines.push({ k: "Total annual leave", v: (statutoryDays + i.bankHolidayCount).toFixed(2) + " days" });
      notes.push("Bank holidays are set as additional to the 5.6-week minimum here.");
    } else {
      lines.push({ k: "Bank holidays counted within", v: i.bankHolidayCount + " days" });
      const remaining = statutoryDays - i.bankHolidayCount;
      lines.push({ k: "Remaining bookable leave", v: remaining.toFixed(2) + " days" });
      if (remaining < 0) notes.push("Bank holidays exceed the entitlement on this pattern — you would need to top up.");
    }

    if (i.startDate) {
      const accrued = proRata(i.startDate, i.leaveYearStart, statutoryDays);
      if (accrued !== null) {
        lines.push({ k: "Pro-rata for this leave year", v: accrued.toFixed(2) + " days" });
        notes.push("Pro-rata = (months remaining in leave year ÷ 12) × annual entitlement. Round in the employee's favour.");
      }
    }
  } else {
    lines.push({ k: "Accrual rate (irregular hours / part-year)", v: (IRREGULAR_RATE * 100).toFixed(2) + "% of hours worked" });
    const exampleAnnualHours = i.hoursPerWeek * 52;
    const exampleLeaveHours = exampleAnnualHours * IRREGULAR_RATE;
    lines.push({ k: "Example at " + i.hoursPerWeek + " hrs/wk × 52", v: exampleLeaveHours.toFixed(1) + " hrs leave/year" });
    notes.push("Accrue 12.07% of hours worked in each pay period (Working Time (Amendment) Regs 2023, in force from leave years starting on or after 1 April 2024).");
    notes.push("Pay using the 52-week reference period for average weekly pay.");
    notes.push("Rolled-up holiday pay is permitted again for irregular-hours/part-year workers — show it as a separate line on the payslip.");
  }

  return { lines, notes };
}

function proRata(startDate: string, leaveYearStart: string, annualDays: number): number | null {
  const s = new Date(startDate);
  const ly = new Date(leaveYearStart);
  if (isNaN(s.getTime()) || isNaN(ly.getTime())) return null;
  const lyEnd = new Date(ly);
  lyEnd.setFullYear(lyEnd.getFullYear() + 1);
  let effectiveStart = s > ly ? s : ly;
  if (effectiveStart >= lyEnd) return 0;
  const msPerMonth = (lyEnd.getTime() - ly.getTime()) / 12;
  const monthsRemaining = (lyEnd.getTime() - effectiveStart.getTime()) / msPerMonth;
  return Math.max(0, (monthsRemaining / 12) * annualDays);
}

function buildMarkdown(args: Inputs & { employeeName: string; result: ReturnType<typeof calculate> }) {
  const { employeeName, pattern, daysPerWeek, hoursPerWeek, bankHolidays, bankHolidayCount, leaveYearStart, startDate, result } = args;
  const lines = [
    `# Holiday entitlement summary`,
    ``,
    employeeName ? `**Employee:** ${employeeName}` : `**Employee:** (not set)`,
    `**Leave year starts:** ${leaveYearStart}`,
    startDate ? `**Employment start:** ${startDate}` : ``,
    `**Pattern:** ${pattern === "regular" ? `${daysPerWeek} day(s)/week` : `irregular hours (${hoursPerWeek} hrs/wk typical)`}`,
    `**Bank holidays:** ${bankHolidays} (${bankHolidayCount} per year)`,
    ``,
    `## Figures`,
    ...result.lines.map((l) => `- **${l.k}:** ${l.v}`),
  ];
  if (result.notes.length) {
    lines.push(``, `## Notes`, ...result.notes.map((n) => `- ${n}`));
  }
  lines.push(
    ``,
    `## Questions to check before relying on this`,
    `- Is the leave year defined in the contract? If not, default is the anniversary of employment.`,
    `- Does the contract specify bank holidays as included or additional? If silent, check what you've done historically.`,
    `- For irregular hours: are you paying rolled-up holiday pay or accruing leave to be taken? Both are now permitted, but you must pick one and tell the worker.`,
    `- Has the worker had unpaid leave, sickness, or family leave that changes accrual?`,
    ``,
    `_Not legal advice. Statutory rules current at time of writing — verify before relying on them._`,
  );
  return lines.filter(Boolean).join("\n");
}
