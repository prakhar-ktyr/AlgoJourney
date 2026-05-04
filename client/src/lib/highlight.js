import { createHighlighter } from "shiki";

/**
 * Shared Shiki highlighter instance using dual-theme CSS variables.
 * Themes: GitHub Dark Dimmed (default/dark/night) and GitHub Light (light/sepia).
 * Uses lazy initialization — the highlighter is created on first use.
 */

let highlighterPromise = null;

const SHIKI_LANGS = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "c",
  "rust",
  "go",
  "html",
  "css",
  "json",
  "bash",
  "sql",
  "markdown",
  "yaml",
  "toml",
];

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark-dimmed", "github-light"],
      langs: SHIKI_LANGS,
    });
  }
  return highlighterPromise;
}

/**
 * Highlight code and return HTML with CSS variable-based theming.
 * Returns null if the language is not supported or highlighting fails.
 */
export async function highlightCode(code, lang) {
  try {
    const highlighter = await getHighlighter();
    const normalizedLang = normalizeLang(lang);
    if (!normalizedLang) return null;

    const html = highlighter.codeToHtml(code, {
      lang: normalizedLang,
      themes: {
        dark: "github-dark-dimmed",
        light: "github-light",
      },
      defaultColor: "dark",
      cssVariablePrefix: "--shiki-",
    });
    return html;
  } catch {
    return null;
  }
}

/** Map language labels used in this project to Shiki language IDs */
function normalizeLang(lang) {
  if (!lang) return null;
  const lower = lang.toLowerCase().trim();
  const MAP = {
    "c++": "cpp",
    "c#": "csharp",
    js: "javascript",
    ts: "typescript",
    py: "python",
    rb: "ruby",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    yml: "yaml",
    md: "markdown",
  };
  const resolved = MAP[lower] || lower;
  if (SHIKI_LANGS.includes(resolved)) return resolved;
  return null;
}
