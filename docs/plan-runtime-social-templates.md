# Plan — Runtime Social Template Creator / Installer

**Goal:** Let admin add & edit social-generator templates at runtime, without redeploy — two authoring paths:
1. **Install from HTML** — upload/paste an HTML+CSS file with `{{token}}` placeholders.
2. **In-app editor** — author/edit a template directly in admin (code editor + live preview).

Both paths produce the same stored artifact and render through the existing export pipeline.

---

## 1. Why this is a big feature (the core constraint)

Current templates (`src/modules/social/social-templates.tsx`) are **compile-time JavaScript**:

```js
{ id, name, kind, slides: ({data, brand}) => JSX[], fields: [...] }
```

They ship in the bundle. There is **no runtime template mechanism today**. Admin-added templates cannot be JSX/JS — you can't store executable code in D1 and eval it in users' browsers safely. So the feature = **inventing a data-driven template format** that is:

- **Data, not code** — stored as HTML string + CSS string + field metadata (JSON).
- **XSS-safe** — admin HTML renders in *every end-user's browser*. This is a stored-XSS sink. Must sanitize on write **and** on render.
- **Export-identical** — must render into the same DOM target (`.social-frame`, 1080×1080 / 1080×1920) so `html-to-image` export works unchanged.
- **Token-driven** — `{{field}}` placeholders map to the user-facing `fields[]` form.

> **SECURITY IS THE SPINE.** Every design decision below is subordinate to "admin-authored markup cannot execute script or exfiltrate data in a user's session." Treat admin as semi-trusted, not trusted — an admin account compromise otherwise becomes site-wide XSS.

---

## 2. Runtime template data model

New D1 table `social_templates` (migration `010_social_templates.sql`):

| column | type | notes |
|---|---|---|
| `id` | TEXT PK | slug, e.g. `custom-promo-01` |
| `name` | TEXT | display name |
| `kind` | TEXT | Single / Carousel / CTA / News / Photo / Pricing (matches existing taxonomy) |
| `category` | TEXT | grouping in picker |
| `width` / `height` | INTEGER | canvas px (default 1080/1080) |
| `fields_json` | TEXT | JSON array of `{ key, label, type, placeholder, hint, options? }` — same shape as existing `fields` |
| `html` | TEXT | **sanitized** body markup with `{{token}}` placeholders |
| `css` | TEXT | **sanitized/scoped** stylesheet |
| `slides_json` | TEXT | optional: for carousels, ordered list of per-slide html or a repeat spec |
| `status` | TEXT | `draft` \| `published` \| `disabled` |
| `is_pro` | INTEGER | gate as premium template (0/1) |
| `version` | INTEGER | bump on each edit |
| `created_by` / `updated_by` | TEXT | admin user id (audit) |
| `created_at` / `updated_at` | INTEGER | epoch |

Published templates are served to the app; drafts only visible in admin preview.

---

## 3. The render pipeline (client)

New component `src/modules/social/RuntimeTemplate.tsx`:

1. Take `{ template, data, brand }`.
2. **Token substitution** — replace `{{key}}` in `html` with the user's `data[key]`, **HTML-escaping each value** (values are user content → escape to prevent user-side injection too). Support `{{brand.studioName}}`, `{{brand.handle}}`, logo, colors.
3. **Sanitize** the substituted HTML with DOMPurify (already a dep — `src/modules/documents/utils.tsx:3`) using a strict allowlist: no `<script>`, no `on*` handlers, no `javascript:`/`data:` URLs except `data:image` for embedded assets, `style`/`class` allowed, external `src`/`href` blocked or proxied.
4. **Scope the CSS** — prefix every rule with the template's unique wrapper id so admin CSS can't leak into the app chrome. Strip `@import`, `url(http…)`, `expression(`, and `position:fixed` breakouts.
5. Render into `.social-frame` sized to `width`×`height` → existing `captureImage`/`exportImage` (`utils.tsx:137`) captures it, unchanged.

**Carousels:** `slides_json` = array of html blocks (or one html + a `{{#each rows}}` mini-spec). Each slide → its own `#social-target-N` node so `downloadAllSlides` keeps working.

**Registry merge:** `DocumentTool.tsx:30` builds `AllSocialTemplates = [...SocialTemplates, ...TikTokTemplates]`. Add published runtime templates fetched from API → `[...built-in, ...runtime]`. Runtime template objects get a synthesized `.slides()` that returns `<RuntimeTemplate .../>` so the rest of `DocumentTool` is untouched.

---

## 4. Security model (non-negotiable)

Two enforcement layers — **defense in depth**:

**A. On write (API, admin):**
- Server-side sanitize of `html` + `css` before persisting (isomorphic DOMPurify or a Worker-safe sanitizer). Reject on `<script>`, event handlers, `javascript:`, external network URLs, `<iframe>`/`<object>`/`<embed>`, `<link>`, `<meta>`, form elements.
- Store the sanitized output, not the raw input. Keep raw only in an `*_source` column if round-trip editing needs it (still re-sanitize on render).
- Zod-validate the whole payload. Size caps (html ≤ 64KB, css ≤ 32KB).

**B. On render (client):**
- Re-sanitize with DOMPurify every render (never trust the DB row).
- CSS scoping + property denylist.
- Consider rendering inside a **sandboxed `<iframe sandbox>`** as the strongest isolation — **key decision, see §7.** Trade-off: iframe = bulletproof isolation but complicates `html-to-image` capture and font/`var()` inheritance; inline-sanitized = simpler capture but relies on DOMPurify correctness.

**C. Access & audit:**
- All authoring endpoints behind `adminMiddleware` (JWT + `role==='admin'`).
- Write to `audit_logs` on create/edit/publish/delete (table exists).
- CSP already restricts `img-src`/`connect-src` (seen in API headers) — keep templates inside it.

---

## 5. API surface (`api/src/routes/admin/`)

Mirror the existing content route pattern (`admin/content.ts`):

**Admin (guarded):**
- `GET  /admin/social-templates` — list (all statuses)
- `POST /admin/social-templates` — create (sanitize + validate)
- `GET  /admin/social-templates/:id` — detail (incl. source)
- `PUT  /admin/social-templates/:id` — update (bump version, sanitize)
- `POST /admin/social-templates/:id/publish` — status → published
- `POST /admin/social-templates/:id/disable`
- `DELETE /admin/social-templates/:id`
- `POST /admin/social-templates/import` — parse uploaded HTML → extract `{{tokens}}` → return a draft field list for review (does not save)

**Public/app:**
- `GET /social-templates` — published only, shaped for the app registry (cache-friendly).

All input Zod-validated. `is_pro` templates gated client-side via `usePlan()` like existing premium templates.

---

## 6. Admin UI (`src/pages/Admin/SocialTemplates.tsx` + detail/editor)

Route `/admin/content/social-templates` (add to `AdminLayout` nav + `App.tsx`).

- **List page:** table (name, kind, status, pro, version, updated) + New / Import buttons.
- **Import flow:** drop `.html` file or paste → server parses tokens → admin reviews auto-detected fields (rename labels, set types image/select/textarea, mark pro) → save as draft.
- **Editor page:** split view —
  - left: **code editor** (html / css / fields JSON tabs). Plain `<textarea>` with monospace to start; CodeMirror later if wanted.
  - right: **live preview** reusing `RuntimeTemplate` with sample data + the real brand, at true canvas ratio with zoom.
  - Field manager: add/reorder/type each `{{token}}`.
  - Actions: Save draft · Publish · Preview-as-user · Disable.
- **Placeholder helper:** show detected `{{tokens}}` and warn on tokens with no matching field (and vice-versa).

---

## 7. Decisions — LOCKED (2026-07-18)

1. **Isolation model → sanitized-inline.** DOMPurify dual-layer (write + render), render inline into `.social-frame`. Keeps `html-to-image` export trivial; matches existing markdown-sanitize path. Security rests on DOMPurify correctness → pin version + XSS payload test suite.
2. **Template language → `{{token}}` + one `{{#each rows}}` repeat.** Tokens for single templates; a single repeat block powers carousels. Small, testable surface. No conditionals/expressions.
3. **Built-ins → keep as-is + ship 2–3 runtime starters.** Hybrid registry: 20+ JSX built-ins untouched, plus 2–3 runtime starter templates in the new format as clone-able examples.
4. **Editor → plain textareas first** (html / css / fields tabs), CodeMirror as a later follow-up.

---

## 8. Phased delivery

- **Phase 1 — Foundation:** migration `010`, `social_templates` table, Zod types, server sanitizer, admin CRUD API (no UI yet), unit-test the sanitizer against XSS payloads.
- **Phase 2 — Renderer:** `RuntimeTemplate.tsx` (token sub + sanitize + CSS scope), merge into `AllSocialTemplates`, verify export (PNG/JPG/PDF) + carousel multi-slide capture.
- **Phase 3 — Admin editor:** list + editor + live preview + field manager + publish flow.
- **Phase 4 — HTML importer:** upload/paste → token extraction → field review → draft.
- **Phase 5 — Polish:** Pro gating, audit logging, empty/error states, manual docs (`Manual.tsx`), 2–3 starter templates, mobile-responsive admin.

Each phase = its own commit + `docs/project-status.md` / `commit-log.md` update (project rule).

---

## 9. Risks / watch-items

- **DOMPurify correctness is the whole security bet** in the inline model — pin version, test payloads, keep re-sanitize on render.
- **`html-to-image` + external fonts/images** — templates must use bundled `var(--font-*)` and `data:`/same-origin images or export renders blank/misaligned. Enforce in sanitizer (block external `url()`).
- **Font/`var()` inheritance** — runtime template must sit inside the same CSS-var scope the built-ins use.
- **Bundle vs fetch** — runtime templates fetched at tool load; handle offline/empty gracefully (built-ins always present).
- **Versioning** — a published template edited under a user mid-session; version bump + republish, no destructive in-place breakage.
