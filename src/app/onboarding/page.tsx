"use client";

import { useMemo, useState } from "react";
import { OutputCard } from "@/components/OutputCard";

type RoleFlags = {
  driving: boolean;
  dbs: boolean;
  remote: boolean;
  manager: boolean;
  handlesPersonalData: boolean;
};

const BASE_ITEMS: { when: string; item: string }[] = [
  { when: "Before start", item: "Signed offer letter on file" },
  { when: "Before start", item: "Right to work check completed and evidence retained (passport, share code, or BRP)" },
  { when: "Before start", item: "References checked and dated" },
  { when: "On or before day 1", item: "Written statement of employment particulars (s.1 ERA 1996) — required by law from day 1" },
  { when: "On or before day 1", item: "Privacy notice issued (UK GDPR Article 13: what data we hold, why, how long, rights)" },
  { when: "Day 1", item: "P45 received OR HMRC starter checklist completed" },
  { when: "Day 1", item: "Bank details and National Insurance number collected (encrypted/locked storage only)" },
  { when: "Day 1", item: "Emergency contact details collected" },
  { when: "Day 1", item: "Health & safety induction (including DSE assessment if office/screen work)" },
  { when: "Day 1", item: "IT account, equipment, and access provisioned (least-privilege)" },
  { when: "Day 1", item: "Pension auto-enrolment assessment (or postponement notice issued)" },
  { when: "Within 2 months", item: "Pensions information letter issued" },
  { when: "Within 2 months", item: "Training entitlement, probation terms, other benefits confirmed in writing" },
  { when: "Within 2 months", item: "Probation review date booked" },
];

const ROLE_ITEMS: Record<keyof RoleFlags, { when: string; item: string }[]> = {
  driving: [
    { when: "Before start", item: "Driving licence check (DVLA share code) — record date and expiry" },
    { when: "Before start", item: "Business-use insurance confirmation if driving own vehicle" },
  ],
  dbs: [
    { when: "Before start", item: "DBS check at the right level for the role (basic / standard / enhanced)" },
    { when: "Annual", item: "Diary DBS update / renewal" },
  ],
  remote: [
    { when: "Day 1", item: "Remote DSE self-assessment issued and returned" },
    { when: "Day 1", item: "Remote-work expectations documented (hours, security, expenses)" },
  ],
  manager: [
    { when: "Within 30 days", item: "Manager induction: capability process, grievance/disciplinary, sickness, ER basics" },
    { when: "Within 30 days", item: "Confidentiality re: personnel data they will access" },
  ],
  handlesPersonalData: [
    { when: "Day 1", item: "UK GDPR / data protection training assigned" },
    { when: "Day 1", item: "Confidentiality agreement signed (if not already in contract)" },
  ],
};

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [flags, setFlags] = useState<RoleFlags>({
    driving: false,
    dbs: false,
    remote: false,
    manager: false,
    handlesPersonalData: true,
  });

  const items = useMemo(() => {
    const all = [...BASE_ITEMS];
    (Object.keys(flags) as (keyof RoleFlags)[]).forEach((k) => {
      if (flags[k]) all.push(...ROLE_ITEMS[k]);
    });
    return all;
  }, [flags]);

  const markdown = useMemo(() => buildMarkdown(name, startDate, jobTitle, flags, items), [name, startDate, jobTitle, flags, items]);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Onboarding document checklist</h2>
        <p className="text-sm text-slate-600">Generates a per-hire list of UK statutory and recommended onboarding tasks. Tick the flags that apply to the role.</p>
      </header>

      <section className="bg-white border border-slate-200 rounded-lg p-4 grid sm:grid-cols-3 gap-4">
        <Field label="Hire name (optional)"><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border border-slate-300 rounded px-2 py-1 w-full" /></Field>
        <Field label="Job title"><input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="border border-slate-300 rounded px-2 py-1 w-full" /></Field>
        <Field label="Start date"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-slate-300 rounded px-2 py-1 w-full" /></Field>
        <div className="sm:col-span-3 grid sm:grid-cols-3 gap-2 text-sm">
          {([
            ["driving", "Driving as part of role"],
            ["dbs", "Needs DBS check"],
            ["remote", "Remote / hybrid working"],
            ["manager", "Has line management duties"],
            ["handlesPersonalData", "Will handle personal data"],
          ] as [keyof RoleFlags, string][]).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2">
              <input type="checkbox" checked={flags[k]} onChange={(e) => setFlags({ ...flags, [k]: e.target.checked })} />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="font-medium mb-2">Generated checklist ({items.length} items)</h3>
        <ul className="text-sm divide-y divide-slate-100">
          {items.map((it, i) => (
            <li key={i} className="py-1 flex gap-3">
              <span className="text-xs text-slate-500 w-32 shrink-0">{it.when}</span>
              <span>{it.item}</span>
            </li>
          ))}
        </ul>
      </section>

      <OutputCard
        title="Markdown checklist"
        filename={`onboarding-${name ? name.toLowerCase().replace(/\s+/g, "-") + "-" : ""}${startDate || "checklist"}.md`}
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

function buildMarkdown(name: string, startDate: string, jobTitle: string, flags: RoleFlags, items: { when: string; item: string }[]): string {
  const flagsList = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join(", ") || "none";
  const groups: Record<string, string[]> = {};
  items.forEach((it) => {
    if (!groups[it.when]) groups[it.when] = [];
    groups[it.when].push(it.item);
  });
  const order = ["Before start", "On or before day 1", "Day 1", "Within 30 days", "Within 2 months", "Annual"];
  const body: string[] = [
    `# Onboarding checklist`,
    ``,
    `**Hire:** ${name || "(not set)"}`,
    `**Job title:** ${jobTitle || "(not set)"}`,
    `**Start date:** ${startDate || "(not set)"}`,
    `**Role flags:** ${flagsList}`,
    ``,
  ];
  order.forEach((bucket) => {
    if (!groups[bucket]) return;
    body.push(`## ${bucket}`);
    groups[bucket].forEach((i) => body.push(`- [ ] ${i}`));
    body.push(``);
  });
  Object.keys(groups).forEach((bucket) => {
    if (!order.includes(bucket)) {
      body.push(`## ${bucket}`);
      groups[bucket].forEach((i) => body.push(`- [ ] ${i}`));
      body.push(``);
    }
  });
  body.push(
    `## Reminder`,
    `- The s.1 written statement is a day-1 obligation since 6 April 2020.`,
    `- Right to work checks must be done before employment starts; keep evidence for the duration of employment + 2 years.`,
    `- Don't store NI numbers, bank details, or RTW documents in shared drives without access control.`,
    ``,
    `_Not legal advice — verify before relying._`
  );
  return body.join("\n");
}
