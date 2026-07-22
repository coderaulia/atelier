import { useMemo } from 'react';
import DOMPurify from 'dompurify';

// ── Runtime (admin-authored) social template renderer ────────────────
//
// This is the AUTHORITATIVE security boundary. Template html/css come from the
// DB (admin-authored) and are rendered in every end-user's browser, so every
// render re-sanitizes with DOMPurify regardless of any server-side pass.
//
// Pipeline: resolve {{tokens}} (values HTML-escaped) → DOMPurify sanitize →
// scope CSS to a unique wrapper id → render into a .social-frame node so the
// existing html-to-image export captures it unchanged.

export interface RuntimeTemplateField {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'image' | 'select';
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
}

export interface RuntimeTemplateDef {
  id: string;
  name: string;
  kind: string;
  category?: string;
  width: number;
  height: number;
  fields: RuntimeTemplateField[];
  html: string;
  css: string;
  slides?: string[];
  is_pro?: boolean;
  __runtime: true;
}

function escapeHtml(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Image tokens carry data:/blob: URLs the user supplied — allow them into an
// attribute context without entity-escaping (DOMPurify still vets the scheme).
function isImageValue(v: unknown): boolean {
  const s = String(v ?? '');
  return s.startsWith('data:image/') || s.startsWith('blob:');
}

function resolveTokens(
  tpl: string,
  data: Record<string, unknown>,
  brand: Record<string, unknown>,
): string {
  let out = tpl || '';

  // {{#each rows}}INNER{{/each}} — data[rows] is a newline-separated string.
  out = out.replace(/\{\{\s*#each\s+([a-zA-Z0-9_]+)\s*\}\}([\s\S]*?)\{\{\s*\/each\s*\}\}/g, (_m, key, inner) => {
    const raw = data[key];
    const lines = String(raw ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
    return lines
      .map((line, i) =>
        String(inner)
          .replace(/\{\{\s*(?:this|\.)\s*\}\}/g, escapeHtml(line))
          .replace(/\{\{\s*@index\s*\}\}/g, String(i + 1)),
      )
      .join('');
  });

  // {{brand.x}}
  out = out.replace(/\{\{\s*brand\.([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key) => {
    const v = brand[key];
    return isImageValue(v) ? String(v) : escapeHtml(v);
  });

  // {{key}}
  out = out.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key) => {
    const v = data[key];
    return isImageValue(v) ? String(v) : escapeHtml(v);
  });

  return out;
}

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true, svg: true },
    ADD_ATTR: ['style'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'a', 'link', 'meta', 'base'],
    FORBID_ATTR: ['srcset'],
    ALLOW_DATA_ATTR: false,
  });
}

// Light client-side CSS sanitize (defense in depth) + scope every selector to
// the wrapper id so admin CSS cannot leak into the app chrome.
function scopeCss(css: string, scopeId: string): string {
  let clean = (css || '')
    .replace(/[<>]/g, '')
    .replace(/@import[^;]*;?/gi, '')
    .replace(/expression\s*\([^)]*\)/gi, '')
    .replace(/(javascript|vbscript):/gi, '')
    .replace(/url\(\s*(['"]?)(https?:|\/\/)[^)]*\1\s*\)/gi, 'none');

  const scope = `#${scopeId}`;
  // Prefix each rule's selectors. Leaves @-rules (media/keyframes) bodies alone
  // at the top level; nested selectors inside @media still get scoped by the
  // same pass because we operate per "selector{...}" chunk.
  return clean.replace(/([^{}]+)\{([^{}]*)\}/g, (_m, selectorGroup, body) => {
    const sel = String(selectorGroup).trim();
    if (!sel || sel.startsWith('@') || sel.includes('%')) return `${sel}{${body}}`;
    const scoped = sel
      .split(',')
      .map((s: string) => {
        const t = s.trim();
        if (!t) return t;
        // .social-frame itself is the wrapper → scope becomes the id directly.
        return t === '.social-frame' ? scope : `${scope} ${t}`;
      })
      .join(', ');
    return `${scoped}{${body}}`;
  });
}

export function RuntimeTemplate({
  template,
  data,
  brand,
  slideHtml,
}: {
  template: RuntimeTemplateDef;
  data: Record<string, unknown>;
  brand: Record<string, unknown>;
  slideHtml?: string;
}) {
  const scopeId = useMemo(
    () => `rt-${template.id}-${Math.random().toString(36).slice(2, 8)}`,
    [template.id],
  );

  const { html, css } = useMemo(() => {
    const source = slideHtml ?? template.html;
    const resolved = resolveTokens(source, data || {}, brand || {});
    return {
      html: sanitize(resolved),
      css: scopeCss(template.css, scopeId),
    };
  }, [slideHtml, template.html, template.css, data, brand, scopeId]);

  const vertical = template.height > template.width;

  return (
    <div
      id={scopeId}
      className={`social-frame${vertical ? ' social-frame--vertical' : ''}`}
      style={{ width: template.width, height: template.height }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

// Build a built-in-compatible template object: adds a `.slides()` that returns
// JSX so it merges into AllSocialTemplates and flows through the existing
// SocialPreview / export pipeline untouched.
export function toRegistryTemplate(def: RuntimeTemplateDef) {
  const slideHtmls = def.slides && def.slides.length ? def.slides : [def.html];
  return {
    id: def.id,
    name: def.name,
    kind: def.kind,
    // The picker groups by aspect ("square" | "vertical"), so derive it from the
    // canvas rather than the admin's free-text category label.
    category: def.height > def.width ? 'vertical' : 'square',
    isPro: !!def.is_pro,
    __runtime: true,
    fields: def.fields,
    slides: ({ data, brand }: { data: Record<string, unknown>; brand: Record<string, unknown> }) =>
      slideHtmls.map((sh, i) => (
        <RuntimeTemplate key={i} template={def} data={data} brand={brand} slideHtml={sh} />
      )),
  };
}
