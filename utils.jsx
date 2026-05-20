// Utilities: icons, markdown, formatters, export helpers
// Globals: Icon, MD, fmt, useLocalStorage, exportPDF, exportImage

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------- Icons (line, 18px) ---------- */
const I = ({ d, vb = "0 0 24 24", size = 18, stroke = "currentColor", fill = "none", sw = 1.5 }) => (
  <svg width={size} height={size} viewBox={vb} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const Icon = {
  doc: <I d={<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 14h8M8 17h6"/></>} />,
  receipt: <I d={<><path d="M19 21V3H5v18l3-2 2 2 2-2 2 2 2-2z"/><path d="M9 7h6M9 11h6M9 15h4"/></>} />,
  proposal: <I d={<><path d="M3 4h18v16H3z"/><path d="M3 9h18"/><circle cx="7" cy="6.5" r="0.7" fill="currentColor"/><circle cx="10" cy="6.5" r="0.7" fill="currentColor"/></>} />,
  prd: <I d={<><path d="M9 3h6l5 5v13H4V3z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h5"/></>} />,
  social: <I d={<><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></>} />,
  gear: <I d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>} />,
  plus: <I d={<><path d="M12 5v14M5 12h14"/></>} />,
  trash: <I d={<><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14h10l1-14"/></>} size={14} />,
  download: <I d={<><path d="M12 3v12M6 11l6 6 6-6M4 21h16"/></>} size={16} />,
  print: <I d={<><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></>} size={16} />,
  image: <I d={<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5-11 11"/></>} size={16} />,
  zoomIn: <I d={<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></>} size={14} />,
  zoomOut: <I d={<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6"/></>} size={14} />,
};

/* ---------- localStorage hook ---------- */
function useLocalStorage(key, initial) {
  const [v, setV] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch (e) { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
  }, [key, v]);
  return [v, setV];
}

/* ---------- Markdown ---------- */
window.marked && marked.setOptions({ breaks: true, gfm: true });
const MD = (src) => {
  if (!src) return "";
  try { return marked.parse(src); }
  catch (e) { return src; }
};
const MDInline = (src) => {
  if (!src) return "";
  try { return marked.parseInline(src); }
  catch (e) { return src; }
};

/* ---------- Formatters ---------- */
const fmt = {
  money: (n, currency = "USD") => {
    const num = Number(n) || 0;
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(num);
    } catch (e) {
      return "$" + num.toFixed(2);
    }
  },
  date: (s) => {
    if (!s) return "—";
    try {
      const d = new Date(s);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch (e) { return s; }
  },
  dateShort: (s) => {
    if (!s) return "—";
    try {
      const d = new Date(s);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
    } catch (e) { return s; }
  }
};

/* ---------- Export helpers ---------- */
function exportPrint(targetSelector) {
  const node = document.querySelector(targetSelector);
  if (!node) return;

  document.querySelectorAll(".print-export-root").forEach(root => root.remove());
  document.getElementById("print-page-style")?.remove();

  const clone = node.cloneNode(true);
  clone.id = "print-target";
  clone.removeAttribute("style");

  const printRoot = document.createElement("div");
  printRoot.className = "print-export-root";
  printRoot.appendChild(clone);

  const pageStyle = document.createElement("style");
  pageStyle.id = "print-page-style";
  const pageSize = clone.classList.contains("paper--a4") ? "A4" : "letter";
  const paperColor = getComputedStyle(node).backgroundColor || "#ffffff";
  pageStyle.textContent = `
    @page {
      size: ${pageSize};
      margin: 0;
      background: ${paperColor};
    }
    body.is-printing {
      --print-paper: ${paperColor};
    }
  `;

  const cleanup = () => {
    document.body.classList.remove("is-printing");
    printRoot.remove();
    pageStyle.remove();
    window.removeEventListener("afterprint", cleanup);
  };

  document.head.appendChild(pageStyle);
  document.body.appendChild(printRoot);
  document.body.classList.add("is-printing");
  window.addEventListener("afterprint", cleanup);

  requestAnimationFrame(() => {
    window.print();
    setTimeout(cleanup, 30000);
  });
}

async function exportImage(targetSelector, filename = "export", format = "png") {
  const node = document.querySelector(targetSelector);
  if (!node) return;
  // Save the transform on the node itself (slide-wrap zoom)
  const oldTransform = node.style.transform;
  const oldBoxShadow = node.style.boxShadow;
  node.style.transform = "none";
  node.style.boxShadow = "none";
  try {
    const opts = { pixelRatio: 2, cacheBust: true };
    let dataUrl;
    if (format === "jpg" || format === "jpeg") {
      dataUrl = await htmlToImage.toJpeg(node, { ...opts, quality: 0.95, backgroundColor: "#ffffff" });
    } else {
      dataUrl = await htmlToImage.toPng(node, opts);
    }
    const link = document.createElement("a");
    link.download = `${filename}.${format === "jpeg" ? "jpg" : format}`;
    link.href = dataUrl;
    link.click();
  } finally {
    node.style.transform = oldTransform;
    node.style.boxShadow = oldBoxShadow;
  }
}

/* ---------- Auto-resize textarea ---------- */
function autosize(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.max(140, el.scrollHeight) + "px";
}

/* ---------- Field components ---------- */
const Field = ({ label, hint, children }) => (
  <div className="field">
    {label && <label className="field__label">{label}</label>}
    {children}
    {hint && <div className="field__hint">{hint}</div>}
  </div>
);

const TextInput = ({ value, onChange, placeholder, type = "text" }) => (
  <input className="field__input" type={type} value={value || ""} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
);

const Textarea = ({ value, onChange, placeholder, rows }) => {
  const ref = useRef(null);
  useEffect(() => { autosize(ref.current); }, [value]);
  return (
    <textarea
      ref={ref}
      className="field__textarea"
      value={value || ""}
      placeholder={placeholder}
      rows={rows || 6}
      onChange={e => onChange(e.target.value)}
    />
  );
};

const SectionTitle = ({ children }) => <div className="section-title">{children}</div>;

/* ---------- Image upload field ---------- */
function ImageField({ value, onChange, label, hint }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const ingest = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) ingest(file);
  };

  return (
    <Field label={label} hint={hint}>
      <div className={"image-field " + (value ? "image-field--has" : "")}>
        {value ? (
          <>
            <div className="image-field__preview">
              <img src={value} alt="" />
            </div>
            <div className="image-field__buttons">
              <button className="image-field__btn" onClick={() => inputRef.current && inputRef.current.click()}>
                Replace
              </button>
              <button className="image-field__btn image-field__btn--danger" onClick={() => onChange("")}>
                Remove
              </button>
            </div>
          </>
        ) : (
          <div
            className={"image-field__dz " + (drag ? "image-field__dz--drag" : "")}
            onClick={() => inputRef.current && inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
          >
            ↓ Drop image · or click
            <span className="image-field__dz-hint">PNG, JPG, WEBP — max 4MB recommended</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => ingest(e.target.files && e.target.files[0])}
        />
      </div>
    </Field>
  );
}

Object.assign(window, {
  Icon, useLocalStorage, MD, MDInline, fmt,
  exportPrint, exportImage, autosize,
  Field, TextInput, Textarea, SectionTitle, ImageField,
});
