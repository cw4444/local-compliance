"use client";

import { useState } from "react";
import { copyText, downloadText } from "@/lib/io";

type Props = {
  title?: string;
  filename: string;
  mime?: string;
  body: string;
  containsPersonalData?: boolean;
};

export function OutputCard({ title, filename, mime = "text/markdown", body, containsPersonalData }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const ok = await copyText(body);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="font-medium">{title ?? "Output"}</h3>
        <div className="flex gap-2">
          <button
            onClick={onCopy}
            className="text-xs px-3 py-1 rounded border border-slate-300 hover:bg-slate-100"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() => downloadText(filename, body, mime)}
            className="text-xs px-3 py-1 rounded border border-slate-300 hover:bg-slate-100"
          >
            Download
          </button>
        </div>
      </div>
      {containsPersonalData && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2">
          ⚠ This output may contain personal data once you fill it in. Store it where you already store HR records — not in a random AI chatbot.
        </p>
      )}
      <pre className="text-xs whitespace-pre-wrap font-mono bg-slate-50 border border-slate-200 rounded p-3 overflow-x-auto">
        {body}
      </pre>
    </section>
  );
}
