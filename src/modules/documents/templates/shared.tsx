// @ts-nocheck
import React from 'react';
import { MD, MDInline } from '../utils';

export const DocBody = ({ md }) => md ? <div className="doc-body" dangerouslySetInnerHTML={{ __html: MD(md) }} /> : null;

export const BrandMark = ({ brand }) => {
  if (brand.logo && brand.logoEnabled !== false) {
    return <img src={brand.logo} alt={brand.studioName || "logo"} style={{ height: 24, width: "auto", maxWidth: 110, objectFit: "contain", display: "block" }} />;
  }
  return <>{brand.studioName || "Studio"}</>;
};

export const InlineMd = ({ md, as = "span" }) => {
  const Tag = as;
  return <Tag dangerouslySetInnerHTML={{ __html: MDInline(md || "") }} />;
};

export const parseLines = (str) => (str || "").split("\n").filter(l => l.trim());

export const CheckRow = ({ text }) => (
  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6, fontSize: "9.5pt" }}>
    <span style={{ color: "var(--paper-accent, #000)", fontWeight: 700 }}>✓</span>
    <span>{text}</span>
  </div>
);
