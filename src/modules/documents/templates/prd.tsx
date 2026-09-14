// @ts-nocheck
import React from 'react';
import { fmt } from '../utils';
import { DocBody, BrandMark, InlineMd, parseLines, CheckRow } from './shared';
/* ============================================== */
/* =============== PRD ========================== */
/* ============================================== */

function PRDStats({ data }) {
  return (
    <dl className="prd-stat-grid">
      <div className="prd-stat"><dt>Author</dt><dd>{data.author || "—"}</dd></div>
      <div className="prd-stat"><dt>Status</dt><dd>{data.status || "Draft"}</dd></div>
      <div className="prd-stat"><dt>Target</dt><dd>{data.release || "—"}</dd></div>
    </dl>
  );
}

function PRDClassic({ data, brand }) {
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>Product Requirements</div>
        <div className="t-doctype">{data.title || "Untitled"}</div>
        <div className="t-sub">{data.tagline}</div>
      </div>
      <PRDStats data={data} />
      <h2>1. Problem</h2><DocBody md={data.problem} />
      <h2>2. Goals &amp; non-goals</h2><DocBody md={data.goals} />
      <h2>3. User stories</h2><DocBody md={data.stories} />
      <h2>4. Solution</h2><DocBody md={data.solution} />
      <h2>5. Success metrics</h2><DocBody md={data.metrics} />
      <h2>6. Risks &amp; open questions</h2><DocBody md={data.risks} />
    </div>
  );
}

function PRDModern({ data, brand }) {
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 12 }}>PRD · {data.status || "Draft"}</div>
          <div className="t-doctype" style={{ fontSize: "40pt" }}>{data.title || "Untitled"}</div>
          <div className="t-num" style={{ fontSize: "11pt", marginTop: 8, color: "var(--paper-ink)" }}>{data.tagline}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from">{data.author || brand.fullName}</div>
          <div className="t-from-meta">Updated {fmt.dateShort(data.date)}</div>
          <div className="t-from-meta">Target {data.release}</div>
        </div>
      </div>
      <h2>Problem</h2><DocBody md={data.problem} />
      <h2>Goals</h2><DocBody md={data.goals} />
      <h2>User stories</h2><DocBody md={data.stories} />
      <h2>Solution</h2><DocBody md={data.solution} />
      <h2>Success metrics</h2><DocBody md={data.metrics} />
      <h2>Risks</h2><DocBody md={data.risks} />
    </div>
  );
}

function PRDEditorial({ data, brand }) {
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span>Product Requirements</span>
        <span>{data.status || "Draft"}</span>
        <span>{fmt.dateShort(data.date)}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype"><em>{data.title || "Untitled"}</em></div>
        <div className="t-sub">{data.tagline}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Author</dt><dd>{data.author || "—"}</dd></div>
        <div className="t-meta-block"><dt>Status</dt><dd>{data.status || "Draft"}</dd></div>
        <div className="t-meta-block"><dt>Target</dt><dd>{data.release || "—"}</dd></div>
        <div className="t-meta-block"><dt>Updated</dt><dd>{fmt.dateShort(data.date)}</dd></div>
      </dl>
      <h3>Section One</h3><h2>The problem.</h2><DocBody md={data.problem} />
      <h3>Section Two</h3><h2>Goals &amp; non-goals.</h2><DocBody md={data.goals} />
      <h3>Section Three</h3><h2>User stories.</h2><DocBody md={data.stories} />
      <h3>Section Four</h3><h2>The solution.</h2><DocBody md={data.solution} />
      <h3>Section Five</h3><h2>How we measure success.</h2><DocBody md={data.metrics} />
      <h3>Section Six</h3><h2>Risks &amp; questions.</h2><DocBody md={data.risks} />
      <div className="t-foot">
        <span>End of document</span>
        <span>{data.author || brand.fullName}</span>
        <span>{fmt.dateShort(data.date)}</span>
      </div>
    </div>
  );
}

function PRDMinimal({ data, brand }) {
  return (
    <div className="doc t-minimal">
      <div className="t-head">
        <div>
          <div className="t-doctype">{data.title || "Untitled PRD"}</div>
          <div className="t-sub">{data.tagline || "Product Requirements Document"}</div>
          <div className="t-num">STATUS: {data.status || "Draft"} · TARGET: {data.release || "—"}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from">{data.author || brand.fullName}</div>
          <div className="t-from-meta">Updated: {fmt.date(data.date)}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Author</dt><dd>{data.author || "—"}</dd></div>
        <div className="t-meta-block"><dt>Lifecycle Status</dt><dd>{data.status || "Draft"}</dd></div>
        <div className="t-meta-block"><dt>Target Release</dt><dd>{data.release || "—"}</dd></div>
        <div className="t-meta-block"><dt>Last Revised</dt><dd>{fmt.date(data.date)}</dd></div>
      </dl>
      <h2>1. Problem Statement</h2><DocBody md={data.problem} />
      <h2>2. Goals &amp; Non-Goals</h2><DocBody md={data.goals} />
      <h2>3. User Stories</h2><DocBody md={data.stories} />
      <h2>4. Proposed Technical Solution</h2><DocBody md={data.solution} />
      <h2>5. Metrics &amp; Observability</h2><DocBody md={data.metrics} />
      <h2>6. Known Risks &amp; Dependencies</h2><DocBody md={data.risks} />
      <div className="t-foot">
        <span>PRD · {data.title || "Untitled"}</span>
        <span>Version {data.status || "Draft"}</span>
        <span>{fmt.date(data.date)}</span>
      </div>
    </div>
  );
}

function PRDExecutive({ data, brand }) {
  return (
    <div className="doc t-executive">
      <div className="t-head">
        <div className="t-head-left">
          <div className="t-doctype">{data.title || "Product Requirements"}</div>
          <div className="t-sub">{data.tagline || "Executive Product Specification"}</div>
          <div className="t-num">RELEASE SPEC: {data.release || "v1.0"} · STATUS: {data.status || "Draft"}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from">{data.author || brand.fullName}</div>
          <div className="t-from-meta">Lead Architect / PM<br/>Revision: {fmt.date(data.date)}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Product Lead</dt><dd>{data.author || "—"}</dd></div>
        <div className="t-meta-block"><dt>Approval Status</dt><dd>{data.status || "Draft"}</dd></div>
        <div className="t-meta-block"><dt>Ship Target</dt><dd>{data.release || "—"}</dd></div>
        <div className="t-meta-block"><dt>Effective Date</dt><dd>{fmt.date(data.date)}</dd></div>
      </dl>
      <h2>Section 1: Problem Definition &amp; Business Opportunity</h2><DocBody md={data.problem} />
      <h2>Section 2: Strategic Objectives &amp; Scope Boundary</h2><DocBody md={data.goals} />
      <h2>Section 3: Core User Personas &amp; Workflows</h2><DocBody md={data.stories} />
      <h2>Section 4: Architectural Solution &amp; Scope</h2><DocBody md={data.solution} />
      <h2>Section 5: KPI Targets &amp; Telemetry Success Metrics</h2><DocBody md={data.metrics} />
      <h2>Section 6: Risk Matrix &amp; Technical Contingencies</h2><DocBody md={data.risks} />
      <div className="t-foot">
        <span>Executive Product Specification</span>
        <span>Product Team Sign-off</span>
        <span>{fmt.date(data.date)}</span>
      </div>
    </div>
  );
}

export { PRDClassic, PRDModern, PRDEditorial, PRDMinimal, PRDExecutive };

