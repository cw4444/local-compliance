export function Banner() {
  return (
    <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2">
        <span aria-hidden>⚠</span>
        <span>
          Runs entirely in your browser. Nothing is uploaded.{" "}
          <strong>Don&apos;t paste real employee data into random SaaS chatbots</strong> — you are, as the
          saying goes, an absolute weapon if you do.
        </span>
      </div>
    </div>
  );
}
