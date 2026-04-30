import { Fragment } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import CodeBlock from "./CodeBlock";

/**
 * Lightweight markdown renderer for the small subset of markdown we author
 * inside problem resource files: paragraphs, unordered/ordered lists, inline
 * `code`, **bold**, *emphasis*, markdown headings, and fenced ```code blocks.
 * Fenced blocks are
 * rendered through the shared CodeBlock component so they look consistent
 * with the dedicated reference-solution snippet.
 *
 * This is intentionally minimal — no link/image/table support — to
 * keep the bundle small and the parser predictable. If we need richer
 * formatting later we can swap this out for `react-markdown`.
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

    // List (- or * or 1.) — collect contiguous list items.
    const listMarker = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (listMarker) {
      const ordered = /\d+\./.test(listMarker[2]);
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (!m) {
          // Continuation line (indented or non-blank, non-marker) belongs to current item.
          if (
            items.length &&
            lines[i].trim() &&
            !/^```/.test(lines[i]) &&
            /^\s+/.test(lines[i])
          ) {
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

    // Paragraph — collect until blank line / fence / list.
    const buf = [line];
    i++;
    while (i < lines.length) {
      const next = lines[i];
      if (
        !next.trim() ||
        /^```/.test(next) ||
        /^(#{1,6})\s+/.test(next) ||
        /^(\s*)([-*]|\d+\.)\s+/.test(next)
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
    return (
      <CodeBlock
        key={key}
        code={block.code}
        language={normalizeFenceLang(block.lang)}
      />
    );
  }
  if (block.type === "list") {
    const Tag = block.ordered ? "ol" : "ul";
    const listClass = block.ordered
      ? "list-decimal list-outside ml-6 space-y-2"
      : "list-disc list-outside ml-6 space-y-2";
    return (
      <Tag key={key} className={listClass}>
        {block.items.map((item, idx) => (
          <li key={idx} className="text-gray-300 leading-relaxed">
            {renderInline(item)}
          </li>
        ))}
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
  return (
    <p key={key} className="whitespace-pre-line">
      {renderInline(block.text)}
    </p>
  );
}

const FENCE_LANG_LABEL = {
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
    return <Fragment key={idx}>{n.value}</Fragment>;
  });
}

function isInlineSpecial(ch) {
  return ch === "`" || ch === "*" || ch === "_" || ch === "$";
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
    const escaped = source
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return display ? `$$${escaped}$$` : `$${escaped}$`;
  }
}
