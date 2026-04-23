import { useEffect, useRef, useState } from "react";

/**
 * Read-only code block styled like the snippet panes used on popular dev sites
 * (GitHub, Stack Overflow, MDN, Stripe docs). Has a thin header strip with the
 * language name and an always-visible copy icon so the affordance never hides
 * behind a hover state. Falls back to a hidden textarea + execCommand when the
 * async clipboard API is unavailable.
 */
export default function CodeBlock({
  code,
  language,
  testId,
  showHeader = true,
  className = "",
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    let ok = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1800);
    }
  };

  const copyLabel = language
    ? `Copy ${language} code to clipboard`
    : "Copy code to clipboard";

  return (
    <div
      className={`rounded-lg border border-gray-800 bg-[#0d1117] overflow-hidden shadow-sm ${className}`}
    >
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800">
          <span className="text-xs font-medium text-gray-400 tracking-wide uppercase">
            {language || "Code"}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copyLabel}
            title={copied ? "Copied!" : "Copy"}
            className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-emerald-400" />
            ) : (
              <CopyIcon className="w-4 h-4" />
            )}
            <span className="sr-only sm:not-sr-only">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      )}
      {!showHeader && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copyLabel}
          title={copied ? "Copied!" : "Copy"}
          className="absolute top-2 right-2 z-10 inline-flex items-center justify-center w-7 h-7 rounded bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700 transition focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {copied ? (
            <CheckIcon className="w-4 h-4 text-emerald-400" />
          ) : (
            <CopyIcon className="w-4 h-4" />
          )}
        </button>
      )}
      <pre
        data-testid={testId}
        className="px-4 py-4 overflow-x-auto text-[13px] leading-relaxed text-gray-100 font-mono"
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function CopyIcon({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
