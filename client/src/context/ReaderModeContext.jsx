import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "reader-mode-prefs";

const THEMES = {
  dark: {
    label: "Dark",
    bg: "bg-gray-950",
    text: "text-gray-200",
    accent: "border-gray-800",
    toolbar: "bg-gray-900/95 border-gray-700",
  },
  light: {
    label: "Light",
    bg: "bg-white",
    text: "text-gray-900",
    accent: "border-gray-200",
    toolbar: "bg-gray-100/95 border-gray-300",
  },
  sepia: {
    label: "Sepia",
    bg: "bg-amber-50",
    text: "text-amber-950",
    accent: "border-amber-200",
    toolbar: "bg-amber-100/95 border-amber-300",
  },
  night: {
    label: "Night",
    bg: "bg-black",
    text: "text-gray-300",
    accent: "border-gray-900",
    toolbar: "bg-gray-950/95 border-gray-800",
  },
};

const FONT_FAMILIES = {
  sans: { label: "Sans", className: "font-sans" },
  serif: { label: "Serif", className: "font-serif" },
  mono: { label: "Mono", className: "font-mono" },
};

const FONT_SIZES = {
  sm: { label: "S", className: "text-sm", prose: "prose-sm" },
  base: { label: "M", className: "text-base", prose: "prose-base" },
  lg: { label: "L", className: "text-lg", prose: "prose-lg" },
  xl: { label: "XL", className: "text-xl", prose: "prose-xl" },
};

const DEFAULT_PREFS = {
  theme: "dark",
  fontFamily: "sans",
  fontSize: "base",
};

function loadPrefs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFS, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_PREFS;
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

const ReaderModeContext = createContext(null);

export function ReaderModeProvider({ children }) {
  const [active, setActive] = useState(false);
  const [prefs, setPrefs] = useState(loadPrefs);

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  // Apply reader mode classes to documentElement for CSS overrides
  useEffect(() => {
    const cl = document.documentElement.classList;
    // Clean up all reader mode classes
    cl.remove(
      "reader-mode-active",
      "reader-mode-dark",
      "reader-mode-light",
      "reader-mode-sepia",
      "reader-mode-night",
    );
    if (active) {
      cl.add("reader-mode-active");
      cl.add(`reader-mode-${prefs.theme}`);
    }
    return () => {
      cl.remove(
        "reader-mode-active",
        "reader-mode-dark",
        "reader-mode-light",
        "reader-mode-sepia",
        "reader-mode-night",
      );
    };
  }, [active, prefs.theme]);

  // Escape key exits reader mode
  useEffect(() => {
    if (!active) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setActive(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [active]);

  const enter = useCallback(() => setActive(true), []);
  const exit = useCallback(() => setActive(false), []);

  const setTheme = useCallback((theme) => {
    setPrefs((p) => ({ ...p, theme }));
  }, []);

  const setFontFamily = useCallback((fontFamily) => {
    setPrefs((p) => ({ ...p, fontFamily }));
  }, []);

  const setFontSize = useCallback((fontSize) => {
    setPrefs((p) => ({ ...p, fontSize }));
  }, []);

  const theme = THEMES[prefs.theme] || THEMES.dark;
  const fontFamily = FONT_FAMILIES[prefs.fontFamily] || FONT_FAMILIES.sans;
  const fontSize = FONT_SIZES[prefs.fontSize] || FONT_SIZES.base;

  return (
    <ReaderModeContext.Provider
      value={{
        active,
        enter,
        exit,
        prefs,
        setTheme,
        setFontFamily,
        setFontSize,
        theme,
        fontFamily,
        fontSize,
        THEMES,
        FONT_FAMILIES,
        FONT_SIZES,
      }}
    >
      {children}
    </ReaderModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useReaderMode() {
  const ctx = useContext(ReaderModeContext);
  if (!ctx) {
    throw new Error("useReaderMode must be used within ReaderModeProvider");
  }
  return ctx;
}
