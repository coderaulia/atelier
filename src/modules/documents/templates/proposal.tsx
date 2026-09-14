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

function ProposalMinimal({ data, brand }) {
  return (
    <div className="doc t-minimal">
      <div className="t-head">
        <div>
          <div className="t-doctype">Project Proposal</div>
          <div className="t-sub">{data.title || "Untitled Proposal"}</div>
          <div className="t-num">PROPOSAL // {data.refNo || "PROP-001"}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta">{brand.fullName}<br/>{brand.email}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Author</dt><dd>{brand.fullName || brand.studioName}</dd></div>
        <div className="t-meta-block"><dt>Date</dt><dd>{fmt.date(data.date)}</dd></div>
        <div className="t-meta-block"><dt>Ref</dt><dd>{data.refNo || "—"}</dd></div>
      </dl>
      <h2>1. Executive Summary</h2><DocBody md={data.summary} />
      <h2>2. Understanding &amp; Objectives</h2><DocBody md={data.understanding} />
      <h2>3. Proposed Approach</h2><DocBody md={data.approach} />
      <h2>4. Deliverables</h2><DocBody md={data.deliverables} />
      <h2>5. Timeline &amp; Phases</h2><DocBody md={data.timeline} />
      <h2>6. Investment Structure</h2><DocBody md={data.investment} />
      <h2>7. Studio Background</h2><DocBody md={data.about} />
      <div className="t-foot">
        <span>{brand.studioName}</span>
        <span>Proposal · {data.refNo || "—"}</span>
        <span>{fmt.date(data.date)}</span>
      </div>
    </div>
  );
}

function ProposalExecutive({ data, brand }) {
  return (
    <div className="doc t-executive">
      <div className="t-head">
        <div className="t-head-left">
          <div className="t-doctype">Project Proposal</div>
          <div className="t-sub">{data.title || "Strategic Commercial Proposal"}</div>
          <div className="t-num">STRICTLY CONFIDENTIAL · REF: {data.refNo || "PROP-001"}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta" style={{ whiteSpace: "pre-line" }}>{brand.studioAddress}<br/>{brand.email}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Client Entity</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Lead Agency</dt><dd>{brand.studioName || brand.fullName}</dd></div>
        <div className="t-meta-block"><dt>Date of Presentation</dt><dd>{fmt.date(data.date)}</dd></div>
        <div className="t-meta-block"><dt>Proposal ID</dt><dd>{data.refNo || "—"}</dd></div>
      </dl>
      <h2>Section 1: Executive Brief &amp; Strategic Context</h2><DocBody md={data.summary} />
      <h2>Section 2: Problem Statement &amp; Requirements</h2><DocBody md={data.understanding} />
      <h2>Section 3: Strategic Methodology &amp; Execution</h2><DocBody md={data.approach} />
      <h2>Section 4: Comprehensive Deliverables Matrix</h2><DocBody md={data.deliverables} />
      <h2>Section 5: Project Schedule &amp; Milestones</h2><DocBody md={data.timeline} />
      <h2>Section 6: Commercial Investment &amp; Fee Schedule</h2><DocBody md={data.investment} />
      <h2>Section 7: Credentials &amp; Case Studies</h2><DocBody md={data.about} />
      <div className="t-foot">
        <span>Confidential Proposal · All Rights Reserved</span>
        <span>{brand.studioName}</span>
        <span>Valid for 30 Days</span>
      </div>
    </div>
  );
}

export { ProposalClassic, ProposalModern, ProposalEditorial, ProposalMinimal, ProposalExecutive };

