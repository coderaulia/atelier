// @ts-nocheck
import React from 'react';
import { fmt } from '../utils';
import { DocBody, BrandMark, InlineMd, parseLines, CheckRow } from './shared';
/* ============================================== */
/* =============== PROPOSAL ===================== */
/* ============================================== */

function ProposalClassic({ data, brand }) {
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}><BrandMark brand={brand} /></div>
        <div className="t-doctype">Proposal</div>
        <div className="t-sub">{data.title || "Untitled proposal"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Prepared for</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Prepared by</dt><dd>{brand.fullName || brand.studioName}</dd></div>
        <div className="t-meta-block"><dt>Date</dt><dd>{fmt.date(data.date)}</dd></div>
        <div className="t-meta-block"><dt>Reference</dt><dd>{data.refNo || "—"}</dd></div>
      </dl>
      <h2>1. Executive Summary</h2><DocBody md={data.summary} />
      <h2>2. Understanding the brief</h2><DocBody md={data.understanding} />
      <h2>3. Approach</h2><DocBody md={data.approach} />
      <h2>4. Deliverables</h2><DocBody md={data.deliverables} />
      <h2>5. Timeline</h2><DocBody md={data.timeline} />
      <h2>6. Investment</h2><DocBody md={data.investment} />
      <h2>7. About</h2><DocBody md={data.about} />
    </div>
  );
}

function ProposalModern({ data, brand }) {
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 18 }}>A proposal</div>
          <div className="t-doctype" style={{ fontSize: "36pt" }}><em>{data.title || "Proposal"}</em></div>
          <div className="t-num">For {data.clientName || "—"} · {fmt.dateShort(data.date)}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta" style={{ whiteSpace: "pre-line" }}>{brand.fullName}<br/>{brand.email}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Engagement</dt><dd>{data.title || "—"}</dd></div>
        <div className="t-meta-block"><dt>Ref.</dt><dd>{data.refNo || "—"}</dd></div>
        <div className="t-meta-block"><dt>Valid until</dt><dd>{fmt.dateShort(data.date)}</dd></div>
      </dl>
      <h2>Summary</h2><DocBody md={data.summary} />
      <h2>The brief</h2><DocBody md={data.understanding} />
      <h2>Approach</h2><DocBody md={data.approach} />
      <h2>Deliverables</h2><DocBody md={data.deliverables} />
      <h2>Timeline</h2><DocBody md={data.timeline} />
      <h2>Investment</h2><DocBody md={data.investment} />
      <h2>About us</h2><DocBody md={data.about} />
    </div>
  );
}

function ProposalEditorial({ data, brand }) {
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span><BrandMark brand={brand} /></span>
        <span>Proposal · No. {data.refNo || "01"}</span>
        <span>{fmt.dateShort(data.date)}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype"><em>{data.title || "A proposal"}</em></div>
        <div className="t-sub">prepared for the kind attention of {data.clientName || "the client"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Prepared for</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>From the desk of</dt><dd>{brand.fullName}</dd></div>
        <div className="t-meta-block"><dt>Studio</dt><dd>{brand.studioName}</dd></div>
        <div className="t-meta-block"><dt>Date</dt><dd>{fmt.dateShort(data.date)}</dd></div>
      </dl>
      <h3>Chapter One</h3><h2>The summary.</h2><DocBody md={data.summary} />
      <h3>Chapter Two</h3><h2>What we heard.</h2><DocBody md={data.understanding} />
      <h3>Chapter Three</h3><h2>How we'll work.</h2><DocBody md={data.approach} />
      <h3>Chapter Four</h3><h2>What you'll receive.</h2><DocBody md={data.deliverables} />
      <h3>Chapter Five</h3><h2>When it happens.</h2><DocBody md={data.timeline} />
      <h3>Chapter Six</h3><h2>The investment.</h2><DocBody md={data.investment} />
      <h3>Chapter Seven</h3><h2>About the studio.</h2><DocBody md={data.about} />
      <div className="t-foot">
        <span>End of proposal</span>
        <span>{brand.studioName}</span>
        <span>{fmt.dateShort(data.date)}</span>
      </div>
    </div>
  );
}


export { ProposalClassic, ProposalModern, ProposalEditorial };
