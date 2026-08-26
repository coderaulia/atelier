// @ts-nocheck
import { fmt } from '../documents/utils';

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

/* Dynamic font size scaler for preventing text clipping */
export function getDynamicFontSize(
  text: string | undefined | null,
  baseSize: number,
  maxCharsAtBase: number = 5,
  minSize: number = Math.round(baseSize * 0.35)
): number {
  const str = String(text ?? "").trim();
  const len = str.length;
  if (len <= maxCharsAtBase || maxCharsAtBase <= 0) return baseSize;
  const scale = maxCharsAtBase / len;
  return Math.max(minSize, Math.round(baseSize * Math.pow(scale, 0.85)));
}

/* ============================================== */
/* 1. PULL QUOTE (single)                          */
/* ============================================== */
const T_Quote = ({ data, brand }) => {
  const quoteText = data.quote || "The secret to social media success? Authenticity & consistency";
  const quoteSize = getDynamicFontSize(quoteText, 116, 50, 60);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Paperclip />
        <VLabel text={data.label || "A Better Future"} style={{ textAlign: "right", lineHeight: 1.4 }} />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: quoteSize, lineHeight: 1.02, color: "var(--vc-ink)", letterSpacing: "-0.01em" }}>
          <span style={{ color: "var(--vc-red)" }}>"</span>{quoteText}<span style={{ color: "var(--vc-red)" }}>"</span>
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
  const statSize = getDynamicFontSize(statText, 380, 4, 130);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "grid", gridTemplateRows: "auto 1fr auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <VLabel text={data.kicker || "By the numbers"} />
        <ArrowOut size={56} color="var(--vc-ink)" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 56, color: "var(--vc-ink)", marginBottom: 10 }}>
          {data.italicLead || "Why do most posts fail?"}
        </div>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: statSize, lineHeight: 0.86, color: "var(--vc-red)", letterSpacing: "-0.04em", wordBreak: "break-word" }}>
          {statText}
        </div>
        <div style={{ marginTop: 28, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 38, color: "var(--vc-mute)", maxWidth: 720 }}>
          {data.statLabel || "of posts get zero meaningful engagement."}
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
  const headSize = getDynamicFontSize(fullText, 124, 30, 68);
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
        <div style={{ fontFamily: "var(--font-display)", fontSize: headSize, lineHeight: 1.02, letterSpacing: "-0.015em" }}>
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
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 124, lineHeight: 0.98, color: "var(--vc-ink)", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
          {headline} <HandCircle color="var(--vc-red)">{circled}</HandCircle>
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
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, color: "var(--vc-mute)", textAlign: "right", lineHeight: 1.35, maxWidth: 380 }}>
          {data.note || "Let us handle your content so you can focus on growth."}
        </div>
      </div>
    </div>
  );
};

/* ============================================== */
/* 5. BEFORE / AFTER (single) — split block        */
/* ============================================== */
const T_BeforeAfter = ({ data, brand }) => (
  <div className="social-frame" style={{ padding: 0, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
    <div style={{ background: "var(--vc-cream)", padding: 72, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "var(--vc-ink)" }}>
      <VLabel num={null} text="Before" />
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, color: "var(--vc-mute)", marginBottom: 16 }}>The way most freelancers work.</div>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: 76, lineHeight: 1, color: "var(--vc-ink)" }}>
          {data.before || "A blank page and a deadline."}
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--vc-mute)" }}>
        {data.beforeNote || "Where most projects start."}
      </div>
    </div>
    <div style={{ background: "var(--vc-blue)", color: "#fff", padding: 72, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel num={null} text="After" color="#fff" />
        <Asterisk size={48} color="#fff" />
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, opacity: 0.8, marginBottom: 16 }}>The way our system works.</div>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: 76, lineHeight: 1 }}>
          {data.after || "A document that earns the deal."}
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

/* ============================================== */
/* 6. MANIFESTO (single) — dark big italic         */
/* ============================================== */
const T_Manifesto = ({ data, brand }) => (
  <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <VLabel text={data.kicker || "Manifesto"} color="var(--vc-cream)" style={{ opacity: 0.7 }} />
      <Asterisk size={56} color="var(--vc-blue)" />
    </div>
    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 400, fontSize: 90, lineHeight: 1.08, letterSpacing: "-0.015em" }}>
        {data.lead || "Tech that"}{" "}
        <em style={{ fontFamily: "var(--font-display)", color: "var(--vc-blue)" }}>{data.italic || "just works."}</em>{" "}
        <span style={{ color: "rgba(236,230,214,0.6)" }}>{data.tail || "You should not have to worry about how it works. You just need it to perform."}</span>
      </div>
    </div>
    <VFooter brand={brand} color="var(--vc-cream)" borderColor="rgba(236,230,214,0.2)" />
  </div>
);

/* ============================================== */
/* 7. FRAMEWORK CAROUSEL (dynamic slides)          */
/* ============================================== */
const T_Framework = ({ data, brand }) => {
  const steps = (data.steps || "Listen — hear the actual ask, not the requested one.\nMap — name every constraint, on paper.\nMake — propose the smallest version that ships.\nShip — ship before it's perfect; iterate in daylight.").split("\n").filter(Boolean);
  const palette = ["var(--vc-cream)", "var(--vc-blue)", "var(--vc-ink)", "var(--vc-lime)"];
  const colors = ["var(--vc-ink)", "#fff", "var(--vc-cream)", "var(--vc-ink)"];

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
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 168, lineHeight: 0.92, color: "var(--vc-ink)", letterSpacing: "-0.03em" }}>
            {data.title || "The LMMS Method"}.
          </div>
          <div style={{ marginTop: 28, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 40, color: "var(--vc-red)" }}>
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
    return (
      <div className="social-frame" style={{ background: bg, color: fg, padding: 80, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <VLabel num={i + 1} text={`Step ${i + 1} of ${steps.length}`} color={fg} style={{ opacity: 0.8 }} />
          <CrescentMark color={fg} />
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 280, lineHeight: 0.88, letterSpacing: "-0.04em", color: "var(--vc-red)" }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ marginTop: 16, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 132, lineHeight: 0.98, letterSpacing: "-0.015em" }}>
              {name.trim()}.
            </div>
            <div style={{ marginTop: 28, fontFamily: "var(--font-helvetica)", fontSize: 32, lineHeight: 1.35, maxWidth: 820, opacity: isDark ? 0.75 : 0.7 }}>
              {body}
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

  const cover = (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel num={2} text="A Short Story" color="var(--vc-cream)" style={{ opacity: 0.7 }} />
        <Paperclip color="var(--vc-cream)" />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 400, fontSize: 96, lineHeight: 1.04, letterSpacing: "-0.015em" }}>
            {data.coverLead || "How we doubled close-rate"}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 132, lineHeight: 1, color: "var(--vc-blue)", marginTop: 6, letterSpacing: "-0.02em" }}>
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
    return (
      <div className="social-frame" style={{ background: color, color: fg, padding: 80, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <VLabel num={i + 1} text={kicker} color={fg} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.6 }}>
            {i + 1} / {rawLines.length}
          </span>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: 96, lineHeight: 1.05, letterSpacing: "-0.015em", maxWidth: 900 }}>
            {body}
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

  const cover = (
    <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel num={3} text={data.kicker || "Field Notes"} />
        <Chevron color="var(--vc-ink)" />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 156, lineHeight: 0.94, color: "var(--vc-ink)", letterSpacing: "-0.03em" }}>
            {tips.length} <Underscribble>{ruleWord.toLowerCase()}s</Underscribble>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 132, lineHeight: 1, color: "var(--vc-ink)", marginTop: 8, letterSpacing: "-0.02em" }}>
            I keep close.
          </div>
          <div style={{ marginTop: 28, fontFamily: "var(--font-helvetica)", fontSize: 28, color: "var(--vc-mute)", maxWidth: 720, lineHeight: 1.4 }}>
            {data.subtitle || "What I've learned shipping freelance work for the better part of a decade."}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Asterisk size={56} />
        <Wordmark brand={brand} />
      </div>
    </div>
  );

  const tipSlides = tips.map((t, i) => (
    <div className="social-frame" style={{ background: i % 2 === 0 ? "var(--vc-cream)" : "var(--vc-ink)", color: i % 2 === 0 ? "var(--vc-ink)" : "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel num={i + 1} text={`${ruleWord} ${i + 1} of ${tips.length}`} color="currentColor" />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.6 }}>{brand.handle || "@studio"}</span>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "auto 1fr", gap: 60, alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 480, lineHeight: 0.82, color: "var(--vc-red)", letterSpacing: "-0.04em" }}>
          {i + 1}
        </div>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: 76, lineHeight: 1.08, letterSpacing: "-0.01em" }}>
          {t}
        </div>
      </div>
      <VFooter brand={brand} color="currentColor" borderColor={i % 2 === 0 ? "rgba(14,14,14,0.2)" : "rgba(236,230,214,0.2)"} />
    </div>
  ));

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
  const leadFull = `${data.lead || "Two spots open for"} ${data.window || "Q3"} projects.`;
  const leadSize = getDynamicFontSize(leadFull, 152, 28, 80);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel text={data.label || "Now Booking"} />
        <Paperclip />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: leadSize, lineHeight: 0.96, color: "var(--vc-ink)", letterSpacing: "-0.025em" }}>
            {data.lead || "Two spots open for"} <HandCircle color="var(--vc-red)">{data.window || "Q3"}</HandCircle>{" "}
            <em style={{ fontFamily: "var(--font-display)", color: "var(--vc-red)" }}>projects.</em>
          </div>
          <div style={{ marginTop: 28, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 36, color: "var(--vc-mute)", maxWidth: 740, lineHeight: 1.35 }}>
            {data.subtext || "Brand and product work. Four-to-six-week engagements. Friendly intake, written deliverables, no agency overhead."}
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
  const headASize = getDynamicFontSize(data.headlineA || "Why your proposal is", 124, 22, 68);
  const headBSize = getDynamicFontSize(data.headlineB || "your portfolio.", 136, 18, 72);
  const urlSize = getDynamicFontSize(data.url || "northquill.studio/essays", 22, 28, 14);
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
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: headASize, lineHeight: 0.98, color: "var(--vc-ink)", letterSpacing: "-0.025em" }}>
            {data.headlineA || "Why your proposal is"}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: headBSize, lineHeight: 0.98, color: "var(--vc-red)", letterSpacing: "-0.025em", marginTop: 4 }}>
            {data.headlineB || "your portfolio."}
          </div>
          <div style={{ marginTop: 28, fontFamily: "var(--font-helvetica)", fontSize: 28, color: "var(--vc-mute)", maxWidth: 800, lineHeight: 1.4 }}>
            {data.subtext || "A short piece on the small things that build trust before the work has even started."}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1.5px solid var(--vc-ink)", paddingTop: 24 }}>
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
  const nameSize = getDynamicFontSize(prodName, 380, 5, 110);
  const cta = data.ctaText || "Get early access";
  const ctaBtnSize = getDynamicFontSize(cta, 22, 18, 14);
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
        <div style={{ marginTop: 12, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: nameSize, lineHeight: 0.88, color: "var(--vc-ink)", letterSpacing: "-0.03em", wordBreak: "break-word" }}>
          {prodName}.
        </div>
        <div style={{ marginTop: 36, fontFamily: "var(--font-helvetica)", fontWeight: 500, fontSize: 44, lineHeight: 1.15, maxWidth: 880 }}>
          {data.tagline || "A document generator built for working freelancers."}
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
  const studioNameSize = getDynamicFontSize(brand.studioName || "Studio", 136, 8, 64);
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
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: studioNameSize, lineHeight: 0.96, letterSpacing: "-0.025em", wordBreak: "break-word" }}>
          {brand.studioName || "Studio"}
        </div>
        <div style={{ marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 20, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5 }}>
          {brand.handle || "@studio"}
        </div>
        {data.ctaText && (
          <div style={{ marginTop: 52, fontFamily: "var(--font-helvetica)", fontWeight: 500, fontSize: ctaTextSize, lineHeight: 1.35, maxWidth: 720, opacity: 0.85 }}>
            {data.ctaText}
          </div>
        )}
      </div>
      <div style={{ paddingTop: 22, borderTop: "1.5px solid rgba(236,230,214,0.15)", display: "flex", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.4 }}>
          {brand.handle || "@studio"}
        </span>
      </div>
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

  const cover = (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel text={data.kicker || "Hard Lessons"} color="var(--vc-cream)" style={{ opacity: 0.7 }} />
        <XMark size={56} color="var(--vc-red)" />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 148, lineHeight: 0.95, letterSpacing: "-0.03em" }}>
            {items.length} mistakes
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 116, lineHeight: 1, color: "var(--vc-red)", marginTop: 4, letterSpacing: "-0.02em" }}>
            I made for you.
          </div>
          <div style={{ marginTop: 28, fontFamily: "var(--font-helvetica)", fontSize: 28, opacity: 0.55, lineHeight: 1.4, maxWidth: 720 }}>
            {data.subtitle || "So you don't have to learn them the hard way."}
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
    const titleSize = getDynamicFontSize(title, 96, 24, 56);
    const lessonSize = getDynamicFontSize(lesson, 48, 65, 30);
    return (
      <div className="social-frame" key={i} style={{ background: bg, color: fg, padding: 80, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <VLabel num={i + 1} text={`of ${items.length}`} color={fg} style={{ opacity: 0.7 }} />
          <XMark size={48} color="var(--vc-red)" />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: titleSize, lineHeight: 1.02, letterSpacing: "-0.02em" }}>
            {title}.
          </div>
          {lesson && (
            <div style={{ marginTop: 32, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: lessonSize, lineHeight: 1.35, opacity: 0.6 }}>
              {lesson}
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

  const cover = (
    <div className="social-frame" style={{ background: "var(--vc-lime)", color: "var(--vc-ink)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel text={data.kicker || "Mini Guide"} />
        <Chevron color="var(--vc-ink)" />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6, marginBottom: 12 }}>
            How to
          </div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 136, lineHeight: 0.94, letterSpacing: "-0.03em" }}>
            {data.topic || "Ship Faster"}.
          </div>
          <div style={{ marginTop: 28, fontFamily: "var(--font-helvetica)", fontSize: 28, opacity: 0.65, lineHeight: 1.4, maxWidth: 720 }}>
            {intro}
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
    return (
      <div className="social-frame" key={i} style={{ background: dark ? "var(--vc-ink)" : "var(--vc-cream)", color: dark ? "var(--vc-cream)" : "var(--vc-ink)", padding: 80, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <VLabel text={`Step ${i + 1} of ${steps.length}`} color="currentColor" style={{ opacity: 0.7 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.4 }}>{data.topic || "Guide"}</span>
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "auto 1fr", gap: 40, alignItems: "center" }}>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 320, lineHeight: 0.88, color: "var(--vc-lime)", letterSpacing: "-0.04em" }}>
            {String(i + 1).padStart(2, "0")}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: 72, lineHeight: 1.05, letterSpacing: "-0.015em" }}>
              {title}.
            </div>
            {detail && (
              <div style={{ marginTop: 20, fontFamily: "var(--font-helvetica)", fontSize: 28, lineHeight: 1.4, opacity: 0.55 }}>
                {detail}
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
const T_BreakingPost = ({ data, brand }) => (
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
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--vc-mute)", marginBottom: 24 }}>
        {data.kicker || "Breaking"}
      </div>
      <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 108, lineHeight: 0.96, color: "var(--vc-ink)", letterSpacing: "-0.02em" }}>
        {data.headline || "Something big just changed."}
      </div>
      {data.subline && (
        <div style={{ marginTop: 28, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 52, color: "var(--vc-red)", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
          {data.subline}
        </div>
      )}
      <div style={{ flex: 1 }} />
      {data.body && (
        <div style={{ fontFamily: "var(--font-helvetica)", fontSize: 28, color: "var(--vc-mute)", lineHeight: 1.5, maxWidth: 820, marginBottom: 40 }}>
          {data.body}
        </div>
      )}
      <VFooter brand={brand} color="var(--vc-ink)" />
    </div>
  </div>
);

/* ============================================== */
/* 16. WEEKLY DIGEST (News)                        */
/* ============================================== */
const T_WeeklyDigest = ({ data, brand }) => {
  const items = (data.items ||
    "The freelance market grew by 12% this quarter.\nAI tools cut design revision time by 40%.\nRemote clients now account for 67% of studio revenue."
  ).split("\n").filter(Boolean);
  return (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.45, marginBottom: 10 }}>
            {data.period || "This Week In"}
          </div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 100, lineHeight: 0.94, letterSpacing: "-0.025em" }}>
            {data.topic || "Design"}.
          </div>
        </div>
        <Asterisk size={80} color="var(--vc-blue)" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {items.map((item, i) => (
          <div key={i} style={{ padding: "28px 0", borderBottom: "1px solid rgba(236,230,214,0.1)", display: "flex", gap: 28, alignItems: "flex-start" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--vc-blue)", flexShrink: 0, marginTop: 4 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: "var(--font-helvetica)", fontSize: 32, lineHeight: 1.35, fontWeight: 500 }}>
              {item}
            </span>
          </div>
        ))}
      </div>
      <VFooter brand={brand} color="var(--vc-cream)" borderColor="rgba(236,230,214,0.2)" />
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
  const theme = data.bg || "";
  const isInk = theme === "ink";
  const isBlue = theme === "blue";
  const bg = isInk ? "var(--vc-ink)" : isBlue ? "var(--vc-blue)" : "var(--vc-cream)";
  const fg = (isInk || isBlue) ? "var(--vc-cream)" : "var(--vc-ink)";
  const muted = (isInk || isBlue) ? "rgba(236,230,214,0.6)" : "var(--vc-mute)";
  const ringBorder = isBlue ? "var(--vc-lime)" : isInk ? "var(--vc-red)" : "var(--vc-ink)";
  const name = data.name || "Elena Rostova";
  const nameSize = getDynamicFontSize(name, 84, 15, 52);
  const position = data.position || "Lead Brand Designer";
  const posSize = getDynamicFontSize(position, 22, 24, 15);

  return (
    <div className="social-frame" style={{ background: bg, color: fg, padding: "72px 80px", display: "grid", gridTemplateRows: "auto 1fr auto", gap: 32 }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Welcome to the Team"} color={fg} />
        <Asterisk size={48} color={isBlue ? "var(--vc-lime)" : "var(--vc-red)"} />
      </div>

      {/* Main Content: Avatar Frame + Info */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        {/* Circle Photo Frame */}
        <div style={{
          width: 380, height: 380, borderRadius: "50%",
          padding: 8, border: `3px solid ${ringBorder}`,
          position: "relative", marginBottom: 36,
          boxShadow: isInk ? "0 20px 50px rgba(0,0,0,0.5)" : "0 20px 50px rgba(0,0,0,0.12)",
          flexShrink: 0
        }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: isInk ? "#222" : "#e5e0d3" }}>
            {data.image
              ? <img src={data.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              : <PhotoSlot label="Drop portrait" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
            }
          </div>
          {/* Badge at bottom of circle */}
          <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", background: ringBorder, color: isBlue ? "var(--vc-ink)" : "#fff", padding: "6px 18px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap" }}>
            New Joiner
          </div>
        </div>

        {/* Member Name */}
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: nameSize, lineHeight: 1, letterSpacing: "-0.015em" }}>
          {name}
        </div>

        {/* Position & Department */}
        <div style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: posSize, letterSpacing: "0.12em", textTransform: "uppercase", color: isBlue ? "var(--vc-lime)" : isInk ? "var(--vc-red)" : "var(--vc-red)", fontWeight: 700 }}>
          {position}
        </div>

        {data.department && (
          <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", color: muted }}>
            {data.department}
          </div>
        )}

        {data.bio && (
          <div style={{ marginTop: 18, fontFamily: "var(--font-helvetica)", fontSize: 24, lineHeight: 1.35, color: muted, maxWidth: 680 }}>
            "{data.bio}"
          </div>
        )}
      </div>

      {/* Footer */}
      <VFooter brand={brand} color={fg} borderColor={isInk ? "rgba(236,230,214,0.18)" : isBlue ? "rgba(255,255,255,0.2)" : "rgba(14,14,14,0.15)"} />
    </div>
  );
};

/* ============================================== */
/* 18C. TEAM ONBOARD · 2 MEMBERS / DUO (Photo)    */
/* ============================================== */
const T_Team2 = ({ data, brand }) => {
  const theme = data.bg || "";
  const isInk = theme === "ink";
  const isBlue = theme === "blue";
  const bg = isInk ? "var(--vc-ink)" : isBlue ? "var(--vc-blue)" : "var(--vc-cream)";
  const fg = (isInk || isBlue) ? "var(--vc-cream)" : "var(--vc-ink)";
  const ringBorder = isBlue ? "var(--vc-lime)" : isInk ? "var(--vc-red)" : "var(--vc-ink)";
  const headline = data.headline || "Welcoming our new team members";
  const headSize = getDynamicFontSize(headline, 56, 32, 40);

  return (
    <div className="social-frame" style={{ background: bg, color: fg, padding: "64px 72px", display: "grid", gridTemplateRows: "auto auto 1fr auto", gap: 24 }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "New Joiners"} color={fg} />
        <Asterisk size={44} color={isBlue ? "var(--vc-lime)" : "var(--vc-red)"} />
      </div>

      {/* Header Statement */}
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: headSize, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
          {headline}
        </div>
      </div>

      {/* Duo Grid: 2 Members Side-by-Side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, alignItems: "center" }}>
        {/* Person 1 */}
        <div style={{
          background: isInk ? "rgba(255,255,255,0.05)" : isBlue ? "rgba(255,255,255,0.08)" : "#fff",
          border: `1.5px solid ${isInk ? "rgba(255,255,255,0.12)" : isBlue ? "rgba(255,255,255,0.15)" : "rgba(14,14,14,0.1)"}`,
          borderRadius: 28, padding: "36px 28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          boxShadow: "0 12px 32px rgba(0,0,0,0.08)"
        }}>
          <div style={{
            width: 240, height: 240, borderRadius: "50%", padding: 6,
            border: `2.5px solid ${ringBorder}`, overflow: "hidden", marginBottom: 22, flexShrink: 0
          }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: isInk ? "#222" : "#eae5d8" }}>
              {data.image1
                ? <img src={data.image1} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <PhotoSlot label="Photo 1" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
              }
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: getDynamicFontSize(data.name1 || "Marcus Vance", 42, 14, 28), lineHeight: 1.1 }}>
            {data.name1 || "Marcus Vance"}
          </div>
          <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: getDynamicFontSize(data.position1 || "Creative Director", 16, 20, 13), letterSpacing: "0.12em", textTransform: "uppercase", color: isBlue ? "var(--vc-lime)" : "var(--vc-red)", fontWeight: 700 }}>
            {data.position1 || "Creative Director"}
          </div>
        </div>

        {/* Person 2 */}
        <div style={{
          background: isInk ? "rgba(255,255,255,0.05)" : isBlue ? "rgba(255,255,255,0.08)" : "#fff",
          border: `1.5px solid ${isInk ? "rgba(255,255,255,0.12)" : isBlue ? "rgba(255,255,255,0.15)" : "rgba(14,14,14,0.1)"}`,
          borderRadius: 28, padding: "36px 28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          boxShadow: "0 12px 32px rgba(0,0,0,0.08)"
        }}>
          <div style={{
            width: 240, height: 240, borderRadius: "50%", padding: 6,
            border: `2.5px solid ${ringBorder}`, overflow: "hidden", marginBottom: 22, flexShrink: 0
          }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: isInk ? "#222" : "#eae5d8" }}>
              {data.image2
                ? <img src={data.image2} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <PhotoSlot label="Photo 2" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
              }
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: getDynamicFontSize(data.name2 || "Aria Chen", 42, 14, 28), lineHeight: 1.1 }}>
            {data.name2 || "Aria Chen"}
          </div>
          <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: getDynamicFontSize(data.position2 || "Senior Engineer", 16, 20, 13), letterSpacing: "0.12em", textTransform: "uppercase", color: isBlue ? "var(--vc-lime)" : "var(--vc-red)", fontWeight: 700 }}>
            {data.position2 || "Senior Engineer"}
          </div>
        </div>
      </div>

      {/* Footer */}
      <VFooter brand={brand} color={fg} borderColor={isInk ? "rgba(236,230,214,0.18)" : isBlue ? "rgba(255,255,255,0.2)" : "rgba(14,14,14,0.15)"} />
    </div>
  );
};

/* ============================================== */
/* 18D. TEAM ONBOARD · 3 MEMBERS / TRIO (Photo)   */
/* ============================================== */
const T_Team3 = ({ data, brand }) => {
  const theme = data.bg || "";
  const isInk = theme === "ink";
  const isBlue = theme === "blue";
  const bg = isInk ? "var(--vc-ink)" : isBlue ? "var(--vc-blue)" : "var(--vc-cream)";
  const fg = (isInk || isBlue) ? "var(--vc-cream)" : "var(--vc-ink)";
  const ringBorder = isBlue ? "var(--vc-lime)" : isInk ? "var(--vc-red)" : "var(--vc-ink)";
  const headline = data.headline || "Meet the new faces at the studio";
  const headSize = getDynamicFontSize(headline, 56, 32, 40);

  const members = [
    { image: data.image1, name: data.name1 || "Sophia Ray", position: data.position1 || "Design Lead", defaultSlot: "Photo 1" },
    { image: data.image2, name: data.name2 || "Liam Thorne", position: data.position2 || "Staff Engineer", defaultSlot: "Photo 2" },
    { image: data.image3, name: data.name3 || "Maya Patel", position: data.position3 || "Product Strategist", defaultSlot: "Photo 3" },
  ];

  return (
    <div className="social-frame" style={{ background: bg, color: fg, padding: "64px 68px", display: "grid", gridTemplateRows: "auto auto 1fr auto", gap: 24 }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Meet the Crew"} color={fg} />
        <Asterisk size={44} color={isBlue ? "var(--vc-lime)" : "var(--vc-red)"} />
      </div>

      {/* Header Statement */}
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: headSize, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
          {headline}
        </div>
      </div>

      {/* 3 Members Row / Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, alignItems: "stretch" }}>
        {members.map((m, idx) => (
          <div key={idx} style={{
            background: isInk ? "rgba(255,255,255,0.05)" : isBlue ? "rgba(255,255,255,0.08)" : "#fff",
            border: `1.5px solid ${isInk ? "rgba(255,255,255,0.12)" : isBlue ? "rgba(255,255,255,0.15)" : "rgba(14,14,14,0.1)"}`,
            borderRadius: 24, padding: "28px 18px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
            boxShadow: "0 10px 28px rgba(0,0,0,0.06)", justifyContent: "space-between"
          }}>
            <div style={{
              width: 190, height: 190, borderRadius: "50%", padding: 5,
              border: `2px solid ${ringBorder}`, overflow: "hidden", marginBottom: 18, flexShrink: 0
            }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: isInk ? "#222" : "#eae5d8" }}>
                {m.image
                  ? <img src={m.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : <PhotoSlot label={m.defaultSlot} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                }
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: getDynamicFontSize(m.name, 34, 12, 24), lineHeight: 1.15 }}>
                {m.name}
              </div>
              <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: getDynamicFontSize(m.position, 14, 18, 11), letterSpacing: "0.1em", textTransform: "uppercase", color: isBlue ? "var(--vc-lime)" : "var(--vc-red)", fontWeight: 700 }}>
                {m.position}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <VFooter brand={brand} color={fg} borderColor={isInk ? "rgba(236,230,214,0.18)" : isBlue ? "rgba(255,255,255,0.2)" : "rgba(14,14,14,0.15)"} />
    </div>
  );
};

/* ============================================== */
/* 18E. TEAM ONBOARD · 4 MEMBERS / QUAD (Photo)   */
/* ============================================== */
const T_Team4 = ({ data, brand }) => {
  const theme = data.bg || "";
  const isInk = theme === "ink";
  const isBlue = theme === "blue";
  const bg = isInk ? "var(--vc-ink)" : isBlue ? "var(--vc-blue)" : "var(--vc-cream)";
  const fg = (isInk || isBlue) ? "var(--vc-cream)" : "var(--vc-ink)";
  const ringBorder = isBlue ? "var(--vc-lime)" : isInk ? "var(--vc-red)" : "var(--vc-ink)";
  const headline = data.headline || "Welcoming 4 new team members";
  const headSize = getDynamicFontSize(headline, 52, 34, 38);

  const members = [
    { image: data.image1, name: data.name1 || "Elena Rostova", position: data.position1 || "Brand Lead", slot: "Photo 1" },
    { image: data.image2, name: data.name2 || "Marcus Vance", position: data.position2 || "Creative Director", slot: "Photo 2" },
    { image: data.image3, name: data.name3 || "Aria Chen", position: data.position3 || "Staff Engineer", slot: "Photo 3" },
    { image: data.image4, name: data.name4 || "Sophia Ray", position: data.position4 || "Product Strategist", slot: "Photo 4" },
  ];

  return (
    <div className="social-frame" style={{ background: bg, color: fg, padding: "56px 64px", display: "grid", gridTemplateRows: "auto auto 1fr auto", gap: 20 }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Team Expansion"} color={fg} />
        <Asterisk size={40} color={isBlue ? "var(--vc-lime)" : "var(--vc-red)"} />
      </div>

      {/* Header Statement */}
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: headSize, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
          {headline}
        </div>
      </div>

      {/* 2x2 Quad Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 20, alignItems: "stretch" }}>
        {members.map((m, idx) => (
          <div key={idx} style={{
            background: isInk ? "rgba(255,255,255,0.05)" : isBlue ? "rgba(255,255,255,0.08)" : "#fff",
            border: `1.5px solid ${isInk ? "rgba(255,255,255,0.12)" : isBlue ? "rgba(255,255,255,0.15)" : "rgba(14,14,14,0.1)"}`,
            borderRadius: 22, padding: "20px 24px", display: "flex", alignItems: "center", gap: 22,
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
          }}>
            <div style={{
              width: 140, height: 140, borderRadius: "50%", padding: 4,
              border: `2px solid ${ringBorder}`, overflow: "hidden", flexShrink: 0
            }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: isInk ? "#222" : "#eae5d8" }}>
                {m.image
                  ? <img src={m.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : <PhotoSlot label={m.slot} style={{ width: "100%", height: "100%", borderRadius: "50%", fontSize: 11 }} />
                }
              </div>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: getDynamicFontSize(m.name, 32, 14, 22), lineHeight: 1.15, wordBreak: "break-word" }}>
                {m.name}
              </div>
              <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", fontSize: getDynamicFontSize(m.position, 14, 18, 11), letterSpacing: "0.1em", textTransform: "uppercase", color: isBlue ? "var(--vc-lime)" : "var(--vc-red)", fontWeight: 700, wordBreak: "break-word" }}>
                {m.position}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <VFooter brand={brand} color={fg} borderColor={isInk ? "rgba(236,230,214,0.18)" : isBlue ? "rgba(255,255,255,0.2)" : "rgba(14,14,14,0.15)"} />
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
  const priceSize = getDynamicFontSize(price, 152, 7, 72);
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
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: priceSize, lineHeight: 0.9, letterSpacing: "-0.04em" }}>
          {price}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.55, marginTop: 12 }}>
          per month
        </div>
        <div style={{ marginTop: 52, display: "flex", flexDirection: "column", gap: 20 }}>
          {features.map((feat, i) => (
            <div key={i} style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <span style={{ color: "var(--vc-red)", fontFamily: "var(--font-mono)", fontSize: 20, flexShrink: 0, lineHeight: 1 }}>→</span>
              <span style={{ fontFamily: "var(--font-helvetica)", fontSize: 30, lineHeight: 1.3 }}>{feat}</span>
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
const T_Testimonial = ({ data, brand }) => (
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
    <div style={{ flex: 1, display: "flex", alignItems: "center", marginTop: -20 }}>
      <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 76, lineHeight: 1.1, color: "var(--vc-ink)", letterSpacing: "-0.01em" }}>
        {data.quote || "Working with this studio changed how I think about client communication entirely."}
      </div>
    </div>
    <div style={{ display: "flex", gap: 28, alignItems: "center", paddingTop: 32, borderTop: "1.5px solid rgba(14,14,14,0.18)" }}>
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
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.1em", color: "var(--vc-mute)", textTransform: "uppercase", marginTop: 6 }}>
          {data.clientTitle || "Founder · Atlas & Bell"}
        </div>
      </div>
    </div>
  </div>
);

const T_PricingEditorial = ({ data, brand }) => {
  const features = (data.features || "Logo + brand mark\nColor palette & type system\nBrand guidelines (12 pages)\n2 revision rounds\nSource files included").split("\n").filter(Boolean).slice(0, 6);
  const useAccent = data.bg === "accent";
  const bg = useAccent ? "var(--accent)" : "var(--vc-cream)";
  const fg = useAccent ? "var(--accent-ink)" : "var(--vc-ink)";
  const muted = useAccent ? "rgba(0,0,0,0.52)" : "var(--vc-mute)";
  const rule = useAccent ? "rgba(0,0,0,0.18)" : "rgba(14,14,14,0.15)";
  const price = fmt.money(Number(data.price) || 0, data.currency || "USD");
  const priceSize = getDynamicFontSize(price, 88, 7, 50);
  const packageName = data.packageName || "Brand Starter";
  const packageSize = getDynamicFontSize(packageName, 84, 14, 52);
  const ctaText = data.ctaText || "DM to get started ->";
  const ctaSize = getDynamicFontSize(ctaText, 17, 24, 13);
  return (
    <div className="social-frame" style={{ background: bg, color: fg, padding: 72, display: "grid", gridTemplateRows: "auto 1fr auto", gap: 34, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -72, top: 210, width: 320, height: 320, border: `1.5px solid ${rule}`, borderRadius: "50%" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "start", gap: 28 }}>
        <div>
          <VLabel text="Proposal No. 01" color={fg} />
          <div style={{ marginTop: 24, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: packageSize, lineHeight: 0.95, letterSpacing: "-0.015em", wordBreak: "break-word" }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 54, alignItems: "end", minHeight: 0 }}>
        <div style={{ alignSelf: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.16em", textTransform: "uppercase", color: muted, marginBottom: 20 }}>
            Included in the engagement
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            {features.map((feat, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "38px 1fr", alignItems: "baseline", gap: 16, paddingBottom: 14, borderBottom: `1px solid ${rule}` }}>
                <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--vc-red)", fontSize: 34, lineHeight: 0.8 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: "var(--font-helvetica)", fontSize: 28, lineHeight: 1.18, letterSpacing: "-0.005em" }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ alignSelf: "stretch", borderLeft: `1.5px solid ${rule}`, paddingLeft: 36, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", color: muted, marginBottom: 20 }}>
              Starting at
            </div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 800, fontSize: priceSize, lineHeight: 0.9, letterSpacing: "-0.05em" }}>
              {price}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.14em", textTransform: "uppercase", color: muted, marginTop: 14 }}>
              Flat fee
            </div>
          </div>
          <Asterisk size={86} color="var(--vc-red)" />
        </div>
      </div>
      <div style={{ borderTop: `1.5px solid ${rule}`, paddingTop: 26, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 24 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: ctaSize, letterSpacing: "0.13em", textTransform: "uppercase" }}>
          {ctaText}
        </span>
        <ArrowOut size={60} color={fg} />
      </div>
    </div>
  );
};

const T_TestimonialEditorial = ({ data, brand }) => {
  const quote = data.quote || "Working with this studio changed how I think about proposals entirely. We closed our next deal the same week.";
  return (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 0, display: "grid", gridTemplateRows: "170px 1fr 190px", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", inset: "28px 28px auto auto", width: 174, height: 174, border: "1.5px solid rgba(244,238,222,0.24)", borderRadius: "50%" }} />
      <div style={{ padding: "64px 72px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
        <VLabel text="Client proof" color="var(--vc-cream)" />
        {brand.logo && brand.logoEnabled !== false
          ? (brand.logoLight
              ? <img src={brand.logoLight} alt="" style={{ height: 30, width: "auto", maxWidth: 120, objectFit: "contain" }} />
              : <img src={brand.logo} alt="" style={{ height: 30, width: "auto", maxWidth: 120, objectFit: "contain", filter: "invert(1)" }} />
            )
          : <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.58 }}>{brand.studioName || "Studio"}</span>
        }
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 46, alignItems: "center", padding: "0 72px", position: "relative", zIndex: 1 }}>
        <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1.5px solid rgba(244,238,222,0.18)", paddingRight: 42 }}>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 240, lineHeight: 0.7, color: "var(--vc-red)", marginTop: 16 }}>"</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 22px)", gap: 8, marginBottom: 16 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: i < 4 ? "var(--vc-red)" : "var(--vc-cream)", display: "block" }} />
            ))}
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: quote.length > 150 ? 62 : 74, lineHeight: 1.06, letterSpacing: "-0.01em" }}>
          {quote}
        </div>
      </div>
      <div style={{ background: "var(--vc-cream)", color: "var(--vc-ink)", padding: "38px 72px", display: "grid", gridTemplateColumns: "112px 1fr auto", gap: 28, alignItems: "center" }}>
        {data.clientPhoto
          ? <img src={data.clientPhoto} alt="" style={{ width: 112, height: 112, objectFit: "cover", flexShrink: 0 }} />
          : <div style={{ width: 112, height: 112, background: "var(--vc-red)", color: "var(--vc-cream)", display: "grid", placeItems: "center", fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 42, flexShrink: 0 }}>
              {((data.clientName || "?")[0] || "?").toUpperCase()}
            </div>
        }
        <div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 34, letterSpacing: "-0.01em" }}>
            {data.clientName || "Client Name"}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.12em", color: "var(--vc-mute)", textTransform: "uppercase", marginTop: 8 }}>
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
  const headSize = getDynamicFontSize(headline, 108, 32, 54);
  const cta = data.ctaText || "Join the waitlist →";
  const ctaBtnSize = getDynamicFontSize(cta, 22, 18, 14);
  return (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Early Access"} color="var(--vc-cream)" style={{ opacity: 0.8 }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 22px", background: "var(--vc-red)", color: "#fff", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
          {data.spotsLeft || "4 spots left"}
        </span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: headSize, lineHeight: 0.98, letterSpacing: "-0.02em" }}>
          {headline}
        </div>
        <div style={{ marginTop: 32, fontFamily: "var(--font-helvetica)", fontSize: 32, lineHeight: 1.4, opacity: 0.65, maxWidth: 780 }}>
          {data.subtext || "Join 350+ designers & founders in private beta testing. Instant access upon invitation."}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 28, borderTop: "1.5px solid rgba(236,230,214,0.18)" }}>
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
  const titleSize = getDynamicFontSize(title, 84, 30, 48);
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
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: titleSize, lineHeight: 1, letterSpacing: "-0.015em" }}>
          {title}
        </div>
        <div style={{ marginTop: 36, display: "grid", gap: 16 }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--vc-ink)", color: "var(--vc-cream)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 14, flexShrink: 0 }}>✓</span>
              <span style={{ fontFamily: "var(--font-helvetica)", fontSize: 28, lineHeight: 1.25, fontWeight: 500 }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, borderTop: "1.5px solid rgba(14,14,14,0.15)" }}>
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
  const headSize = getDynamicFontSize(headline, 100, 34, 52);
  const keyword = data.keyword || "ONBOARD";
  const kwSize = getDynamicFontSize(keyword, 140, 7, 72);
  return (
    <div className="social-frame" style={{ background: "var(--vc-lime)", color: "var(--vc-ink)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Free Drop"} />
        <ArrowOut size={56} color="var(--vc-ink)" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: headSize, lineHeight: 1.02, letterSpacing: "-0.02em", maxWidth: 860 }}>
          {headline}
        </div>
        <div style={{ marginTop: 40, background: "var(--vc-ink)", color: "var(--vc-cream)", padding: "36px 48px", borderRadius: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>
            Drop this word in comments:
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: kwSize, color: "var(--vc-lime)", letterSpacing: "0.08em", lineHeight: 0.95 }}>
            "{keyword}"
          </div>
        </div>
        <div style={{ marginTop: 24, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 32, opacity: 0.75 }}>
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
  const metricSize = getDynamicFontSize(metric, 280, 5, 110);
  return (
    <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 80, display: "grid", gridTemplateRows: "auto 1fr auto", gap: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Client Results"} color="var(--vc-cream)" style={{ opacity: 0.8 }} />
        <Asterisk size={56} color="var(--vc-lime)" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 800, fontSize: metricSize, lineHeight: 0.88, color: "var(--vc-lime)", letterSpacing: "-0.04em" }}>
          {metric}
        </div>
        <div style={{ marginTop: 20, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 44, lineHeight: 1.15, maxWidth: 800 }}>
          {data.metricLabel || "Increase in closed deal size in 60 days"}
        </div>
        <div style={{ marginTop: 24, fontFamily: "var(--font-helvetica)", fontSize: 26, lineHeight: 1.4, opacity: 0.65, maxWidth: 760 }}>
          {data.summary || "Complete repositioning and brand identity overhaul for an enterprise B2B consultancy."}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, borderTop: "1.5px solid rgba(236,230,214,0.18)" }}>
        <div>
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 26 }}>
            {data.clientName || "Sarah Jenkins"}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6, marginTop: 4 }}>
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
  const reviewSize = getDynamicFontSize(review, 68, 80, 40);
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
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: reviewSize, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
          "{review}"
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 28, borderTop: "1.5px solid rgba(14,14,14,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: "var(--vc-ink)", color: "var(--vc-cream)", display: "grid", placeItems: "center", fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 26 }}>
            {((data.clientName || "A")[0] || "A").toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 26, display: "flex", alignItems: "center", gap: 8 }}>
              {data.clientName || "Alex Rivera"}
              <span style={{ fontSize: 18, color: "var(--vc-blue)" }}>✓</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: "var(--vc-mute)", marginTop: 4 }}>
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
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 68, lineHeight: 1 }}>
          {data.client || "Luminary Media"}
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.08)", padding: "20px 28px", borderRadius: 16, borderLeft: "4px solid var(--vc-red)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>The Problem</div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontSize: 24, fontWeight: 500, marginTop: 4 }}>{data.problem || "Low proposal response rate & inconsistent brand assets"}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", padding: "20px 28px", borderRadius: 16, borderLeft: "4px solid var(--vc-lime)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>The Solution</div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontSize: 24, fontWeight: 500, marginTop: 4 }}>{data.solution || "Custom document template system & editorial style guide"}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", padding: "20px 28px", borderRadius: 16, borderLeft: "4px solid #fff" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>The Result</div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontSize: 24, fontWeight: 700, color: "var(--vc-lime)", marginTop: 4 }}>{data.outcome || "3.5x higher contract close rate & $95k in new client revenue"}</div>
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
  const titleSize = getDynamicFontSize(title, 76, 32, 46);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", color: "var(--vc-ink)", padding: 76, display: "grid", gridTemplateRows: "auto 1fr auto", gap: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Audit Checklist"} />
        <Asterisk size={56} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: titleSize, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          {title}
        </div>
        <div style={{ marginTop: 36, display: "grid", gap: 16 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 18, alignItems: "center", paddingBottom: 12, borderBottom: "1px solid rgba(14,14,14,0.1)" }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--vc-ink)", color: "var(--vc-lime)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>✓</span>
              <span style={{ fontFamily: "var(--font-helvetica)", fontSize: 28, fontWeight: 500, lineHeight: 1.2 }}>{it}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1.5px solid rgba(14,14,14,0.15)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--vc-mute)" }}>
          {data.note || "Save this post for your next project"}
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
            <div style={{ marginTop: 24, fontFamily: "var(--font-helvetica)", fontSize: 32, lineHeight: 1.3, opacity: 0.75, textDecoration: "line-through" }}>
              {data.myth || "Work 80 hours a week, lower your rates to compete, and take every client you can find."}
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, opacity: 0.4, marginTop: 20 }}>Conventional advice</div>
        </div>
        <div style={{ background: "var(--vc-cream)", color: "var(--vc-ink)", borderRadius: 24, padding: "36px 32px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}>
          <div>
            <div style={{ display: "inline-flex", padding: "6px 16px", background: "var(--vc-ink)", color: "var(--vc-lime)", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
              {data.truthTitle || "Reality"}
            </div>
            <div style={{ marginTop: 24, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 36, lineHeight: 1.25 }}>
              {data.truth || "Pick one high-value niche, price on business outcomes, and say no to 80% of inquiries."}
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
  const headSize = getDynamicFontSize(headline, 72, 34, 46);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", color: "var(--vc-ink)", padding: 76, display: "grid", gridTemplateRows: "auto 1fr auto", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <VLabel text={data.kicker || "Core Principles"} />
        <ArrowOut size={56} color="var(--vc-ink)" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: headSize, lineHeight: 1, letterSpacing: "-0.015em", marginBottom: 28 }}>
          {headline}
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: "22px 30px", borderRadius: 18, display: "grid", gridTemplateColumns: "48px 1fr", gap: 16, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 24, color: "var(--vc-lime)", fontWeight: 700 }}>01</span>
            <div>
              <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 24 }}>{data.pillar1Title || "Positioning"}</div>
              <div style={{ fontFamily: "var(--font-helvetica)", fontSize: 20, opacity: 0.7, marginTop: 2 }}>{data.pillar1Body || "Specialist over generalist. Solve an expensive problem."}</div>
            </div>
          </div>
          <div style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: "22px 30px", borderRadius: 18, display: "grid", gridTemplateColumns: "48px 1fr", gap: 16, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 24, color: "var(--vc-lime)", fontWeight: 700 }}>02</span>
            <div>
              <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 24 }}>{data.pillar2Title || "Packaging"}</div>
              <div style={{ fontFamily: "var(--font-helvetica)", fontSize: 20, opacity: 0.7, marginTop: 2 }}>{data.pillar2Body || "Fixed deliverables, clear scopes, zero hourly billing."}</div>
            </div>
          </div>
          <div style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: "22px 30px", borderRadius: 18, display: "grid", gridTemplateColumns: "48px 1fr", gap: 16, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 24, color: "var(--vc-lime)", fontWeight: 700 }}>03</span>
            <div>
              <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 24 }}>{data.pillar3Title || "Pipeline"}</div>
              <div style={{ fontFamily: "var(--font-helvetica)", fontSize: 20, opacity: 0.7, marginTop: 2 }}>{data.pillar3Body || "Always cultivate relationships before you need work."}</div>
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
      fA("before", "Before — headline"),
      f("beforeNote", "Before — mono note"),
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
      f("coverLead", "Cover · roman"),
      f("coverItalic", "Cover · italic"),
      fA("slides", "Story slides — 'Kicker — Body', one per line", { hint: "Colors cycle cream → blue → lime → ink. Add as many slides as needed." }),
      f("ctaText", "Closing slide CTA text (optional)", { hint: "Leave empty to skip the closing slide." }),
    ] },
  { id: "tipscarousel", name: "Tips Carousel",     kind: "Carousel",
    slides: (p) => T_Tips(p),
    fields: [
      f("kicker", "Kicker"),
      fA("subtitle", "Subtitle (cover)"),
      fA("tips", "Tips (one per line)", { hint: "Add as many as needed — no limit." }),
      f("ruleLabel", "Slide label word", { placeholder: "Rule", hint: "Appears as 'Rule 1 of N'. Change to Tip, Lesson, Step…" }),
      f("ctaText", "Closing slide CTA text (optional)", { hint: "Leave empty to skip the closing slide." }),
    ] },
  { id: "mistakes",    name: "Mistakes Made",      kind: "Carousel",
    slides: (p) => T_Mistakes(p),
    fields: [
      f("kicker", "Kicker", { placeholder: "Hard Lessons" }),
      fA("subtitle", "Cover subtitle"),
      fA("mistakes", "Mistakes — 'Title — Lesson', one per line", { hint: "No limit. Title is bold; lesson appears as italic note." }),
      f("ctaText", "Closing CTA text (optional)", { hint: "Leave empty to skip the closing slide." }),
    ] },
  { id: "miniguide",   name: "Mini Guide",          kind: "Carousel",
    slides: (p) => T_MiniGuide(p),
    fields: [
      f("kicker", "Kicker", { placeholder: "Mini Guide" }),
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
      f("name", "Member Name", { placeholder: "Elena Rostova" }),
      f("position", "Position / Role", { placeholder: "Lead Brand Designer" }),
      f("department", "Department / Location (optional)", { placeholder: "Brand Studio · London" }),
      fA("bio", "Short Welcome Note (optional)", { placeholder: "Joining our studio to lead brand identity and digital design systems." }),
      { key: "bg", label: "Theme", type: "select", options: [{ value: "", label: "Cream (default)" }, { value: "ink", label: "Ink / Dark" }, { value: "blue", label: "Blue" }] },
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
      { key: "bg", label: "Theme", type: "select", options: [{ value: "", label: "Cream (default)" }, { value: "ink", label: "Ink / Dark" }, { value: "blue", label: "Blue" }] },
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
      { key: "bg", label: "Theme", type: "select", options: [{ value: "", label: "Cream (default)" }, { value: "ink", label: "Ink / Dark" }, { value: "blue", label: "Blue" }] },
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
      { key: "bg", label: "Theme", type: "select", options: [{ value: "", label: "Cream (default)" }, { value: "ink", label: "Ink / Dark" }, { value: "blue", label: "Blue" }] },
    ] },

  /* --- Pricing --- */
  { id: "pricing",     name: "Pricing Card",        kind: "Pricing",
    slides: (p) => [<T_PricingEditorial {...p} />],
    fields: [
      f("packageName", "Package name", { placeholder: "Brand Starter" }),
      f("price", "Price (number only)", { placeholder: "1500" }),
      { key: "currency", label: "Currency", type: "select", options: [{ value: "USD", label: "USD ($)" }, { value: "IDR", label: "IDR (Rp)" }, { value: "EUR", label: "EUR (€)" }, { value: "GBP", label: "GBP (£)" }] },
      fA("features", "Features (one per line, 4–6 lines)"),
      f("ctaText", "CTA text", { placeholder: "DM to get started →" }),
      { key: "bg", label: "Background", type: "select", options: [{ value: "", label: "Cream (default)" }, { value: "accent", label: "Accent color" }] },
    ] },
];

export {
  SocialTemplates,
  Paperclip, Chevron, ArrowOut, Asterisk, XMark,
  HandCircle, Underscribble, PhotoSlot, CrescentMark,
  VLabel, VFooter, Wordmark,
};
