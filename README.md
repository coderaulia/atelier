# Atelier

A browser-based document, social media, and quote generator for independent studios and freelancers. No build step, no server, no accounts - just open `index.html` and start making polished client-facing work.

Built and open-sourced by **[Vanaila Digital](https://vanaila.com)**.

---

## What it does

Atelier gives you a design-quality toolkit for the documents, posts, and estimates that surround client work:

**Documents**

- Agreements / contracts
- Invoices with line items, tax, and discount
- Project proposals
- Product requirement documents (PRDs)
- Monthly retainers
- Receipts
- Client onboarding sheets
- Scope guard documents
- Project handover sheets

Every document ships in three visual styles: **Classic**, **Modern**, and **Editorial**.

**Social media posts**

- Instagram 1:1 single posts and carousels
- TikTok / Threads 9:16 vertical posts
- Pricing cards, testimonials, launches, photo posts, case studies, weekly digests, tutorials, and more
- Dynamic carousels with slide counts, per-slide download controls, and optional CTA slides

**Tools**

- Quick quote calculator with hours, hourly rate, discount, tax, and currency support
- Copyable plain-text quote summary
- Live quote preview

Everything is filled from a form, previewed live, and exported as PDF for documents or PNG / JPG for social assets. No design software required.

---

## Getting started

```bash
git clone https://github.com/vanaila-digital/atelier.git
cd atelier
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

No dependencies to install. No build step. Works offline after first load, except for fonts loaded from Google Fonts.

---

## Features

### Documents

- 9 document types with 3 templates each, for 27 document layouts total
- Markdown support in long-form fields: headings, bold, italic, lists, and tables
- Shared studio details across every document
- Logo support in document headers
- Letter and A4 paper modes
- PDF export through the browser print dialog with print-optimised layout

### Social

- 31 templates across square and vertical formats
- Square templates for quotes, stats, announcements, processes, before/after posts, manifestos, frameworks, stories, tips, booking CTAs, link-in-bio posts, launches, mistakes, mini guides, news, digests, photos, showcases, pricing, and testimonials
- Vertical templates for hot takes, top lists, big questions, stats, Threads posts, tutorials, portfolio covers, case studies, POV posts, schedules, and case study carousels
- Template picker with live thumbnails grouped by format and kind
- Per-template content forms with text, textarea, select, and image fields
- Export a single post, all carousel slides, or individual carousel slides as PNG / JPG at 2x pixel ratio

### Brand identity

- Studio name, full name, handle, email, address, tax ID, and payment details stored in Studio Settings
- Upload a company logo as PNG, SVG, or JPG
- Logo on/off toggle for templates
- Logo used across document headers and brand marks where templates support it
- Accent colour, header font, body font, and paper size customisable via the Tweaks panel

### Quote calculator

- Calculates subtotal, discount, tax, and total from hours and rate
- Supports USD, IDR, EUR, and GBP formatting
- Copies a plain-text estimate summary to the clipboard
- Stored locally alongside the rest of the app state

### No lock-in

- All data stored in browser `localStorage`; nothing leaves your device
- Export to standard formats at any time
- Fork and self-host with zero infrastructure

---

## File structure

```text
index.html            Entry point; loads React, Babel, marked, html-to-image, and app scripts
styles.css            App shell, document, social, quote calculator, and responsive styles
utils.jsx             Shared icons, markdown helpers, formatters, fields, image upload, exports
editors.jsx           Form editors for document and social content
doc-templates.jsx     Document templates: 9 document types x 3 variants
social-templates.jsx  Instagram / square social templates and registry
tiktok-templates.jsx  TikTok / Threads / vertical templates and registry
quote-calculator.jsx  Quick quote calculator panel and preview
tweaks-panel.jsx      Reusable Tweaks panel and controls
app.jsx               App shell, state, settings modal, navigation, preview, export flow
```

Scripts are loaded with `<script type="text/babel">` tags. Babel standalone transpiles JSX in the browser, and React 18 is loaded from CDN as a UMD build.

---

## Customising

### Adding a social template

1. Define a template object in `social-templates.jsx` for square templates or `tiktok-templates.jsx` for vertical templates:

```js
{
  id: "my-template",
  name: "My Template",
  kind: "Single",           // or "Carousel", "CTA", "News", etc.
  category: "square",       // use "vertical" for 1080x1920 templates
  width: 1080,
  height: 1080,
  fields: [
    { key: "headline", label: "Headline", type: "text", placeholder: "..." },
    { key: "body", label: "Body", type: "textarea" },
  ],
  slides: ({ data, brand }) => [
    <div className="social-frame" key="0">
      {/* template JSX */}
    </div>
  ],
}
```

2. Add it to `SocialTemplates` or `TikTokTemplates`.

The picker, form renderer, preview, and export buttons use the template registry automatically.

### Adding a document type

1. Add default data in `app.jsx`.
2. Add an editor component in `editors.jsx`.
3. Add Classic, Modern, and Editorial template components in `doc-templates.jsx`.
4. Register the template set in `DocTemplates`.
5. Add the document definition to `DOC_TYPES` in `app.jsx`.

### Changing brand defaults

Edit `DEFAULT_BRAND` in `app.jsx`. Users can overwrite those values in Studio Settings, and the saved values stay in `localStorage`.

---

## Tech stack

| Layer        | Choice                                                                  |
| ------------ | ----------------------------------------------------------------------- |
| UI           | React 18 CDN / UMD                                                      |
| JSX          | Babel standalone                                                        |
| Markdown     | marked.js                                                               |
| Image export | html-to-image                                                           |
| Fonts        | Google Fonts: Source Serif 4, Instrument Serif, Manrope, JetBrains Mono |
| Storage      | localStorage                                                            |
| Build        | None                                                                    |

---

## Browser support

Any modern browser: Chrome, Firefox, Safari, or Edge. Image export uses `html-to-image`, which requires browser support for `Canvas` and `Blob` APIs.

---

## Contributing

Pull requests are welcome. For significant changes, open an issue first to discuss what you would like to change.

Please keep the no-build-step constraint. This project is intentionally simple to fork and self-host.

---

## License

MIT - free to use, fork, and modify. Attribution appreciated but not required.

---

## Made by

**[Vanaila Digital](https://vanaila.com)** - a digital agency creating website, custom tools for creators, small business, and enterprises.
