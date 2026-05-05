import { useState, useRef, useEffect } from "react";

export default function TooltipTerm({ term, definition }) {
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(true);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // If too close to top, show below instead
      setAbove(rect.top > 120);
    }
  }, [open]);

  // Close on outside click (mobile-friendly)
  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [open]);

  return (
    <span className="relative inline-block">
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-describedby={open ? "tooltip-content" : undefined}
        className="border-b border-dotted border-blue-400 text-blue-300 cursor-help transition-colors hover:text-blue-200 hover:border-blue-300"
        onClick={() => setOpen(true)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {term}
      </span>
      {open && (
        <span
          ref={tooltipRef}
          id="tooltip-content"
          role="tooltip"
          className={`absolute z-50 left-1/2 -translate-x-1/2 w-64 sm:w-72 px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-gray-200 shadow-lg ${
            above ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <span className="block leading-relaxed">{definition}</span>
          <span
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 border-gray-600 rotate-45 ${
              above ? "top-full -mt-1 border-r border-b" : "bottom-full -mb-1 border-l border-t"
            }`}
          />
        </span>
      )}
    </span>
  );
}
