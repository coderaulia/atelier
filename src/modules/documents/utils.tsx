import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/* ---------- Icons (line, 18px) ---------- */
const I = ({ d, vb = "0 0 24 24", size = 18, stroke = "currentColor", fill = "none", sw = 1.5 }: any) => (
  <svg width={size} height={size} viewBox={vb} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

export const Icon: Record<string, React.JSX.Element> = {
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
  calc: <I d={<><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 7h8M8 11h8M8 15h4M14 19h2"/></>} />,
  copy: <I d={<><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>} size={14} />,
};

/* ---------- localStorage hook ---------- */
export function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(() => {
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
marked.use({ breaks: true, gfm: true });

export const MD = (src: string): string => {
  if (!src) return "";
  try { return DOMPurify.sanitize(marked.parse(src) as string); }
  catch (e) { return DOMPurify.sanitize(src); }
};

export const MDInline = (src: string): string => {
  if (!src) return "";
  try { return DOMPurify.sanitize(marked.parseInline(src) as string); }
  catch (e) { return DOMPurify.sanitize(src); }
};

/* ---------- Formatters ---------- */
export const fmt = {
  money: (n: any, currency = "USD") => {
    const num = Number(n) || 0;
    try {
      if (currency === "IDR") return "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(num));
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(num);
    } catch (e) {
      return "$" + num.toFixed(2);
    }
  },
  date: (s: string) => {
    if (!s) return "—";
    try {
      const d = new Date(s);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch (e) { return s; }
  },
  dateShort: (s: string) => {
    if (!s) return "—";
    try {
      const d = new Date(s);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
    } catch (e) { return s; }
  }
};

/* ---------- Export helpers ---------- */
async function loadHtmlToImage() {
  return import('html-to-image');
}

export function exportPrint(targetSelector: string) {
  const node = document.querySelector(targetSelector) as HTMLElement | null;
  if (!node) return;

  document.querySelectorAll(".print-export-root").forEach(root => root.remove());
  document.getElementById("print-page-style")?.remove();

  const clone = node.cloneNode(true) as HTMLElement;
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

export async function captureImage(targetSelector: string, format = "png"): Promise<string | null> {
  const node = document.querySelector(targetSelector) as HTMLElement | null;
  if (!node) return null;
  const oldTransform = node.style.transform;
  const oldBoxShadow = node.style.boxShadow;
  node.style.transform = "none";
  node.style.boxShadow = "none";
  try {
    const htmlToImage = await loadHtmlToImage();
    const opts = { pixelRatio: 2, cacheBust: true };
    if (format === "jpg" || format === "jpeg") {
      return await htmlToImage.toJpeg(node, { ...opts, quality: 0.95, backgroundColor: "#ffffff" });
    }
    return await htmlToImage.toPng(node, opts);
  } finally {
    node.style.transform = oldTransform;
    node.style.boxShadow = oldBoxShadow;
  }
}

export async function exportImage(targetSelector: string, filename = "export", format = "png") {
  const dataUrl = await captureImage(targetSelector, format);
  if (!dataUrl) return;
  const link = document.createElement("a");
  link.download = `${filename}.${format === "jpeg" ? "jpg" : format}`;
  link.href = dataUrl;
  link.click();
}

export async function copyImage(targetSelector: string): Promise<boolean> {
  if (!navigator.clipboard || !(window as any).ClipboardItem) {
    throw new Error("Clipboard image copy is not supported in this browser.");
  }
  const dataUrl = await captureImage(targetSelector, "png");
  if (!dataUrl) return false;
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  return true;
}

/* ---------- Auto-resize textarea ---------- */
export function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.max(140, el.scrollHeight) + "px";
}

/* ---------- Field components ---------- */
export const Field = ({ label, hint, children }: any) => (
  <div className="field">
    {label && <label className="field__label">{label}</label>}
    {children}
    {hint && <div className="field__hint">{hint}</div>}
  </div>
);

export const TextInput = ({ value, onChange, placeholder, type = "text" }: any) => (
  <input className="field__input" type={type} value={value || ""} placeholder={placeholder} onChange={(e: any) => onChange(e.target.value)} />
);

export const Textarea = ({ value, onChange, placeholder, rows }: any) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { autosize(ref.current); }, [value]);
  return (
    <textarea
      ref={ref}
      className="field__textarea"
      value={value || ""}
      placeholder={placeholder}
      rows={rows || 6}
      onChange={(e: any) => onChange(e.target.value)}
    />
  );
};

export const SectionTitle = ({ children }: any) => <div className="section-title">{children}</div>;

/* ---------- Image upload field ---------- */
export function ImageField({ value, onChange, label, hint }: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const ingest = (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  const onDrop = (e: any) => {
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
            onDragOver={(e: any) => { e.preventDefault(); setDrag(true); }}
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
          onChange={(e: any) => ingest(e.target.files && e.target.files[0])}
        />
      </div>
    </Field>
  );
}
