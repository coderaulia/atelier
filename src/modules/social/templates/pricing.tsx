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

export {
  T_PricingCard,
  T_Pricing3Tier,
  T_PricingRetainer,
  T_PricingAudit,
  T_TestimonialEditorial
};
