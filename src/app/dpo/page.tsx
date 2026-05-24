"use client";

import { useMemo, useState } from "react";
import { OutputCard } from "@/components/OutputCard";

type Answer = "yes" | "no" | "unsure";

type Trigger = {
  id: string;
  question: string;
  explain: string;
};

const TRIGGERS: Trigger[] = [
  {
    id: "publicAuthority",
    question: "Are you a public authority or body?",
    explain:
      "Government, local authority, NHS body, school, etc. Courts acting in their judicial capacity are excluded. Most small businesses answer no here.",
  },
  {
    id: "monitoring",
    question:
      "Do your core activities require regular and systematic monitoring of individuals on a large scale?",
    explain:
      "'Core' means central to what you do, not a support function. 'Regular and systematic' includes tracking, profiling, ad networks, location services, online behavioural advertising, CCTV networks, fitness trackers, connected devices. 'Large scale' considers number of people, volume of data, geographic reach, and duration. ICO has not set a hard number — the WP29 / EDPB guidelines suggest it is not about absolute numbers but proportion and scope.",
  },
  {
    id: "specialCategory",
    question:
      "Do your core activities involve large-scale processing of special category data, or data on criminal convictions?",
    explain:
      "Special category data = health, race, ethnicity, religious or political views, sex life, sexual orientation, trade union membership, genetic data, biometric data used to identify someone. A small clinic with one patient list is usually not 'large scale'; a digital health platform is. If you process this data only incidentally (e.g. occasional sick notes), it is not your 'core activity'.",
  },
];

export default function DpoPage() {
  const [orgName, setOrgName] = useState("");
  const [decidedBy, setDecidedBy] = useState("");
  const [answers, setAnswers] = useState<Record<string, Answer | null>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [voluntary, setVoluntary] = useState(false);

  const verdict = useMemo(() => decide(answers), [answers]);
  const md = useMemo(() => buildRecord(orgName, decidedBy, answers, notes, voluntary, verdict), [orgName, decidedBy, answers, notes, voluntary, verdict]);

  function setAnswer(id: string, a: Answer) {
    setAnswers({ ...answers, [id]: a });
  }
  function setNote(id: string, v: string) {
    setNotes({ ...notes, [id]: v });
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Do we need a Data Protection Officer?</h2>
        <p className="text-sm text-slate-600">
          Walks the three UK GDPR Article 37 triggers. The ICO expects you to{" "}
          <em>document</em> your decision either way — this produces that record.
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-lg p-4 grid sm:grid-cols-2 gap-4">
        <Field label="Organisation name">
          <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="border border-slate-300 rounded px-2 py-1 w-full" />
        </Field>
        <Field label="Decision recorded by">
          <input type="text" value={decidedBy} onChange={(e) => setDecidedBy(e.target.value)} className="border border-slate-300 rounded px-2 py-1 w-full" />
        </Field>
      </section>

      {TRIGGERS.map((t, i) => (
        <section key={t.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xs uppercase text-slate-500">Trigger {i + 1}</span>
            <h3 className="font-medium">{t.question}</h3>
          </div>
          <p className="text-xs text-slate-600">{t.explain}</p>
          <div className="flex gap-2 text-sm">
            {(["yes", "no", "unsure"] as Answer[]).map((a) => (
              <button
                key={a}
                onClick={() => setAnswer(t.id, a)}
                className={`px-3 py-1 rounded border ${answers[t.id] === a ? "bg-slate-800 text-white border-slate-800" : "border-slate-300"}`}
              >
                {a}
              </button>
            ))}
          </div>
          <Field label="Reasoning (saved into the decision record)">
            <textarea value={notes[t.id] ?? ""} onChange={(e) => setNote(t.id, e.target.value)} rows={2} className="w-full border border-slate-300 rounded px-2 py-1" />
          </Field>
        </section>
      ))}

      <section className="bg-white border border-slate-200 rounded-lg p-4">
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={voluntary} onChange={(e) => setVoluntary(e.target.checked)} className="mt-1" />
          <span>
            We are appointing a DPO <strong>voluntarily</strong> (i.e. not legally required, but doing it anyway). If you tick this, the same statutory protections and duties apply as if mandatory.
          </span>
        </label>
      </section>

      <section className={`rounded-lg p-4 border ${verdict.cssClass}`}>
        <p className="font-medium">{verdict.headline}</p>
        <ul className="list-disc list-inside mt-2 text-sm space-y-1">
          {verdict.reasons.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </section>

      <OutputCard
        title="DPO decision record (Markdown)"
        filename={`dpo-decision-${orgName ? orgName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}${new Date().toISOString().slice(0,10)}.md`}
        body={md}
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

type Verdict = {
  status: "required" | "not-required" | "unclear" | "incomplete";
  headline: string;
  reasons: string[];
  cssClass: string;
};

function decide(answers: Record<string, Answer | null>): Verdict {
  const ids = TRIGGERS.map((t) => t.id);
  const given = ids.filter((id) => answers[id] != null);
  if (given.length === 0) {
    return {
      status: "incomplete",
      headline: "Answer the three questions above.",
      reasons: [],
      cssClass: "bg-slate-50 border-slate-200 text-slate-700",
    };
  }
  const yes = ids.filter((id) => answers[id] === "yes");
  const unsure = ids.filter((id) => answers[id] === "unsure");

  if (yes.length > 0) {
    return {
      status: "required",
      headline: "A DPO is legally required.",
      reasons: [
        `${yes.length} trigger(s) answered 'yes' under UK GDPR Article 37(1).`,
        "DPO can be staff or external. They must be independent in their tasks, report to the highest management level, and have expertise in data protection law.",
        "Notify the ICO of the DPO's contact details and publish them.",
      ],
      cssClass: "bg-red-50 border-red-300 text-red-900",
    };
  }
  if (unsure.length > 0) {
    return {
      status: "unclear",
      headline: "Unclear — treat as required until you can rule it out.",
      reasons: [
        `${unsure.length} trigger(s) marked 'unsure'.`,
        "ICO guidance: if you're not sure whether you meet the threshold, document why, and consider appointing voluntarily. Voluntary appointment carries the same duties.",
        "Get written advice from a data protection specialist before recording 'not required'.",
      ],
      cssClass: "bg-amber-50 border-amber-300 text-amber-900",
    };
  }
  if (given.length < ids.length) {
    return {
      status: "incomplete",
      headline: "Answer the remaining trigger questions.",
      reasons: [`${given.length}/${ids.length} answered.`],
      cssClass: "bg-slate-50 border-slate-200 text-slate-700",
    };
  }
  return {
    status: "not-required",
    headline: "A DPO is not legally required.",
    reasons: [
      "All three triggers answered 'no'.",
      "You still need someone responsible for data protection compliance — typically a director or senior manager.",
      "Keep this decision record in case the ICO asks how you reached it (UK GDPR accountability principle).",
      "Re-run this check whenever your processing materially changes (new product, new data type, scaling up).",
    ],
    cssClass: "bg-emerald-50 border-emerald-300 text-emerald-900",
  };
}

function buildRecord(
  orgName: string,
  decidedBy: string,
  answers: Record<string, Answer | null>,
  notes: Record<string, string>,
  voluntary: boolean,
  verdict: Verdict,
): string {
  const lines: string[] = [
    `# DPO appointment decision record`,
    ``,
    `**Organisation:** ${orgName || "(not set)"}`,
    `**Decided by:** ${decidedBy || "(not set)"}`,
    `**Date:** ${new Date().toISOString().slice(0,10)}`,
    `**Outcome:** ${verdict.headline}`,
    voluntary ? `**Voluntary appointment:** yes (same duties apply as if mandatory)` : ``,
    ``,
    `## Assessment against UK GDPR Article 37(1)`,
    ``,
  ];
  TRIGGERS.forEach((t, i) => {
    lines.push(`### Trigger ${i + 1}: ${t.question}`);
    lines.push(`**Answer:** ${answers[t.id] ?? "(not answered)"}`);
    lines.push(`**Reasoning:** ${notes[t.id] || "(none recorded)"}`);
    lines.push(``);
  });
  lines.push(`## Conclusion`);
  verdict.reasons.forEach((r) => lines.push(`- ${r}`));
  lines.push(
    ``,
    `## Review trigger`,
    `Re-run this assessment if any of the following happen:`,
    `- New product, service, or processing activity is launched.`,
    `- We start handling a new category of personal data (especially health, biometric, criminal records, children's data).`,
    `- We scale up materially (more users, more data, new jurisdictions).`,
    `- The law or ICO guidance changes.`,
    ``,
    `_Not legal advice. Decision recorded in good faith based on the questions above._`
  );
  return lines.filter(Boolean).join("\n");
}
