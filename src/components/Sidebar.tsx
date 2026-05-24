import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/holiday", label: "Holiday entitlement" },
  { href: "/absence", label: "Absence policy check" },
  { href: "/onboarding", label: "Onboarding checklist" },
  { href: "/toil", label: "TOIL tracker" },
  { href: "/retention", label: "Data retention" },
  { href: "/dpo", label: "Do we need a DPO?" },
  { href: "/risk-log", label: "Risk log" },
];

export function Sidebar() {
  return (
    <nav className="text-sm">
      <ul className="space-y-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block rounded px-3 py-2 hover:bg-slate-200 text-slate-800"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-slate-500 px-3">
        Not legal advice. Helps you organise the right questions before you call HR / legal / your accountant.
      </p>
    </nav>
  );
}
