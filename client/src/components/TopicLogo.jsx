import { useMemo } from "react";
import {
  siC,
  siCplusplus,
  siPython,
  siJavascript,
  siTypescript,
  siGo,
  siRust,
  siHtml5,
  siCss,
  siReact,
  siNodedotjs,
  siNextdotjs,
  siGraphql,
  siAndroid,
  siLinux,
  siDocker,
  siGnubash,
  siMysql,
  siMongodb,
  siScikitlearn,
  siTensorflow,
  siOpencv,
  siPandas,
  siJest,
  siGit,
  siEthereum,
} from "simple-icons";
import javaLogo from "../assets/logos/java.svg";

/**
 * Branded "logo" badge for a tutorial topic.
 *
 * Logos are bundled with the app — there are no runtime CDN requests:
 *   - Most marks come from `simple-icons` (CC0). We only import the icons
 *     we actually reference, so Vite tree-shakes the rest out of the bundle.
 *   - Java (which Simple Icons no longer ships for trademark reasons) is
 *     loaded from a local SVG file under `assets/logos/` (Devicon, MIT).
 *   - Topics with no recognised brand (e.g. "DSA", "System Design") render
 *     a coloured monogram tile so the catalogue still feels uniform.
 */

const SIZE_CLASS = {
  sm: { box: "w-7 h-7 text-[11px]", img: "w-4 h-4" },
  md: { box: "w-10 h-10 text-sm", img: "w-6 h-6" },
  lg: { box: "w-14 h-14 text-base", img: "w-8 h-8" },
};

// kind: "si"  -> simple-icons object (we render its path inline as <svg>)
//       "img" -> bundled image asset (we render an <img src>)
//       "mono" -> monogram-only fallback (we render brand.label)
// Background colours are picked to give the white-foreground silhouette a
// readable, on-brand backdrop. `fg` is only used for monogram tiles.
const BRAND = {
  // Programming languages
  c: { kind: "si", icon: siC, bg: "#03599C", fg: "#FFFFFF" },
  cpp: { kind: "si", icon: siCplusplus, bg: "#00599C", fg: "#FFFFFF" },
  java: { kind: "img", src: javaLogo, bg: "#FFFFFF" },
  python: { kind: "si", icon: siPython, bg: "#3776AB", fg: "#FFFFFF" },
  javascript: {
    kind: "si",
    icon: siJavascript,
    bg: "#F7DF1E",
    fg: "#1F2937",
    fgHex: "#1F2937",
  },
  typescript: { kind: "si", icon: siTypescript, bg: "#3178C6", fg: "#FFFFFF" },
  go: { kind: "si", icon: siGo, bg: "#00ADD8", fg: "#FFFFFF" },
  rust: { kind: "si", icon: siRust, bg: "#0F172A", fg: "#FFFFFF" },

  // Web
  html: { kind: "si", icon: siHtml5, bg: "#E34F26", fg: "#FFFFFF" },
  css: { kind: "si", icon: siCss, bg: "#1572B6", fg: "#FFFFFF" },
  react: { kind: "si", icon: siReact, bg: "#0F172A", fgHex: "#61DAFB" },
  nodejs: { kind: "si", icon: siNodedotjs, bg: "#339933", fg: "#FFFFFF" },
  nextjs: { kind: "si", icon: siNextdotjs, bg: "#000000", fg: "#FFFFFF" },
  "web-apis-rest": { kind: "mono", label: "API", bg: "#4F46E5", fg: "#FFFFFF" },
  graphql: { kind: "si", icon: siGraphql, bg: "#0F172A", fgHex: "#E10098" },
  "mobile-development": {
    kind: "si",
    icon: siAndroid,
    bg: "#3DDC84",
    fg: "#FFFFFF",
  },

  // Core CS
  dsa: { kind: "mono", label: "DSA", bg: "#7C3AED", fg: "#FFFFFF" },
  oop: { kind: "mono", label: "OOP", bg: "#7C3AED", fg: "#FFFFFF" },
  "discrete-mathematics": {
    kind: "mono",
    label: "DM",
    bg: "#7C3AED",
    fg: "#FFFFFF",
  },
  "theory-of-computation": {
    kind: "mono",
    label: "ToC",
    bg: "#7C3AED",
    fg: "#FFFFFF",
  },
  "compiler-design": {
    kind: "mono",
    label: "CC",
    bg: "#7C3AED",
    fg: "#FFFFFF",
  },
  "computer-architecture": {
    kind: "mono",
    label: "CA",
    bg: "#7C3AED",
    fg: "#FFFFFF",
  },

  // Systems & infra
  "operating-systems": {
    kind: "si",
    icon: siLinux,
    bg: "#1F2937",
    fgHex: "#FFFFFF",
  },
  "computer-networks": {
    kind: "mono",
    label: "CN",
    bg: "#EA580C",
    fg: "#FFFFFF",
  },
  "distributed-systems": {
    kind: "mono",
    label: "DS",
    bg: "#EA580C",
    fg: "#FFFFFF",
  },
  "cloud-computing": {
    kind: "mono",
    label: "Cld",
    bg: "#0EA5E9",
    fg: "#FFFFFF",
  },
  "devops-cicd": {
    kind: "si",
    icon: siDocker,
    bg: "#2496ED",
    fg: "#FFFFFF",
  },
  cybersecurity: { kind: "mono", label: "Sec", bg: "#DC2626", fg: "#FFFFFF" },
  "linux-shell": {
    kind: "si",
    icon: siGnubash,
    bg: "#111827",
    fgHex: "#A3E635",
  },

  // Databases
  dbms: { kind: "mono", label: "DB", bg: "#0891B2", fg: "#FFFFFF" },
  sql: { kind: "si", icon: siMysql, bg: "#4479A1", fg: "#FFFFFF" },
  "nosql-mongodb": {
    kind: "si",
    icon: siMongodb,
    bg: "#47A248",
    fg: "#FFFFFF",
  },

  // AI / ML
  "artificial-intelligence": {
    kind: "mono",
    label: "AI",
    bg: "#DB2777",
    fg: "#FFFFFF",
  },
  "machine-learning": {
    kind: "si",
    icon: siScikitlearn,
    bg: "#F7931E",
    fg: "#FFFFFF",
  },
  "deep-learning": {
    kind: "si",
    icon: siTensorflow,
    bg: "#FF6F00",
    fg: "#FFFFFF",
  },
  nlp: { kind: "mono", label: "NLP", bg: "#DB2777", fg: "#FFFFFF" },
  "computer-vision": {
    kind: "si",
    icon: siOpencv,
    bg: "#5C3EE8",
    fg: "#FFFFFF",
  },
  "data-science": {
    kind: "si",
    icon: siPandas,
    bg: "#150458",
    fg: "#FFFFFF",
  },
  "math-for-ml": { kind: "mono", label: "∑", bg: "#DB2777", fg: "#FFFFFF" },

  // SWE
  "system-design": { kind: "mono", label: "SD", bg: "#D97706", fg: "#FFFFFF" },
  "design-patterns": {
    kind: "mono",
    label: "DP",
    bg: "#D97706",
    fg: "#FFFFFF",
  },
  "software-engineering": {
    kind: "mono",
    label: "SE",
    bg: "#D97706",
    fg: "#FFFFFF",
  },
  "testing-qa": { kind: "si", icon: siJest, bg: "#C21325", fg: "#FFFFFF" },
  "git-version-control": {
    kind: "si",
    icon: siGit,
    bg: "#F05032",
    fg: "#FFFFFF",
  },

  // Emerging
  blockchain: {
    kind: "si",
    icon: siEthereum,
    bg: "#3C3C3D",
    fg: "#FFFFFF",
  },
  "quantum-computing": {
    kind: "mono",
    label: "Q",
    bg: "#9333EA",
    fg: "#FFFFFF",
  },
};

// Tailwind category colour → hex fallback (kept in sync with topics.js).
const CATEGORY_BG = {
  "bg-blue-500": "#3B82F6",
  "bg-emerald-500": "#10B981",
  "bg-violet-500": "#8B5CF6",
  "bg-orange-500": "#F97316",
  "bg-cyan-500": "#06B6D4",
  "bg-pink-500": "#EC4899",
  "bg-amber-500": "#F59E0B",
  "bg-rose-500": "#F43F5E",
};

function fallbackFor(topic) {
  const bg = CATEGORY_BG[topic?.color] || "#374151";
  const label = (topic?.name || "?").trim().charAt(0).toUpperCase();
  return { kind: "mono", label, bg, fg: "#FFFFFF" };
}

export default function TopicLogo({ topic, size = "md", className = "" }) {
  const brand = BRAND[topic?.slug] || fallbackFor(topic);
  const sizing = SIZE_CLASS[size] || SIZE_CLASS.md;
  const ariaLabel = `${topic?.name || "Topic"} logo`;

  // simple-icons exports an SVG `path` (24x24 viewBox). Memo the JSX so we
  // don't recompute it on every parent re-render of large topic grids.
  const svgEl = useMemo(() => {
    if (brand.kind !== "si") return null;
    const fill = brand.fgHex || "#FFFFFF";
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={sizing.img}
        aria-hidden="true"
        focusable="false"
      >
        <path d={brand.icon.path} fill={fill} />
      </svg>
    );
  }, [brand, sizing.img]);

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center rounded-md font-bold leading-none shrink-0 select-none shadow-sm ring-1 ring-black/20 overflow-hidden ${sizing.box} ${className}`}
      style={{ backgroundColor: brand.bg, color: brand.fg }}
    >
      {brand.kind === "si" && svgEl}
      {brand.kind === "img" && (
        <img src={brand.src} alt="" aria-hidden="true" className={sizing.img} loading="lazy" />
      )}
      {brand.kind === "mono" && brand.label}
    </span>
  );
}
