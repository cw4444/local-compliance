import Link from "next/link";

const tools = [
  {
    href: "/holiday",
    title: "Holiday entitlement explainer",
    blurb: "Work out statutory leave for full-time, part-time, and irregular-hours staff. Pro-rates mid-year starters.",
  },
  {
    href: "/absence",
    title: "Absence policy checker",
    blurb: "SSP eligibility prompts, Bradford Factor calculator, return-to-work questions.",
  },
  {
    href: "/onboarding",
    title: "Onboarding document checklist",
    blurb: "Right-to-work, starter checklist, pension auto-enrolment, contract, GDPR notice — generates a per-hire list.",
  },
  {
    href: "/retention",
    title: "Data retention prompts",
    blurb: "GDPR-aligned default retention periods per record type. Builds a schedule you can adopt or argue with.",
  },
  {
    href: "/risk-log",
    title: "Risk log generator",
    blurb: "Add hazards, score likelihood × impact, assign owners and review dates. Export CSV.",
  },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-2">Organise the questions before you call HR / legal / your accountant.</h2>
        <p className="text-slate-700 max-w-prose">
          This is a local, browser-side helper. It doesn&apos;t store anything on a server, doesn&apos;t phone home, and
          isn&apos;t legal advice. It is meant to save you from re-reading gov.uk at 11pm on a Tuesday by giving you
          structured starting points for the most common UK small-business compliance jobs.
        </p>
      </section>
      <ul className="grid sm:grid-cols-2 gap-3">
        {tools.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="block bg-white border border-slate-200 hover:border-slate-400 rounded-lg p-4"
            >
              <div className="font-medium">{t.title}</div>
              <div className="text-sm text-slate-600 mt-1">{t.blurb}</div>
            </Link>
          </li>
        ))}
      </ul>
      <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
        <p className="font-medium mb-1">A note on AI chatbots and employee data</p>
        <p>
          Pasting names, sickness records, performance notes, or anything else identifying a specific person into a
          third-party chatbot is a data transfer under UK GDPR. If you wouldn&apos;t email it to a random vendor without a
          contract, don&apos;t paste it into a chatbot without one either. This app keeps everything in your browser.
        </p>
      </section>
    </div>
  );
}
