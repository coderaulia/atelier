// @ts-nocheck
import React from 'react';
import { fmt } from '../utils';
import { DocBody, BrandMark, InlineMd, parseLines, CheckRow } from './shared';
/* ============================================== */
/* =============== HANDOVER ==================== */
/* ============================================== */

function HandoverClassic({ data, brand }) {
  const deliverables = parseLines(data.deliverablesList);
  const nextSteps = parseLines(data.nextStepsForClient);
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>
          <BrandMark brand={brand} />
        </div>
        <div className="t-doctype">Project Handover</div>
        <div className="t-sub">{data.projectName || "Project"} · {data.clientName || "Client"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Project</dt><dd>{data.projectName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Handover date</dt><dd>{fmt.date(data.handoverDate)}</dd></div>
        <div className="t-meta-block"><dt>Signed off by</dt><dd>{data.studioSignOffName || brand.fullName || "—"}</dd></div>
      </dl>
      <h2>1. Deliverables</h2>
      <div style={{ marginBottom: 24 }}>
        {deliverables.length ? deliverables.map((d, i) => <CheckRow key={i} text={d} />) : <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", color: "var(--paper-muted)" }}>No deliverables listed.</p>}
      </div>
      <h2>2. File locations</h2>
      <DocBody md={data.fileLocations} />
      <h2>3. Credentials handed over</h2>
      <DocBody md={data.credentialsHandedOver} />
      <h2>4. Next steps for client</h2>
      <div style={{ marginBottom: 24 }}>
        {nextSteps.length ? nextSteps.map((s, i) => <CheckRow key={i} text={s} />) : <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", color: "var(--paper-muted)" }}>No steps listed.</p>}
      </div>
      <div className="t-foot">
        <div><div className="t-sign">{data.studioSignOffName || brand.fullName || "—"}<br/>{brand.studioName}</div></div>
        <div><div className="t-sign">{data.clientName || "—"}</div></div>
      </div>
    </div>
  );
}

function HandoverModern({ data, brand }) {
  const deliverables = parseLines(data.deliverablesList);
  const nextSteps = parseLines(data.nextStepsForClient);
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div className="t-doctype">Project<br/><em>Handover</em></div>
          <div className="t-num">{data.projectName || "Project"} · {fmt.dateShort(data.handoverDate)}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta">{data.clientName || "—"}</div>
          <div className="t-from-meta" style={{ marginTop: 4 }}>{brand.email}</div>
        </div>
      </div>
      <h2>Deliverables</h2>
      <div style={{ marginBottom: 24 }}>
        {deliverables.map((d, i) => <CheckRow key={i} text={d} />)}
      </div>
      <h2>File locations</h2>
      <DocBody md={data.fileLocations} />
      <h2>Credentials</h2>
      <DocBody md={data.credentialsHandedOver} />
      <h2>Next steps for client</h2>
      <div style={{ marginBottom: 24 }}>
        {nextSteps.map((s, i) => <CheckRow key={i} text={s} />)}
      </div>
      <div className="t-foot">
        <div>
          <div className="t-sign"></div>
          <div>{data.studioSignOffName || brand.fullName || "—"}</div>
          <div style={{ color: "var(--paper-muted)" }}>{brand.studioName}</div>
        </div>
        <div>
          <div className="t-sign"></div>
          <div>{data.clientName || "—"}</div>
        </div>
      </div>
    </div>
  );
}

function HandoverEditorial({ data, brand }) {
  const deliverables = parseLines(data.deliverablesList);
  const nextSteps = parseLines(data.nextStepsForClient);
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span><BrandMark brand={brand} /></span>
        <span>Handover</span>
        <span>{fmt.dateShort(data.handoverDate)}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype">A <em>handover.</em></div>
        <div className="t-sub">from {brand.studioName || "Studio"} to {data.clientName || "the client"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Project</dt><dd>{data.projectName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Date</dt><dd>{fmt.dateShort(data.handoverDate)}</dd></div>
        <div className="t-meta-block"><dt>Signed off</dt><dd>{data.studioSignOffName || brand.fullName || "—"}</dd></div>
      </dl>
      <h3>What you're getting</h3><h2>Deliverables.</h2>
      <div style={{ marginBottom: 24 }}>
        {deliverables.map((d, i) => <CheckRow key={i} text={d} />)}
      </div>
      <h3>Where it lives</h3><h2>Files.</h2>
      <DocBody md={data.fileLocations} />
      <h3>Access</h3><h2>Credentials.</h2>
      <DocBody md={data.credentialsHandedOver} />
      <h3>What's next</h3><h2>Next steps.</h2>
      <div style={{ marginBottom: 24 }}>
        {nextSteps.map((s, i) => <CheckRow key={i} text={s} />)}
      </div>
      <div className="t-sign-area">
        <div className="t-sign">{data.studioSignOffName || brand.fullName || "—"}<br/>{brand.studioName}</div>
        <div className="t-sign">{data.clientName || "—"}</div>
      </div>
      <div className="t-foot">
        <span>End of handover</span>
        <span>{brand.studioName}</span>
        <span>{fmt.dateShort(data.handoverDate)}</span>
      </div>
    </div>
  );
}

export { HandoverClassic, HandoverModern, HandoverEditorial };
