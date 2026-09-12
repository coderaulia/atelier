// @ts-nocheck
import React from 'react';

const Paperclip = ({ size = 70, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 70 70" fill="none">
    <circle cx="35" cy="35" r="34" stroke={color} strokeWidth="1.5" />
    <path d="M22 35 L46 35 M40 28 L48 35 L40 42" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Chevron = ({ size = 70, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 70 70" fill="none">
    <circle cx="35" cy="35" r="34" stroke={color} strokeWidth="1.5" />
    <path d="M28 22 L42 35 L28 48" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowOut = ({ size = 64, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="31" stroke={color} strokeWidth="1.5" />
    <path d="M24 40 L40 24 M28 24 L40 24 L40 36" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Asterisk = ({ size = 64, color = "var(--vc-red)" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <g stroke={color} strokeWidth="5.5" strokeLinecap="round">
      <line x1="32" y1="8" x2="32" y2="56" />
      <line x1="11.2" y1="20" x2="52.8" y2="44" />
      <line x1="11.2" y1="44" x2="52.8" y2="20" />
    </g>
  </svg>
);

const XMark = ({ size = 80, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <path d="M14 14 L66 66 M66 14 L14 66" stroke={color} strokeWidth="6" strokeLinecap="round" />
  </svg>
);

// Hand-drawn ellipse circling text — pass children, optional rotate
const HandCircle = ({ children, color = "var(--vc-red)", padding = "0.05em 0.25em", rotation = -2 }) => (
  <span style={{ position: "relative", padding, display: "inline-block" }}>
    {children}
    <svg style={{ position: "absolute", inset: -8, width: "calc(100% + 16px)", height: "calc(100% + 16px)", pointerEvents: "none", transform: `rotate(${rotation}deg)` }} viewBox="0 0 100 50" preserveAspectRatio="none">
      <path d="M 6 25 C 8 8, 50 4, 92 12 C 98 14, 96 30, 88 38 C 70 46, 22 48, 8 38 C 2 30, 4 18, 10 14" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  </span>
);

const Underscribble = ({ children, color = "var(--vc-red)" }) => (
  <span style={{ position: "relative", display: "inline-block" }}>
    {children}
    <svg style={{ position: "absolute", left: 0, right: 0, bottom: "-0.15em", width: "100%", height: "0.25em" }} viewBox="0 0 100 12" preserveAspectRatio="none">
      <path d="M 1 6 Q 25 1, 50 7 T 99 4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  </span>
);

const PhotoSlot = ({ label = "Photo · drag image here", ratio, bg = "#1a1a1a", color = "#777", style }) => (
  <div style={{
    background: `repeating-linear-gradient(135deg, ${bg} 0 12px, #222 12px 24px)`,
    color, fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.1em",
    textTransform: "uppercase", display: "grid", placeItems: "center",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, ...style
  }}>
    <span>{label}</span>
  </div>
);

const CrescentMark = ({ size = 56, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M 32 6 A 26 26 0 1 0 32 58 A 18 26 0 1 1 32 6 Z" fill={color} />
  </svg>
);

/* Vanaila label — "[ 03 ] LABEL TEXT" */
const VLabel = ({ num, text, color, style }) => (
  <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase", color, ...style }}>
    {num != null && <span style={{ opacity: 0.55 }}>[ </span>}
    {num != null && <span>{String(num).padStart(2, "0")} </span>}
    {num != null && <span style={{ opacity: 0.55 }}>] </span>}
    {text}
  </span>
);

/* Bottom-bar branding strip shared by many templates */
const VFooter = ({ brand, color = "var(--vc-ink)", borderColor, useLightLogo }) => {
  const isLightText = useLightLogo || (
    color === "var(--vc-cream)" ||
    color === "#fff" ||
    color === "#ffffff" ||
    (color === "currentColor" && borderColor?.includes("rgba(236,230,214"))
  );
  const logoSrc = (isLightText && brand.logoLight) ? brand.logoLight : brand.logo;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      paddingTop: 22, borderTop: borderColor ? `1.5px solid ${borderColor}` : "1.5px solid currentColor",
      color,
    }}>
      {logoSrc && brand.logoEnabled !== false
        ? <img src={logoSrc} alt={brand.studioName || "logo"} style={{ height: 28, width: "auto", maxWidth: 120, objectFit: "contain" }} />
        : <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase" }}>{brand.studioName || "Studio"}</span>
      }
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>
        {brand.handle || "@studio"}
      </span>
    </div>
  );
};

/* Dynamic font size scaler for preventing text clipping, mid-word breaking, and ensuring balanced editorial rendering */
export function getDynamicFontSize(
  text: string | undefined | null,
  baseSize: number,
  maxCharsAtBase: number = 5,
  minSize: number = Math.max(16, Math.round(baseSize * 0.25)),
  availableWidth: number = 880
): number {
  const str = String(text ?? "").trim();
  if (!str) return baseSize;
  const len = str.length;

  // 1. General length-based scaling
  let size = baseSize;
  if (len > maxCharsAtBase && maxCharsAtBase > 0) {
    const scale = maxCharsAtBase / len;
    size = Math.round(baseSize * Math.pow(scale, 0.88));
  }

  // 2. Word-boundary protection: Guarantee no individual word exceeds availableWidth
  const words = str.split(/\s+/).filter(Boolean);
  let longestWordLen = 0;
  for (const w of words) {
    if (w.length > longestWordLen) longestWordLen = w.length;
  }

  if (longestWordLen > 0) {
    // Average bold character width is ~0.62em. To guarantee the longest word fits on one line:
    // longestWordLen * fontSize * 0.62 <= availableWidth
    const maxWordSize = Math.floor(availableWidth / (longestWordLen * 0.62));
    if (size > maxWordSize) {
      size = maxWordSize;
    }
  }

  // 3. Single-line hero text constraint: If text is a single word or short hero (<= 2 words),
  // ensure the full string fits within availableWidth without character wrapping
  if (words.length <= 2 && len > 0) {
    const maxFullTextSize = Math.floor(availableWidth / (len * 0.62));
    if (size > maxFullTextSize) {
      size = maxFullTextSize;
    }
  }

  // Floor safeguard: ensure minSize does not force overflow if the word is long
  const maxSafeFloor = longestWordLen > 0 ? Math.floor(availableWidth / (longestWordLen * 0.62)) : minSize;
  const effectiveMin = Math.min(minSize, maxSafeFloor);
  return Math.max(effectiveMin, size);
}

/* Theme options for template customization */
export const THEME_OPTIONS = [
  { value: "", label: "Cream (default)" },
  { value: "ink", label: "Ink / Dark" },
  { value: "blue", label: "Sapphire Blue" },
  { value: "sage", label: "Sage / Matcha" },
  { value: "mauve", label: "Lavender / Mauve" },
  { value: "peach", label: "Peach / Rose" },
];

/* Centralized theme palette resolver */
export function getThemeColors(themeName?: string) {
  switch (themeName) {
    case "ink":
      return {
        bg: "var(--vc-ink)",
        fg: "var(--vc-cream)",
        muted: "rgba(236,230,214,0.65)",
        cardBg: "rgba(255,255,255,0.06)",
        cardBorder: "rgba(255,255,255,0.14)",
        ringBorder: "var(--vc-red)",
        accent: "var(--vc-red)",
        borderColor: "rgba(236,230,214,0.2)",
        tagBg: "rgba(255,255,255,0.1)",
        tagFg: "var(--vc-cream)",
        btnBg: "var(--vc-red)",
        btnFg: "#FFFFFF",
      };
    case "blue":
      return {
        bg: "var(--vc-blue)",
        fg: "#FFFFFF",
        muted: "rgba(255,255,255,0.72)",
        cardBg: "rgba(255,255,255,0.08)",
        cardBorder: "rgba(255,255,255,0.2)",
        ringBorder: "var(--vc-lime)",
        accent: "var(--vc-lime)",
        borderColor: "rgba(255,255,255,0.22)",
        tagBg: "rgba(255,255,255,0.12)",
        tagFg: "#FFFFFF",
        btnBg: "var(--vc-lime)",
        btnFg: "#0F172A",
      };
    case "sage": // Catppuccin Green / Sage
      return {
        bg: "#E8EFE9",
        fg: "#1B382B",
        muted: "#4A6B5D",
        cardBg: "rgba(255,255,255,0.75)",
        cardBorder: "rgba(27,56,43,0.15)",
        ringBorder: "#2D6A4F",
        accent: "#2D6A4F",
        borderColor: "rgba(27,56,43,0.18)",
        tagBg: "rgba(45,106,79,0.12)",
        tagFg: "#1B382B",
        btnBg: "#2D6A4F",
        btnFg: "#FFFFFF",
      };
    case "mauve": // Catppuccin Mauve / Lavender
      return {
        bg: "#EFEBF6",
        fg: "#291B48",
        muted: "#5E4A82",
        cardBg: "rgba(255,255,255,0.75)",
        cardBorder: "rgba(41,27,72,0.15)",
        ringBorder: "#7B52AB",
        accent: "#7B52AB",
        borderColor: "rgba(41,27,72,0.18)",
        tagBg: "rgba(123,82,171,0.12)",
        tagFg: "#291B48",
        btnBg: "#7B52AB",
        btnFg: "#FFFFFF",
      };
    case "peach": // Catppuccin Peach / Warm Rose
      return {
        bg: "#FDF0EB",
        fg: "#3E1E17",
        muted: "#7A4D43",
        cardBg: "rgba(255,255,255,0.75)",
        cardBorder: "rgba(62,30,23,0.15)",
        ringBorder: "#D95D39",
        accent: "#D95D39",
        borderColor: "rgba(62,30,23,0.18)",
        tagBg: "rgba(217,93,57,0.12)",
        tagFg: "#3E1E17",
        btnBg: "#D95D39",
        btnFg: "#FFFFFF",
      };
    case "cream":
    default:
      return {
        bg: "var(--vc-cream)",
        fg: "var(--vc-ink)",
        muted: "var(--vc-mute)",
        cardBg: "#FFFFFF",
        cardBorder: "rgba(14,14,14,0.12)",
        ringBorder: "var(--vc-red)",
        accent: "var(--vc-red)",
        borderColor: "rgba(14,14,14,0.15)",
        tagBg: "rgba(14,14,14,0.06)",
        tagFg: "var(--vc-ink)",
        btnBg: "var(--vc-red)",
        btnFg: "#FFFFFF",
      };
  }
}

const Wordmark = ({ brand, color }) => {
  if (brand.logo && brand.logoEnabled !== false) {
    const isLightText = color === "var(--vc-cream)" || color === "#fff" || color === "#ffffff" || color === "var(--vc-lime)";
    const logoSrc = (isLightText && brand.logoLight) ? brand.logoLight : brand.logo;
    return <img src={logoSrc} alt={brand.studioName || "logo"} style={{ height: 36, width: "auto", maxWidth: 140, objectFit: "contain" }} />;
  }
  return (
    <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 36, color: color || "currentColor", letterSpacing: "-0.01em" }}>
      {brand.studioName || "Studio"}
    </span>
  );
};

export {
  Paperclip, Chevron, ArrowOut, Asterisk, XMark,
  HandCircle, Underscribble, PhotoSlot, CrescentMark,
  VLabel, VFooter, Wordmark,
};
