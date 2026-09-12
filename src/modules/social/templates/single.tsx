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
/* 1. PULL QUOTE (single)                          */
/* ============================================== */
const T_Quote = ({ data, brand }) => {
  const quoteText = data.quote || "The secret to social media success? Authenticity & consistency";
  const quoteSize = getDynamicFontSize(quoteText, 116, 50, 56);
  return (
    <div className="social-frame" style={{ background: "var(--vc-cream)", padding: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
        <Paperclip />
        <VLabel text={data.label || "A Better Future"} style={{ textAlign: "right", lineHeight: 1.4 }} />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: quoteSize, lineHeight: 1.02, color: "var(--vc-ink)", letterSpacing: "-0.01em", overflowWrap: "break-word", wordBreak: "normal" }}>
          <span style={{ color: "var(--vc-red)" }}>"</span>{renderSocialMd(quoteText)}<span style={{ color: "var(--vc-red)" }}>"</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
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
  const labelSize = getDynamicFontSize(data.statLabel || "of posts get zero meaningful engagement.", 38, 85, 26, 920);
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
        <div style={{ marginTop: 28, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: labelSize, color: "var(--vc-mute)", maxWidth: "100%", lineHeight: 1.35, overflowWrap: "break-word", wordBreak: "normal" }}>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
        <Paperclip color="#fff" />
        <Chevron color="#fff" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, flexShrink: 0 }}>
        <XMark size={96} color="#fff" />
        <VLabel text={data.label || "A Better Future"} color="#fff" style={{ textAlign: "right", lineHeight: 1.4, opacity: 0.85 }} />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: headSize, lineHeight: 1.02, letterSpacing: "-0.015em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {headA}{" "}
          <em>{headB}</em>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexShrink: 0 }}>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
        <VLabel text={data.kicker || "Method"} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 22px", border: "1.5px solid var(--vc-ink)", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <span style={{ display: "inline-block", width: 14, height: 14 }}>
            <svg viewBox="0 0 14 14" fill="none"><path d="M3 11 L11 3 M5 3 L11 3 L11 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </span>
          {data.pillRight || "Digital"}
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 700, fontSize: headSize, lineHeight: 0.98, color: "var(--vc-ink)", textTransform: "uppercase", letterSpacing: "-0.02em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {renderSocialMd(headline)} <HandCircle color="var(--vc-red)">{circled}</HandCircle>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexShrink: 0 }}>
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
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: beforeSize, lineHeight: 1.08, color: "var(--vc-ink)", overflowWrap: "break-word", wordBreak: "normal" }}>
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
          <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 600, fontSize: afterSize, lineHeight: 1.08, overflowWrap: "break-word", wordBreak: "normal" }}>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
        <VLabel text={data.kicker || "Manifesto"} color="var(--vc-cream)" style={{ opacity: 0.7 }} />
        <Asterisk size={56} color="var(--vc-blue)" />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-helvetica)", fontWeight: 400, fontSize: headSize, lineHeight: 1.08, letterSpacing: "-0.015em", overflowWrap: "break-word", wordBreak: "normal" }}>
          {data.lead || "Tech that"}{" "}
          <em style={{ fontFamily: "var(--font-display)", color: "var(--vc-blue)" }}>{data.italic || "just works."}</em>{" "}
          <span style={{ color: "rgba(236,230,214,0.6)" }}>{renderSocialMd(data.tail || "You should not have to worry about how it works. You just need it to perform.")}</span>
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        <VFooter brand={brand} color="var(--vc-cream)" borderColor="rgba(236,230,214,0.2)" />
      </div>
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

export {
  T_Quote,
  T_Stat,
  T_Announce,
  T_Steps,
  T_BeforeAfter,
  T_Manifesto,
  T_Checklist,
  T_Opinion,
  T_Pillars
};
