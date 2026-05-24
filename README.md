# Local Compliance

A small, browser-only helper for UK small businesses. It walks you through five common HR / compliance jobs and spits out a tidy Markdown or CSV file you can save, print, or hand to your accountant.

**It runs entirely on your own computer. Nothing is uploaded anywhere. No accounts. No tracking.**

Not legal advice. Think of it as a tidy notebook with the right questions printed in it, so you arrive at your call with HR / legal / your accountant already organised.

---

## What's inside

| Tool | What it does |
| --- | --- |
| **Holiday entitlement explainer** | Works out how many days off someone is owed under the UK statutory minimum (5.6 weeks). Handles part-timers, mid-year starters, and irregular-hours workers. Shows the working. |
| **Absence policy checker** | Three things in one place: a quick "is this person eligible for Statutory Sick Pay?" check, a Bradford Factor calculator, and a return-to-work meeting template you can fill in. |
| **Onboarding document checklist** | Tick a few boxes about the role (driving? DBS? remote? handles personal data?) and it produces a full checklist of what you need on file — right-to-work, contract, pension auto-enrolment, the lot. |
| **Data retention prompts** | A starter schedule of how long you're supposed to keep different records (payroll, HR files, CCTV, marketing consent, etc.) with the legal basis next to each. Edit anything, then export. |
| **Risk log generator** | Add risks, score them (likelihood × impact), assign an owner and review date. Exports as CSV or Markdown. |

Every output has a **Copy** button (sticks it on your clipboard) and a **Download** button (saves a file).

---

## How to run it

You need [Node.js](https://nodejs.org) installed (version 18 or newer). If you don't have it, install it from the link — it's a normal app installer.

Open a terminal in this folder and type these two commands, one after the other:

```
npm install
npm run dev
```

The first command downloads what the app needs (only the first time). The second starts the app.

When it's ready, you'll see a line like:

```
Local: http://localhost:3000
```

Open that address in your browser. That's it.

To stop it, go back to the terminal and press `Ctrl + C`.

### Running it again later

You only need `npm install` the first time. After that, just `npm run dev`.

---

## Where does the data go?

**Nowhere.** Everything you type stays in your browser tab. Close the tab and it's gone. The app has no server, no database, no analytics, no third-party scripts. The files you download are saved by your browser to your normal Downloads folder, like any other download.

That is the whole point — so you can put real names, real sickness records, and real risks into it without sending them to some company you've never met.

### A grumpy note about AI chatbots

Pasting employee data into a public AI chatbot (ChatGPT, Gemini, Claude.ai, Copilot, whatever) is a data transfer. Under UK GDPR, you would need a lawful basis, a contract with the provider, and usually a Data Processing Agreement. Free consumer chatbots don't give you any of that.

If you wouldn't email an unsigned employment contract to a random vendor with no NDA, don't paste it into a chatbot with no contract either. Use this thing locally instead.

---

## Limitations

- This is a helper, not a lawyer. UK statutory rates change (usually every April). Defaults included here are correct at time of writing — verify on [gov.uk](https://www.gov.uk) before relying on them.
- The retention schedule and onboarding checklist are starting points. Your specific industry may have extra obligations (financial services, healthcare, education, etc.).
- The SSP and holiday calculators handle the common cases. Edge cases (term-time only workers, complex shift patterns, TUPE transfers, etc.) need a human.

If you're in doubt, the questions in the outputs are the right ones to ask. Take them to your HR adviser, accountant, or employment solicitor.

---

## Credits

Built by [Claude](https://www.anthropic.com/claude), an AI assistant from [Anthropic](https://www.anthropic.com), at the request of a UK small-business owner who was tired of re-reading gov.uk at 11pm on a Tuesday.

Licence: MIT (see `LICENSE`). Use it, fork it, change it, ship it — whatever helps.
