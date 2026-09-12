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
/* 10. NOW BOOKING (CTA)                           */
/* ============================================== */
const T_Booking = ({ data, brand }) => {
  const cta = data.ctaText || "Inquire via DM";
  const ctaBtnSize = getDynamicFontSize(cta, 22, 16, 14);
  const project = data.projectText ?? data.project ?? "projects.";
  const leadFull = `${data.lead || "Two spots open for"} ${data.window || "Q3"} ${project}`;
  const leadSize = getDynamicFontSize(leadFull, 152, 20, 54);
  const subtextSize = getDynamicFontSize(data.subtext || "", 36, 80, 24, 920);
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
          <div style={{ marginTop: 28, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: subtextSize, color: "var(--vc-mute)", maxWidth: "100%", lineHeight: 1.35, overflowWrap: "break-word", wordBreak: "normal" }}>
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
  const subSize = getDynamicFontSize(data.subtext || "", 28, 80, 20, 920);
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
          <div style={{ marginTop: 28, fontFamily: "var(--font-helvetica)", fontSize: subSize, color: "var(--vc-mute)", maxWidth: "100%", lineHeight: 1.4, overflowWrap: "break-word", wordBreak: "normal" }}>
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

export {
  T_Booking,
  T_LinkBio,
  T_Launch,
  T_Waitlist,
  T_LeadMagnet,
  T_DMKeyword
};
