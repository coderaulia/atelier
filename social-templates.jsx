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

const Asterisk = ({ size = 80, color = "var(--vc-red)" }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill={color}>
    {Array.from({ length: 8 }).map((_, i) => (
      <ellipse key={i} cx="40" cy="40" rx="6" ry="34" transform={`rotate(${i * 22.5} 40 40)`} />
    ))}
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
const VFooter = ({ brand, color = "var(--vc-ink)", borderColor }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    paddingTop: 22, borderTop: borderColor ? `1.5px solid ${borderColor}` : "1.5px solid currentColor",
    color,
  }}>
    {brand.logo && brand.logoEnabled !== false
      ? <img src={brand.logo} alt={brand.studioName || "logo"} style={{ height: 28, width: "auto", maxWidth: 120, objectFit: "contain" }} />
      : <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase" }}>{brand.studioName || "Studio"}</span>
    }
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>
      {brand.handle || "@studio"}
    </span>
  </div>
);

/* ============================================== */
/* 1. PULL QUOTE (single)                          */
/* ============================================== */
const T_Quote = ({ data, brand }) => (
  <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Paperclip />
      <VLabel text={data.label || "A Better Future"} style={{ textAlign: "right", lineHeight: 1.4 }} />
    </div>
    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 116, lineHeight: 1.02, color: "var(--vc-ink)", letterSpacing: "-0.01em" }}>
        <span style={{ color: "var(--vc-red)" }}>"</span>{data.quote || "The secret to social media success? Authenticity & consistency"}<span style={{ color: "var(--vc-red)" }}>"</span>
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

/* ============================================== */
/* 2. STAT HERO (single)                           */
/* ============================================== */
const T_Stat = ({ data, brand }) => (
  <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "grid", gridTemplateRows: "auto 1fr auto" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <VLabel text={data.kicker || "By the numbers"} />
      <ArrowOut size={56} color="var(--vc-ink)" />
    </div>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 56, color: "var(--vc-ink)", marginBottom: 10 }}>
        {data.italicLead || "Why do most posts fail?"}
      </div>
      <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 380, lineHeight: 0.86, color: "var(--vc-red)", letterSpacing: "-0.04em" }}>
        {data.stat || "91%"}
      </div>
      <div style={{ marginTop: 28, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 38, color: "var(--vc-mute)", maxWidth: 720 }}>
        {data.statLabel || "of posts get zero meaningful engagement."}
      </div>
    </div>
    <VFooter brand={brand} borderColor="rgba(14,14,14,0.15)" />
  </div>
);

/* ============================================== */
/* 3. ANNOUNCEMENT (single) — red big card         */
/* ============================================== */
const T_Announce = ({ data, brand }) => (
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
      <div style={{ fontFamily: "var(--font-display)", fontSize: 124, lineHeight: 1.02, letterSpacing: "-0.015em" }}>
        {data.headlineA || "The Startup Formula"}{" "}
        <em>{data.headlineB || "Strategy, Execution, Growth."}</em>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <VLabel num={null} text={brand.studioName || "Studio"} color="#fff" style={{ opacity: 0.9 }} />
      <Asterisk size={90} color="#fff" />
    </div>
  </div>
);

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
    return <img src={brand.logo} alt={brand.studioName || "logo"} style={{ height: 36, width: "auto", maxWidth: 140, objectFit: "contain" }} />;
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
const T_Booking = ({ data, brand }) => (
  <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <VLabel text={data.label || "Now Booking"} />
      <Paperclip />
    </div>
    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <div>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 152, lineHeight: 0.96, color: "var(--vc-ink)", letterSpacing: "-0.025em" }}>
          {data.lead || "Two spots open for"} <HandCircle color="var(--vc-red)">{data.window || "Q3"}</HandCircle>{" "}
          <em style={{ fontFamily: "var(--font-display)", color: "var(--vc-red)" }}>projects.</em>
        </div>
        <div style={{ marginTop: 28, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 36, color: "var(--vc-mute)", maxWidth: 740, lineHeight: 1.35 }}>
          {data.subtext || "Brand and product work. Four-to-six-week engagements. Friendly intake, written deliverables, no agency overhead."}
        </div>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "var(--vc-red)", color: "#fff", padding: "26px 36px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        <span>{data.ctaText || "Inquire via DM"}</span>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M5 17 L17 5 M9 5 L17 5 L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </div>
      <Asterisk size={68} />
    </div>
  </div>
);

/* ============================================== */
/* 11. LINK-IN-BIO (CTA)                           */
/* ============================================== */
const T_LinkBio = ({ data, brand }) => (
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
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 124, lineHeight: 0.98, color: "var(--vc-ink)", letterSpacing: "-0.025em" }}>
          {data.headlineA || "Why your proposal is"}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 136, lineHeight: 0.98, color: "var(--vc-red)", letterSpacing: "-0.025em", marginTop: 4 }}>
          {data.headlineB || "your portfolio."}
        </div>
        <div style={{ marginTop: 28, fontFamily: "var(--font-helvetica)", fontSize: 28, color: "var(--vc-mute)", maxWidth: 800, lineHeight: 1.4 }}>
          {data.subtext || "A short piece on the small things that build trust before the work has even started."}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1.5px solid var(--vc-ink)", paddingTop: 24 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "var(--vc-ink)", letterSpacing: "0.05em" }}>↗ {data.url || "northquill.studio/essays"}</span>
        <Asterisk size={56} />
      </div>
    </div>
    <div style={{ padding: "26px 80px", background: "var(--vc-blue)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 32 }}>{brand.studioName || "Studio"}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.85 }}>Link in bio</span>
    </div>
  </div>
);

/* ============================================== */
/* 12. LAUNCH (CTA)                                */
/* ============================================== */
const T_Launch = ({ data, brand }) => (
  <div className="social-frame" style={{ background: "var(--vc-lime)", color: "var(--vc-ink)", padding: 80, display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <VLabel text={data.kicker || "Launching"} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase" }}>{data.date || "May · 2026"}</span>
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--vc-ink)" }}>
        {data.category || "A new product"}
      </div>
      <div style={{ marginTop: 12, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 380, lineHeight: 0.88, color: "var(--vc-ink)", letterSpacing: "-0.03em" }}>
        {data.productName || "Atelier"}.
      </div>
      <div style={{ marginTop: 36, fontFamily: "var(--font-helvetica)", fontWeight: 500, fontSize: 44, lineHeight: 1.15, maxWidth: 880 }}>
        {data.tagline || "A document generator built for working freelancers."}
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "var(--vc-ink)", color: "var(--vc-cream)", padding: "26px 40px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        <span>{data.ctaText || "Get early access"}</span>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M5 17 L17 5 M9 5 L17 5 L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </div>
      <Asterisk size={88} />
    </div>
  </div>
);

/* ============================================== */
/* CAROUSEL CLOSING / CTA SLIDE                    */
/* ============================================== */
const CarouselCTA = ({ brand, data }) => (
  <div className="social-frame" style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <VLabel text="Follow for more" color="var(--vc-cream)" style={{ opacity: 0.5 }} />
      <Asterisk size={56} color="var(--vc-blue)" />
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      {brand.logo && brand.logoEnabled !== false
        ? <img src={brand.logo} alt="" style={{ height: 80, width: "auto", maxWidth: 220, objectFit: "contain", marginBottom: 36 }} />
        : null
      }
      <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 136, lineHeight: 0.96, letterSpacing: "-0.025em" }}>
        {brand.studioName || "Studio"}
      </div>
      <div style={{ marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 20, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5 }}>
        {brand.handle || "@studio"}
      </div>
      {data.ctaText && (
        <div style={{ marginTop: 52, fontFamily: "var(--font-helvetica)", fontWeight: 500, fontSize: 40, lineHeight: 1.35, maxWidth: 720, opacity: 0.85 }}>
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

/* ============ Template registry ============ */
const f = (key, label, opts = {}) => ({ key, label, type: opts.type || "text", placeholder: opts.placeholder, hint: opts.hint });
const fA = (key, label, opts = {}) => f(key, label, { type: "textarea", ...opts });

const SocialTemplates = [
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
];

Object.assign(window, {
  SocialTemplates,
  // shared decorations + helpers for other template files
  Paperclip, Chevron, ArrowOut, Asterisk, XMark,
  HandCircle, Underscribble, PhotoSlot, CrescentMark,
  VLabel, VFooter, Wordmark,
});
