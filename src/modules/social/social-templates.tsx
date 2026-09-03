// @ts-nocheck
import { fmt } from '../documents/utils';
import { renderSocialMd } from './renderSocialMd';

// Social media templates — Vanaila editorial-bold aesthetic
// Each template: { id, name, kind, fields, slides({data, brand}) → JSX[] }
// Single posts return 1 slide; carousels return N slides.

/* ============================================== */
/* Decoration components (reusable SVG)            */
/* ============================================== */

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

/* ============================================== */
/* 1. PULL QUOTE (single)                          */
/* ============================================== */
const T_Quote = ({ data, brand }) => {
  const quoteText = data.quote || "The secret to social media success? Authenticity & consistency";
  const quoteSize = getDynamicFontSize(quoteText, 116, 50, 56);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Paperclip />
        <VLabel text={data.label || "A Better Future"} style={{ textAlign: "right", lineHeight: 1.4 }} />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: quoteSize, lineHeight: 1.02, color: "var(--vc-ink)", letterSpacing: "-0.01em", overflowWrap: "break-word", wordBreak: "normal" }}>
          <span style={{ color: "var(--vc-red)" }}>"</span>{renderSocialMd(quoteText)}<span style={{ color: "var(--vc-red)" }}>"</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <ArrowOut size={56} color="var(--vc-ink)" />
          <span style={{ display: "inline-flex", alignItems: "center", padding: "10px 22px", border: "1.5px solid var(--vc-ink)", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {data.role || "Director"}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", padding: "12px 26px", background: "var(--vc-ink)", color: "var(--vc-cream)", borderRadius: 999, fontFamily: "var(--font-helvetica)", fontSize: 22, letterSpacing: "-0.005em" }}>
            {data.attribution || "Francis Donovan"}
          </span>
        </div>
        <Asterisk size={74} />
      </div>
    </div>
  );
};

/* ============================================== */
/* 2. STAT HERO (single)                           */
/* ============================================== */
const T_Stat = ({ data, brand }) => {
  const statText = data.stat || "91%";
  const statSize = getDynamicFontSize(statText, 380, 4, 48);
  const leadSize = getDynamicFontSize(data.italicLead || "Why do most posts fail?", 56, 25, 28);
  const labelSize = getDynamicFontSize(data.statLabel || "of posts get zero meaningful engagement.", 38, 45, 22);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "grid", gridTemplateRows: "auto 1fr auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <VLabel text={data.kicker || "By the numbers"} />
        <ArrowOut size={56} color="var(--vc-ink)" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: leadSize, color: "var(--vc-ink)", marginBottom: 10, overflowWrap: "break-word", wordBreak: "normal" }}>
          {data.italicLead || "Why do most posts fail?"}
        </div>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: statSize, lineHeight: statSize > 250 ? 0.86 : 0.94, color: "var(--vc-red)", letterSpacing: "-0.04em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {statText}
        </div>
        <div style={{ marginTop: 28, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: labelSize, color: "var(--vc-mute)", maxWidth: 720, overflowWrap: "break-word", wordBreak: "normal" }}>
          {renderSocialMd(data.statLabel || "of posts get zero meaningful engagement.")}
        </div>
      </div>
      <VFooter brand={brand} borderColor="rgba(14,14,14,0.15)" />
    </div>
  );
};

/* ============================================== */
/* 3. ANNOUNCEMENT (single) — red big card         */
/* ============================================== */
const T_Announce = ({ data, brand }) => {
  const headA = data.headlineA || "The Startup Formula";
  const headB = data.headlineB || "Strategy, Execution, Growth.";
  const fullText = `${headA} ${headB}`;
  const headSize = getDynamicFontSize(fullText, 124, 25, 48, 840);
  return (
    <div className="social-frame" style={{ background: "var(--vc-red)", color: "#fff", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Paperclip color="#fff" />
        <Chevron color="#fff" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
        <XMark size={96} color="#fff" />
        <VLabel text={data.label || "A Better Future"} color="#fff" style={{ textAlign: "right", lineHeight: 1.4, opacity: 0.85 }} />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: headSize, lineHeight: 1.02, letterSpacing: "-0.015em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {headA}{" "}
          <em>{headB}</em>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <VLabel num={null} text={brand.studioName || "Studio"} color="#fff" style={{ opacity: 0.9 }} />
        <Asterisk size={90} color="#fff" />
      </div>
    </div>
  );
};

/* ============================================== */
/* 4. STEP-BY-STEP (single) — circled word         */
/* ============================================== */
const T_Steps = ({ data, brand }) => {
  const headline = data.headline || "MY STEP-BY-STEP PROCESS FOR CREATING HIGH-PERFORMING";
  const circled = data.circled || "POSTS";
  const headSize = getDynamicFontSize(`${headline} ${circled}`, 124, 15, 48);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <VLabel text={data.kicker || "Method"} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 22px", border: "1.5px solid var(--vc-ink)", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <span style={{ display: "inline-block", width: 14, height: 14 }}>
            <svg viewBox="0 0 14 14" fill="none"><path d="M3 11 L11 3 M5 3 L11 3 L11 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </span>
          {data.pillRight || "Digital"}
        </span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: headSize, lineHeight: 0.98, color: "var(--vc-ink)", textTransform: "uppercase", letterSpacing: "-0.02em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {renderSocialMd(headline)} <HandCircle color="var(--vc-red)">{circled}</HandCircle>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Paperclip size={56} />
          <span style={{ display: "inline-flex", alignItems: "center", padding: "10px 22px", border: "1.5px solid var(--vc-ink)", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <svg width={14} height={14} viewBox="0 0 14 14" fill="none" style={{ marginRight: 8 }}><path d="M3 11 L11 3 M5 3 L11 3 L11 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            {data.pillLeft || "Strategy"}
          </span>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, color: "var(--vc-mute)", textAlign: "right", lineHeight: 1.35, maxWidth: 380, overflowWrap: "break-word", wordBreak: "normal" }}>
          {renderSocialMd(data.note || "Let us handle your content so you can focus on growth.")}
        </div>
      </div>
    </div>
  );
};

/* ============================================== */
/* 5. BEFORE / AFTER (single) — split block        */
/* ============================================== */
const T_BeforeAfter = ({ data, brand }) => {
  const beforeSize = getDynamicFontSize(data.before || "A blank page and a deadline.", 76, 18, 36, 400);
  const afterSize = getDynamicFontSize(data.after || "A document that earns the deal.", 76, 18, 36, 400);
  return (
    <div className="social-frame" style={{ padding: 0, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <div style={{ background: "var(--vc-cream)", padding: 72, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "var(--vc-ink)" }}>
        <VLabel num={null} text={data.beforeLabel || "Before"} />
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, color: "var(--vc-mute)", marginBottom: 16 }}>
            {data.beforeSubtitle || "The way most freelancers work."}
          </div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: beforeSize, lineHeight: 1, color: "var(--vc-ink)", overflowWrap: "break-word", wordBreak: "normal" }}>
            {renderSocialMd(data.before || "A blank page and a deadline.")}
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--vc-mute)" }}>
          {data.beforeNote || "Where most projects start."}
        </div>
      </div>
      <div style={{ background: "var(--vc-blue)", color: "#fff", padding: 72, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <VLabel num={null} text={data.afterLabel || "After"} color="#fff" />
          <Asterisk size={48} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, opacity: 0.8, marginBottom: 16 }}>
            {data.afterSubtitle || "The way our system works."}
          </div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: afterSize, lineHeight: 1, overflowWrap: "break-word", wordBreak: "normal" }}>
            {renderSocialMd(data.after || "A document that earns the deal.")}
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.8 }}>
          {data.afterNote || "What good work looks like."}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", background: "var(--vc-ink)", color: "var(--vc-cream)", padding: "12px 26px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase" }}>
        {brand.studioName || "Studio"} · {brand.handle || "@studio"}
      </div>
    </div>
  );
};

/* ============================================== */
/* 6. MANIFESTO (single) — dark big italic         */
/* ============================================== */
const T_Manifesto = ({ data, brand }) => {
  const fullText = `${data.lead || "Tech that"} ${data.italic || "just works."} ${data.tail || "You should not have to worry about how it works. You just need it to perform."}`;
  const headSize = getDynamicFontSize(fullText, 90, 30, 42);
  return (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <VLabel text={data.kicker || "Manifesto"} color="var(--vc-cream)" style={{ opacity: 0.7 }} />
        <Asterisk size={56} color="var(--vc-blue)" />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 400, fontSize: headSize, lineHeight: 1.08, letterSpacing: "-0.015em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {data.lead || "Tech that"}{" "}
          <em style={{ fontFamily: "var(--font-display)", color: "var(--vc-blue)" }}>{data.italic || "just works."}</em>{" "}
          <span style={{ color: "rgba(236,230,214,0.6)" }}>{renderSocialMd(data.tail || "You should not have to worry about how it works. You just need it to perform.")}</span>
        </div>
      </div>
      <VFooter brand={brand} color="var(--vc-cream)" borderColor="rgba(236,230,214,0.2)" />
    </div>
  );
};

/* ============================================== */
/* 7. FRAMEWORK CAROUSEL (dynamic slides)          */
/* ============================================== */
const T_Framework = ({ data, brand }) => {
  const steps = (data.steps || "Listen — hear the actual ask, not the requested one.\nMap — name every constraint, on paper.\nMake — propose the smallest version that ships.\nShip — ship before it's perfect; iterate in daylight.").split("\n").filter(Boolean);
  const palette = ["var(--vc-cream)", "var(--vc-blue)", "var(--vc-ink)", "var(--vc-lime)"];
  const colors = ["var(--vc-ink)", "#fff", "var(--vc-cream)", "var(--vc-ink)"];

  const titleSize = getDynamicFontSize(data.title || "The LMMS Method", 168, 12, 52);

  const cover = (
    <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel num={1} text={data.coverLabel || "A Framework"} />
        <Chevron color="var(--vc-ink)" />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 56, color: "var(--vc-mute)", marginBottom: 16 }}>
            {data.subtitle || "How we run client projects,"}
          </div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: titleSize, lineHeight: 0.95, color: "var(--vc-ink)", letterSpacing: "-0.03em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.title || "The LMMS Method"}.
          </div>
          <div style={{ marginTop: 24, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 40, color: "var(--vc-red)" }}>
            in {steps.length} moves.
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", padding: "14px 28px", background: "var(--vc-ink)", color: "var(--vc-cream)", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Swipe →
        </span>
        <Asterisk size={64} />
      </div>
    </div>
  );

  const stepSlides = steps.map((s, i) => {
    const [name, ...rest] = s.split("—");
    const body = rest.join("—").trim();
    const bg = palette[i % palette.length];
    const fg = colors[i % colors.length];
    const isDark = bg === "var(--vc-blue)" || bg === "var(--vc-ink)";
    const nameSize = getDynamicFontSize(name.trim(), 132, 10, 48);
    const bodySize = getDynamicFontSize(body, 32, 60, 22);
    return (
      <div className="social-frame" key={i} style={{ background: bg, color: fg, padding: 80, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <VLabel num={i + 1} text={`Step ${i + 1} of ${steps.length}`} color={fg} style={{ opacity: 0.8 }} />
          <CrescentMark color={fg} />
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 280, lineHeight: 0.88, letterSpacing: "-0.04em", color: "var(--vc-red)" }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ marginTop: 12, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: nameSize, lineHeight: 1, letterSpacing: "-0.015em", overflowWrap: "break-word", wordBreak: "normal" }}>
              {name.trim()}.
            </div>
            <div style={{ marginTop: 24, fontFamily: "var(--font-helvetica)", fontSize: bodySize, lineHeight: 1.35, maxWidth: 820, opacity: isDark ? 0.75 : 0.7, overflowWrap: "break-word", wordBreak: "normal" }}>
              {renderSocialMd(body)}
            </div>
          </div>
        </div>
        <VFooter brand={brand} color={fg} borderColor={isDark ? "rgba(255,255,255,0.2)" : "rgba(14,14,14,0.2)"} />
      </div>
    );
  });

  const slides = [cover, ...stepSlides];
  if (data.ctaText) slides.push(<CarouselCTA brand={brand} data={data} />);
  return slides;
};

/* ============================================== */
/* 8. STORY CAROUSEL (dynamic slides)              */
/* ============================================== */
const T_Story = ({ data, brand }) => {
  const palette = [
    { color: "var(--vc-cream)", fg: "var(--vc-ink)" },
    { color: "var(--vc-blue)",  fg: "#fff" },
    { color: "var(--vc-lime)",  fg: "var(--vc-ink)" },
    { color: "var(--vc-ink)",   fg: "var(--vc-cream)" },
  ];

  const rawLines = (data.slides ||
    "The Problem — You're getting views but no conversions. Here's why.\nThe Shift — Treat the document as part of the product, not an afterthought.\nThe Result — Clients sign faster. Briefs come back warmer. Work compounds."
  ).split("\n").filter(Boolean);

  const leadSize = getDynamicFontSize(data.coverLead || "How we doubled close-rate", 96, 20, 48);
  const italicSize = getDynamicFontSize(data.coverItalic || "in a quarter.", 132, 14, 52);

  const cover = (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel num={2} text={data.kicker || "A Short Story"} color="var(--vc-cream)" style={{ opacity: 0.7 }} />
        <Paperclip color="var(--vc-cream)" />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 400, fontSize: leadSize, lineHeight: 1.04, letterSpacing: "-0.015em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {renderSocialMd(data.coverLead || "How we doubled close-rate")}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: italicSize, lineHeight: 1.0, color: "var(--vc-blue)", marginTop: 6, letterSpacing: "-0.02em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.coverItalic || "in a quarter."}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>Swipe to read →</span>
        <Asterisk size={56} color="var(--vc-blue)" />
      </div>
    </div>
  );

  const contentSlides = rawLines.map((line, i) => {
    const dashIdx = line.indexOf("—");
    const kicker = dashIdx > -1 ? line.slice(0, dashIdx).trim() : "";
    const body = dashIdx > -1 ? line.slice(dashIdx + 1).trim() : line.trim();
    const { color, fg } = palette[i % palette.length];
    const bodySize = getDynamicFontSize(body, 96, 24, 44);
    return (
      <div className="social-frame" key={i} style={{ background: color, color: fg, padding: 80, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <VLabel num={i + 1} text={kicker} color={fg} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.6 }}>
            {i + 1} / {rawLines.length}
          </span>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: bodySize, lineHeight: 1.05, letterSpacing: "-0.015em", maxWidth: 900, overflowWrap: "break-word", wordBreak: "normal" }}>
            {renderSocialMd(body)}
          </div>
        </div>
        <VFooter brand={brand} color={fg} borderColor={fg === "#fff" || fg === "var(--vc-cream)" ? "rgba(255,255,255,0.25)" : "rgba(14,14,14,0.2)"} />
      </div>
    );
  });

  const slides = [cover, ...contentSlides];
  if (data.ctaText) slides.push(<CarouselCTA brand={brand} data={data} />);
  return slides;
};

/* ============================================== */
/* 9. TIPS CAROUSEL (cover + N rules)              */
/* ============================================== */
const T_Tips = ({ data, brand }) => {
  const tips = (data.tips || "Write the email before the spec.\nPrice the outcome, not the hour.\nNever pitch what you can't deliver.\nDocument decisions, not opinions.\nShip the smallest useful thing.").split("\n").filter(Boolean);
  const ruleWord = data.ruleLabel || "Rule";

  const titleItalic = data.titleItalic || "I keep close.";
  const ruleSize = getDynamicFontSize(`${tips.length} ${ruleWord}s`, 156, 8, 52);
  const italicSize = getDynamicFontSize(titleItalic, 132, 10, 48);

  const cover = (
    <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel num={3} text={data.kicker || "Field Notes"} />
        <Chevron color="var(--vc-ink)" />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: ruleSize, lineHeight: 0.95, color: "var(--vc-ink)", letterSpacing: "-0.03em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {tips.length} <Underscribble>{ruleWord.toLowerCase()}s</Underscribble>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: italicSize, lineHeight: 1.02, color: "var(--vc-ink)", marginTop: 8, letterSpacing: "-0.02em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {titleItalic}
          </div>
          <div style={{ marginTop: 28, fontFamily: "var(--font-helvetica)", fontSize: 28, color: "var(--vc-mute)", maxWidth: 720, lineHeight: 1.4, overflowWrap: "break-word", wordBreak: "normal" }}>
            {renderSocialMd(data.subtitle || "What I've learned shipping freelance work for the better part of a decade.")}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Asterisk size={56} />
        <Wordmark brand={brand} />
      </div>
    </div>
  );

  const tipSlides = tips.map((t, i) => {
    const tipSize = getDynamicFontSize(t, 76, 25, 38);
    return (
      <div className="social-frame" key={i} style={{ background: i % 2 === 0 ? "var(--vc-cream)" : "var(--vc-ink)", color: i % 2 === 0 ? "var(--vc-ink)" : "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <VLabel num={i + 1} text={`${ruleWord} ${i + 1} of ${tips.length}`} color="currentColor" />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.6 }}>{brand.handle || "@studio"}</span>
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "auto 1fr", gap: 60, alignItems: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 480, lineHeight: 0.82, color: "var(--vc-red)", letterSpacing: "-0.04em" }}>
            {i + 1}
          </div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: tipSize, lineHeight: 1.15, letterSpacing: "-0.01em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {renderSocialMd(t)}
          </div>
        </div>
        <VFooter brand={brand} color="currentColor" borderColor={i % 2 === 0 ? "rgba(14,14,14,0.2)" : "rgba(236,230,214,0.2)"} />
      </div>
    );
  });

  const slides = [cover, ...tipSlides];
  if (data.ctaText) slides.push(<CarouselCTA brand={brand} data={data} />);
  return slides;
};

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

/* ============================================== */
/* 10. NOW BOOKING (CTA)                           */
/* ============================================== */
const T_Booking = ({ data, brand }) => {
  const cta = data.ctaText || "Inquire via DM";
  const ctaBtnSize = getDynamicFontSize(cta, 22, 16, 14);
  const project = data.projectText ?? data.project ?? "projects.";
  const leadFull = `${data.lead || "Two spots open for"} ${data.window || "Q3"} ${project}`;
  const leadSize = getDynamicFontSize(leadFull, 152, 20, 54);
  const subtextSize = getDynamicFontSize(data.subtext || "", 36, 70, 24);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel text={data.label || "Now Booking"} />
        <Paperclip />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: leadSize, lineHeight: 1.02, color: "var(--vc-ink)", letterSpacing: "-0.025em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.lead || "Two spots open for"} <HandCircle color="var(--vc-red)">{data.window || "Q3"}</HandCircle>{" "}
            <em style={{ fontFamily: "var(--font-display)", color: "var(--vc-red)" }}>{project}</em>
          </div>
          <div style={{ marginTop: 28, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: subtextSize, color: "var(--vc-mute)", maxWidth: 740, lineHeight: 1.35, overflowWrap: "break-word", wordBreak: "normal" }}>
            {renderSocialMd(data.subtext || "Brand and product work. Four-to-six-week engagements. Friendly intake, written deliverables, no agency overhead.")}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "var(--vc-red)", color: "#fff", padding: "24px 36px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: ctaBtnSize, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <span>{cta}</span>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M5 17 L17 5 M9 5 L17 5 L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </div>
        <Asterisk size={68} />
      </div>
    </div>
  );
};

/* ============================================== */
/* 11. LINK-IN-BIO (CTA)                           */
/* ============================================== */
const T_LinkBio = ({ data, brand }) => {
  const headASize = getDynamicFontSize(data.headlineA || "Why your proposal is", 124, 18, 54);
  const headBSize = getDynamicFontSize(data.headlineB || "your portfolio.", 136, 15, 54);
  const urlSize = getDynamicFontSize(data.url || "northquill.studio/essays", 22, 28, 14);
  const subSize = getDynamicFontSize(data.subtext || "", 28, 70, 20);
  return (
    <div className="social-frame" style={{ padding: 0, display: "grid", gridTemplateRows: "auto 1fr auto", background: "var(--vc-cream)" }}>
      <div style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: "44px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.label || "New Essay"} color="var(--vc-cream)" />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.85 }}>
          Read now →
        </span>
      </div>
      <div style={{ padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <VLabel num={null} text={data.kicker || "On documents"} />
        <div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: headASize, lineHeight: 1.02, color: "var(--vc-ink)", letterSpacing: "-0.025em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.headlineA || "Why your proposal is"}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: headBSize, lineHeight: 1.02, color: "var(--vc-red)", letterSpacing: "-0.025em", marginTop: 4, overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.headlineB || "your portfolio."}
          </div>
          <div style={{ marginTop: 28, fontFamily: "var(--font-helvetica)", fontSize: subSize, color: "var(--vc-mute)", maxWidth: 800, lineHeight: 1.4, overflowWrap: "break-word", wordBreak: "normal" }}>
            {renderSocialMd(data.subtext || "A short piece on the small things that build trust before the work has even started.")}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1.5px solid var(--vc-ink)", paddingTop: 20 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: urlSize, color: "var(--vc-ink)", letterSpacing: "0.05em" }}>↗ {data.url || "northquill.studio/essays"}</span>
          <Asterisk size={56} />
        </div>
      </div>
      <div style={{ padding: "26px 80px", background: "var(--vc-blue)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 32 }}>{brand.studioName || "Studio"}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.85 }}>Link in bio</span>
      </div>
    </div>
  );
};

/* ============================================== */
/* 12. LAUNCH (CTA)                                */
/* ============================================== */
const T_Launch = ({ data, brand }) => {
  const prodName = data.productName || "Atelier";
  const nameSize = getDynamicFontSize(prodName, 380, 4, 52);
  const cta = data.ctaText || "Get early access";
  const ctaBtnSize = getDynamicFontSize(cta, 22, 18, 14);
  const tagSize = getDynamicFontSize(data.tagline || "", 44, 50, 24);
  return (
    <div className="social-frame" style={{ background: "var(--vc-lime)", color: "var(--vc-ink)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel text={data.kicker || "Launching"} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase" }}>{data.date || "May · 2026"}</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--vc-ink)" }}>
          {data.category || "A new product"}
        </div>
        <div style={{ marginTop: 12, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: nameSize, lineHeight: nameSize > 250 ? 0.95 : 1.0, color: "var(--vc-ink)", letterSpacing: "-0.03em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {prodName}.
        </div>
        <div style={{ marginTop: 28, fontFamily: "var(--font-helvetica)", fontWeight: 500, fontSize: tagSize, lineHeight: 1.2, maxWidth: 880, overflowWrap: "break-word", wordBreak: "normal" }}>
          {renderSocialMd(data.tagline || "A document generator built for working freelancers.")}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "var(--vc-ink)", color: "var(--vc-cream)", padding: "24px 38px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: ctaBtnSize, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <span>{cta}</span>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M5 17 L17 5 M9 5 L17 5 L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </div>
        <Asterisk size={88} />
      </div>
    </div>
  );
};

/* ============================================== */
/* CAROUSEL CLOSING / CTA SLIDE                    */
/* ============================================== */
const CarouselCTA = ({ brand, data }) => {
  const studioNameSize = getDynamicFontSize(brand.studioName || "Studio", 136, 8, 56);
  const ctaTextSize = getDynamicFontSize(data.ctaText || "", 40, 24, 22);
  return (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <VLabel text="Follow for more" color="var(--vc-cream)" style={{ opacity: 0.5 }} />
        <Asterisk size={56} color="var(--vc-blue)" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        {brand.logo && brand.logoEnabled !== false
          ? <img src={brand.logoLight || brand.logo} alt="" style={{ height: 80, width: "auto", maxWidth: 220, objectFit: "contain", marginBottom: 36 }} />
          : null
        }
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: studioNameSize, lineHeight: 0.96, letterSpacing: "-0.025em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {brand.studioName || "Studio"}
        </div>
        <div style={{ marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 20, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5 }}>
          {brand.handle || "@studio"}
        </div>
        {data.ctaText && (
          <div style={{ marginTop: 44, fontFamily: "var(--font-helvetica)", fontWeight: 500, fontSize: ctaTextSize, lineHeight: 1.35, maxWidth: 720, opacity: 0.85, overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.ctaText}
          </div>
        )}
      </div>
      <VFooter brand={brand} color="var(--vc-cream)" borderColor="rgba(236,230,214,0.2)" />
    </div>
  );
};

/* ============================================== */
/* 13. MISTAKES MADE (Carousel)                    */
/* ============================================== */
const T_Mistakes = ({ data, brand }) => {
  const items = (data.mistakes ||
    "Underpricing your work — I thought low rates would win clients. They attracted bad ones.\nNot writing things down — Verbal agreements disappear. Every project needs a brief.\nTaking every project — Busyness isn't the same as success. Pick your work carefully."
  ).split("\n").filter(Boolean);

  const bgPalette  = ["var(--vc-cream)", "var(--vc-blue)", "var(--vc-lime)", "var(--vc-ink)"];
  const fgPalette  = ["var(--vc-ink)",   "#fff",           "var(--vc-ink)",  "var(--vc-cream)"];
  const borderOp   = ["rgba(14,14,14,0.15)", "rgba(255,255,255,0.2)", "rgba(14,14,14,0.15)", "rgba(236,230,214,0.2)"];

  const titleItalic = data.titleItalic || "I made for you.";
  const mistakeSize = getDynamicFontSize(`${items.length} mistakes`, 148, 10, 52);
  const subSize = getDynamicFontSize(titleItalic, 116, 12, 46);

  const cover = (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel text={data.kicker || "Hard Lessons"} color="var(--vc-cream)" style={{ opacity: 0.7 }} />
        <XMark size={56} color="var(--vc-red)" />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: mistakeSize, lineHeight: 0.95, letterSpacing: "-0.03em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {items.length} mistakes
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: subSize, lineHeight: 1.02, color: "var(--vc-red)", marginTop: 4, letterSpacing: "-0.02em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {titleItalic}
          </div>
          <div style={{ marginTop: 28, fontFamily: "var(--font-helvetica)", fontSize: 28, opacity: 0.6, lineHeight: 1.4, maxWidth: 720, overflowWrap: "break-word", wordBreak: "normal" }}>
            {renderSocialMd(data.subtitle || "So you don't have to learn them the hard way.")}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5 }}>Swipe →</span>
        <Asterisk size={56} color="var(--vc-red)" />
      </div>
    </div>
  );

  const mistakeSlides = items.map((item, i) => {
    const dash = item.indexOf("—");
    const title  = dash > -1 ? item.slice(0, dash).trim() : item;
    const lesson = dash > -1 ? item.slice(dash + 1).trim() : "";
    const bg = bgPalette[i % bgPalette.length];
    const fg = fgPalette[i % fgPalette.length];
    const titleSize = getDynamicFontSize(title, 96, 20, 44);
    const lessonSize = getDynamicFontSize(lesson, 48, 60, 26);
    return (
      <div className="social-frame" key={i} style={{ background: bg, color: fg, padding: 80, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <VLabel num={i + 1} text={`of ${items.length}`} color={fg} style={{ opacity: 0.7 }} />
          <XMark size={48} color="var(--vc-red)" />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: titleSize, lineHeight: 1.05, letterSpacing: "-0.02em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {renderSocialMd(title)}.
          </div>
          {lesson && (
            <div style={{ marginTop: 32, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: lessonSize, lineHeight: 1.35, opacity: 0.65, overflowWrap: "break-word", wordBreak: "normal" }}>
              {renderSocialMd(lesson)}
            </div>
          )}
        </div>
        <VFooter brand={brand} color={fg} borderColor={borderOp[i % borderOp.length]} />
      </div>
    );
  });

  const slides = [cover, ...mistakeSlides];
  if (data.ctaText) slides.push(<CarouselCTA brand={brand} data={data} />);
  return slides;
};

/* ============================================== */
/* 14. MINI GUIDE (Carousel)                       */
/* ============================================== */
const T_MiniGuide = ({ data, brand }) => {
  const steps = (data.steps ||
    "Write the goal first — Before you open any tool, write the end state in one sentence.\nMap your constraints — List every real limitation: time, budget, scope, and patience.\nDesign the smallest version — Resist over-engineering on the first pass.\nShip and learn — Real feedback beats internal debate every time."
  ).split("\n").filter(Boolean);

  const intro = data.intro || `A practical guide in ${steps.length} step${steps.length === 1 ? "" : "s"}.`;
  const topicSize = getDynamicFontSize(data.topic || "Ship Faster", 136, 10, 48);

  const cover = (
    <div className="social-frame" style={{ background: "var(--vc-lime)", color: "var(--vc-ink)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel text={data.kicker || "Mini Guide"} />
        <Chevron color="var(--vc-ink)" />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6, marginBottom: 12 }}>
            {data.prefix || "How to"}
          </div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: topicSize, lineHeight: 0.95, letterSpacing: "-0.03em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.topic || "Ship Faster"}.
          </div>
          <div style={{ marginTop: 28, fontFamily: "var(--font-helvetica)", fontSize: 28, opacity: 0.65, lineHeight: 1.4, maxWidth: 720, overflowWrap: "break-word", wordBreak: "normal" }}>
            {renderSocialMd(intro)}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", padding: "14px 28px", background: "var(--vc-ink)", color: "var(--vc-cream)", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          {steps.length} steps →
        </span>
        <Asterisk size={64} color="var(--vc-ink)" />
      </div>
    </div>
  );

  const stepSlides = steps.map((s, i) => {
    const dash = s.indexOf("—");
    const title  = dash > -1 ? s.slice(0, dash).trim() : s;
    const detail = dash > -1 ? s.slice(dash + 1).trim() : "";
    const dark = i % 2 === 1;
    const titleSize = getDynamicFontSize(title, 72, 16, 36, 560);
    const detailSize = getDynamicFontSize(detail, 28, 50, 20, 560);
    return (
      <div className="social-frame" key={i} style={{ background: dark ? "var(--vc-ink)" : "var(--vc-cream)", color: dark ? "var(--vc-cream)" : "var(--vc-ink)", padding: 80, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <VLabel text={`Step ${i + 1} of ${steps.length}`} color="currentColor" style={{ opacity: 0.7 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.4 }}>{data.topic || "Guide"}</span>
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "auto 1fr", gap: 36, alignItems: "center" }}>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 320, lineHeight: 0.88, color: "var(--vc-lime)", letterSpacing: "-0.04em" }}>
            {String(i + 1).padStart(2, "0")}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: titleSize, lineHeight: 1.1, letterSpacing: "-0.015em", overflowWrap: "break-word", wordBreak: "normal" }}>
              {renderSocialMd(title)}.
            </div>
            {detail && (
              <div style={{ marginTop: 18, fontFamily: "var(--font-helvetica)", fontSize: detailSize, lineHeight: 1.4, opacity: 0.6, overflowWrap: "break-word", wordBreak: "normal" }}>
                {renderSocialMd(detail)}
              </div>
            )}
          </div>
        </div>
        <VFooter brand={brand} color="currentColor" borderColor={dark ? "rgba(236,230,214,0.2)" : "rgba(14,14,14,0.2)"} />
      </div>
    );
  });

  const slides = [cover, ...stepSlides];
  if (data.ctaText) slides.push(<CarouselCTA brand={brand} data={data} />);
  return slides;
};

/* ============================================== */
/* 15. BREAKING POST (News)                        */
/* ============================================== */
const T_BreakingPost = ({ data, brand }) => {
  const headSize = getDynamicFontSize(data.headline || "Something big just changed.", 108, 20, 46);
  const subSize = getDynamicFontSize(data.subline || "", 52, 30, 24);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "var(--vc-red)", color: "#fff", padding: "30px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          {data.category || "Industry"}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {data.date || "May · 2026"}
        </span>
      </div>
      <div style={{ flex: 1, padding: 80, display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--vc-mute)", marginBottom: 20 }}>
          {data.kicker || "Breaking"}
        </div>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: headSize, lineHeight: 1.02, color: "var(--vc-ink)", letterSpacing: "-0.02em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {data.headline || "Something big just changed."}
        </div>
        {data.subline && (
          <div style={{ marginTop: 24, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: subSize, color: "var(--vc-red)", lineHeight: 1.2, letterSpacing: "-0.01em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.subline}
          </div>
        )}
        <div style={{ flex: 1 }} />
        {data.body && (
          <div style={{ fontFamily: "var(--font-helvetica)", fontSize: 28, color: "var(--vc-mute)", lineHeight: 1.5, maxWidth: 820, marginBottom: 40, overflowWrap: "break-word", wordBreak: "normal" }}>
            {renderSocialMd(data.body)}
          </div>
        )}
        <VFooter brand={brand} color="var(--vc-ink)" />
      </div>
    </div>
  );
};

/* ============================================== */
/* 16. WEEKLY DIGEST (News)                        */
/* ============================================== */
const T_WeeklyDigest = ({ data, brand }) => {
  const items = (data.items ||
    "The freelance market grew by 12% this quarter.\nAI tools cut design revision time by 40%.\nRemote clients now account for 67% of studio revenue."
  ).split("\n").filter(Boolean);
  const topicSize = getDynamicFontSize(data.topic || "Design", 100, 10, 42);
  return (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>
            {data.period || "This Week In"}
          </div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: topicSize, lineHeight: 0.95, letterSpacing: "-0.025em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.topic || "Design"}.
          </div>
        </div>
        <Asterisk size={80} color="var(--vc-blue)" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {items.map((item, i) => (
          <div key={i} style={{ padding: "28px 0", borderBottom: "1px solid rgba(236,230,214,0.1)", display: "flex", gap: 24, alignItems: "flex-start" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--vc-blue)", flexShrink: 0, marginTop: 4 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: "var(--font-helvetica)", fontSize: 32, lineHeight: 1.35, fontWeight: 500, overflowWrap: "break-word", wordBreak: "normal" }}>
              {renderSocialMd(item)}
            </span>
          </div>
        ))}
      </div>
      <VFooter brand={brand} color="var(--vc-cream)" borderColor="rgba(236,230,214,0.2)" />
    </div>
  );
};

/* ============================================== */
/* 16B. NEWS HERO PHOTO (News)                     */
/* ============================================== */
const T_NewsHero = ({ data, brand }) => {
  const c = getThemeColors(data.bg);
  const headline = data.headline || "Freelance studios win 75% of new tech branding briefs";
  const headSize = getDynamicFontSize(headline, 56, 30, 36, 950);

  return (
    <div className="social-frame" style={{ background: c.bg, color: c.fg, padding: "56px 64px", display: "grid", gridTemplateRows: "auto 1fr auto auto", gap: 20 }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: c.accent, color: "#fff", padding: "4px 14px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
            {data.category || "Report"}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: c.muted, letterSpacing: "0.1em" }}>
            {data.date || "May 2026"}
          </span>
        </div>
        <Asterisk size={40} color={c.accent} />
      </div>

      {/* Featured Photo Frame */}
      <div style={{ width: "100%", height: 420, borderRadius: 20, overflow: "hidden", border: `1.5px solid ${c.cardBorder}`, background: "#222", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
        {data.image
          ? <img src={data.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <PhotoSlot label="Featured Photo" style={{ width: "100%", height: "100%" }} />
        }
        {data.tag && (
          <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(14,14,14,0.85)", color: "#fff", padding: "6px 16px", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {data.tag}
          </div>
        )}
      </div>

      {/* Headline & Synopsis */}
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: headSize, lineHeight: 1.06, letterSpacing: "-0.015em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {headline}
        </div>
        {data.synopsis && (
          <div style={{ marginTop: 10, fontFamily: "var(--font-helvetica)", fontSize: 20, lineHeight: 1.35, color: c.muted, overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.synopsis}
          </div>
        )}
      </div>

      <VFooter brand={brand} color={c.fg} borderColor={c.borderColor} />
    </div>
  );
};

/* ============================================== */
/* 16C. NEWS SPLIT 50/50 (News)                    */
/* ============================================== */
const T_NewsSplit = ({ data, brand }) => {
  const c = getThemeColors(data.bg);
  const headline = data.headline || "The shift towards asynchronous studio retainers";
  const headSize = getDynamicFontSize(headline, 52, 28, 34, 520);
  const takeaways = (data.takeaways || "54% increase in retainer proposals year-on-year\nClient demand shifts from agency teams to solo experts\nAverage contract size up 35% in Q2").split("\n").filter(Boolean).slice(0, 3);

  return (
    <div className="social-frame" style={{ background: c.bg, color: c.fg, padding: 0, display: "grid", gridTemplateColumns: "1fr 1.15fr" }}>
      {/* Left Column: Photo */}
      <div style={{ height: "100%", position: "relative", overflow: "hidden", background: "#222" }}>
        {data.image
          ? <img src={data.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <PhotoSlot label="News Portrait / Press" style={{ width: "100%", height: "100%" }} />
        }
        <div style={{ position: "absolute", top: 32, left: 32, background: c.accent, color: "#fff", padding: "6px 16px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
          {data.category || "Press"}
        </div>
      </div>

      {/* Right Column: Editorial Copy */}
      <div style={{ padding: "56px 60px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <VLabel text={data.kicker || "Industry Dispatch"} color={c.fg} />
            <Asterisk size={36} color={c.accent} />
          </div>

          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: headSize, lineHeight: 1.05, letterSpacing: "-0.015em", marginBottom: 20 }}>
            {headline}
          </div>

          <div style={{ borderTop: `1px solid ${c.cardBorder}`, paddingTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: c.muted }}>
              Key Takeaways
            </div>
            {takeaways.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 16, lineHeight: 1.35, fontFamily: "var(--font-sans)" }}>
                <span style={{ color: c.accent, fontWeight: 700 }}>•</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <VFooter brand={brand} color={c.fg} borderColor={c.borderColor} />
      </div>
    </div>
  );
};

/* ============================================== */
/* 16D. NEWS INTERVIEW SPOTLIGHT (News)            */
/* ============================================== */
const T_NewsInterview = ({ data, brand }) => {
  const c = getThemeColors(data.bg);
  const quote = data.quote || "The studios that win in 2026 are the ones that treat documents as brand assets, not paperwork.";
  const quoteSize = getDynamicFontSize(quote, 54, 40, 36);

  return (
    <div className="social-frame" style={{ background: c.bg, color: c.fg, padding: "64px 72px", display: "grid", gridTemplateRows: "auto 1fr auto", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ background: c.tagBg, color: c.tagFg, padding: "4px 14px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, border: `1px solid ${c.cardBorder}` }}>
            {data.kicker || "Founder Spotlight"}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: c.muted }}>
            {data.publication || "Issue No. 12"}
          </span>
        </div>
        <Asterisk size={42} color={c.accent} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 36, alignItems: "center" }}>
        {/* Portrait Circle */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: 220, height: 220, borderRadius: "50%", padding: 6, border: `2.5px solid ${c.ringBorder}`, overflow: "hidden", marginBottom: 16, boxShadow: "0 12px 28px rgba(0,0,0,0.1)" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#222" }}>
              {data.image
                ? <img src={data.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <PhotoSlot label="Portrait" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
              }
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.01em" }}>
            {data.speaker || "Marcus Bell"}
          </div>
          <div style={{ marginTop: 4, fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: c.accent, fontWeight: 700 }}>
            {data.title || "Managing Partner"}
          </div>
        </div>

        {/* Pull Quote Box */}
        <div style={{ borderLeft: `3px solid ${c.accent}`, paddingLeft: 32 }}>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: quoteSize, lineHeight: 1.15, letterSpacing: "-0.01em", color: c.fg }}>
            "{quote}"
          </div>
          {data.context && (
            <div style={{ marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 14, color: c.muted, letterSpacing: "0.08em" }}>
              — {data.context}
            </div>
          )}
        </div>
      </div>

      <VFooter brand={brand} color={c.fg} borderColor={c.borderColor} />
    </div>
  );
};

/* ============================================== */
/* 17. PHOTO POST (Photo)                          */
/* ============================================== */
const T_PhotoPost = ({ data, brand }) => (
  <div className="social-frame" style={{ background: "var(--vc-ink)", padding: 0, position: "relative", display: "flex", flexDirection: "column" }}>
    <div style={{ flex: 1, overflow: "hidden" }}>
      {data.image
        ? <img src={data.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : <PhotoSlot style={{ width: "100%", height: "100%" }} />
      }
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "120px 80px 72px", background: "linear-gradient(to bottom, rgba(14,14,14,0) 0%, rgba(14,14,14,0.88) 100%)" }}>
      {data.tag && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(236,230,214,0.55)", marginBottom: 14 }}>
          {data.tag}
        </div>
      )}
      <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: 72, lineHeight: 1.04, color: "#fff", letterSpacing: "-0.015em" }}>
        {data.caption || "Caption goes here."}
      </div>
      <div style={{ marginTop: 24, fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(236,230,214,0.5)" }}>
        {brand.handle || "@studio"}
      </div>
    </div>
  </div>
);

/* ============================================== */
/* 18. WORK SHOWCASE (Photo)                       */
/* ============================================== */
const T_WorkShowcase = ({ data, brand }) => (
  <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 0, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 648, background: "var(--vc-ink)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
      {data.image
        ? <img src={data.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : <PhotoSlot style={{ width: "100%", height: "100%" }} />
      }
      <div style={{ position: "absolute", top: 32, right: 40, fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
        {data.projectType || "Brand"} · {data.year || "2026"}
      </div>
    </div>
    <div style={{ flex: 1, padding: "44px 80px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--vc-mute)", marginBottom: 14 }}>
          {data.client || "Client name"}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 88, lineHeight: 0.98, color: "var(--vc-ink)", letterSpacing: "-0.02em" }}>
          {data.tagline || "A project worth sharing."}
        </div>
      </div>
      <VFooter brand={brand} color="var(--vc-ink)" />
    </div>
  </div>
);

/* ============================================== */
/* 18B. TEAM ONBOARD · 1 MEMBER (Photo)           */
/* ============================================== */
const T_Team1 = ({ data, brand }) => {
  const c = getThemeColors(data.bg);
  const name = data.name || "Elena Rostova";
  const nameSize = getDynamicFontSize(name, 84, 15, 52);
  const position = data.position || "Lead Brand Designer";
  const posSize = getDynamicFontSize(position, 22, 24, 15);
  const badge = data.badge !== undefined ? data.badge : "New Joiner";
  const badgeSize = getDynamicFontSize(badge, 13, 14, 10);

  return (
    <div className="social-frame" style={{ background: c.bg, color: c.fg, padding: "72px 80px", display: "grid", gridTemplateRows: "auto 1fr auto", gap: 32 }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Welcome to the Team"} color={c.fg} />
        <Asterisk size={48} color={c.accent} />
      </div>

      {/* Main Content: Avatar Frame + Info */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        {/* Circle Photo Frame */}
        <div style={{
          width: 380, height: 380, borderRadius: "50%",
          padding: 8, border: `3px solid ${c.ringBorder}`,
          position: "relative", marginBottom: 36,
          boxShadow: "0 20px 50px rgba(0,0,0,0.14)",
          flexShrink: 0
        }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#222" }}>
            {data.image
              ? <img src={data.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              : <PhotoSlot label="Drop portrait" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
            }
          </div>
          {/* Dynamic Badge at bottom of circle */}
          {badge && badge.trim() && (
            <div style={{
              position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
              background: c.ringBorder, color: c.bg.includes("blue") ? "#0F172A" : "#fff",
              padding: "6px 20px", borderRadius: 999, fontFamily: "var(--font-mono)",
              fontSize: badgeSize, letterSpacing: "0.14em", textTransform: "uppercase",
              fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(0,0,0,0.18)"
            }}>
              {badge}
            </div>
          )}
        </div>

        {/* Member Name */}
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: nameSize, lineHeight: 1, letterSpacing: "-0.015em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {name}
        </div>

        {/* Position & Department */}
        <div style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: posSize, letterSpacing: "0.12em", textTransform: "uppercase", color: c.accent, fontWeight: 700, overflowWrap: "break-word", wordBreak: "normal" }}>
          {position}
        </div>

        {data.department && (
          <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", color: c.muted, overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.department}
          </div>
        )}

        {data.bio && (
          <div style={{ marginTop: 18, fontFamily: "var(--font-helvetica)", fontSize: 24, lineHeight: 1.35, color: c.muted, maxWidth: 680, overflowWrap: "break-word", wordBreak: "normal" }}>
            "{data.bio}"
          </div>
        )}
      </div>

      {/* Footer */}
      <VFooter brand={brand} color={c.fg} borderColor={c.borderColor} />
    </div>
  );
};

/* ============================================== */
/* 18C. TEAM ONBOARD · 2 MEMBERS / DUO (Photo)    */
/* ============================================== */
const T_Team2 = ({ data, brand }) => {
  const c = getThemeColors(data.bg);
  const headline = data.headline || "Welcoming our new team members";
  const headSize = getDynamicFontSize(headline, 56, 32, 40);

  return (
    <div className="social-frame" style={{ background: c.bg, color: c.fg, padding: "64px 72px", display: "grid", gridTemplateRows: "auto auto 1fr auto", gap: 24 }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "New Joiners"} color={c.fg} />
        <Asterisk size={44} color={c.accent} />
      </div>

      {/* Header Statement */}
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: headSize, lineHeight: 1.05, letterSpacing: "-0.01em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {headline}
        </div>
      </div>

      {/* Duo Grid: 2 Members Side-by-Side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, alignItems: "center" }}>
        {/* Person 1 */}
        <div style={{
          background: c.cardBg,
          border: `1.5px solid ${c.cardBorder}`,
          borderRadius: 28, padding: "36px 28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          boxShadow: "0 12px 32px rgba(0,0,0,0.08)"
        }}>
          <div style={{
            width: 240, height: 240, borderRadius: "50%", padding: 6,
            border: `2.5px solid ${c.ringBorder}`, overflow: "hidden", marginBottom: 22, flexShrink: 0
          }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#222" }}>
              {data.image1
                ? <img src={data.image1} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <PhotoSlot label="Photo 1" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
              }
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: getDynamicFontSize(data.name1 || "Marcus Vance", 42, 14, 28), lineHeight: 1.1, overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.name1 || "Marcus Vance"}
          </div>
          <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: getDynamicFontSize(data.position1 || "Creative Director", 16, 20, 13), letterSpacing: "0.12em", textTransform: "uppercase", color: c.accent, fontWeight: 700, overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.position1 || "Creative Director"}
          </div>
        </div>

        {/* Person 2 */}
        <div style={{
          background: c.cardBg,
          border: `1.5px solid ${c.cardBorder}`,
          borderRadius: 28, padding: "36px 28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          boxShadow: "0 12px 32px rgba(0,0,0,0.08)"
        }}>
          <div style={{
            width: 240, height: 240, borderRadius: "50%", padding: 6,
            border: `2.5px solid ${c.ringBorder}`, overflow: "hidden", marginBottom: 22, flexShrink: 0
          }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#222" }}>
              {data.image2
                ? <img src={data.image2} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <PhotoSlot label="Photo 2" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
              }
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: getDynamicFontSize(data.name2 || "Aria Chen", 42, 14, 28), lineHeight: 1.1, overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.name2 || "Aria Chen"}
          </div>
          <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: getDynamicFontSize(data.position2 || "Senior Engineer", 16, 20, 13), letterSpacing: "0.12em", textTransform: "uppercase", color: c.accent, fontWeight: 700, overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.position2 || "Senior Engineer"}
          </div>
        </div>
      </div>

      {/* Footer */}
      <VFooter brand={brand} color={c.fg} borderColor={c.borderColor} />
    </div>
  );
};

/* ============================================== */
/* 18D. TEAM ONBOARD · 3 MEMBERS / TRIO (Photo)   */
/* ============================================== */
const T_Team3 = ({ data, brand }) => {
  const c = getThemeColors(data.bg);
  const headline = data.headline || "Meet the new faces at the studio";
  const headSize = getDynamicFontSize(headline, 56, 32, 40);

  const members = [
    { image: data.image1, name: data.name1 || "Sophia Ray", position: data.position1 || "Design Lead", defaultSlot: "Photo 1" },
    { image: data.image2, name: data.name2 || "Liam Thorne", position: data.position2 || "Staff Engineer", defaultSlot: "Photo 2" },
    { image: data.image3, name: data.name3 || "Maya Patel", position: data.position3 || "Product Strategist", defaultSlot: "Photo 3" },
  ];

  return (
    <div className="social-frame" style={{ background: c.bg, color: c.fg, padding: "64px 68px", display: "grid", gridTemplateRows: "auto auto 1fr auto", gap: 24 }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Meet the Crew"} color={c.fg} />
        <Asterisk size={44} color={c.accent} />
      </div>

      {/* Header Statement */}
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: headSize, lineHeight: 1.05, letterSpacing: "-0.01em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {headline}
        </div>
      </div>

      {/* 3 Members Row / Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, alignItems: "stretch" }}>
        {members.map((m, idx) => (
          <div key={idx} style={{
            background: c.cardBg,
            border: `1.5px solid ${c.cardBorder}`,
            borderRadius: 24, padding: "28px 18px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
            boxShadow: "0 10px 28px rgba(0,0,0,0.06)", justifyContent: "space-between"
          }}>
            <div style={{
              width: 190, height: 190, borderRadius: "50%", padding: 5,
              border: `2px solid ${c.ringBorder}`, overflow: "hidden", marginBottom: 18, flexShrink: 0
            }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#222" }}>
                {m.image
                  ? <img src={m.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : <PhotoSlot label={m.defaultSlot} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                }
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: getDynamicFontSize(m.name, 34, 12, 24), lineHeight: 1.15, overflowWrap: "break-word", wordBreak: "normal" }}>
                {m.name}
              </div>
              <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: getDynamicFontSize(m.position, 14, 18, 11), letterSpacing: "0.1em", textTransform: "uppercase", color: c.accent, fontWeight: 700, overflowWrap: "break-word", wordBreak: "normal" }}>
                {m.position}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <VFooter brand={brand} color={c.fg} borderColor={c.borderColor} />
    </div>
  );
};

/* ============================================== */
/* 18E. TEAM ONBOARD · 4 MEMBERS / QUAD (Photo)   */
/* ============================================== */
const T_Team4 = ({ data, brand }) => {
  const c = getThemeColors(data.bg);
  const headline = data.headline || "Welcoming 4 new team members";
  const headSize = getDynamicFontSize(headline, 52, 34, 38);

  const members = [
    { image: data.image1, name: data.name1 || "Elena Rostova", position: data.position1 || "Brand Lead", slot: "Photo 1" },
    { image: data.image2, name: data.name2 || "Marcus Vance", position: data.position2 || "Creative Director", slot: "Photo 2" },
    { image: data.image3, name: data.name3 || "Aria Chen", position: data.position3 || "Staff Engineer", slot: "Photo 3" },
    { image: data.image4, name: data.name4 || "Sophia Ray", position: data.position4 || "Product Strategist", slot: "Photo 4" },
  ];

  return (
    <div className="social-frame" style={{ background: c.bg, color: c.fg, padding: "56px 64px", display: "grid", gridTemplateRows: "auto auto 1fr auto", gap: 20 }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Team Expansion"} color={c.fg} />
        <Asterisk size={40} color={c.accent} />
      </div>

      {/* Header Statement */}
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: headSize, lineHeight: 1.05, letterSpacing: "-0.01em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {headline}
        </div>
      </div>

      {/* 2x2 Quad Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 20, alignItems: "stretch" }}>
        {members.map((m, idx) => (
          <div key={idx} style={{
            background: c.cardBg,
            border: `1.5px solid ${c.cardBorder}`,
            borderRadius: 22, padding: "20px 24px", display: "flex", alignItems: "center", gap: 22,
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
          }}>
            <div style={{
              width: 140, height: 140, borderRadius: "50%", padding: 4,
              border: `2px solid ${c.ringBorder}`, overflow: "hidden", flexShrink: 0
            }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#222" }}>
                {m.image
                  ? <img src={m.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : <PhotoSlot label={m.slot} style={{ width: "100%", height: "100%", borderRadius: "50%", fontSize: 11 }} />
                }
              </div>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: getDynamicFontSize(m.name, 32, 14, 22), lineHeight: 1.15, overflowWrap: "break-word", wordBreak: "normal" }}>
                {m.name}
              </div>
              <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", fontSize: getDynamicFontSize(m.position, 14, 18, 11), letterSpacing: "0.1em", textTransform: "uppercase", color: c.accent, fontWeight: 700, overflowWrap: "break-word", wordBreak: "normal" }}>
                {m.position}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <VFooter brand={brand} color={c.fg} borderColor={c.borderColor} />
    </div>
  );
};

/* ============================================== */
/* 19. PRICING / PACKAGE CARD (single)             */
/* ============================================== */
const T_PricingCard = ({ data, brand }) => {
  const features = (data.features || "Logo + brand mark\nColor palette & type system\nBrand guidelines (12 pages)\n2 revision rounds\nSource files included").split("\n").filter(Boolean).slice(0, 6);
  const useAccent = data.bg === "accent";
  const bg = useAccent ? "var(--accent)" : "var(--vc-cream)";
  const fg = useAccent ? "var(--accent-ink)" : "var(--vc-ink)";
  const muted = useAccent ? "rgba(0,0,0,0.52)" : "var(--vc-mute)";
  const rule = useAccent ? "rgba(0,0,0,0.18)" : "rgba(14,14,14,0.15)";
  const price = fmt.money(Number(data.price) || 0, data.currency || "USD");
  const priceSize = getDynamicFontSize(price, 152, 6, 52);
  const ctaText = data.ctaText || "DM to get started →";
  const ctaSize = getDynamicFontSize(ctaText, 18, 22, 13);
  return (
    <div className="social-frame" style={{ background: bg, color: fg, padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <VLabel text={data.packageName || "Package"} color={fg} />
        {brand.logo && brand.logoEnabled !== false
          ? <img src={(useAccent && brand.logoLight) ? brand.logoLight : brand.logo} alt="" style={{ height: 28, width: "auto", maxWidth: 100, objectFit: "contain" }} />
          : <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5 }}>{brand.studioName || "Studio"}</span>
        }
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: priceSize, lineHeight: 0.9, letterSpacing: "-0.04em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {price}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.55, marginTop: 12 }}>
          per month
        </div>
        <div style={{ marginTop: 52, display: "flex", flexDirection: "column", gap: 20 }}>
          {features.map((feat, i) => (
            <div key={i} style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <span style={{ color: "var(--vc-red)", fontFamily: "var(--font-mono)", fontSize: 20, flexShrink: 0, lineHeight: 1 }}>→</span>
              <span style={{ fontFamily: "var(--font-helvetica)", fontSize: 30, lineHeight: 1.3, overflowWrap: "break-word", wordBreak: "normal" }}>{feat}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: `1.5px solid ${rule}`, paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: ctaSize, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {ctaText}
        </span>
        <Asterisk size={52} color={fg} />
      </div>
    </div>
  );
};

/* ============================================== */
/* 20. TESTIMONIAL CARD (single)                   */
/* ============================================== */
const T_Testimonial = ({ data, brand }) => {
  const quote = data.quote || "Working with this studio changed how I think about client communication entirely.";
  const quoteSize = getDynamicFontSize(quote, 76, 40, 36);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 220, lineHeight: 0.68, color: "var(--vc-red)", marginTop: -16 }}>"</div>
        <div style={{ alignSelf: "flex-start", marginTop: 8 }}>
          {brand.logo && brand.logoEnabled !== false
            ? <img src={brand.logo} alt="" style={{ height: 30, width: "auto", maxWidth: 110, objectFit: "contain" }} />
            : <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.45 }}>{brand.studioName || "Studio"}</span>
          }
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", marginTop: -16 }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: quoteSize, lineHeight: 1.1, color: "var(--vc-ink)", letterSpacing: "-0.01em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {quote}
        </div>
      </div>
      <div style={{ display: "flex", gap: 28, alignItems: "center", paddingTop: 28, borderTop: "1.5px solid rgba(14,14,14,0.18)" }}>
        {data.clientPhoto
          ? <img src={data.clientPhoto} alt="" style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          : <div style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--vc-ink)", color: "var(--vc-cream)", display: "grid", placeItems: "center", fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: 32, flexShrink: 0 }}>
              {((data.clientName || "?")[0] || "?").toUpperCase()}
            </div>
        }
        <div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 32, color: "var(--vc-ink)", letterSpacing: "-0.005em" }}>
            {data.clientName || "Client Name"}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.1em", color: "var(--vc-mute)", textTransform: "uppercase", marginTop: 4 }}>
            {data.clientTitle || "Founder · Atlas & Bell"}
          </div>
        </div>
      </div>
    </div>
  );
};

const T_PricingEditorial = ({ data, brand }) => {
  const features = (data.features || "Logo + brand mark\nColor palette & type system\nBrand guidelines (12 pages)\n2 revision rounds\nSource files included").split("\n").filter(Boolean).slice(0, 6);
  const useAccent = data.bg === "accent";
  const bg = useAccent ? "var(--accent)" : "var(--vc-cream)";
  const fg = useAccent ? "var(--accent-ink)" : "var(--vc-ink)";
  const muted = useAccent ? "rgba(0,0,0,0.52)" : "var(--vc-mute)";
  const rule = useAccent ? "rgba(0,0,0,0.18)" : "rgba(14,14,14,0.15)";
  const price = fmt.money(Number(data.price) || 0, data.currency || "USD");
  const priceSize = getDynamicFontSize(price, 88, 6, 42, 260);
  const packageName = data.packageName || "Brand Starter";
  const packageSize = getDynamicFontSize(packageName, 84, 12, 44, 560);
  const ctaText = data.ctaText || "DM to get started ->";
  const ctaSize = getDynamicFontSize(ctaText, 17, 24, 13);
  return (
    <div className="social-frame" style={{ background: bg, color: fg, padding: 72, display: "grid", gridTemplateRows: "auto 1fr auto", gap: 34, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -72, top: 210, width: 320, height: 320, border: `1.5px solid ${rule}`, borderRadius: "50%" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "start", gap: 28 }}>
        <div>
          <VLabel text={data.kicker || "Proposal No. 01"} color={fg} />
          <div style={{ marginTop: 20, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: packageSize, lineHeight: 0.98, letterSpacing: "-0.015em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {packageName}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {brand.logo && brand.logoEnabled !== false
            ? <img src={(useAccent && brand.logoLight) ? brand.logoLight : brand.logo} alt="" style={{ height: 30, width: "auto", maxWidth: 120, objectFit: "contain" }} />
            : <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.55 }}>{brand.studioName || "Studio"}</span>
          }
          <div style={{ marginTop: 18, fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", color: muted }}>
            Available now
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 48, alignItems: "end", minHeight: 0 }}>
        <div style={{ alignSelf: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.16em", textTransform: "uppercase", color: muted, marginBottom: 20 }}>
            Included in the engagement
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            {features.map((feat, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "38px 1fr", alignItems: "baseline", gap: 16, paddingBottom: 12, borderBottom: `1px solid ${rule}` }}>
                <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--vc-red)", fontSize: 32, lineHeight: 0.8 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: "var(--font-helvetica)", fontSize: 28, lineHeight: 1.2, letterSpacing: "-0.005em", overflowWrap: "break-word", wordBreak: "normal" }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ alignSelf: "stretch", borderLeft: `1.5px solid ${rule}`, paddingLeft: 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", color: muted, marginBottom: 18 }}>
              Starting at
            </div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 800, fontSize: priceSize, lineHeight: 0.9, letterSpacing: "-0.05em", overflowWrap: "break-word", wordBreak: "normal" }}>
              {price}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.14em", textTransform: "uppercase", color: muted, marginTop: 12 }}>
              Flat fee
            </div>
          </div>
          <Asterisk size={86} color="var(--vc-red)" />
        </div>
      </div>
      <div style={{ borderTop: `1.5px solid ${rule}`, paddingTop: 24, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 24 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: ctaSize, letterSpacing: "0.13em", textTransform: "uppercase" }}>
          {ctaText}
        </span>
        <ArrowOut size={60} color={fg} />
      </div>
    </div>
  );
};

/* ============================================== */
/* 19B. PRICING 3-TIER COMPARISON (Pricing)       */
/* ============================================== */
const T_Pricing3Tier = ({ data, brand }) => {
  const c = getThemeColors(data.bg);
  const headline = data.headline || "Transparent packages for every project stage";
  const headSize = getDynamicFontSize(headline, 48, 30, 30);

  const tiers = [
    {
      name: data.tier1Name || "Starter",
      price: data.tier1Price || "$1,200",
      desc: data.tier1Desc || "Essential brand basics",
      features: (data.tier1Features || "Logo & mark\nColor palette\nType system\n1 Revision round").split("\n").filter(Boolean).slice(0, 4),
      popular: false,
    },
    {
      name: data.tier2Name || "Pro Package",
      price: data.tier2Price || "$3,500",
      desc: data.tier2Desc || "Full identity & system",
      features: (data.tier2Features || "Complete brand identity\n32-Page design system\nDocument templates\n3 Revision rounds\nSource files included").split("\n").filter(Boolean).slice(0, 5),
      popular: true,
    },
    {
      name: data.tier3Name || "Partner",
      price: data.tier3Price || "$6,000",
      desc: data.tier3Desc || "Custom end-to-end",
      features: (data.tier3Features || "Strategy & positioning\nFull multi-platform kit\nOngoing advisory\nPriority 48h turnaround\nDirect Slack access").split("\n").filter(Boolean).slice(0, 5),
      popular: false,
    },
  ];

  return (
    <div className="social-frame" style={{ background: c.bg, color: c.fg, padding: "56px 64px", display: "grid", gridTemplateRows: "auto auto 1fr auto", gap: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Investment & Plans"} color={c.fg} />
        <Asterisk size={42} color={c.accent} />
      </div>

      <div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: headSize, lineHeight: 1.05, letterSpacing: "-0.01em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {headline}
        </div>
      </div>

      {/* 3 Tier Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, alignItems: "stretch" }}>
        {tiers.map((t, idx) => {
          const isPop = t.popular;
          return (
            <div key={idx} style={{
              background: isPop ? (c.bg.includes("ink") ? "rgba(255,255,255,0.12)" : c.cardBg) : (c.bg.includes("ink") ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)"),
              border: isPop ? `2px solid ${c.accent}` : `1.5px solid ${c.cardBorder}`,
              borderRadius: 22, padding: "26px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between",
              position: "relative", boxShadow: isPop ? "0 14px 36px rgba(0,0,0,0.1)" : "0 6px 18px rgba(0,0,0,0.04)"
            }}>
              {isPop && (
                <div style={{
                  position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                  background: c.accent, color: "#fff", padding: "4px 14px", borderRadius: 999,
                  fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap"
                }}>
                  Most Popular
                </div>
              )}
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: isPop ? c.accent : c.muted, fontWeight: 700 }}>
                  {t.name}
                </div>
                <div style={{ marginTop: 8, fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: getDynamicFontSize(t.price, 44, 6, 26, 240), lineHeight: 1, letterSpacing: "-0.02em", overflowWrap: "break-word", wordBreak: "normal" }}>
                  {t.price}
                </div>
                <div style={{ marginTop: 4, fontFamily: "var(--font-helvetica)", fontSize: 13, color: c.muted, minHeight: 18, overflowWrap: "break-word", wordBreak: "normal" }}>
                  {t.desc}
                </div>
                <div style={{ marginTop: 14, borderTop: `1px solid ${c.cardBorder}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {t.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, lineHeight: 1.3, fontFamily: "var(--font-sans)" }}>
                      <span style={{ color: c.accent, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span style={{ overflowWrap: "break-word", wordBreak: "normal" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                marginTop: 18, textAlign: "center", padding: "10px 14px", borderRadius: 999,
                background: isPop ? c.btnBg : "transparent", color: isPop ? c.btnFg : c.fg,
                border: isPop ? "none" : `1.5px solid ${c.cardBorder}`,
                fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700
              }}>
                Select {t.name}
              </div>
            </div>
          );
        })}
      </div>

      <VFooter brand={brand} color={c.fg} borderColor={c.borderColor} />
    </div>
  );
};

/* ============================================== */
/* 19C. PRICING MONTHLY RETAINER (Pricing)        */
/* ============================================== */
const T_PricingRetainer = ({ data, brand }) => {
  const c = getThemeColors(data.bg);
  const rate = data.rate || "$4,500";
  const rateSize = getDynamicFontSize(rate, 116, 6, 50, 450);
  const items = (data.deliverables || "Dedicated private Slack channel\n48-Hour average turnaround on briefs\nUnlimited request queue (1 active at a time)\nDesign systems, decks & client docs\nPause or cancel anytime").split("\n").filter(Boolean).slice(0, 5);

  return (
    <div className="social-frame" style={{ background: c.bg, color: c.fg, padding: "64px 72px", display: "grid", gridTemplateRows: "auto 1fr auto", gap: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Studio Retainer"} color={c.fg} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: c.tagBg, color: c.tagFg, padding: "6px 16px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, border: `1px solid ${c.cardBorder}` }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.accent, display: "inline-block" }} />
          {data.availability || "2 Spots Available for Q3"}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 36, alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.14em", textTransform: "uppercase", color: c.muted, marginBottom: 8 }}>
            {data.packageName || "Dedicated Design Partner"}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: rateSize, lineHeight: 0.9, letterSpacing: "-0.03em", overflowWrap: "break-word", wordBreak: "normal" }}>
              {rate}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: c.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              / month
            </span>
          </div>
          <div style={{ marginTop: 20, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 26, lineHeight: 1.25, color: c.fg, overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.tagline || "Senior-level design bandwidth without the agency overhead."}
          </div>
          <div style={{ marginTop: 24 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: c.btnBg, color: c.btnFg, padding: "18px 32px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
              {data.ctaText || "Inquire via DM →"}
            </div>
          </div>
        </div>

        {/* Deliverables Card */}
        <div style={{
          background: c.cardBg, border: `1.5px solid ${c.cardBorder}`, borderRadius: 24, padding: "32px 28px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 12
        }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: c.accent, fontWeight: 700, marginBottom: 4 }}>
            Included in Retainer
          </div>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontFamily: "var(--font-sans)", fontSize: 16, lineHeight: 1.35 }}>
              <span style={{ color: c.accent, fontWeight: 700, flexShrink: 0 }}>✓</span>
              <span style={{ overflowWrap: "break-word", wordBreak: "normal" }}>{it}</span>
            </div>
          ))}
        </div>
      </div>

      <VFooter brand={brand} color={c.fg} borderColor={c.borderColor} />
    </div>
  );
};

/* ============================================== */
/* 19D. PRICING FIXED AUDIT / SPRINT (Pricing)    */
/* ============================================== */
const T_PricingAudit = ({ data, brand }) => {
  const c = getThemeColors(data.bg);
  const headline = data.headline || "Proposal & Document Teardown";
  const headSize = getDynamicFontSize(headline, 56, 24, 32);
  const price = data.price || "$1,800";
  const priceSize = getDynamicFontSize(price, 64, 6, 36, 280);
  const items = (data.deliverables || "24-Page comprehensive teardown report\nRewrite of proposal narrative & pricing table\nCustom production-ready Figma/Doc template\n60-Minute live strategy & review session").split("\n").filter(Boolean).slice(0, 4);

  return (
    <div className="social-frame" style={{ background: c.bg, color: c.fg, padding: "64px 72px", display: "grid", gridTemplateRows: "auto 1fr auto", gap: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Fixed-Scope Sprint"} color={c.fg} />
        <div style={{ display: "inline-flex", padding: "6px 18px", border: `1.5px solid ${c.fg}`, borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {data.duration || "2-Week Turnaround"}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: headSize, lineHeight: 1.05, letterSpacing: "-0.015em", marginBottom: 20, overflowWrap: "break-word", wordBreak: "normal" }}>
          {headline}
        </div>

        <div style={{
          background: c.cardBg, border: `1.5px solid ${c.cardBorder}`, borderRadius: 24, padding: "32px 36px",
          display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 28, alignItems: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: c.muted, marginBottom: 10 }}>
              What You Receive
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, lineHeight: 1.35 }}>
                  <span style={{ color: c.accent, fontWeight: 700 }}>→</span>
                  <span style={{ overflowWrap: "break-word", wordBreak: "normal" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderLeft: `1px solid ${c.cardBorder}`, paddingLeft: 28, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: c.muted }}>
              Flat Investment
            </div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: priceSize, lineHeight: 1, letterSpacing: "-0.02em", color: c.accent, marginTop: 6, overflowWrap: "break-word", wordBreak: "normal" }}>
              {price}
            </div>
            <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 11, color: c.muted, textTransform: "uppercase" }}>
              One-time · 100% money-back guarantee
            </div>
            <div style={{ marginTop: 16, width: "100%", padding: "14px 20px", background: c.btnBg, color: c.btnFg, borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, textAlign: "center" }}>
              {data.ctaText || "Book Sprint →"}
            </div>
          </div>
        </div>
      </div>

      <VFooter brand={brand} color={c.fg} borderColor={c.borderColor} />
    </div>
  );
};

const T_TestimonialEditorial = ({ data, brand }) => {
  const quote = data.quote || "Working with this studio changed how I think about proposals entirely. We closed our next deal the same week.";
  const quoteSize = getDynamicFontSize(quote, 74, 40, 36, 600);
  return (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 0, display: "grid", gridTemplateRows: "170px 1fr 190px", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", inset: "28px 28px auto auto", width: 174, height: 174, border: "1.5px solid rgba(244,238,222,0.24)", borderRadius: "50%" }} />
      <div style={{ padding: "64px 72px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
        <VLabel text={data.kicker || "Client proof"} color="var(--vc-cream)" />
        {brand.logo && brand.logoEnabled !== false
          ? (brand.logoLight
              ? <img src={brand.logoLight} alt="" style={{ height: 30, width: "auto", maxWidth: 120, objectFit: "contain" }} />
              : <img src={brand.logo} alt="" style={{ height: 30, width: "auto", maxWidth: 120, objectFit: "contain", filter: "invert(1)" }} />
            )
          : <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.58 }}>{brand.studioName || "Studio"}</span>
        }
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 40, alignItems: "center", padding: "0 72px", position: "relative", zIndex: 1 }}>
        <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1.5px solid rgba(244,238,222,0.18)", paddingRight: 36 }}>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 240, lineHeight: 0.7, color: "var(--vc-red)", marginTop: 16 }}>"</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 20px)", gap: 8, marginBottom: 16 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ width: 20, height: 20, borderRadius: "50%", background: i < 4 ? "var(--vc-red)" : "var(--vc-cream)", display: "block" }} />
            ))}
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: quoteSize, lineHeight: 1.08, letterSpacing: "-0.01em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {quote}
        </div>
      </div>
      <div style={{ background: "var(--vc-cream)", color: "var(--vc-ink)", padding: "38px 72px", display: "grid", gridTemplateColumns: "112px 1fr auto", gap: 24, alignItems: "center" }}>
        {data.clientPhoto
          ? <img src={data.clientPhoto} alt="" style={{ width: 112, height: 112, objectFit: "cover", flexShrink: 0 }} />
          : <div style={{ width: 112, height: 112, background: "var(--vc-red)", color: "var(--vc-cream)", display: "grid", placeItems: "center", fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 38, flexShrink: 0 }}>
              {((data.clientName || "?")[0] || "?").toUpperCase()}
            </div>
        }
        <div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 34, letterSpacing: "-0.01em", overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.clientName || "Client Name"}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.12em", color: "var(--vc-mute)", textTransform: "uppercase", marginTop: 6, overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.clientTitle || "Founder - Atlas & Bell"}
          </div>
        </div>
        <ArrowOut size={62} color="var(--vc-ink)" />
      </div>
    </div>
  );
};

/* ============================================== */
/* 22. WAITLIST / EARLY ACCESS (CTA)              */
/* ============================================== */
const T_Waitlist = ({ data, brand }) => {
  const headline = data.headline || "The new way to build freelance proposals";
  const headSize = getDynamicFontSize(headline, 108, 24, 48);
  const cta = data.ctaText || "Join the waitlist →";
  const ctaBtnSize = getDynamicFontSize(cta, 22, 18, 14);
  return (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Early Access"} color="var(--vc-cream)" style={{ opacity: 0.8 }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 20px", background: "var(--vc-red)", color: "#fff", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
          {data.spotsLeft || "4 spots left"}
        </span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: headSize, lineHeight: 1.02, letterSpacing: "-0.02em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {headline}
        </div>
        <div style={{ marginTop: 28, fontFamily: "var(--font-helvetica)", fontSize: 32, lineHeight: 1.4, opacity: 0.65, maxWidth: 780, overflowWrap: "break-word", wordBreak: "normal" }}>
          {data.subtext || "Join 350+ designers & founders in private beta testing. Instant access upon invitation."}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, borderTop: "1.5px solid rgba(236,230,214,0.18)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "var(--vc-lime)", color: "var(--vc-ink)", padding: "24px 38px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: ctaBtnSize, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
          <span>{cta}</span>
        </div>
        <Wordmark brand={brand} color="var(--vc-cream)" />
      </div>
    </div>
  );
};

/* ============================================== */
/* 23. FREE RESOURCE / GUIDE (CTA)                */
/* ============================================== */
const T_LeadMagnet = ({ data, brand }) => {
  const benefits = (data.benefits || "Real pricing benchmarks for 2026\nClient outreach & follow-up scripts\nScope negotiation checklist\nContract clause cheatsheet").split("\n").filter(Boolean).slice(0, 4);
  const title = data.title || "The 2026 Freelance Rate & Pricing Guide";
  const titleSize = getDynamicFontSize(title, 84, 22, 42);
  const cta = data.ctaText || "Download free copy →";
  const ctaBtnSize = getDynamicFontSize(cta, 20, 20, 13);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", color: "var(--vc-ink)", padding: 76, display: "grid", gridTemplateRows: "auto 1fr auto", gap: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.category || "Free Resource"} />
        <span style={{ display: "inline-flex", alignItems: "center", padding: "8px 20px", border: "1.5px solid var(--vc-ink)", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {data.deliverableType || "PDF + Notion Sheet"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: titleSize, lineHeight: 1.04, letterSpacing: "-0.015em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {title}
        </div>
        <div style={{ marginTop: 32, display: "grid", gap: 14 }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--vc-ink)", color: "var(--vc-cream)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 13, flexShrink: 0 }}>✓</span>
              <span style={{ fontFamily: "var(--font-helvetica)", fontSize: 28, lineHeight: 1.25, fontWeight: 500, overflowWrap: "break-word", wordBreak: "normal" }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1.5px solid rgba(14,14,14,0.15)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "var(--vc-red)", color: "#fff", padding: "22px 34px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: ctaBtnSize, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <span>{cta}</span>
        </div>
        <Asterisk size={56} />
      </div>
    </div>
  );
};

/* ============================================== */
/* 24. DM KEYWORD / AUTOMATION (CTA)              */
/* ============================================== */
const T_DMKeyword = ({ data, brand }) => {
  const headline = data.headline || "Want my Notion Client Onboarding Portal?";
  const headSize = getDynamicFontSize(headline, 100, 26, 46);
  const keyword = data.keyword || "ONBOARD";
  const kwSize = getDynamicFontSize(keyword, 140, 6, 46, 760);
  return (
    <div className="social-frame" style={{ background: "var(--vc-lime)", color: "var(--vc-ink)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Free Drop"} />
        <ArrowOut size={56} color="var(--vc-ink)" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: headSize, lineHeight: 1.04, letterSpacing: "-0.02em", maxWidth: 860, overflowWrap: "break-word", wordBreak: "normal" }}>
          {headline}
        </div>
        <div style={{ marginTop: 36, background: "var(--vc-ink)", color: "var(--vc-cream)", padding: "36px 48px", borderRadius: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>
            Drop this word in comments:
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: kwSize, color: "var(--vc-lime)", letterSpacing: "0.08em", lineHeight: 0.95, overflowWrap: "break-word", wordBreak: "normal" }}>
            "{keyword}"
          </div>
        </div>
        <div style={{ marginTop: 22, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 32, opacity: 0.75, overflowWrap: "break-word", wordBreak: "normal" }}>
          ...and I'll automatically DM you {data.resourceName || "the Notion template link"}.
        </div>
      </div>
      <VFooter brand={brand} borderColor="rgba(14,14,14,0.18)" />
    </div>
  );
};

/* ============================================== */
/* 25. CLIENT METRIC IMPACT (Social Proof)        */
/* ============================================== */
const T_MetricProof = ({ data, brand }) => {
  const metric = data.metric || "+240%";
  const metricSize = getDynamicFontSize(metric, 280, 4, 56);
  return (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 80, display: "grid", gridTemplateRows: "auto 1fr auto", gap: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Client Results"} color="var(--vc-cream)" style={{ opacity: 0.8 }} />
        <Asterisk size={56} color="var(--vc-lime)" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 800, fontSize: metricSize, lineHeight: metricSize > 200 ? 0.9 : 0.98, color: "var(--vc-lime)", letterSpacing: "-0.04em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {metric}
        </div>
        <div style={{ marginTop: 18, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 44, lineHeight: 1.15, maxWidth: 800, overflowWrap: "break-word", wordBreak: "normal" }}>
          {renderSocialMd(data.metricLabel || "Increase in closed deal size in 60 days")}
        </div>
        <div style={{ marginTop: 20, fontFamily: "var(--font-helvetica)", fontSize: 26, lineHeight: 1.4, opacity: 0.65, maxWidth: 760, overflowWrap: "break-word", wordBreak: "normal" }}>
          {renderSocialMd(data.summary || "Complete repositioning and brand identity overhaul for an enterprise B2B consultancy.")}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1.5px solid rgba(236,230,214,0.18)" }}>
        <div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 26, overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.clientName || "Sarah Jenkins"}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6, marginTop: 4, overflowWrap: "break-word", wordBreak: "normal" }}>
            {data.clientRole || "Managing Director · Apex"}
          </div>
        </div>
        <Wordmark brand={brand} color="var(--vc-cream)" />
      </div>
    </div>
  );
};

/* ============================================== */
/* 26. SOCIAL REVIEW CARD (Social Proof)          */
/* ============================================== */
const T_TweetReview = ({ data, brand }) => {
  const review = data.review || "Vanaila Studio completely transformed our documents. Our conversion rate on proposals jumped from 22% to 68% in two weeks.";
  const reviewSize = getDynamicFontSize(review, 68, 60, 36);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", color: "var(--vc-ink)", padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Client Feedback"} />
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} style={{ color: "var(--vc-red)", fontSize: 28 }}>★</span>
          ))}
        </div>
      </div>
      <div style={{ padding: "48px 0" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: reviewSize, lineHeight: 1.15, letterSpacing: "-0.01em", overflowWrap: "break-word", wordBreak: "normal" }}>
          "{renderSocialMd(review)}"
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, borderTop: "1.5px solid rgba(14,14,14,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: "var(--vc-ink)", color: "var(--vc-cream)", display: "grid", placeItems: "center", fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 26 }}>
            {((data.clientName || "A")[0] || "A").toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 26, display: "flex", alignItems: "center", gap: 8 }}>
              {data.clientName || "Alex Rivera"}
              <span style={{ fontSize: 16, color: "var(--vc-blue)" }}>✓</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: "var(--vc-mute)", marginTop: 2 }}>
              {data.handle || "@alexrivera_"} · {data.clientTitle || "Founder"}
            </div>
          </div>
        </div>
        <Paperclip />
      </div>
    </div>
  );
};

/* ============================================== */
/* 27. CASE STUDY SNAPSHOT (Social Proof)         */
/* ============================================== */
const T_CaseStudy = ({ data, brand }) => {
  return (
    <div className="social-frame" style={{ background: "var(--vc-blue)", color: "#fff", padding: 76, display: "grid", gridTemplateRows: "auto 1fr auto", gap: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Case Study"} color="#fff" style={{ opacity: 0.85 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.75 }}>
          {data.industry || "Design & Tech · 2026"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 68, lineHeight: 1, overflowWrap: "break-word", wordBreak: "normal" }}>
          {data.client || "Luminary Media"}
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.08)", padding: "20px 28px", borderRadius: 16, borderLeft: "4px solid var(--vc-red)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>The Problem</div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontSize: 24, fontWeight: 500, marginTop: 4, overflowWrap: "break-word", wordBreak: "normal" }}>{renderSocialMd(data.problem || "Low proposal response rate & inconsistent brand assets")}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", padding: "20px 28px", borderRadius: 16, borderLeft: "4px solid var(--vc-lime)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>The Solution</div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontSize: 24, fontWeight: 500, marginTop: 4, overflowWrap: "break-word", wordBreak: "normal" }}>{renderSocialMd(data.solution || "Custom document template system & editorial style guide")}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", padding: "20px 28px", borderRadius: 16, borderLeft: "4px solid #fff" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>The Result</div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontSize: 24, fontWeight: 700, color: "var(--vc-lime)", marginTop: 4, overflowWrap: "break-word", wordBreak: "normal" }}>{renderSocialMd(data.outcome || "3.5x higher contract close rate & $95k in new client revenue")}</div>
          </div>
        </div>
      </div>
      <VFooter brand={brand} color="#fff" borderColor="rgba(255,255,255,0.2)" />
    </div>
  );
};

/* ============================================== */
/* 28. QUICK AUDIT / CHECKLIST (Single)           */
/* ============================================== */
const T_Checklist = ({ data, brand }) => {
  const items = (data.items || "PO or written approval attached\nPayment due date and bank details clear\nItemized deliverables breakdown\nLate fee terms clearly stated\nDirect contact for accounts payable").split("\n").filter(Boolean).slice(0, 5);
  const title = data.title || "5 Things to check before sending an invoice";
  const titleSize = getDynamicFontSize(title, 76, 24, 40);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", color: "var(--vc-ink)", padding: 76, display: "grid", gridTemplateRows: "auto 1fr auto", gap: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Audit Checklist"} />
        <Asterisk size={56} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: titleSize, lineHeight: 1.05, letterSpacing: "-0.02em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {title}
        </div>
        <div style={{ marginTop: 32, display: "grid", gap: 16 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 18, alignItems: "center", paddingBottom: 10, borderBottom: "1px solid rgba(14,14,14,0.1)" }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--vc-ink)", color: "var(--vc-lime)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>✓</span>
              <span style={{ fontFamily: "var(--font-helvetica)", fontSize: 28, fontWeight: 500, lineHeight: 1.2, overflowWrap: "break-word", wordBreak: "normal" }}>{renderSocialMd(it)}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1.5px solid rgba(14,14,14,0.15)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--vc-mute)", overflowWrap: "break-word", wordBreak: "normal" }}>
          {renderSocialMd(data.note || "Save this post for your next project")}
        </span>
        <Wordmark brand={brand} />
      </div>
    </div>
  );
};

/* ============================================== */
/* 29. MYTH VS. REALITY (Single)                  */
/* ============================================== */
const T_Opinion = ({ data, brand }) => {
  return (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 76, display: "grid", gridTemplateRows: "auto 1fr auto", gap: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Reality Check"} color="var(--vc-cream)" style={{ opacity: 0.8 }} />
        <Paperclip color="var(--vc-cream)" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 24, padding: "36px 32px", border: "1px solid rgba(255,255,255,0.12)", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-flex", padding: "6px 16px", background: "rgba(239,68,68,0.2)", color: "var(--vc-red)", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
              {data.mythTitle || "Myth"}
            </div>
            <div style={{ marginTop: 20, fontFamily: "var(--font-helvetica)", fontSize: 32, lineHeight: 1.3, opacity: 0.75, textDecoration: "line-through", overflowWrap: "break-word", wordBreak: "normal" }}>
              {renderSocialMd(data.myth || "Work 80 hours a week, lower your rates to compete, and take every client you can find.")}
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, opacity: 0.4, marginTop: 20 }}>Conventional advice</div>
        </div>
        <div style={{ background: "var(--vc-cream)", color: "var(--vc-ink)", borderRadius: 24, padding: "36px 32px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}>
          <div>
            <div style={{ display: "inline-flex", padding: "6px 16px", background: "var(--vc-ink)", color: "var(--vc-lime)", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
              {data.truthTitle || "Reality"}
            </div>
            <div style={{ marginTop: 20, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 36, lineHeight: 1.25, overflowWrap: "break-word", wordBreak: "normal" }}>
              {renderSocialMd(data.truth || "Pick one high-value niche, price on business outcomes, and say no to 80% of inquiries.")}
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--vc-red)", fontWeight: 700, marginTop: 20 }}>What actually works</div>
        </div>
      </div>
      <VFooter brand={brand} color="var(--vc-cream)" borderColor="rgba(236,230,214,0.18)" />
    </div>
  );
};

/* ============================================== */
/* 30. 3 PILLARS / CORE PRINCIPLES (Single)       */
/* ============================================== */
const T_Pillars = ({ data, brand }) => {
  const headline = data.headline || "The 3 Pillars of High-Earning Freelancers";
  const headSize = getDynamicFontSize(headline, 72, 26, 40);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", color: "var(--vc-ink)", padding: 76, display: "grid", gridTemplateRows: "auto 1fr auto", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Core Principles"} />
        <ArrowOut size={56} color="var(--vc-ink)" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: headSize, lineHeight: 1, letterSpacing: "-0.015em", marginBottom: 24, overflowWrap: "break-word", wordBreak: "normal" }}>
          {headline}
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: "22px 30px", borderRadius: 18, display: "grid", gridTemplateColumns: "44px 1fr", gap: 16, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 24, color: "var(--vc-lime)", fontWeight: 700 }}>01</span>
            <div>
              <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 24, overflowWrap: "break-word", wordBreak: "normal" }}>{data.pillar1Title || "Positioning"}</div>
              <div style={{ fontFamily: "var(--font-helvetica)", fontSize: 20, opacity: 0.7, marginTop: 2, overflowWrap: "break-word", wordBreak: "normal" }}>{renderSocialMd(data.pillar1Body || "Specialist over generalist. Solve an expensive problem.")}</div>
            </div>
          </div>
          <div style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: "22px 30px", borderRadius: 18, display: "grid", gridTemplateColumns: "44px 1fr", gap: 16, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 24, color: "var(--vc-lime)", fontWeight: 700 }}>02</span>
            <div>
              <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 24, overflowWrap: "break-word", wordBreak: "normal" }}>{data.pillar2Title || "Packaging"}</div>
              <div style={{ fontFamily: "var(--font-helvetica)", fontSize: 20, opacity: 0.7, marginTop: 2, overflowWrap: "break-word", wordBreak: "normal" }}>{renderSocialMd(data.pillar2Body || "Fixed deliverables, clear scopes, zero hourly billing.")}</div>
            </div>
          </div>
          <div style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: "22px 30px", borderRadius: 18, display: "grid", gridTemplateColumns: "44px 1fr", gap: 16, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 24, color: "var(--vc-lime)", fontWeight: 700 }}>03</span>
            <div>
              <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 24, overflowWrap: "break-word", wordBreak: "normal" }}>{data.pillar3Title || "Pipeline"}</div>
              <div style={{ fontFamily: "var(--font-helvetica)", fontSize: 20, opacity: 0.7, marginTop: 2, overflowWrap: "break-word", wordBreak: "normal" }}>{renderSocialMd(data.pillar3Body || "Always cultivate relationships before you need work.")}</div>
            </div>
          </div>
        </div>
      </div>
      <VFooter brand={brand} borderColor="rgba(14,14,14,0.15)" />
    </div>
  );
};

/* ============ Template registry ============ */
const f = (key, label, opts = {}) => ({ key, label, type: opts.type || "text", placeholder: opts.placeholder, hint: opts.hint });
const fA = (key, label, opts = {}) => f(key, label, { type: "textarea", ...opts });

const SocialTemplates = [
  /* --- Single (Instagram 1:1) --- */
  { id: "quote",        name: "Pull Quote",        kind: "Single",
    slides: (p) => [<T_Quote {...p} />],
    fields: [
      f("label", "Top-right label"),
      fA("quote", "Quote"),
      f("role", "Role pill", { placeholder: "Director" }),
      f("attribution", "Name pill"),
    ] },
  { id: "stat",         name: "Stat Hero",         kind: "Single",
    slides: (p) => [<T_Stat {...p} />],
    fields: [
      f("kicker", "Kicker"),
      f("italicLead", "Italic lead-in", { placeholder: "Why do most posts fail?" }),
      f("stat", "Stat", { placeholder: "91%" }),
      fA("statLabel", "Statement"),
    ] },
  { id: "announce",     name: "Announcement",      kind: "Single",
    slides: (p) => [<T_Announce {...p} />],
    fields: [
      f("label", "Bracket label"),
      f("headlineA", "Headline · roman"),
      f("headlineB", "Headline · italic"),
    ] },
  { id: "steps",        name: "Process",           kind: "Single",
    slides: (p) => [<T_Steps {...p} />],
    fields: [
      f("kicker", "Top-left label", { placeholder: "Method" }),
      fA("headline", "Headline (the word to circle goes in the next field)"),
      f("circled", "Word to circle in red", { placeholder: "POSTS" }),
      f("pillLeft", "Bottom-left pill"),
      f("pillRight", "Top-right pill"),
      fA("note", "Italic note · bottom-right"),
    ] },
  { id: "ba",           name: "Before / After",    kind: "Single",
    slides: (p) => [<T_BeforeAfter {...p} />],
    fields: [
      f("beforeSubtitle", "Before — subtitle", { placeholder: "The way most freelancers work." }),
      fA("before", "Before — headline"),
      f("beforeNote", "Before — mono note"),
      f("afterSubtitle", "After — subtitle", { placeholder: "The way our system works." }),
      fA("after", "After — headline"),
      f("afterNote", "After — mono note"),
    ] },
  { id: "manifesto",    name: "Manifesto",         kind: "Single",
    slides: (p) => [<T_Manifesto {...p} />],
    fields: [
      f("kicker", "Kicker"),
      f("lead", "Lead · roman", { placeholder: "Tech that" }),
      f("italic", "Italic word/phrase", { placeholder: "just works." }),
      fA("tail", "Trailing sentence (muted)"),
    ] },
  { id: "checklist",    name: "Quick Audit",       kind: "Single",
    slides: (p) => [<T_Checklist {...p} />],
    fields: [
      f("kicker", "Kicker label", { placeholder: "Audit Checklist" }),
      f("title", "Checklist title", { placeholder: "5 Things to check before sending an invoice" }),
      fA("items", "Items (one per line, up to 5)", { hint: "Add 3–5 items." }),
      f("note", "Bottom note", { placeholder: "Save this post for your next project" }),
    ] },
  { id: "opinion",      name: "Myth vs Reality",   kind: "Single",
    slides: (p) => [<T_Opinion {...p} />],
    fields: [
      f("kicker", "Kicker label", { placeholder: "Reality Check" }),
      f("mythTitle", "Myth label", { placeholder: "Myth" }),
      fA("myth", "Myth statement"),
      f("truthTitle", "Reality label", { placeholder: "Reality" }),
      fA("truth", "Reality statement"),
    ] },
  { id: "pillars",      name: "Core Pillars",      kind: "Single",
    slides: (p) => [<T_Pillars {...p} />],
    fields: [
      f("kicker", "Kicker label", { placeholder: "Core Principles" }),
      f("headline", "Headline", { placeholder: "The 3 Pillars of High-Earning Freelancers" }),
      f("pillar1Title", "Pillar 01 Title", { placeholder: "Positioning" }),
      f("pillar1Body", "Pillar 01 Description"),
      f("pillar2Title", "Pillar 02 Title", { placeholder: "Packaging" }),
      f("pillar2Body", "Pillar 02 Description"),
      f("pillar3Title", "Pillar 03 Title", { placeholder: "Pipeline" }),
      f("pillar3Body", "Pillar 03 Description"),
    ] },

  /* --- Carousel --- */
  { id: "framework",    name: "Framework",         kind: "Carousel",
    slides: (p) => T_Framework(p),
    fields: [
      f("title", "Title (cover)"),
      f("subtitle", "Subtitle (cover)"),
      f("coverLabel", "Cover bracket label", { placeholder: "A Framework" }),
      fA("steps", "Steps — 'Name — body', one per line", { hint: "One step per line. No hard limit." }),
      f("ctaText", "Closing slide CTA text (optional)", { hint: "Leave empty to skip the closing slide." }),
    ] },
  { id: "story",        name: "Short Story",       kind: "Carousel",
    slides: (p) => T_Story(p),
    fields: [
      f("kicker", "Cover kicker", { placeholder: "A Short Story" }),
      f("coverLead", "Cover · roman"),
      f("coverItalic", "Cover · italic"),
      fA("slides", "Story slides — 'Kicker — Body', one per line", { hint: "Colors cycle cream → blue → lime → ink. Add as many slides as needed." }),
      f("ctaText", "Closing slide CTA text (optional)", { hint: "Leave empty to skip the closing slide." }),
    ] },
  { id: "tipscarousel", name: "Tips Carousel",     kind: "Carousel",
    slides: (p) => T_Tips(p),
    fields: [
      f("kicker", "Kicker"),
      f("ruleLabel", "Slide label word", { placeholder: "Rule", hint: "Appears as 'Rule 1 of N'. Change to Tip, Lesson, Step…" }),
      f("titleItalic", "Cover italic line", { placeholder: "I keep close." }),
      fA("subtitle", "Subtitle (cover)"),
      fA("tips", "Tips (one per line)", { hint: "Add as many as needed — no limit." }),
      f("ctaText", "Closing slide CTA text (optional)", { hint: "Leave empty to skip the closing slide." }),
    ] },
  { id: "mistakes",    name: "Mistakes Made",      kind: "Carousel",
    slides: (p) => T_Mistakes(p),
    fields: [
      f("kicker", "Kicker", { placeholder: "Hard Lessons" }),
      f("titleItalic", "Cover italic title", { placeholder: "I made for you." }),
      fA("subtitle", "Cover subtitle"),
      fA("mistakes", "Mistakes — 'Title — Lesson', one per line", { hint: "No limit. Title is bold; lesson appears as italic note." }),
      f("ctaText", "Closing CTA text (optional)", { hint: "Leave empty to skip the closing slide." }),
    ] },
  { id: "miniguide",   name: "Mini Guide",          kind: "Carousel",
    slides: (p) => T_MiniGuide(p),
    fields: [
      f("kicker", "Kicker", { placeholder: "Mini Guide" }),
      f("prefix", "Top prefix label", { placeholder: "How to" }),
      f("topic", "Topic / title", { placeholder: "Ship Faster" }),
      f("intro", "Cover intro line", { hint: "Leave empty to auto-generate from step count." }),
      fA("steps", "Steps — 'Name — detail', one per line", { hint: "Detail is optional. No slide limit." }),
      f("ctaText", "Closing CTA text (optional)", { hint: "Leave empty to skip the closing slide." }),
    ] },

  /* --- CTA --- */
  { id: "booking",      name: "Now Booking",       kind: "CTA",
    slides: (p) => [<T_Booking {...p} />],
    fields: [
      f("label", "Top-left label", { placeholder: "Now Booking" }),
      f("lead", "Lead-in", { placeholder: "Two spots open for" }),
      f("window", "Window (circled)", { placeholder: "Q3" }),
      f("project", "Accent / Trailing text", { placeholder: "projects." }),
      fA("subtext", "Subtext"),
      f("ctaText", "CTA text"),
    ] },
  { id: "linkbio",      name: "Link-in-bio",       kind: "CTA",
    slides: (p) => [<T_LinkBio {...p} />],
    fields: [
      f("label", "Top label"),
      f("kicker", "Kicker"),
      f("headlineA", "Headline · roman"),
      f("headlineB", "Headline · italic"),
      fA("subtext", "Subtext"),
      f("url", "URL / path"),
    ] },
  { id: "launch",       name: "Launch",            kind: "CTA",
    slides: (p) => [<T_Launch {...p} />],
    fields: [
      f("kicker", "Top-left label", { placeholder: "Launching" }),
      f("category", "Category"),
      f("productName", "Product name"),
      fA("tagline", "Tagline"),
      f("date", "Launch date"),
      f("ctaText", "CTA text"),
    ] },
  { id: "waitlist",     name: "Waitlist",          kind: "CTA",
    slides: (p) => [<T_Waitlist {...p} />],
    fields: [
      f("kicker", "Kicker", { placeholder: "Early Access" }),
      f("spotsLeft", "Spots badge", { placeholder: "4 spots left" }),
      fA("headline", "Main headline", { placeholder: "The new way to build freelance proposals" }),
      fA("subtext", "Subtext"),
      f("ctaText", "CTA button text", { placeholder: "Join the waitlist →" }),
    ] },
  { id: "leadmagnet",   name: "Free Resource",     kind: "CTA",
    slides: (p) => [<T_LeadMagnet {...p} />],
    fields: [
      f("category", "Top label", { placeholder: "Free Resource" }),
      f("deliverableType", "Format pill", { placeholder: "PDF + Notion Sheet" }),
      fA("title", "Resource title", { placeholder: "The 2026 Freelance Rate & Pricing Guide" }),
      fA("benefits", "Included benefits (one per line, up to 4)"),
      f("ctaText", "CTA button text", { placeholder: "Download free copy →" }),
    ] },
  { id: "dmkeyword",    name: "DM Keyword",        kind: "CTA",
    slides: (p) => [<T_DMKeyword {...p} />],
    fields: [
      f("kicker", "Top-left kicker", { placeholder: "Free Drop" }),
      fA("headline", "Question / hook", { placeholder: "Want my Notion Client Onboarding Portal?" }),
      f("keyword", "Comment keyword", { placeholder: "ONBOARD" }),
      f("resourceName", "Resource name in footnote", { placeholder: "the Notion template link" }),
    ] },

  /* --- Social Proof --- */
  { id: "testimonial", name: "Testimonial Card",    kind: "Social Proof",
    slides: (p) => [<T_TestimonialEditorial {...p} />],
    fields: [
      f("kicker", "Kicker label", { placeholder: "Client proof" }),
      fA("quote", "Quote"),
      f("clientName", "Client name"),
      f("clientTitle", "Client title / company", { placeholder: "Founder · Atlas & Bell" }),
      { key: "clientPhoto", label: "Client photo (optional)", type: "image" },
    ] },
  { id: "metricproof", name: "Metric Impact",       kind: "Social Proof",
    slides: (p) => [<T_MetricProof {...p} />],
    fields: [
      f("kicker", "Kicker label", { placeholder: "Client Results" }),
      f("metric", "Big metric number", { placeholder: "+240%" }),
      fA("metricLabel", "Metric description / timeframe", { placeholder: "Increase in closed deal size in 60 days" }),
      fA("summary", "Context / engagement summary"),
      f("clientName", "Client name", { placeholder: "Sarah Jenkins" }),
      f("clientRole", "Client role & company", { placeholder: "Managing Director · Apex" }),
    ] },
  { id: "tweetreview", name: "Social Review",       kind: "Social Proof",
    slides: (p) => [<T_TweetReview {...p} />],
    fields: [
      f("kicker", "Kicker", { placeholder: "Client Feedback" }),
      fA("review", "Review quote"),
      f("clientName", "Client name", { placeholder: "Alex Rivera" }),
      f("handle", "Social handle", { placeholder: "@alexrivera_" }),
      f("clientTitle", "Role or company", { placeholder: "Founder" }),
    ] },
  { id: "casestudy",   name: "Case Study Snapshot", kind: "Social Proof",
    slides: (p) => [<T_CaseStudy {...p} />],
    fields: [
      f("kicker", "Kicker", { placeholder: "Case Study" }),
      f("client", "Client name / project", { placeholder: "Luminary Media" }),
      f("industry", "Industry & year", { placeholder: "Design & Tech · 2026" }),
      fA("problem", "The Problem"),
      fA("solution", "The Solution"),
      fA("outcome", "The Result"),
    ] },

  /* --- News --- */
  { id: "breaking",    name: "Breaking Post",       kind: "News",
    slides: (p) => [<T_BreakingPost {...p} />],
    fields: [
      f("category", "Top-bar category", { placeholder: "Industry" }),
      f("date", "Date", { placeholder: "May · 2026" }),
      f("kicker", "Kicker label", { placeholder: "Breaking" }),
      f("headline", "Headline"),
      f("subline", "Subline · italic (optional)"),
      fA("body", "Body copy (optional)"),
    ] },
  { id: "digest",      name: "Weekly Digest",       kind: "News",
    slides: (p) => [<T_WeeklyDigest {...p} />],
    fields: [
      f("period", "Period label", { placeholder: "This Week In" }),
      f("topic", "Topic", { placeholder: "Design" }),
      fA("items", "Items (one per line)", { hint: "3–5 items works best." }),
    ] },
  { id: "newshero",    name: "News Hero Photo",     kind: "News",
    slides: (p) => [<T_NewsHero {...p} />],
    fields: [
      f("category", "Category pill", { placeholder: "Report" }),
      f("date", "Date label", { placeholder: "May 2026" }),
      { key: "image", label: "Featured Photo", type: "image" },
      f("tag", "Photo overlay tag (optional)", { placeholder: "Exclusive" }),
      f("headline", "News headline", { placeholder: "Freelance studios win 75% of new tech branding briefs" }),
      fA("synopsis", "Editorial synopsis / summary"),
      { key: "bg", label: "Theme", type: "select", options: THEME_OPTIONS },
    ] },
  { id: "newssplit",   name: "News Split 50/50",    kind: "News",
    slides: (p) => [<T_NewsSplit {...p} />],
    fields: [
      f("category", "Category pill", { placeholder: "Press" }),
      { key: "image", label: "Portrait Photo", type: "image" },
      f("kicker", "Kicker label", { placeholder: "Industry Dispatch" }),
      f("headline", "Headline", { placeholder: "The shift towards asynchronous studio retainers" }),
      fA("takeaways", "Key takeaways (one per line, up to 3)"),
      { key: "bg", label: "Theme", type: "select", options: THEME_OPTIONS },
    ] },
  { id: "newsinterview", name: "News Spotlight",   kind: "News",
    slides: (p) => [<T_NewsInterview {...p} />],
    fields: [
      f("kicker", "Kicker pill", { placeholder: "Founder Spotlight" }),
      f("publication", "Publication / Issue tag", { placeholder: "Issue No. 12" }),
      { key: "image", label: "Portrait Photo", type: "image" },
      f("speaker", "Speaker Name", { placeholder: "Marcus Bell" }),
      f("title", "Speaker Title", { placeholder: "Managing Partner" }),
      fA("quote", "Pull quote statement"),
      f("context", "Quote source / context", { placeholder: "On the future of document design" }),
      { key: "bg", label: "Theme", type: "select", options: THEME_OPTIONS },
    ] },

  /* --- Photo --- */
  { id: "photopost",   name: "Photo Post",          kind: "Photo",
    slides: (p) => [<T_PhotoPost {...p} />],
    fields: [
      { key: "image", label: "Photo", type: "image" },
      f("tag", "Tag / category label (optional)"),
      fA("caption", "Caption"),
    ] },
  { id: "showcase",    name: "Work Showcase",       kind: "Photo",
    slides: (p) => [<T_WorkShowcase {...p} />],
    fields: [
      { key: "image", label: "Project photo", type: "image" },
      f("client", "Client name"),
      f("projectType", "Project type", { placeholder: "Brand" }),
      f("year", "Year", { placeholder: "2026" }),
      fA("tagline", "Project tagline"),
    ] },
  { id: "team1",       name: "Team Onboard · Single", kind: "Photo",
    slides: (p) => [<T_Team1 {...p} />],
    fields: [
      f("kicker", "Kicker label", { placeholder: "Welcome to the Team" }),
      { key: "image", label: "Member Photo", type: "image" },
      f("badge", "Pill Badge (e.g. New Joiner, Top Performer, Best Achiever)", { placeholder: "New Joiner" }),
      f("name", "Member Name", { placeholder: "Elena Rostova" }),
      f("position", "Position / Role", { placeholder: "Lead Brand Designer" }),
      f("department", "Department / Location (optional)", { placeholder: "Brand Studio · London" }),
      fA("bio", "Short Welcome Note (optional)", { placeholder: "Joining our studio to lead brand identity and digital design systems." }),
      { key: "bg", label: "Theme", type: "select", options: THEME_OPTIONS },
    ] },
  { id: "team2",       name: "Team Onboard · Duo",    kind: "Photo",
    slides: (p) => [<T_Team2 {...p} />],
    fields: [
      f("kicker", "Kicker label", { placeholder: "New Joiners" }),
      f("headline", "Headline", { placeholder: "Welcoming two new leads to the studio" }),
      { key: "image1", label: "Member 1 Photo", type: "image" },
      f("name1", "Member 1 Name", { placeholder: "Marcus Vance" }),
      f("position1", "Member 1 Position", { placeholder: "Creative Director" }),
      { key: "image2", label: "Member 2 Photo", type: "image" },
      f("name2", "Member 2 Name", { placeholder: "Aria Chen" }),
      f("position2", "Member 2 Position", { placeholder: "Senior Engineer" }),
      { key: "bg", label: "Theme", type: "select", options: THEME_OPTIONS },
    ] },
  { id: "team3",       name: "Team Onboard · Trio",   kind: "Photo",
    slides: (p) => [<T_Team3 {...p} />],
    fields: [
      f("kicker", "Kicker label", { placeholder: "Meet the Crew" }),
      f("headline", "Headline", { placeholder: "Meet the new faces at the studio" }),
      { key: "image1", label: "Member 1 Photo", type: "image" },
      f("name1", "Member 1 Name", { placeholder: "Sophia Ray" }),
      f("position1", "Member 1 Position", { placeholder: "Design Lead" }),
      { key: "image2", label: "Member 2 Photo", type: "image" },
      f("name2", "Member 2 Name", { placeholder: "Liam Thorne" }),
      f("position2", "Member 2 Position", { placeholder: "Staff Engineer" }),
      { key: "image3", label: "Member 3 Photo", type: "image" },
      f("name3", "Member 3 Name", { placeholder: "Maya Patel" }),
      f("position3", "Member 3 Position", { placeholder: "Product Strategist" }),
      { key: "bg", label: "Theme", type: "select", options: THEME_OPTIONS },
    ] },
  { id: "team4",       name: "Team Onboard · Quad",   kind: "Photo",
    slides: (p) => [<T_Team4 {...p} />],
    fields: [
      f("kicker", "Kicker label", { placeholder: "Team Expansion" }),
      f("headline", "Headline", { placeholder: "Welcoming 4 new team members" }),
      { key: "image1", label: "Member 1 Photo", type: "image" },
      f("name1", "Member 1 Name", { placeholder: "Elena Rostova" }),
      f("position1", "Member 1 Position", { placeholder: "Brand Lead" }),
      { key: "image2", label: "Member 2 Photo", type: "image" },
      f("name2", "Member 2 Name", { placeholder: "Marcus Vance" }),
      f("position2", "Member 2 Position", { placeholder: "Creative Director" }),
      { key: "image3", label: "Member 3 Photo", type: "image" },
      f("name3", "Member 3 Name", { placeholder: "Aria Chen" }),
      f("position3", "Member 3 Position", { placeholder: "Staff Engineer" }),
      { key: "image4", label: "Member 4 Photo", type: "image" },
      f("name4", "Member 4 Name", { placeholder: "Sophia Ray" }),
      f("position4", "Member 4 Position", { placeholder: "Product Strategist" }),
      { key: "bg", label: "Theme", type: "select", options: THEME_OPTIONS },
    ] },

  /* --- Pricing --- */
  { id: "pricing",     name: "Pricing Card",        kind: "Pricing",
    slides: (p) => [<T_PricingEditorial {...p} />],
    fields: [
      f("kicker", "Proposal / kicker label", { placeholder: "Proposal No. 01" }),
      f("packageName", "Package name", { placeholder: "Brand Starter" }),
      f("price", "Price (number only)", { placeholder: "1500" }),
      { key: "currency", label: "Currency", type: "select", options: [{ value: "USD", label: "USD ($)" }, { value: "IDR", label: "IDR (Rp)" }, { value: "EUR", label: "EUR (€)" }, { value: "GBP", label: "GBP (£)" }] },
      fA("features", "Features (one per line, 4–6 lines)"),
      f("ctaText", "CTA text", { placeholder: "DM to get started →" }),
      { key: "bg", label: "Theme", type: "select", options: THEME_OPTIONS },
    ] },
  { id: "pricing3tier", name: "Pricing 3-Tier Grid", kind: "Pricing",
    slides: (p) => [<T_Pricing3Tier {...p} />],
    fields: [
      f("kicker", "Kicker label", { placeholder: "Investment & Plans" }),
      f("headline", "Headline", { placeholder: "Transparent packages for every project stage" }),
      f("tier1Name", "Tier 1 Name", { placeholder: "Starter" }),
      f("tier1Price", "Tier 1 Price", { placeholder: "$1,200" }),
      f("tier1Desc", "Tier 1 Subtitle", { placeholder: "Essential brand basics" }),
      fA("tier1Features", "Tier 1 Features (one per line, up to 4)"),
      f("tier2Name", "Tier 2 Name (Popular)", { placeholder: "Pro Package" }),
      f("tier2Price", "Tier 2 Price", { placeholder: "$3,500" }),
      f("tier2Desc", "Tier 2 Subtitle", { placeholder: "Full identity & system" }),
      fA("tier2Features", "Tier 2 Features (one per line, up to 5)"),
      f("tier3Name", "Tier 3 Name", { placeholder: "Partner" }),
      f("tier3Price", "Tier 3 Price", { placeholder: "$6,000" }),
      f("tier3Desc", "Tier 3 Subtitle", { placeholder: "Custom end-to-end" }),
      fA("tier3Features", "Tier 3 Features (one per line, up to 5)"),
      { key: "bg", label: "Theme", type: "select", options: THEME_OPTIONS },
    ] },
  { id: "pricingretainer", name: "Pricing Retainer", kind: "Pricing",
    slides: (p) => [<T_PricingRetainer {...p} />],
    fields: [
      f("kicker", "Kicker label", { placeholder: "Studio Retainer" }),
      f("availability", "Availability badge", { placeholder: "2 Spots Available for Q3" }),
      f("packageName", "Package name", { placeholder: "Dedicated Design Partner" }),
      f("rate", "Monthly rate", { placeholder: "$4,500" }),
      f("tagline", "Tagline / Value proposition"),
      fA("deliverables", "Included deliverables (one per line, up to 5)"),
      f("ctaText", "CTA button text", { placeholder: "Inquire via DM →" }),
      { key: "bg", label: "Theme", type: "select", options: THEME_OPTIONS },
    ] },
  { id: "pricingaudit", name: "Pricing Audit / Sprint", kind: "Pricing",
    slides: (p) => [<T_PricingAudit {...p} />],
    fields: [
      f("kicker", "Kicker label", { placeholder: "Fixed-Scope Sprint" }),
      f("duration", "Duration pill", { placeholder: "2-Week Turnaround" }),
      f("headline", "Sprint Title", { placeholder: "Proposal & Document Teardown" }),
      f("price", "Flat fee", { placeholder: "$1,800" }),
      fA("deliverables", "Deliverables checklist (one per line, up to 4)"),
      f("ctaText", "Booking button text", { placeholder: "Book Sprint →" }),
      { key: "bg", label: "Theme", type: "select", options: THEME_OPTIONS },
    ] },
];

export {
  SocialTemplates,
  Paperclip, Chevron, ArrowOut, Asterisk, XMark,
  HandCircle, Underscribble, PhotoSlot, CrescentMark,
  VLabel, VFooter, Wordmark,
};
