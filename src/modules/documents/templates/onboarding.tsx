// @ts-nocheck
import React from 'react';
import { fmt } from '../utils';
import { DocBody, BrandMark, InlineMd, parseLines, CheckRow } from './shared';
/* ============================================== */
/* ============= ONBOARDING ==================== */
/* ============================================== */

function OnboardingClassic({ data, brand }) {
  const deliverables = parseLines(data.deliverables);
  const assets = parseLines(data.assetsNeeded);
  return (
    <div className="doc t-classic">
      <div className="t-head">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", letterSpacing: "0.15em", color: "var(--paper-muted)", textTransform: "uppercase", marginBottom: 14 }}>
          <BrandMark brand={brand} />
        </div>
        <div className="t-doctype">Client Onboarding</div>
        <div className="t-sub">{data.projectName || "Project"} · {data.clientName || "Client"}</div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Client</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Project</dt><dd>{data.projectName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Start date</dt><dd>{fmt.date(data.startDate)}</dd></div>
        <div className="t-meta-block"><dt>Contact</dt><dd>{data.pointOfContact || "—"}</dd></div>
      </dl>
      <h2>1. Deliverables</h2>
      <div style={{ marginBottom: 24 }}>
        {deliverables.length ? deliverables.map((d, i) => <CheckRow key={i} text={d} />) : <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", color: "var(--paper-muted)" }}>No deliverables listed.</p>}
      </div>
      <h2>2. Assets needed from client</h2>
      <div style={{ marginBottom: 24 }}>
        {assets.length ? assets.map((a, i) => <CheckRow key={i} text={a} />) : <p style={{ fontFamily: "var(--font-serif)", fontSize: "11pt", color: "var(--paper-muted)" }}>No assets listed.</p>}
      </div>
      <h2>3. Communication</h2>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Channel</dt><dd>{data.communicationChannel || "—"}</dd></div>
        <div className="t-meta-block"><dt>Meetings</dt><dd>{data.meetingSchedule || "—"}</dd></div>
      </dl>
      <div style={{ marginTop: 40, borderTop: "1px solid var(--paper-rule)", paddingTop: 16, fontFamily: "var(--font-mono)", fontSize: "9pt", color: "var(--paper-muted)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center" }}>
        {brand.studioName} · {brand.email}
      </div>
    </div>
  );
}

function OnboardingModern({ data, brand }) {
  const deliverables = parseLines(data.deliverables);
  const assets = parseLines(data.assetsNeeded);
  return (
    <div className="doc t-modern">
      <div className="t-head">
        <div>
          <div className="t-doctype">Client<br/><em>Onboarding</em></div>
          <div className="t-num">{data.projectName || "Project"}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta">{data.clientName || "—"}</div>
          <div className="t-from-meta" style={{ marginTop: 4 }}>{fmt.dateShort(data.startDate)}</div>
        </div>
      </div>
      <h2>Deliverables</h2>
      <div style={{ marginBottom: 24 }}>
        {deliverables.map((d, i) => <CheckRow key={i} text={d} />)}
      </div>
      <h2>Assets needed from you</h2>
      <div style={{ marginBottom: 24 }}>
        {assets.map((a, i) => <CheckRow key={i} text={a} />)}
      </div>
      <h2>Communication</h2>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Channel</dt><dd>{data.communicationChannel || "—"}</dd></div>
        <div className="t-meta-block"><dt>Meetings</dt><dd>{data.meetingSchedule || "—"}</dd></div>
        <div className="t-meta-block"><dt>Contact</dt><dd>{data.pointOfContact || "—"}</dd></div>
      </dl>
      <div className="t-foot">
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "8pt", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--paper-muted)" }}>Studio</div>
          <div style={{ marginTop: 4, fontSize: "10pt" }}>{brand.studioName} · {brand.email}</div>
        </div>
      </div>
    </div>
  );
}

function OnboardingEditorial({ data, brand }) {
  const deliverables = parseLines(data.deliverables);
  const assets = parseLines(data.assetsNeeded);
  return (
    <div className="doc t-editorial">
      <div className="t-head">
        <span><BrandMark brand={brand} /></span>
        <span>Onboarding</span>
        <span>{fmt.dateShort(data.startDate)}</span>
      </div>
      <div className="t-doctype-wrap">
        <div className="t-doctype"><em>Getting started.</em></div>
        <div className="t-sub">A guide for {data.clientName || "the client"} on the {data.projectName || "project"} project.</div>
      </div>
      <h3>What we'll make</h3><h2>Deliverables.</h2>
      <div style={{ marginBottom: 24 }}>
        {deliverables.map((d, i) => <CheckRow key={i} text={d} />)}
      </div>
      <h3>What we need from you</h3><h2>Assets needed.</h2>
      <div style={{ marginBottom: 24 }}>
        {assets.map((a, i) => <CheckRow key={i} text={a} />)}
      </div>
      <h3>How we work</h3><h2>Communication.</h2>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Channel</dt><dd>{data.communicationChannel || "—"}</dd></div>
        <div className="t-meta-block"><dt>Meetings</dt><dd>{data.meetingSchedule || "—"}</dd></div>
        <div className="t-meta-block"><dt>Point of contact</dt><dd>{data.pointOfContact || "—"}</dd></div>
      </dl>
      <div className="t-foot">
        <span>Start: {fmt.dateShort(data.startDate)}</span>
        <span>{brand.studioName}</span>
        <span>{data.clientName || "—"}</span>
      </div>
    </div>
  );
}

function OnboardingMinimal({ data, brand }) {
  const deliverables = parseLines(data.deliverables);
  const assets = parseLines(data.assetsNeeded);
  return (
    <div className="doc t-minimal">
      <div className="t-head">
        <div>
          <div className="t-doctype">Client Onboarding</div>
          <div className="t-sub">{data.projectName || "Project"} · {data.clientName || "Client"}</div>
          <div className="t-num">START: {fmt.date(data.startDate)} · LEAD: {data.pointOfContact || "—"}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta">{brand.studioAddress}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Client Entity</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Project Scope</dt><dd>{data.projectName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Kickoff Date</dt><dd>{fmt.date(data.startDate)}</dd></div>
        <div className="t-meta-block"><dt>Lead Contact</dt><dd>{data.pointOfContact || "—"}</dd></div>
      </dl>
      <h2>1. Project Deliverables Matrix</h2>
      <div style={{ marginBottom: 20 }}>
        {deliverables.length ? deliverables.map((d, i) => <CheckRow key={i} text={d} />) : <p style={{ fontFamily: "var(--font-sans)", fontSize: "9.5pt", color: "var(--paper-muted)" }}>No deliverables listed.</p>}
      </div>
      <h2>2. Required Assets &amp; Client Access</h2>
      <div style={{ marginBottom: 20 }}>
        {assets.length ? assets.map((a, i) => <CheckRow key={i} text={a} />) : <p style={{ fontFamily: "var(--font-sans)", fontSize: "9.5pt", color: "var(--paper-muted)" }}>No prerequisites listed.</p>}
      </div>
      <h2>3. Communication Protocols</h2>
      <dl className="t-meta" style={{ marginBottom: 0 }}>
        <div className="t-meta-block"><dt>Primary Channel</dt><dd>{data.communicationChannel || "—"}</dd></div>
        <div className="t-meta-block"><dt>Standing Cadence</dt><dd>{data.meetingSchedule || "—"}</dd></div>
        <div className="t-meta-block"><dt>Key Contact</dt><dd>{data.pointOfContact || "—"}</dd></div>
      </dl>
      <div className="t-foot">
        <span>{brand.studioName}</span>
        <span>Client Onboarding Guide</span>
        <span>{fmt.date(data.startDate)}</span>
      </div>
    </div>
  );
}

function OnboardingExecutive({ data, brand }) {
  const deliverables = parseLines(data.deliverables);
  const assets = parseLines(data.assetsNeeded);
  return (
    <div className="doc t-executive">
      <div className="t-head">
        <div className="t-head-left">
          <div className="t-doctype">Client Onboarding</div>
          <div className="t-sub">Executive Kickoff &amp; Partnership Governance Guide</div>
          <div className="t-num">ENGAGEMENT: {data.projectName || "Project"} · LAUNCH: {fmt.date(data.startDate)}</div>
        </div>
        <div className="t-head-right">
          <div className="t-from"><BrandMark brand={brand} /></div>
          <div className="t-from-meta" style={{ whiteSpace: "pre-line" }}>{brand.studioAddress}<br/>{brand.email}</div>
        </div>
      </div>
      <dl className="t-meta">
        <div className="t-meta-block"><dt>Client Partner</dt><dd>{data.clientName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Initiative</dt><dd>{data.projectName || "—"}</dd></div>
        <div className="t-meta-block"><dt>Commencement Date</dt><dd>{fmt.date(data.startDate)}</dd></div>
        <div className="t-meta-block"><dt>Executive Sponsor</dt><dd>{data.pointOfContact || "—"}</dd></div>
      </dl>
      <h2>Section 1: Contracted Deliverables &amp; Outcomes</h2>
      <div style={{ marginBottom: 24 }}>
        {deliverables.length ? deliverables.map((d, i) => <CheckRow key={i} text={d} />) : <p style={{ fontFamily: "var(--font-serif)", fontSize: "10.5pt", color: "var(--paper-muted)" }}>No deliverables registered.</p>}
      </div>
      <h2>Section 2: Client Prerequisites &amp; Technical Assets</h2>
      <div style={{ marginBottom: 24 }}>
        {assets.length ? assets.map((a, i) => <CheckRow key={i} text={a} />) : <p style={{ fontFamily: "var(--font-serif)", fontSize: "10.5pt", color: "var(--paper-muted)" }}>No required assets registered.</p>}
      </div>
      <h2>Section 3: Stakeholder Governance &amp; Cadence</h2>
      <dl className="t-meta" style={{ marginBottom: 0 }}>
        <div className="t-meta-block"><dt>Communication Medium</dt><dd>{data.communicationChannel || "—"}</dd></div>
        <div className="t-meta-block"><dt>Review Schedule</dt><dd>{data.meetingSchedule || "—"}</dd></div>
        <div className="t-meta-block"><dt>Direct Escalation</dt><dd>{data.pointOfContact || brand.fullName || "—"}</dd></div>
      </dl>
      <div className="t-foot">
        <span>Strategic Client Onboarding Charter</span>
        <span>{brand.studioName}</span>
        <span>Confidential</span>
      </div>
    </div>
  );
}

export { OnboardingClassic, OnboardingModern, OnboardingEditorial, OnboardingMinimal, OnboardingExecutive };

