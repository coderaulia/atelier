# Atelier

A browser-based document and social media generator for independent studios and freelancers. No build step, no server, no accounts — just open `index.html` and start making beautiful work.

Built and open-sourced by **[Vanaila Digital](https://vanaila.com)**.

---

## What it does

Atelier gives you a design-quality toolkit for the documents and posts that surround client work:

**Documents**
- Service agreements / contracts
- Invoices with line items, tax, and discount
- Project proposals
- Product requirement documents (PRDs)

Three visual styles for every document: **Classic**, **Modern**, and **Editorial**.

**Social media posts**
- Instagram 1:1 carousels and single posts
- TikTok / Threads 9:16 vertical posts
- Carousel formats with dynamic slide count and optional CTA slide

Everything is filled from a form, previewed live, and exported as PDF (documents) or PNG / JPG (social). No design software required.

---

## Getting started

```bash
git clone https://github.com/vanaila-digital/atelier.git
cd atelier
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

No dependencies to install. No build step. Works offline after first load (fonts are fetched from Google Fonts on first open).

---

## Features

### Documents
- Three templates per document type (Classic / Modern / Editorial)
- Markdown support in long-form fields — headings, bold, italic, lists, tables
- Brand details (name, address, handle, payment info) shared across all templates
- PDF export via browser print dialog — layout is print-optimised

### Social
- **23 templates** across square and vertical formats
- Carousel posts: unlimited slides, dynamic numbering, optional CTA/closing slide
- Single posts: quote cards, stat posts, manifesto, before/after, booking announcements, and more
- Vertical posts: Threads-style, TikTok tutorials, portfolios, case studies
- Per-template content form with text and image fields
- Export individual slides or all slides at once (PNG or JPG at 2× pixel ratio)

### Brand identity
- Upload a company logo (PNG, SVG, JPG) — appears on all templates and doc headers
- Logo on/off toggle per template type
- Logo used as profile picture in Threads-style posts
- Accent colour, typography, and paper size customisable via the Tweaks panel

### No lock-in
- All data stored in browser `localStorage` — nothing leaves your device
- Export to standard formats (PDF, PNG, JPG) at any time
- Fork and self-host with zero infra

---

## File structure

```
index.html            Entry point — loads all scripts in order
styles.css            All styles (design tokens, shell, templates, social)
utils.jsx             Shared components: icons, formatters, ImageField, exportImage
editors.jsx           Form editors for each document / social type
doc-templates.jsx     Agreement, Invoice, Proposal, PRD templates (×3 styles each)
social-templates.jsx  Instagram / square social templates + registry
tiktok-templates.jsx  TikTok / Threads / vertical templates + registry
app.jsx               App shell, state, settings modal, preview pane
tweaks-panel.jsx      Live design tweaks (accent, fonts, paper size)
```

Scripts are loaded via `<script type="text/babel">` tags — Babel standalone transpiles JSX in the browser. React 18 is loaded from CDN (UMD build).

---

## Customising

### Adding a template

1. Define a template object in `social-templates.jsx` (square) or `tiktok-templates.jsx` (vertical):

```js
{
  id: "my-template",
  name: "My Template",
  kind: "Single",           // or "Carousel"
  category: "square",       // or "vertical"
  width: 1080,
  height: 1080,
  fields: [
    { key: "headline", label: "Headline", type: "text", placeholder: "..." },
    { key: "body",     label: "Body",     type: "textarea" },
  ],
  slides: ({ data, brand }) => [
    <div className="social-frame" key="0">
      {/* your JSX here */}
    </div>
  ],
}
```

2. Add it to the `SocialTemplates` (or `TikTokTemplates`) array.

The template picker and export system pick it up automatically.

### Adding a document template

1. Add a new variant component in `doc-templates.jsx`:
```js
function InvoiceMyStyle({ data, brand }) { ... }
```

2. Register it in the `DocTemplates` export object:
```js
DocTemplates.invoice.mystyle = InvoiceMyStyle;
```

3. Add the variant pill in `app.jsx` → `VARIANTS` array.

### Changing brand defaults

Edit `DEFAULT_BRAND` in `app.jsx`. These are the placeholder values — users overwrite them in Studio Settings.

---

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 18 (CDN/UMD) |
| JSX | Babel standalone |
| Markdown | marked.js |
| Image export | html-to-image |
| Fonts | Google Fonts (Source Serif 4, Instrument Serif, Manrope, JetBrains Mono) |
| Storage | localStorage |
| Build | None |

---

## Browser support

Any modern browser (Chrome, Firefox, Safari, Edge). Image export uses `html-to-image` which requires a browser that supports `Canvas` and `Blob` APIs.

---

## Contributing

Pull requests are welcome. For significant changes, open an issue first to discuss what you'd like to change.

Please keep the no-build-step constraint — this project is intentionally simple to fork and self-host.

---

## License

MIT — free to use, fork, and modify. Attribution appreciated but not required.

---

## Made by

**[Vanaila Digital](https://vanaila.com)** — a small studio building tools for independent creators and studios.
