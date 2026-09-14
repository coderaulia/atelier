// @ts-nocheck
import React from 'react';
import { fmt } from '../utils';
import { DocBody, BrandMark, InlineMd, parseLines, CheckRow } from './shared';
/* ============================================== */
/* =============== AGREEMENT ==================== */
/* ============================================== */

function AgreementClassic({ data, brand }) {
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>
          <BrandMark brand={brand} />
        </div>
        <div className="t-doctype">Services Agreement</div>
        <div className="t-sub">{data.title || "Untitled engagement"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block">
          <dt>Between</dt>
          <dd>{brand.studioName || "—"}<br/><span style={{ color: "var(--paper-muted)", fontWeight: 400 }}>{brand.studioAddress}</span></dd>
        </div>
        <div className="t-meta-block">
          <dt>And</dt>
          <dd>{data.clientName || "—"}<br/><span style={{ color: "var(--paper-muted)", fontWeight: 400, whiteSpace: "pre-line" }}>{data.clientAddress}</span></dd>
        </div>
        <div className="t-meta-block">
          <dt>Effective date</dt>
          <dd>{fmt.date(data.date)}</dd>
        </div>
        <div className="t-meta-block">
          <dt>Reference</dt>
          <dd>{data.refNo || "—"}</dd>
        </div>
      </dl>
      <h2>1. Scope of Work</h2>
      <DocBody md={data.scope} />
      <h2>2. Deliverables</h2>
      <DocBody md={data.deliverables} />
      <h2>3. Compensation</h2>
      <DocBody md={data.compensation} />
      <h2>4. Timeline</h2>
      <DocBody md={data.timeline} />
      <h2>5. Legal &amp; General Terms</h2>
      <DocBody md={data.legal} />

      <div className="t-foot">
        <div>
          <div className="t-sign">{data.signatoryName || brand.fullName || "—"}<br/>{brand.studioName}</div>
        </div>
        <div>
          <div className="t-sign">{data.clientSignatory || "—"}<br/>{data.clientName}</div>
        </div>
      </div>
    </div>
  );
}

function AgreementModern({ data, brand }) {
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div className="t-doctype">Services<br/><em>Agreement</em></div>
          <div className="t-num">REF / {data.refNo || "AG-0001"}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta" style={{ whiteSpace: "pre-line" }}>{brand.studioAddress}</div>
          <div className="t-from-meta" style={{ marginTop: 6 }}>{brand.email}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block">
          <dt>Client</dt>
          <dd>{data.clientName || "—"}</dd>
        </div>
        <div className="t-meta-block">
          <dt>Engagement</dt>
          <dd>{data.title || "—"}</dd>
        </div>
        <div className="t-meta-block">
          <dt>Effective</dt>
          <dd>{fmt.date(data.date)}</dd>
        </div>
      </dl>
      <h2>Scope</h2>
      <DocBody md={data.scope} />
      <h2>Deliverables</h2>
      <DocBody md={data.deliverables} />
      <h2>Compensation</h2>
      <DocBody md={data.compensation} />
      <h2>Timeline</h2>
      <DocBody md={data.timeline} />
      <h2>Legal</h2>
      <DocBody md={data.legal} />

      <div className="t-foot">
        <div>
          <div className="t-sign"></div>
          <div>{data.signatoryName || brand.fullName || "—"}</div>
          <div style={{ color: "var(--paper-muted)" }}>{brand.studioName}</div>
        </div>
        <div>
          <div className="t-sign"></div>
          <div>{data.clientSignatory || "—"}</div>
          <div style={{ color: "var(--paper-muted)" }}>{data.clientName}</div>
        </div>
      </div>
    </div>
  );
}

function AgreementEditorial({ data, brand }) {
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span><BrandMark brand={brand} /></span>
        <span>No. {data.refNo || "01"}</span>
        <span>{fmt.dateShort(data.date)}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype">An <em>agreement</em></div>
        <div className="t-sub">on the matter of "{data.title || "the engagement"}"</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Between</dt><dd>{brand.studioName || "—"}</dd></div>
        <div className="t-meta-block"><dt>And</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Effective</dt><dd>{fmt.dateShort(data.date)}</dd></div>
        <div className="t-meta-block"><dt>Reference</dt><dd>{data.refNo || "—"}</dd></div>
      </dl>
      <h3>The Scope</h3><h2>What is being made.</h2>
      <DocBody md={data.scope} />
      <h3>The Deliverables</h3><h2>What will be received.</h2>
      <DocBody md={data.deliverables} />
      <h3>The Compensation</h3><h2>What is owed.</h2>
      <DocBody md={data.compensation} />
      <h3>The Timeline</h3><h2>When it happens.</h2>
      <DocBody md={data.timeline} />
      <h3>The Terms</h3><h2>How we work together.</h2>
      <DocBody md={data.legal} />

      <div className="t-sign-area">
        <div className="t-sign">{data.signatoryName || brand.fullName || "—"}<br/>{brand.studioName}</div>
        <div className="t-sign">{data.clientSignatory || "—"}<br/>{data.clientName}</div>
      </div>
      <div className="t-foot">
        <span>End of document</span>
        <span>{brand.studioName}</span>
        <span>{fmt.dateShort(data.date)}</span>
      </div>
    </div>
  );
}

function AgreementMinimal({ data, brand }) {
  return (
    <div className="doc t-minimal">
      <div className="t-head">
        <div>
          <div className="t-doctype">Services Agreement</div>
          <div className="t-sub">{data.title || "Engagement Agreement"}</div>
          <div className="t-num">REF // {data.refNo || "AG-0001"}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta">{brand.studioAddress}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Provider</dt><dd>{brand.studioName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Date</dt><dd>{fmt.date(data.date)}</dd></div>
        <div className="t-meta-block"><dt>Ref</dt><dd>{data.refNo || "—"}</dd></div>
      </dl>
      <h2>1. Scope of Work</h2>
      <DocBody md={data.scope} />
      <h2>2. Deliverables</h2>
      <DocBody md={data.deliverables} />
      <h2>3. Compensation</h2>
      <DocBody md={data.compensation} />
      <h2>4. Timeline</h2>
      <DocBody md={data.timeline} />
      <h2>5. Terms &amp; Conditions</h2>
      <DocBody md={data.legal} />
      <div className="t-sign-area">
        <div className="t-sign">ACCEPTED &amp; AGREED:<br/><strong>{data.signatoryName || brand.fullName || "—"}</strong><br/>{brand.studioName}</div>
        <div className="t-sign">ACCEPTED &amp; AGREED:<br/><strong>{data.clientSignatory || "—"}</strong><br/>{data.clientName}</div>
      </div>
      <div className="t-foot">
        <span>{brand.studioName}</span>
        <span>Services Agreement · {data.refNo || "—"}</span>
        <span>{fmt.date(data.date)}</span>
      </div>
    </div>
  );
}

function AgreementExecutive({ data, brand }) {
  return (
    <div className="doc t-executive">
      <div className="t-head">
        <div className="t-head-left">
          <div className="t-doctype">Services Agreement</div>
          <div className="t-sub">{data.title || "Master Professional Services Engagement"}</div>
          <div className="t-num">CONFIDENTIAL · REF: {data.refNo || "AG-0001"}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta" style={{ whiteSpace: "pre-line" }}>{brand.studioAddress}<br/>{brand.email}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Service Provider</dt><dd>{brand.studioName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Client Party</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Effective Date</dt><dd>{fmt.date(data.date)}</dd></div>
        <div className="t-meta-block"><dt>Document Ref</dt><dd>{data.refNo || "—"}</dd></div>
      </dl>
      <h2>Section 1: Scope of Engagement</h2>
      <DocBody md={data.scope} />
      <h2>Section 2: Key Deliverables</h2>
      <DocBody md={data.deliverables} />
      <h2>Section 3: Financial Considerations &amp; Fees</h2>
      <DocBody md={data.compensation} />
      <h2>Section 4: Milestones &amp; Project Schedule</h2>
      <DocBody md={data.timeline} />
      <h2>Section 5: General Legal Provisions</h2>
      <DocBody md={data.legal} />
      <div className="t-sign-area">
        <div className="t-sign">{data.signatoryName || brand.fullName || "—"}<br/>Authorized Representative, {brand.studioName}</div>
        <div className="t-sign">{data.clientSignatory || "—"}<br/>Authorized Representative, {data.clientName}</div>
      </div>
      <div className="t-foot">
        <span>Official Services Agreement</span>
        <span>{brand.studioName}</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}

export { AgreementClassic, AgreementModern, AgreementEditorial, AgreementMinimal, AgreementExecutive };

