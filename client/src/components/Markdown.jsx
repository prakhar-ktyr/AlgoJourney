import { Fragment } from "react";
import { Link } from "react-router-dom";
import katex from "katex";
import "katex/dist/katex.min.css";
import CodeBlock from "./CodeBlock";

/**
 * Lightweight markdown renderer for the small subset of markdown we author
 * inside problem resource files: paragraphs, unordered/ordered lists, inline
 * `code`, **bold**, *emphasis*, markdown headings, GitHub-style tables, and
 * fenced ```code blocks. Fenced blocks are rendered through the shared
 * CodeBlock component so they look consistent with the dedicated
 * reference-solution snippet.
 *
 * This is intentionally minimal — no link/image support — to keep the
 * bundle small and the parser predictable. If we need richer formatting
 * later we can swap this out for `react-markdown`.
 */
export default function Markdown({ source, className = "" }) {
  if (!source) return null;
  const blocks = parseBlocks(source);
  return (
    <div className={`space-y-4 text-gray-300 leading-relaxed ${className}`}>
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}

/**
 * Render a single line of inline markdown (no block parsing). Useful for
 * places that want `$math$`, `**bold**`, and `` `code` `` formatting but
 * cannot host a wrapping `<div>` (e.g. inside captions or table cells).
 */
export function MarkdownInline({ source }) {
  if (!source) return null;
  return <>{renderInline(String(source))}</>;
}

function parseBlocks(text) {
  const blocks = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block.
    const fence = line.match(/^```([A-Za-z+]*)\s*$/);
    if (fence) {
      const lang = fence[1] || "";
      const buf = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: "code", lang, code: buf.join("\n") });
      continue;
    }

    // Blank line — separator.
    if (!line.trim()) {
      i++;
      continue;
    }

    // Thematic break / horizontal rule (---, ***, ___).
    if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Markdown heading (### Title).
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({
        type: "heading",
        level: Math.min(heading[1].length, 6),
        text: heading[2].trim(),
      });
      i++;
      continue;
    }

    // GitHub-style table:
    //   | Col A | Col B |
    //   |-------|------:|
    //   | a1    | b1    |
    // Outer pipes are optional. The separator row controls column alignment
    // (`:---`, `---:`, `:---:`).
    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = splitTableRow(line);
      const align = parseTableAlignment(lines[i + 1]);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      blocks.push({ type: "table", header, align, rows });
      continue;
    }

    // List (- or * or 1.) — collect contiguous list items.
    const listMarker = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (listMarker) {
      const ordered = /\d+\./.test(listMarker[2]);
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (!m) {
          // Continuation line (indented or non-blank, non-marker) belongs to current item.
          if (items.length && lines[i].trim() && !/^```/.test(lines[i]) && /^\s+/.test(lines[i])) {
            items[items.length - 1] += "\n" + lines[i].trim();
            i++;
            continue;
          }
          break;
        }
        items.push(m[3]);
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // Blockquote and GFM Alerts (> [!NOTE], etc.)
    const blockquoteMatch = line.match(/^>\s?(.*)$/);
    if (blockquoteMatch) {
      const buf = [blockquoteMatch[1]];
      i++;
      while (i < lines.length) {
        const next = lines[i];
        if (!next.trim()) break;

        const nextMatch = next.match(/^>\s?(.*)$/);
        if (nextMatch) {
          buf.push(nextMatch[1]);
          i++;
        } else if (
          /^```/.test(next) ||
          /^(#{1,6})\s+/.test(next) ||
          /^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(next) ||
          /^(\s*)([-*]|\d+\.)\s+/.test(next) ||
          (next.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
        ) {
          break;
        } else {
          // Lazy continuation
          buf.push(next);
          i++;
        }
      }
      const bqText = buf.join("\n");
      const alertMatch = bqText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*\n|\s+)([\s\S]*)$/i);
      if (alertMatch) {
        blocks.push({ type: "alert", alertType: alertMatch[1].toUpperCase(), text: alertMatch[2].trim() });
      } else {
        blocks.push({ type: "blockquote", text: bqText.trim() });
      }
      continue;
    }

    // Paragraph — collect until blank line / fence / list / table / blockquote.
    const buf = [line];
    i++;
    while (i < lines.length) {
      const next = lines[i];
      if (
        !next.trim() ||
        /^```/.test(next) ||
        /^(#{1,6})\s+/.test(next) ||
        /^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(next) ||
        /^(\s*)([-*]|\d+\.)\s+/.test(next) ||
        /^>/.test(next) ||
        (next.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
      ) {
        break;
      }
      buf.push(next);
      i++;
    }
    blocks.push({ type: "paragraph", text: buf.join("\n") });
  }
  return blocks;
}

function renderBlock(block, key) {
  if (block.type === "code") {
    return <CodeBlock key={key} code={block.code} language={normalizeFenceLang(block.lang)} />;
  }
  if (block.type === "hr") {
    return <hr key={key} className="border-t border-gray-700 my-2" />;
  }
  if (block.type === "list") {
    const hasTaskItems = block.items.some((item) => /^\[[ x]\]\s/i.test(item));
    const Tag = block.ordered ? "ol" : "ul";
    const listClass = hasTaskItems
      ? "list-none ml-1 space-y-2"
      : block.ordered
        ? "list-decimal list-outside ml-6 space-y-2"
        : "list-disc list-outside ml-6 space-y-2";
    return (
      <Tag key={key} className={listClass}>
        {block.items.map((item, idx) => {
          const taskMatch = item.match(/^\[([ x])\]\s([\s\S]*)$/i);
          if (taskMatch) {
            const checked = taskMatch[1].toLowerCase() === "x";
            return (
              <li key={idx} className="text-gray-300 leading-relaxed flex items-start gap-2">
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 mt-0.5 rounded border flex-shrink-0 ${checked ? "bg-indigo-500 border-indigo-500 text-white" : "border-gray-600 text-transparent"}`}
                  aria-hidden="true"
                >
                  {checked && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span>{renderInline(taskMatch[2])}</span>
              </li>
            );
          }
          return (
            <li key={idx} className="text-gray-300 leading-relaxed">
              {renderInline(item)}
            </li>
          );
        })}
      </Tag>
    );
  }
  if (block.type === "heading") {
    const HeadingTag = `h${block.level}`;
    const HEADING_CLASS = {
      1: "text-3xl font-bold text-white",
      2: "text-2xl font-semibold text-white",
      3: "text-xl font-semibold text-white",
      4: "text-lg font-semibold text-white",
      5: "text-base font-semibold text-white",
      6: "text-sm font-semibold text-white uppercase tracking-wide",
    };
    return (
      <HeadingTag key={key} className={HEADING_CLASS[block.level]}>
        {renderInline(block.text)}
      </HeadingTag>
    );
  }
  if (block.type === "table") {
    const alignClass = (a) =>
      a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";
    return (
      <div key={key} className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              {block.header.map((cell, idx) => (
                <th
                  key={idx}
                  className={`px-3 py-2 font-semibold text-white ${alignClass(block.align[idx])}`}
                >
                  {renderInline(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-gray-800/60">
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className={`px-3 py-2 align-top text-gray-300 ${alignClass(block.align[cIdx])}`}
                  >
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === "blockquote") {
    return (
      <blockquote key={key} className="border-l-4 border-gray-600 pl-4 py-2 italic text-gray-400 bg-gray-800/20 rounded-r-md">
        <p className="whitespace-pre-line">{renderInline(block.text)}</p>
      </blockquote>
    );
  }

  if (block.type === "alert") {
    const ALERT_STYLES = {
      NOTE: "border-blue-500 bg-blue-500/10",
      TIP: "border-green-500 bg-green-500/10",
      IMPORTANT: "border-purple-500 bg-purple-500/10",
      WARNING: "border-yellow-500 bg-yellow-500/10",
      CAUTION: "border-red-500 bg-red-500/10",
    };
    const TITLE_COLORS = {
      NOTE: "text-blue-400",
      TIP: "text-green-400",
      IMPORTANT: "text-purple-400",
      WARNING: "text-yellow-400",
      CAUTION: "text-red-400",
    };
    const TITLE_ICONS = {
      NOTE: "ℹ️",
      TIP: "💡",
      IMPORTANT: "✨",
      WARNING: "⚠️",
      CAUTION: "🛑",
    };

    return (
      <div key={key} className={`border-l-4 pl-4 py-3 rounded-r-md ${ALERT_STYLES[block.alertType]}`}>
        <div className={`font-semibold mb-2 flex items-center gap-2 ${TITLE_COLORS[block.alertType]}`}>
          <span>{TITLE_ICONS[block.alertType]}</span>
          <span className="capitalize">{block.alertType.toLowerCase()}</span>
        </div>
        <div className="text-gray-300 whitespace-pre-line">
          {renderInline(block.text)}
        </div>
      </div>
    );
  }

  return (
    <p key={key} className="whitespace-pre-line">
      {renderInline(block.text)}
    </p>
  );
}

const FENCE_LANG_LABEL = {
  c: "C",
  cpp: "C++",
  "c++": "C++",
  cxx: "C++",
  java: "Java",
  python: "Python",
  py: "Python",
  javascript: "JavaScript",
  js: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  bash: "Bash",
  sh: "Shell",
  json: "JSON",
};

function normalizeFenceLang(raw) {
  if (!raw) return "";
  return FENCE_LANG_LABEL[raw.toLowerCase()] || raw;
}

/** True for a markdown table separator row like `|---|:--:|---:|`. */
function isTableSeparator(line) {
  if (!line || !line.includes("|")) return false;
  const cells = splitTableRow(line);
  if (!cells.length) return false;
  return cells.every((c) => /^:?-{3,}:?$/.test(c.trim()));
}

/** Split a markdown table row into cell strings, ignoring optional outer pipes. */
function splitTableRow(line) {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

/** Parse a separator row into per-column alignments: 'left' | 'center' | 'right'. */
function parseTableAlignment(line) {
  return splitTableRow(line).map((cell) => {
    const t = cell.trim();
    const left = t.startsWith(":");
    const right = t.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    return "left";
  });
}

/**
 * Render inline markdown: `code`, **bold**, *em* / _em_. Single combined pass
 * so that emphasis can wrap inline code (e.g. `**\`cin\` (input)**`).
 */
function renderInline(text) {
  const nodes = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];

    // Inline code: `...`
    if (ch === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        nodes.push({ type: "code", value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // Block math: $$...$$ (rendered inline with display style).
    if (ch === "$" && text[i + 1] === "$") {
      const end = text.indexOf("$$", i + 2);
      if (end !== -1) {
        nodes.push({
          type: "math",
          display: true,
          value: text.slice(i + 2, end).trim(),
        });
        i = end + 2;
        continue;
      }
    }

    // Inline math: $...$  (LaTeX). To avoid eating stray currency-style
    // dollar signs, require the closing `$` on the same line and no whitespace
    // immediately after the opening `$`.
    if (ch === "$" && text[i + 1] && text[i + 1] !== " " && text[i + 1] !== "$") {
      const end = findClosingDollar(text, i + 1);
      if (end !== -1) {
        nodes.push({
          type: "math",
          display: false,
          value: text.slice(i + 1, end).trim(),
        });
        i = end + 1;
        continue;
      }
    }

    // Bold: **...**
    if (ch === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        nodes.push({ type: "strong", children: renderInline(text.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    // Emphasis: *...* (single asterisk, not part of **) — require non-space after `*`.
    if (ch === "*" && text[i + 1] !== "*" && text[i + 1] && text[i + 1] !== " ") {
      const end = findClosing(text, i + 1, "*");
      if (end !== -1) {
        nodes.push({ type: "em", children: renderInline(text.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    // Emphasis: _..._
    if (ch === "_" && text[i + 1] && text[i + 1] !== " ") {
      const end = findClosing(text, i + 1, "_");
      if (end !== -1) {
        nodes.push({ type: "em", children: renderInline(text.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    // Link: [text](url) — `text` may contain inline code/emphasis but not
    // nested `]`. Skip placeholder hrefs of `#` so they render as plain text.
    if (ch === "[") {
      const closeBracket = text.indexOf("]", i + 1);
      if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          const label = text.slice(i + 1, closeBracket);
          const href = text.slice(closeBracket + 2, closeParen).trim();
          if (href && href !== "#") {
            nodes.push({ type: "link", href, children: renderInline(label) });
            i = closeParen + 1;
            continue;
          }
          if (href === "#") {
            // Strip placeholder links entirely — render only the label text.
            nodes.push(...renderInline(label).map((c) => ({ type: "node", value: c })));
            i = closeParen + 1;
            continue;
          }
        }
      }
    }

    // Plain text — accumulate until next special char.
    let j = i + 1;
    while (j < text.length && !isInlineSpecial(text[j])) j++;
    nodes.push({ type: "text", value: text.slice(i, j) });
    i = j;
  }

  return nodes.map((n, idx) => {
    if (n.type === "code") {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-gray-800/80 text-indigo-200 text-[0.875em] font-mono"
        >
          {n.value}
        </code>
      );
    }
    if (n.type === "strong") {
      return (
        <strong key={idx} className="font-semibold text-white">
          {n.children}
        </strong>
      );
    }
    if (n.type === "em") {
      return (
        <em key={idx} className="italic">
          {n.children}
        </em>
      );
    }
    if (n.type === "math") {
      const html = renderMath(n.value, n.display);
      const Tag = n.display ? "span" : "span";
      return (
        <Tag
          key={idx}
          className={n.display ? "katex-display-inline" : ""}
          // KaTeX produces sanitised HTML; safe to inject.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    if (n.type === "link") {
      const linkClass = "text-indigo-300 hover:text-indigo-200 underline underline-offset-2";
      if (isExternalHref(n.href)) {
        return (
          <a
            key={idx}
            href={n.href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {n.children}
          </a>
        );
      }
      return (
        <Link key={idx} to={n.href} className={linkClass}>
          {n.children}
        </Link>
      );
    }
    if (n.type === "node") {
      return <Fragment key={idx}>{n.value}</Fragment>;
    }
    return <Fragment key={idx}>{n.value}</Fragment>;
  });
}

function isInlineSpecial(ch) {
  return ch === "`" || ch === "*" || ch === "_" || ch === "$" || ch === "[";
}

/** External link if it has a scheme (`http:`, `https:`, `mailto:`, …) or starts with `//`. */
function isExternalHref(href) {
  return /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}

/** Find the next standalone closing marker (skipping inline code spans). */
function findClosing(text, start, marker) {
  let i = start;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "`") {
      const end = text.indexOf("`", i + 1);
      if (end === -1) return -1;
      i = end + 1;
      continue;
    }
    if (ch === marker) {
      // For `*`, ensure it's not part of a `**` bold marker.
      if (marker === "*" && text[i + 1] === "*") {
        i += 2;
        continue;
      }
      return i;
    }
    i++;
  }
  return -1;
}

/**
 * Find the matching closing `$` for inline math. Skips over inline code spans
 * (`` ` ``) so dollar signs inside code don't terminate the math span. Returns
 * -1 if no closing `$` is found on the rest of the text or if the candidate
 * looks like the start of a `$$` block delimiter.
 */
function findClosingDollar(text, start) {
  let i = start;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "`") {
      const end = text.indexOf("`", i + 1);
      if (end === -1) return -1;
      i = end + 1;
      continue;
    }
    if (ch === "$") {
      // `$$` is a display-math delimiter, not a closer for inline `$`.
      if (text[i + 1] === "$") return -1;
      // Don't allow whitespace just before the closing `$` (typical LaTeX rule).
      if (i > start && text[i - 1] === " ") return -1;
      return i;
    }
    i++;
  }
  return -1;
}

function renderMath(source, display) {
  try {
    return katex.renderToString(source, {
      displayMode: display,
      throwOnError: false,
      output: "html",
    });
  } catch {
    // Fall back to the literal source so authors can spot the broken formula.
    const escaped = source.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return display ? `$$${escaped}$$` : `$${escaped}$`;
  }
}
