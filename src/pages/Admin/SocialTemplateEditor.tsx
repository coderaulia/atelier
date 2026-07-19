import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import {
  getAdminSocialTemplate, createSocialTemplate, updateSocialTemplate,
  publishSocialTemplate, disableSocialTemplate, importSocialTemplateHtml,
  type SocialTemplateField, type SocialTemplatePayload,
} from '../../lib/api'
import { RuntimeTemplate, type RuntimeTemplateDef } from '../../modules/social/RuntimeTemplate'
import { DEFAULT_BRAND } from '../../modules/documents/defaults'
import '../../modules/documents/documents.css'

const KINDS = ['Single', 'Carousel', 'CTA', 'News', 'Photo', 'Pricing', 'Social Proof']

interface Starter {
  label: string
  html: string
  css: string
  fields: SocialTemplateField[]
}

// Clone-able starter presets so admins have working examples to build from.
const STARTERS: Record<string, Starter> = {
  headline: {
    label: 'Kicker + Headline',
    html: `<div style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:90px;box-sizing:border-box;background:var(--vc-cream)">
  <div class="kick">{{kicker}}</div>
  <div class="head">{{headline}}</div>
  <div class="foot">{{brand.studioName}} · {{brand.handle}}</div>
</div>`,
    css: `.kick{font-family:var(--font-mono);font-size:28px;letter-spacing:.14em;text-transform:uppercase;color:var(--vc-red)}
.head{font-family:var(--font-display);font-size:120px;line-height:1;color:var(--vc-ink);margin:24px 0 auto}
.foot{font-family:var(--font-mono);font-size:22px;color:var(--vc-ink);opacity:.7}`,
    fields: [
      { key: 'kicker', label: 'Kicker', type: 'text', placeholder: 'Fresh Drop' },
      { key: 'headline', label: 'Headline', type: 'textarea', placeholder: 'Say something bold' },
    ],
  },
  stat: {
    label: 'Big Stat',
    html: `<div style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:90px;box-sizing:border-box;background:var(--vc-ink)">
  <div class="lead">{{lead}}</div>
  <div class="stat">{{stat}}</div>
  <div class="cap">{{caption}}</div>
</div>`,
    css: `.lead{font-family:var(--font-display);font-style:italic;font-size:46px;color:var(--vc-cream)}
.stat{font-family:var(--font-helvetica);font-weight:700;font-size:360px;line-height:.86;color:var(--vc-red);letter-spacing:-.04em}
.cap{font-family:var(--font-display);font-style:italic;font-size:34px;color:var(--vc-cream);opacity:.8;margin-top:20px;max-width:760px}`,
    fields: [
      { key: 'lead', label: 'Lead-in', type: 'text', placeholder: 'Why do most posts fail?' },
      { key: 'stat', label: 'Stat', type: 'text', placeholder: '91%' },
      { key: 'caption', label: 'Caption', type: 'textarea', placeholder: 'of posts get zero engagement.' },
    ],
  },
  list: {
    label: 'Carousel-ready List',
    html: `<div style="width:100%;height:100%;display:flex;flex-direction:column;padding:90px;box-sizing:border-box;background:var(--vc-cream)">
  <div class="kick">{{kicker}}</div>
  <div class="items">{{#each items}}<div class="item"><span class="n">{{@index}}</span>{{this}}</div>{{/each}}</div>
  <div class="foot">{{brand.handle}}</div>
</div>`,
    css: `.kick{font-family:var(--font-mono);font-size:26px;letter-spacing:.14em;text-transform:uppercase;color:var(--vc-red);margin-bottom:40px}
.items{flex:1;display:flex;flex-direction:column;gap:28px;justify-content:center}
.item{font-family:var(--font-helvetica);font-weight:600;font-size:56px;color:var(--vc-ink);display:flex;gap:24px;align-items:baseline}
.n{font-family:var(--font-mono);font-size:32px;color:var(--vc-red)}
.foot{font-family:var(--font-mono);font-size:22px;color:var(--vc-ink);opacity:.6}`,
    fields: [
      { key: 'kicker', label: 'Kicker', type: 'text', placeholder: 'Five Rules' },
      { key: 'items', label: 'Items (one per line)', type: 'textarea', placeholder: 'Ship daily\nCut scope\nStay close to users', hint: 'Each line becomes a numbered row via {{#each items}}.' },
    ],
  },
}

// Split an uploaded HTML file into body markup + extracted <style> CSS.
function splitHtmlFile(raw: string): { html: string; css: string } {
  let css = ''
  const html = raw.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_m, body) => { css += body + '\n'; return '' })
  // If there's a <body>, keep only its contents.
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const cleaned = (bodyMatch ? bodyMatch[1] : html)
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<\/?html[^>]*>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .trim()
  return { html: cleaned, css: css.trim() }
}

type Tab = 'html' | 'css' | 'fields'

export default function SocialTemplateEditor() {
  const navigate = useNavigate()
  const { id: routeId } = useParams<{ id: string }>()
  const isNew = !routeId

  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [kind, setKind] = useState('Single')
  const [width, setWidth] = useState(1080)
  const [height, setHeight] = useState(1080)
  const [isPro, setIsPro] = useState(false)
  const [html, setHtml] = useState(isNew ? STARTERS.headline.html : '')
  const [css, setCss] = useState(isNew ? STARTERS.headline.css : '')
  const [fieldsText, setFieldsText] = useState(isNew ? JSON.stringify(STARTERS.headline.fields, null, 2) : '[]')
  const [status, setStatus] = useState('draft')

  const [tab, setTab] = useState<Tab>('html')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])

  useEffect(() => {
    if (isNew) return
    getAdminSocialTemplate(routeId!)
      .then(({ template: t }) => {
        setId(t.id); setName(t.name); setKind(t.kind)
        setWidth(t.width); setHeight(t.height); setIsPro(!!t.is_pro); setStatus(t.status ?? 'draft')
        // prefer source (author input) for round-trip editing; fall back to stored clean
        setHtml(t.html_source ?? t.html)
        setCss(t.css_source ?? t.css)
        setFieldsText(JSON.stringify(safeParse(t.fields_json, []), null, 2))
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [routeId, isNew])

  // Parse fields for preview + validation.
  const fields: SocialTemplateField[] = useMemo(() => safeParse(fieldsText, []), [fieldsText])
  const fieldsValid = useMemo(() => {
    try { const p = JSON.parse(fieldsText); return Array.isArray(p) } catch { return false }
  }, [fieldsText])

  // Build sample data from field placeholders/labels for the live preview.
  const sampleData = useMemo(() => {
    const d: Record<string, string> = {}
    for (const f of fields) d[f.key] = f.placeholder || f.label || f.key
    return d
  }, [fields])

  const previewDef: RuntimeTemplateDef = useMemo(() => ({
    id: id || 'preview', name: name || 'Preview', kind, category: undefined,
    width, height, fields, html, css, is_pro: isPro, __runtime: true,
  }), [id, name, kind, width, height, fields, html, css, isPro])

  const previewScale = Math.min(1, 420 / width)

  async function handleImport() {
    setError(''); setSuccess('')
    try {
      const res = await importSocialTemplateHtml(html, css)
      setHtml(res.html); setCss(res.css)
      setFieldsText(JSON.stringify(res.suggestedFields, null, 2))
      setWarnings(res.warnings)
      setSuccess(`Detected ${res.tokens.length} token(s): ${res.tokens.join(', ') || 'none'}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed')
    }
  }

  function loadStarter(key: string) {
    const s = STARTERS[key]
    if (!s) return
    setHtml(s.html); setCss(s.css); setFieldsText(JSON.stringify(s.fields, null, 2))
    setTab('html'); setSuccess(`Loaded "${s.label}" starter — edit and publish`)
  }

  async function handleFileUpload(file: File) {
    setError(''); setSuccess('')
    if (!/\.html?$/i.test(file.name)) { setError('Please upload an .html file'); return }
    if (file.size > 256 * 1024) { setError('File too large (max 256 KB)'); return }
    const raw = await file.text()
    const { html: h, css: c } = splitHtmlFile(raw)
    setHtml(h); if (c) setCss(c)
    setTab('html')
    // Immediately sanitize + detect fields from the uploaded markup.
    try {
      const res = await importSocialTemplateHtml(h, c || css)
      setHtml(res.html); setCss(res.css)
      setFieldsText(JSON.stringify(res.suggestedFields, null, 2))
      setWarnings(res.warnings)
      setSuccess(`Imported ${file.name} — detected ${res.tokens.length} token(s)`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed')
    }
  }

  async function handleSave(): Promise<boolean> {
    setError(''); setSuccess(''); setWarnings([])
    if (!fieldsValid) { setError('Fields JSON is not a valid array'); return false }
    const payload: SocialTemplatePayload = { id, name, kind, width, height, fields, html, css, is_pro: isPro }
    setSaving(true)
    try {
      const res = isNew ? await createSocialTemplate(payload) : await updateSocialTemplate(id, payload)
      setWarnings(res.warnings || [])
      setSuccess(isNew ? 'Template created (draft)' : 'Saved')
      if (isNew) { navigate(`/admin/content/social-templates/${id}`, { replace: true }); }
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    const ok = isNew ? await handleSave() : true
    if (!ok) return
    try {
      await publishSocialTemplate(id)
      setStatus('published'); setSuccess('Published — now live in the social generator')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed')
    }
  }

  async function handleDisable() {
    try {
      await disableSocialTemplate(id)
      setStatus('disabled'); setSuccess('Disabled — removed from the social generator')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Disable failed')
    }
  }

  if (loading) {
    return <AdminLayout active="social-templates"><section className="admin-page"><p>Loading…</p></section></AdminLayout>
  }

  return (
    <AdminLayout active="social-templates">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Content · Social Templates</div>
            <h1>{isNew ? 'New template' : name || id}</h1>
            <p>Author a runtime social template. Published templates appear in the social generator without a redeploy.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <select defaultValue="" onChange={(e) => { if (e.target.value) loadStarter(e.target.value); e.target.value = '' }}
              title="Load a starter preset into the editor"
              style={{ padding: '8px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-2)' }}>
              <option value="">Start from…</option>
              {Object.entries(STARTERS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
            </select>
            <label className="admin-btn" style={{ cursor: 'pointer' }}>
              ⬆ Upload HTML
              <input type="file" accept=".html,.htm,text/html" style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = '' }} />
            </label>
            <button className="admin-btn" onClick={() => navigate('/admin/content/social-templates')}>← Back</button>
            <button className="admin-btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save draft'}</button>
            <button className="admin-btn admin-btn--primary" onClick={handlePublish}>Publish</button>
            {!isNew && status === 'published' && <button className="admin-btn" onClick={handleDisable}>Disable</button>}
          </div>
        </div>

        {error && <div className="admin-error">{error}<button onClick={() => setError('')}>×</button></div>}
        {success && <div className="admin-success">{success}<button onClick={() => setSuccess('')}>×</button></div>}
        {warnings.length > 0 && (
          <div className="admin-panel" style={{ marginBottom: 16, borderLeft: '4px solid rgba(234,179,8,.5)' }}>
            <strong style={{ fontSize: 13 }}>Sanitizer removed unsafe content:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 13, color: 'var(--ink-2)' }}>
              {warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 460px', gap: 20, alignItems: 'start' }}>
          {/* ── Editor column ── */}
          <div className="admin-panel">
            <div className="admin-grid-2">
              <div className="admin-form-row">
                <label>Template ID (slug)</label>
                <input value={id} disabled={!isNew} placeholder="custom-promo-01"
                  onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
              </div>
              <div className="admin-form-row"><label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Custom Promo" /></div>
            </div>
            <div className="admin-grid-2">
              <div className="admin-form-row"><label>Kind</label>
                <select value={kind} onChange={(e) => setKind(e.target.value)}>
                  {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="admin-form-row"><label>Pro-gated</label>
                <select value={isPro ? '1' : '0'} onChange={(e) => setIsPro(e.target.value === '1')}>
                  <option value="0">Free — everyone</option><option value="1">Pro only</option>
                </select>
              </div>
            </div>
            <div className="admin-grid-2">
              <div className="admin-form-row"><label>Width (px)</label>
                <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value) || 1080)} /></div>
              <div className="admin-form-row"><label>Height (px)</label>
                <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 1080)} /></div>
            </div>

            <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', margin: '8px 0 12px' }}>
              {(['html', 'css', 'fields'] as Tab[]).map((tb) => (
                <button key={tb} onClick={() => setTab(tb)}
                  style={{
                    padding: '8px 14px', fontSize: 13, fontWeight: tab === tb ? 600 : 500, border: 'none',
                    borderBottom: tab === tb ? '2px solid var(--accent)' : '2px solid transparent',
                    color: tab === tb ? 'var(--accent)' : 'var(--ink-2)', background: 'transparent', cursor: 'pointer',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>{tb}{tb === 'fields' && !fieldsValid ? ' ⚠' : ''}</button>
              ))}
              <button onClick={handleImport} title="Re-parse the HTML: sanitize, detect {{tokens}}, and auto-suggest fields"
                style={{ marginLeft: 'auto', padding: '8px 14px', fontSize: 13, border: 'none', color: 'var(--ink-2)', background: 'transparent', cursor: 'pointer' }}>
                ⟳ Detect fields
              </button>
            </div>

            {tab === 'html' && (
              <textarea value={html} onChange={(e) => setHtml(e.target.value)} spellCheck={false}
                style={editorTextareaStyle} placeholder="Template markup with {{tokens}}…" />
            )}
            {tab === 'css' && (
              <textarea value={css} onChange={(e) => setCss(e.target.value)} spellCheck={false}
                style={editorTextareaStyle} placeholder=".selector { … } — scoped automatically" />
            )}
            {tab === 'fields' && (
              <>
                <textarea value={fieldsText} onChange={(e) => setFieldsText(e.target.value)} spellCheck={false}
                  style={{ ...editorTextareaStyle, borderColor: fieldsValid ? undefined : 'rgba(220,38,38,.6)' }}
                  placeholder='[{"key":"headline","label":"Headline","type":"textarea"}]' />
                <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>
                  Each field: <code>{'{ key, label, type: text|textarea|image|select, placeholder?, hint? }'}</code>.
                  The <code>key</code> maps to a <code>{'{{key}}'}</code> token in the HTML.
                </p>
              </>
            )}

            <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.5 }}>
              Tokens: <code>{'{{field_key}}'}</code>, brand values <code>{'{{brand.studioName}}'}</code> /
              <code>{'{{brand.handle}}'}</code>, and carousels via <code>{'{{#each rows}}…{{/each}}'}</code>.
              External scripts, event handlers, and remote URLs are stripped on save and again on render.
            </p>
          </div>

          {/* ── Live preview column ── */}
          <div style={{ position: 'sticky', top: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Live preview {status !== 'draft' && <span className="badge badge--free" style={{ marginLeft: 6 }}>{status}</span>}
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, overflow: 'hidden' }}>
              <div style={{ height: height * previewScale, overflow: 'hidden' }}>
                <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left', width, height }}>
                  <RuntimeTemplate template={previewDef} data={sampleData} brand={DEFAULT_BRAND as Record<string, unknown>} />
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
              Preview uses each field's placeholder/label as sample text and the default studio brand.
            </p>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}

const editorTextareaStyle: React.CSSProperties = {
  width: '100%', minHeight: 320, fontFamily: 'var(--mono, monospace)', fontSize: 13, lineHeight: 1.5,
  padding: 12, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)',
  resize: 'vertical', tabSize: 2,
}

function safeParse<T>(s: string, fallback: T): T {
  try { return JSON.parse(s) as T } catch { return fallback }
}
