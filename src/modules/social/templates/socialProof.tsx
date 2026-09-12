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

export {
  T_Testimonial,
  T_PricingEditorial,
  T_MetricProof,
  T_TweetReview,
  T_CaseStudy
};
