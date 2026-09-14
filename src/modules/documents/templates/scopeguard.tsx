// @ts-nocheck
import React from 'react';
import { fmt } from '../utils';
import { DocBody, BrandMark, InlineMd, parseLines, CheckRow } from './shared';
/* ============================================== */
/* ============= SCOPE GUARD =================== */
/* ============================================== */

function ScopeGuardClassic({ data, brand }) {
  const outItems = parseLines(data.whatIsOutOfScope);
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>
          <BrandMark brand={brand} />
        </div>
        <div className="t-doctype">Revision Policy</div>
        <div className="t-sub">{data.projectName || "Project"} · {data.clientName || "Client"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Project</dt><dd>{data.projectName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Included rounds</dt><dd><strong>{data.includedRevisions || "2"}</strong> revision rounds</dd></div>
        <div className="t-meta-block"><dt>Additional rate</dt><dd>{fmt.money(data.additionalRevisionRate, data.currency)} / round</dd></div>
      </dl>
      <h2>1. What counts as a revision</h2>
      <DocBody md={data.whatIsRevision} />
      <h2>2. What is out of scope</h2>
      {outItems.length ? (
        <ul style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6, paddingLeft: "1.4em", margin: "8px 0 16px" }}>
          {outItems.map((item, i) => <li key={i} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
      ) : <DocBody md={data.whatIsOutOfScope} />}
      <h2>3. Additional revisions</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>
        Revisions beyond the included {data.includedRevisions || "2"} rounds are billed at {fmt.money(data.additionalRevisionRate, data.currency)} per round, invoiced separately.
      </p>
      <div style={{ marginTop: 40, borderTop: "1px solid var(--paper-rule)", paddingTop: 16, fontFamily: "var(--font-mono)", fontSize: "9pt", color: "var(--paper-muted)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center" }}>
        {brand.studioName} · {brand.email}
      </div>
    </div>
  );
}

function ScopeGuardModern({ data, brand }) {
  const outItems = parseLines(data.whatIsOutOfScope);
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div className="t-doctype">Revision<br/><em>Policy</em></div>
          <div className="t-num">{data.includedRevisions || "2"} rounds included</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta">{data.projectName || "—"}</div>
          <div className="t-from-meta" style={{ marginTop: 4 }}>{data.clientName || "—"}</div>
        </div>
      </div>
      <h2>What counts as a revision</h2>
      <DocBody md={data.whatIsRevision} />
      <h2>Out of scope</h2>
      {outItems.length ? (
        <ul style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6, paddingLeft: "1.4em", margin: "8px 0 16px" }}>
          {outItems.map((item, i) => <li key={i} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
      ) : <DocBody md={data.whatIsOutOfScope} />}
      <h2>Additional revisions</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>
        {fmt.money(data.additionalRevisionRate, data.currency)} per additional round, invoiced separately.
      </p>
      <div className="t-foot">
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--paper-muted)" }}>Studio</div>
          <div style={{ marginTop: 4, fontSize: "10pt" }}>{brand.studioName} · {brand.email}</div>
        </div>
      </div>
    </div>
  );
}

function ScopeGuardEditorial({ data, brand }) {
  const outItems = parseLines(data.whatIsOutOfScope);
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span><BrandMark brand={brand} /></span>
        <span>Scope Guard</span>
        <span>{data.projectName || "—"}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype">A <em>revision policy.</em></div>
        <div className="t-sub">for {data.clientName || "the client"} — {data.includedRevisions || "2"} rounds included.</div>
      </div>
      <h3>What's in</h3><h2>What counts.</h2>
      <DocBody md={data.whatIsRevision} />
      <h3>What's out</h3><h2>What isn't covered.</h2>
      {outItems.length ? (
        <ul style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6, paddingLeft: "1.4em", margin: "8px 0 16px" }}>
          {outItems.map((item, i) => <li key={i} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
      ) : <DocBody md={data.whatIsOutOfScope} />}
      <h3>Extra rounds</h3><h2>The rate.</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", lineHeight: 1.6 }}>
        {fmt.money(data.additionalRevisionRate, data.currency)} per additional round, invoiced separately.
      </p>
      <div className="t-foot">
        <span>End of document</span>
        <span>{brand.studioName}</span>
        <span>{data.projectName || "—"}</span>
      </div>
    </div>
  );
}

function ScopeGuardMinimal({ data, brand }) {
  const outItems = parseLines(data.whatIsOutOfScope);
  return (
    <div className="doc t-minimal">
      <div className="t-head">
        <div>
          <div className="t-doctype">Revision Policy</div>
          <div className="t-sub">{data.projectName || "Project Scope"} · {data.clientName || "Client"}</div>
          <div className="t-num">{data.includedRevisions || "2"} INCLUDED ROUNDS · {fmt.money(data.additionalRevisionRate, data.currency)} / ADD'L ROUND</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta">{brand.studioAddress}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Initiative</dt><dd>{data.projectName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Base Rounds</dt><dd style={{ color: "var(--paper-ink)", fontWeight: 700 }}>{data.includedRevisions || "2"} rounds</dd></div>
        <div className="t-meta-block"><dt>Overage Rate</dt><dd style={{ color: "var(--paper-ink)", fontWeight: 700 }}>{fmt.money(data.additionalRevisionRate, data.currency)} / round</dd></div>
      </dl>
      <h2>1. Permitted Revision Definition</h2>
      <DocBody md={data.whatIsRevision} />
      <h2>2. Explicitly Out of Scope</h2>
      {outItems.length ? (
        <ul style={{ fontFamily: "var(--font-sans)", fontSize: "9.5pt", lineHeight: 1.6, paddingLeft: "1.4em", margin: "8px 0 16px" }}>
          {outItems.map((item, i) => <li key={i} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
      ) : <DocBody md={data.whatIsOutOfScope} />}
      <h2>3. Change Requests &amp; Overage Billing</h2>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "9.5pt", lineHeight: 1.6 }}>
        Revisions exceeding {data.includedRevisions || "2"} rounds incur a change-order surcharge of <strong>{fmt.money(data.additionalRevisionRate, data.currency)}</strong> per round.
      </p>
      <div className="t-foot">
        <span>{brand.studioName}</span>
        <span>Scope Guard Agreement</span>
        <span>{data.projectName || "—"}</span>
      </div>
    </div>
  );
}

function ScopeGuardExecutive({ data, brand }) {
  const outItems = parseLines(data.whatIsOutOfScope);
  return (
    <div className="doc t-executive">
      <div className="t-head">
        <div className="t-head-left">
          <div className="t-doctype">Revision Policy</div>
          <div className="t-sub">Scope Governance &amp; Change Request Policy Framework</div>
          <div className="t-num">PROJECT: {data.projectName || "Project"} · REVISION CAP: {data.includedRevisions || "2"} ROUNDS</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta" style={{ whiteSpace: "pre-line" }}>{brand.studioAddress}<br/>{brand.email}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Project Engagement</dt><dd>{data.projectName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Client Entity</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Allocated Revision Rounds</dt><dd style={{ color: "var(--accent)", fontSize: "11.5pt", fontWeight: 700 }}>{data.includedRevisions || "2"} Rounds</dd></div>
        <div className="t-meta-block"><dt>Additional Round Surcharge</dt><dd style={{ color: "var(--accent)", fontSize: "11.5pt", fontWeight: 700 }}>{fmt.money(data.additionalRevisionRate, data.currency)}</dd></div>
      </dl>
      <h2>Section 1: Standard Revision Classification</h2>
      <DocBody md={data.whatIsRevision} />
      <h2>Section 2: Material Scope Exceptions &amp; Exclusions</h2>
      {outItems.length ? (
        <ul style={{ fontFamily: "var(--font-serif)", fontSize: "10.5pt", lineHeight: 1.65, paddingLeft: "1.4em", margin: "10px 0 20px" }}>
          {outItems.map((item, i) => <li key={i} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
      ) : <DocBody md={data.whatIsOutOfScope} />}
      <h2>Section 3: Formal Change Order Process &amp; Billing</h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "10.5pt", lineHeight: 1.65 }}>
        Modifications beyond the agreed {data.includedRevisions || "2"} rounds require a formal change request and will be billed at {fmt.money(data.additionalRevisionRate, data.currency)} per round, payable prior to commencement of subsequent revisions.
      </p>
      <div className="t-foot">
        <span>Formal Scope Governance Policy</span>
        <span>{brand.studioName}</span>
        <span>Strict Enforcement</span>
      </div>
    </div>
  );
}

export { ScopeGuardClassic, ScopeGuardModern, ScopeGuardEditorial, ScopeGuardMinimal, ScopeGuardExecutive };

