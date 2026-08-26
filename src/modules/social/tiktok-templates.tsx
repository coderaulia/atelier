// @ts-nocheck
import {
  Paperclip, Chevron, ArrowOut, Asterisk, XMark,
  HandCircle, Underscribble, PhotoSlot, CrescentMark,
  VLabel, VFooter, Wordmark, getDynamicFontSize,
} from './social-templates';


const VFRAME = { className: "social-frame social-frame--vertical" };

const ImgOrSlot = ({ src, label = "Drop image · 4:5 recommended", style, objectPosition = "center" }) => (
  src
    ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition, display: "block", ...style }} />
    : <PhotoSlot label={label} style={{ width: "100%", height: "100%", ...style }} />
);

/* ============================================== */
/* 1. HOT TAKE — big italic statement              */
/* ============================================== */
const V_HotTake = ({ data, brand }) => {
  const fullText = `${data.body || "You need to "} ${data.italic || "finish one"} ${data.tail || " of the seven tabs already open."}`;
  const bodySize = getDynamicFontSize(fullText, 160, 40, 76);
  return (
    <div {...VFRAME} style={{ background: "var(--vc-cream)", padding: 96, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel text={data.kicker || "Hot Take"} />
        <Paperclip />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 48, color: "var(--vc-red)", marginBottom: 24 }}>
            {data.lead || "You don't need another tool."}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: bodySize, lineHeight: 0.96, color: "var(--vc-ink)", letterSpacing: "-0.02em" }}>
            {data.body || "You need to "}
            <em style={{ color: "var(--vc-red)" }}>{data.italic || "finish one"}</em>
            {data.tail || " of the seven tabs already open."}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Asterisk size={88} />
        <div style={{ textAlign: "right" }}>
          <Wordmark brand={brand} />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--vc-mute)", marginTop: 6 }}>
            {brand.handle || "@studio"}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================== */
/* 2. TOP 5 LIST — numbered vertical               */
/* ============================================== */
const V_TopList = ({ data, brand }) => {
  const items = (data.items || "Listen before you build.\nWrite the email first.\nDocument as you go.\nPrice the outcome.\nShip in daylight.").split("\n").filter(Boolean).slice(0, 6);
  return (
    <div {...VFRAME} style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid var(--vc-ink)", paddingBottom: 28 }}>
        <div>
          <VLabel text={data.kicker || "Field Notes"} />
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 96, lineHeight: 0.98, marginTop: 18, letterSpacing: "-0.025em" }}>
            {data.title || "Top "}{items.length}{" "}
            <Underscribble>{data.titleAccent || "rules"}</Underscribble>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 38, color: "var(--vc-mute)", marginTop: 8 }}>
            {data.subtitle || "from a freelance decade."}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", gap: 32, padding: "26px 0", borderBottom: i < items.length - 1 ? "1px solid rgba(14,14,14,0.18)" : "0", alignItems: "baseline" }}>
            <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 72, color: "var(--vc-red)", width: 78, lineHeight: 1 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: "var(--font-helvetica)", fontWeight: 500, fontSize: 44, lineHeight: 1.18, letterSpacing: "-0.005em" }}>
              {it}
            </span>
          </div>
        ))}
      </div>
      <VFooter brand={brand} borderColor="rgba(14,14,14,0.2)" />
    </div>
  );
};

/* ============================================== */
/* 3. BIG QUESTION                                  */
/* ============================================== */
const V_Question = ({ data, brand }) => {
  const qText = data.question || "Are you a freelancer";
  const accText = data.questionAccent || "or a hobbyist?";
  const qSize = getDynamicFontSize(qText, 156, 22, 76);
  const accSize = getDynamicFontSize(accText, 168, 18, 80);
  return (
    <div {...VFRAME} style={{ background: "var(--vc-blue)", color: "#fff", padding: 96, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel text={data.kicker || "Question of the Week"} color="#fff" style={{ opacity: 0.85 }} />
        <CrescentMark color="#fff" size={72} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 400, fontSize: qSize, lineHeight: 1, letterSpacing: "-0.025em" }}>
          {qText}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: accSize, lineHeight: 0.98, letterSpacing: "-0.025em", marginTop: 4 }}>
          {accText}
        </div>
        <div style={{ marginTop: 56, fontFamily: "var(--font-helvetica)", fontSize: 36, lineHeight: 1.4, maxWidth: 820, opacity: 0.85 }}>
          {data.answer || "The difference is not how good you are. It's whether someone is paying you to be that good before next Tuesday."}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Asterisk size={84} color="#fff" />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.85 }}>
          Reply your answer →
        </span>
      </div>
    </div>
  );
};

/* ============================================== */
/* 4. STAT HERO VERTICAL                            */
/* ============================================== */
const V_StatVertical = ({ data, brand }) => {
  const stat = String(data.stat || "73%");
  const statSize = getDynamicFontSize(stat, 520, 3, 240);
  return (
    <div {...VFRAME} style={{ background: "var(--vc-cream)", padding: 96, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel text={data.kicker || "By the Numbers"} />
        <Chevron color="var(--vc-ink)" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 64, color: "var(--vc-mute)", marginBottom: 14 }}>
          {data.italicLead || "An uncomfortable truth"}
        </div>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: statSize, lineHeight: 0.86, color: "var(--vc-red)", letterSpacing: "-0.055em", whiteSpace: "nowrap", maxWidth: "100%" }}>
          {stat}
        </div>
        <div style={{ marginTop: 48, fontFamily: "var(--font-helvetica)", fontSize: 52, lineHeight: 1.15, color: "var(--vc-ink)", maxWidth: 880, letterSpacing: "-0.005em" }}>
          {data.statLabel || "of solo freelancers undercharge by at least 30%."}
        </div>
        <div style={{ marginTop: 24, fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--vc-mute)" }}>
          {data.source || "Survey of 1,200 — 2026"}
        </div>
      </div>
      <VFooter brand={brand} borderColor="rgba(14,14,14,0.2)" />
    </div>
  );
};

/* ============================================== */
/* 5. THREADS REPLY — Threads-post style mock      */
/* ============================================== */
const V_ThreadsPost = ({ data, brand }) => {
  const initials = (brand.fullName || brand.studioName || "MA").split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div {...VFRAME} style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel text={data.kicker || "From the Feed"} />
        <Paperclip />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div style={{ background: "#fff", borderRadius: 32, padding: 64, border: "1px solid rgba(14,14,14,0.12)", boxShadow: "0 16px 48px -16px rgba(0,0,0,0.18)", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {(brand.logoAvatar || brand.logo) && brand.logoEnabled !== false
              ? <img src={brand.logoAvatar || brand.logo} alt="" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover" }} />
              : <div style={{ width: 96, height: 96, borderRadius: "50%", background: "var(--vc-ink)", color: "var(--vc-cream)", display: "grid", placeItems: "center", fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: 36 }}>{initials}</div>
            }
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: 36, color: "var(--vc-ink)" }}>
                {brand.studioName || "Studio"}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "var(--vc-mute)", marginTop: 2 }}>
                {brand.handle || "@studio"} · {data.time || "2h"}
              </div>
            </div>
            <span style={{ fontFamily: "var(--font-helvetica)", fontSize: 36, color: "var(--vc-mute)", letterSpacing: "0.2em" }}>···</span>
          </div>
          <div style={{ marginTop: 36, fontFamily: "var(--font-helvetica)", fontSize: 44, lineHeight: 1.32, color: "var(--vc-ink)", letterSpacing: "-0.005em" }}>
            {data.body || "the hardest part of freelancing isn't the work. it's deciding the work is finished and sending the invoice."}
          </div>
          {data.italicLine && (
            <div style={{ marginTop: 20, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 36, color: "var(--vc-red)" }}>
              {data.italicLine}
            </div>
          )}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid rgba(14,14,14,0.1)", display: "flex", gap: 44, color: "var(--vc-mute)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-mono)", fontSize: 22 }}>
              <svg width={28} height={28} viewBox="0 0 28 28" fill="none"><path d="M3 14a11 11 0 0 1 22 0c0 6-5 11-11 11-2 0-4-1-5-1l-4 1 1-4c-2-2-3-4-3-7Z" stroke="currentColor" strokeWidth="2"/></svg>
              {data.replies || "184"}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-mono)", fontSize: 22 }}>
              <svg width={28} height={28} viewBox="0 0 28 28" fill="none"><path d="M6 10l4-4 4 4M10 6v12M22 18l-4 4-4-4M18 22V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              {data.reposts || "62"}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-mono)", fontSize: 22, color: "var(--vc-red)" }}>
              <svg width={28} height={28} viewBox="0 0 28 28" fill="currentColor"><path d="M14 24S4 17 4 11a5 5 0 0 1 10-2 5 5 0 0 1 10 2c0 6-10 13-10 13Z"/></svg>
              {data.likes || "1.2k"}
            </span>
          </div>
        </div>
      </div>
      <VFooter brand={brand} borderColor="rgba(14,14,14,0.2)" />
    </div>
  );
};

/* ============================================== */
/* 6. TUTORIAL HOOK — How to X in 60s              */
/* ============================================== */
const V_Tutorial = ({ data, brand }) => {
  const steps = (data.steps || "Audit existing brand touchpoints.\nMap the customer journey.\nWrite the headline first.\nDesign in low-fi.\nShip and iterate.").split("\n").filter(Boolean).slice(0, 5);
  const whatText = data.what || "rebrand a";
  const whatItalic = data.whatItalic || "small studio";
  const headlineFull = `${whatText} ${whatItalic}`;
  const whatSize = getDynamicFontSize(headlineFull, 132, 18, 68);
  const cta = data.ctaText || "Watch full";
  const ctaBtnSize = getDynamicFontSize(cta, 20, 16, 13);
  return (
    <div {...VFRAME} style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 96, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel text={data.kicker || "Tutorial"} color="var(--vc-cream)" style={{ opacity: 0.8 }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 22px", border: "1.5px solid var(--vc-lime)", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--vc-lime)" }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "var(--vc-lime)" }}></span>
          {data.duration || "60 sec"}
        </span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.7 }}>
          How to
        </div>
        <div style={{ marginTop: 8, fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: whatSize, lineHeight: 0.96, letterSpacing: "-0.025em" }}>
          {whatText}
          <br />
          <em style={{ fontFamily: "var(--font-display)", color: "var(--vc-lime)" }}>{whatItalic}</em>
        </div>
        <div style={{ marginTop: 64, display: "flex", flexDirection: "column", gap: 18 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "var(--vc-lime)", letterSpacing: "0.04em", width: 56 }}>
                0{i + 1}
              </span>
              <span style={{ fontFamily: "var(--font-helvetica)", fontSize: 34, lineHeight: 1.25, opacity: 0.9, flex: 1 }}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "var(--vc-lime)", color: "var(--vc-ink)", padding: "20px 32px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: ctaBtnSize, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {cta} <span>→</span>
        </span>
        <Wordmark brand={brand} color="var(--vc-cream)" />
      </div>
    </div>
  );
};

/* ============================================== */
/* 7. PORTFOLIO COVER — image + project info       */
/* ============================================== */
const V_PortfolioCover = ({ data, brand }) => (
  <div {...VFRAME} style={{ background: "var(--vc-ink)", color: "var(--vc-cream)", padding: 0, display: "grid", gridTemplateRows: "auto 1.05fr auto" }}>
    {/* Top mono bar */}
    <div style={{ padding: "44px 64px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(236,230,214,0.18)" }}>
      <VLabel text={data.kicker || "Case Study"} color="var(--vc-cream)" />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>
        {data.refNo || "No. 014"}
      </span>
    </div>
    {/* Image */}
    <div style={{ position: "relative", overflow: "hidden", background: "#111" }}>
      <ImgOrSlot src={data.image} label="Drop project image · 4:5 or larger" />
      {/* Asterisk overlay */}
      <div style={{ position: "absolute", top: 32, right: 32 }}>
        <Asterisk size={80} color="var(--vc-red)" />
      </div>
    </div>
    {/* Bottom info */}
    <div style={{ padding: "56px 64px 64px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--vc-lime)" }}>
          {data.role || "Brand · Identity · Web"}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>
          {data.year || "2026"}
        </span>
      </div>
      <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 108, lineHeight: 0.96, letterSpacing: "-0.025em" }}>
        {data.client || "Atlas & Bell"}
      </div>
      <div style={{ marginTop: 10, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 56, color: "var(--vc-cream)", opacity: 0.7, lineHeight: 1.1 }}>
        {data.titleItalic || "a new brand for a B2B platform."}
      </div>
      <div style={{ marginTop: 36, paddingTop: 24, borderTop: "1px solid rgba(236,230,214,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Wordmark brand={brand} color="var(--vc-cream)" />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>
          {brand.handle || "@studio"}
        </span>
      </div>
    </div>
  </div>
);

/* ============================================== */
/* 8. CASE STUDY — image + big stat overlay        */
/* ============================================== */
const V_CaseStudy = ({ data, brand }) => (
  <div {...VFRAME} style={{ background: "var(--vc-cream)", padding: 0, display: "grid", gridTemplateRows: "auto auto 1fr auto" }}>
    <div style={{ padding: "44px 64px", display: "flex", justifyContent: "space-between", borderBottom: "2px solid var(--vc-ink)" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        Case Study · {data.client || "Atlas & Bell"}
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--vc-mute)" }}>
        {data.year || "2026"}
      </span>
    </div>
    {/* Image block */}
    <div style={{ aspectRatio: "5/4", overflow: "hidden", position: "relative", background: "#111" }}>
      <ImgOrSlot src={data.image} label="Drop screenshot · landscape" />
    </div>
    {/* Stat + body */}
    <div style={{ padding: "56px 64px", display: "grid", gridTemplateColumns: "auto 1fr", gap: 56, alignItems: "center" }}>
      <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 280, lineHeight: 0.84, color: "var(--vc-red)", letterSpacing: "-0.04em" }}>
        {data.stat || "+312%"}
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--vc-mute)" }}>
          The result
        </div>
        <div style={{ marginTop: 12, fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: 44, lineHeight: 1.18, color: "var(--vc-ink)", letterSpacing: "-0.005em" }}>
          {data.statLabel || "increase in qualified leads in the first 90 days post-launch."}
        </div>
      </div>
    </div>
    {/* Footer */}
    <div style={{ padding: "32px 64px", background: "var(--vc-ink)", color: "var(--vc-cream)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 16 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          {data.tag1 || "Brand"}
        </span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          {data.tag2 || "Web"}
        </span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          {data.tag3 || "8 weeks"}
        </span>
      </div>
      <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 32 }}>
        {brand.studioName || "Studio"}
      </span>
    </div>
  </div>
);

/* ============================================== */
/* 9. POV — narrative scene                         */
/* ============================================== */
const V_POV = ({ data, brand }) => (
  <div {...VFRAME} style={{ background: "var(--vc-lime)", color: "var(--vc-ink)", padding: 96, display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 24, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700 }}>
        POV:
      </span>
      <Asterisk size={72} color="var(--vc-ink)" />
    </div>
    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 132, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {data.scene || "It's Friday at 4pm. The invoice clears. You "}
        <span style={{ fontFamily: "var(--font-helvetica)", fontStyle: "normal", fontWeight: 700, color: "var(--vc-red)" }}>{data.action || "close the laptop"}</span>
        {data.tail || " and start the weekend."}
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 20, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        {data.endTag || "— the dream"}
      </span>
      <Wordmark brand={brand} />
    </div>
  </div>
);

/* ============================================== */
/* 10. WEEKLY SCHEDULE                              */
/* ============================================== */
const V_Schedule = ({ data, brand }) => {
  const items = (data.items || "MON — Client calls + check-ins\nTUE — Deep work block 1\nWED — Deep work block 2\nTHU — Reviews + revisions\nFRI — Ship + invoice\nSAT — Read + walk\nSUN — Plan the week").split("\n").filter(Boolean);
  return (
    <div {...VFRAME} style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <VLabel text={data.kicker || "Weekly Schedule"} />
        <Paperclip />
      </div>
      <div style={{ marginTop: 18, borderBottom: "2px solid var(--vc-ink)", paddingBottom: 28 }}>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 116, lineHeight: 0.96, letterSpacing: "-0.025em" }}>
          {data.title || "How I run a"}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 128, lineHeight: 0.96, color: "var(--vc-red)", letterSpacing: "-0.025em" }}>
          {data.titleItalic || "calm week."}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {items.map((it, i) => {
          const [day, ...rest] = it.split("—");
          const body = rest.join("—").trim();
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 32, padding: "20px 0", borderBottom: i < items.length - 1 ? "1px solid rgba(14,14,14,0.15)" : "0", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 28, letterSpacing: "0.12em", color: "var(--vc-red)", fontWeight: 600 }}>
                {day.trim()}
              </span>
              <span style={{ fontFamily: "var(--font-helvetica)", fontSize: 36, lineHeight: 1.25, letterSpacing: "-0.005em" }}>
                {body}
              </span>
            </div>
          );
        })}
      </div>
      <VFooter brand={brand} borderColor="rgba(14,14,14,0.2)" />
    </div>
  );
};

/* ============ Field shortcuts ============ */
const tf = (key, label, opts = {}) => ({ key, label, type: opts.type || "text", placeholder: opts.placeholder, hint: opts.hint });
const tA = (key, label, opts = {}) => tf(key, label, { type: "textarea", ...opts });
const tI = (key, label, opts = {}) => tf(key, label, { type: "image", ...opts });

const VERTICAL = { width: 1080, height: 1920, category: "vertical" };

/* ============================================== */
/* 11. PORTFOLIO CASE STUDY — 3-slide carousel     */
/* ============================================== */
const V_CaseStudyCarousel = ({ data, brand }) => {
  const palette = [
    { bg: "var(--vc-cream)", fg: "var(--vc-ink)", border: "rgba(14,14,14,0.15)" },
    { bg: "var(--vc-blue)",  fg: "#fff",           border: "rgba(255,255,255,0.2)" },
    { bg: "var(--vc-lime)",  fg: "var(--vc-ink)",  border: "rgba(14,14,14,0.15)" },
  ];
  const slideContent = [
    { num: "01", label: "Problem",  content: data.problem  || "What challenge did the client face?", image: data.image1 },
    { num: "02", label: "Solution", content: data.solution || "What did we build or design?",        image: data.image2 },
    { num: "03", label: "Result",   content: data.result   || "What was the outcome?",               image: data.image3 },
  ];
  return slideContent.map((s, i) => {
    const { bg, fg, border } = palette[i];
    return (
      <div key={i} {...VFRAME} style={{ background: bg, color: fg, padding: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "44px 80px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${border}` }}>
          <VLabel text={`${s.num} / 03 · ${s.label}`} color={fg} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.55 }}>
            {data.projectName || "Case Study"}
          </span>
        </div>
        {s.image ? (
          <>
            <div style={{ flex: "0 0 660px", overflow: "hidden", position: "relative", background: "#111" }}>
              <img src={s.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1, padding: "52px 80px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5, marginBottom: 20 }}>
                  {data.clientName || "Client"}
                </div>
                <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: 68, lineHeight: 1.08, letterSpacing: "-0.01em" }}>
                  {s.content}
                </div>
              </div>
              <VFooter brand={brand} color={fg} borderColor={border} />
            </div>
          </>
        ) : (
          <>
            <div style={{ flex: 1, padding: "64px 80px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.45, marginBottom: 36 }}>
                {data.clientName || "Client"}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 110, lineHeight: 1.04, letterSpacing: "-0.015em" }}>
                {s.content}
              </div>
            </div>
            <div style={{ padding: "0 80px 64px" }}>
              <VFooter brand={brand} color={fg} borderColor={border} />
            </div>
          </>
        )}
      </div>
    );
  });
};

const TikTokTemplates = [
  { id: "hottake", name: "Hot Take", kind: "Single", ...VERTICAL,
    slides: (p) => [<V_HotTake {...p} />],
    fields: [
      tf("kicker", "Top label", { placeholder: "Hot Take" }),
      tf("lead", "Italic lead-in"),
      tf("body", "Body · roman"),
      tf("italic", "Italic phrase"),
      tf("tail", "Trailing roman"),
    ] },
  { id: "toplist", name: "Top List", kind: "Single", ...VERTICAL,
    slides: (p) => [<V_TopList {...p} />],
    fields: [
      tf("kicker", "Kicker"),
      tf("title", "Title prefix", { placeholder: "Top " }),
      tf("titleAccent", "Underscribbled word", { placeholder: "rules" }),
      tf("subtitle", "Italic subtitle"),
      tA("items", "Items (one per line)", { hint: "Up to 6 lines." }),
    ] },
  { id: "question", name: "Big Question", kind: "Single", ...VERTICAL,
    slides: (p) => [<V_Question {...p} />],
    fields: [
      tf("kicker", "Kicker"),
      tf("question", "Question · roman"),
      tf("questionAccent", "Question · italic"),
      tA("answer", "Brief answer"),
    ] },
  { id: "statv", name: "Stat (Vertical)", kind: "Single", ...VERTICAL,
    slides: (p) => [<V_StatVertical {...p} />],
    fields: [
      tf("kicker", "Kicker"),
      tf("italicLead", "Italic lead-in"),
      tf("stat", "Stat", { placeholder: "73%" }),
      tA("statLabel", "Statement"),
      tf("source", "Source"),
    ] },
  { id: "threads", name: "Threads Post", kind: "Single", ...VERTICAL,
    slides: (p) => [<V_ThreadsPost {...p} />],
    fields: [
      tf("kicker", "Top label"),
      tA("body", "Post body"),
      tf("italicLine", "Italic closing line · optional"),
      tf("time", "Time stamp", { placeholder: "2h" }),
      tf("replies", "Replies count"),
      tf("reposts", "Reposts count"),
      tf("likes", "Likes count"),
    ] },
  { id: "tutorial", name: "Tutorial Hook", kind: "Single", ...VERTICAL,
    slides: (p) => [<V_Tutorial {...p} />],
    fields: [
      tf("kicker", "Kicker"),
      tf("duration", "Duration pill", { placeholder: "60 sec" }),
      tf("what", "What · roman"),
      tf("whatItalic", "What · italic accent"),
      tA("steps", "Steps (one per line)", { hint: "Up to 5 lines." }),
      tf("ctaText", "CTA text", { placeholder: "Watch full" }),
    ] },
  { id: "portfolio", name: "Portfolio Cover", kind: "Portfolio", ...VERTICAL,
    slides: (p) => [<V_PortfolioCover {...p} />],
    fields: [
      tI("image", "Project image", { hint: "Crops to ~4:5 portrait" }),
      tf("kicker", "Top label", { placeholder: "Case Study" }),
      tf("refNo", "Reference no."),
      tf("role", "Role · scope"),
      tf("year", "Year"),
      tf("client", "Client / project name"),
      tf("titleItalic", "Italic subtitle"),
    ] },
  { id: "casestudy", name: "Case Study", kind: "Portfolio", ...VERTICAL,
    slides: (p) => [<V_CaseStudy {...p} />],
    fields: [
      tI("image", "Screenshot / artifact", { hint: "Crops to landscape 5:4" }),
      tf("client", "Client name"),
      tf("year", "Year"),
      tf("stat", "Big stat", { placeholder: "+312%" }),
      tA("statLabel", "What the stat means"),
      tf("tag1", "Tag 1"),
      tf("tag2", "Tag 2"),
      tf("tag3", "Tag 3"),
    ] },
  { id: "pov", name: "POV", kind: "Single", ...VERTICAL,
    slides: (p) => [<V_POV {...p} />],
    fields: [
      tf("scene", "Scene · roman before action"),
      tf("action", "Bold action phrase"),
      tf("tail", "Scene · roman after action"),
      tf("endTag", "End tag", { placeholder: "— the dream" }),
    ] },
  { id: "schedule", name: "Weekly Schedule", kind: "Single", ...VERTICAL,
    slides: (p) => [<V_Schedule {...p} />],
    fields: [
      tf("kicker", "Kicker"),
      tf("title", "Title · roman"),
      tf("titleItalic", "Title · italic"),
      tA("items", "Items — 'DAY — body', one per line"),
    ] },
  { id: "casestudycarousel", name: "Case Study Carousel", kind: "Carousel", ...VERTICAL,
    slides: (p) => V_CaseStudyCarousel(p),
    fields: [
      tf("projectName", "Project name", { placeholder: "Brand Identity" }),
      tf("clientName", "Client name", { placeholder: "Atlas & Bell" }),
      tA("problem", "Slide 1 — Problem", { hint: "What challenge did the client face?" }),
      tI("image1", "Slide 1 — image (optional)"),
      tA("solution", "Slide 2 — Solution", { hint: "What did you build or design?" }),
      tI("image2", "Slide 2 — image (optional)"),
      tA("result", "Slide 3 — Result", { hint: "What was the measurable outcome?" }),
      tI("image3", "Slide 3 — image (optional)"),
    ] },
];

Object.assign(window, { TikTokTemplates });

export { TikTokTemplates };
