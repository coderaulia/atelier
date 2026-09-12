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
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: nameSize, lineHeight: 1.08, letterSpacing: "-0.015em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {name}
        </div>

        {/* Position & Department */}
        <div style={{ marginTop: 14, fontFamily: "var(--font-mono)", fontSize: posSize, letterSpacing: "0.12em", textTransform: "uppercase", color: c.accent, fontWeight: 700, overflowWrap: "break-word", wordBreak: "normal" }}>
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

export {
  T_PhotoPost,
  T_WorkShowcase,
  T_Team1,
  T_Team2,
  T_Team3,
  T_Team4
};
