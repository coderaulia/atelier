// @ts-nocheck
import React from 'react';
import { fmt } from '../../documents/utils';
import { renderSocialMd } from '../renderSocialMd';
import {
  Paperclip, Chevron, ArrowOut, Asterisk, XMark,
  HandCircle, Underscribble, PhotoSlot, CrescentMark,
  VLabel, VFooter, Wordmark, getDynamicFontSize,
  THEME_OPTIONS, getThemeColors,
} from '../decorations';

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
      <div style={{ display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
        <VLabel num={1} text={data.coverLabel || "A Framework"} />
        <Chevron color="var(--vc-ink)" />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ display: "inline-flex", alignItems: "center", padding: "14px 28px", background: "var(--vc-ink)", color: "var(--vc-cream)", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Swipe →
        </span>
        <Asterisk size={64} />
      </div>
    </div>
  );

  const stepSlides = steps.map((s, i) => {
    const parts = s.split("—");
    const name = parts[0] || `Step ${i + 1}`;
    const body = parts.slice(1).join("—").trim() || s;
    const bg = palette[i % palette.length];
    const fg = colors[i % colors.length];
    const isDark = bg === "var(--vc-blue)" || bg === "var(--vc-ink)";
    const nameSize = getDynamicFontSize(name.trim(), 132, 10, 48);
    const bodySize = getDynamicFontSize(body, 32, 60, 22);
    return (
      <div className="social-frame" key={i} style={{ background: bg, color: fg, padding: 80, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
          <VLabel num={i + 1} text={`Step ${i + 1} of ${steps.length}`} color={fg} style={{ opacity: 0.8 }} />
          <CrescentMark color={fg} />
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: 280, lineHeight: 0.88, letterSpacing: "-0.04em", color: "var(--vc-red)" }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ marginTop: 12, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: nameSize, lineHeight: 1.08, letterSpacing: "-0.015em", overflowWrap: "break-word", wordBreak: "normal" }}>
              {name.trim()}.
            </div>
            <div style={{ marginTop: 24, fontFamily: "var(--font-helvetica)", fontSize: bodySize, lineHeight: 1.35, maxWidth: 820, opacity: isDark ? 0.75 : 0.7, overflowWrap: "break-word", wordBreak: "normal" }}>
              {renderSocialMd(body)}
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <VFooter brand={brand} color={fg} borderColor={isDark ? "rgba(255,255,255,0.2)" : "rgba(14,14,14,0.2)"} />
        </div>
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
          <div style={{ marginTop: 28, fontFamily: "var(--font-helvetica)", fontSize: 28, color: "var(--vc-mute)", maxWidth: "100%", lineHeight: 1.4, overflowWrap: "break-word", wordBreak: "normal" }}>
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

export {
  T_Framework,
  T_Story,
  T_Tips,
  T_Mistakes,
  T_MiniGuide
};
