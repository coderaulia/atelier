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

export {
  T_BreakingPost,
  T_WeeklyDigest,
  T_NewsHero,
  T_NewsSplit,
  T_NewsInterview
};
