/**
 * Font embedding helper for high-fidelity image export.
 * Inlines @font-face font files as base64 data URIs so that SVG foreignObject
 * (html-to-image) renders custom fonts (Instrument Serif, JetBrains Mono, Manrope, etc.)
 * identically to the browser preview instead of falling back to Times New Roman.
 */

let cachedFontEmbedCSS: string | null = null;
let embedPromise: Promise<string> | null = null;
const fontDataUrlCache = new Map<string, string>();

async function fetchBlobAsDataUrl(url: string): Promise<string> {
  if (fontDataUrlCache.has(url)) {
    return fontDataUrlCache.get(url)!;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching font ${url}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      fontDataUrlCache.set(url, dataUrl);
      resolve(dataUrl);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Parses CSS text containing @font-face rules, downloads font files, and
 * returns the CSS with base64 data URIs substituted.
 */
async function processCssText(cssText: string): Promise<string> {
  const fontFaceRegex = /@font-face\s*\{[^}]+\}/g;
  const blocks = cssText.match(fontFaceRegex) || [];
  if (blocks.length === 0) return cssText;

  const urlRegex = /url\((?:['"]?)(https?:\/\/[^)'"]+)(?:['"]?)\)/g;
  const urlsToFetch = new Set<string>();

  for (const block of blocks) {
    let match;
    while ((match = urlRegex.exec(block)) !== null) {
      urlsToFetch.add(match[1]);
    }
  }

  // Fetch all font files concurrently
  const urlMap = new Map<string, string>();
  await Promise.all(
    Array.from(urlsToFetch).map(async (url) => {
      try {
        const dataUrl = await fetchBlobAsDataUrl(url);
        urlMap.set(url, dataUrl);
      } catch (err) {
        console.warn(`[font-embed] Failed to convert font to data URL: ${url}`, err);
      }
    })
  );

  // Substitute URLs in each font-face block
  return blocks
    .map((block) => {
      return block.replace(urlRegex, (full, url) => {
        const dataUrl = urlMap.get(url);
        return dataUrl ? `url("${dataUrl}")` : full;
      });
    })
    .join('\n\n');
}

/**
 * Extracts and embeds font-face rules for all active web fonts.
 * Caches the result in memory for instantaneous subsequent exports.
 */
export async function getFontEmbedCSS(): Promise<string> {
  if (cachedFontEmbedCSS) return cachedFontEmbedCSS;
  if (embedPromise) return embedPromise;

  embedPromise = (async () => {
    try {
      if (typeof document === 'undefined') return '';
      if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch (e) {}
      }

      const fontFaceCssChunks: string[] = [];
      const inspectedHrefs = new Set<string>();

      // 1. Try reading from document.styleSheets
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        if (sheet.href) inspectedHrefs.add(sheet.href);

        try {
          const rules = sheet.cssRules || sheet.rules;
          if (!rules) continue;
          for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            if (rule.type === CSSRule.FONT_FACE_RULE) {
              fontFaceCssChunks.push(rule.cssText);
            }
          }
        } catch (e) {
          // If cross-origin prevented direct cssRules access, fetch directly
          if (sheet.href && (sheet.href.includes('fonts.googleapis.com') || sheet.href.includes('fonts.gstatic.com'))) {
            try {
              const res = await fetch(sheet.href);
              if (res.ok) {
                const text = await res.text();
                fontFaceCssChunks.push(text);
              }
            } catch (fetchErr) {
              console.warn('[font-embed] Failed to fetch cross-origin stylesheet:', sheet.href, fetchErr);
            }
          }
        }
      }

      // 2. Also check any <link rel="stylesheet"> in <head> that might not have been parsed
      const fontLinks = document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');
      for (const link of Array.from(fontLinks)) {
        if (link.href && link.href.includes('fonts.googleapis.com') && !inspectedHrefs.has(link.href)) {
          inspectedHrefs.add(link.href);
          try {
            const res = await fetch(link.href);
            if (res.ok) {
              const text = await res.text();
              fontFaceCssChunks.push(text);
            }
          } catch (err) {
            console.warn('[font-embed] Failed to fetch font link stylesheet:', link.href, err);
          }
        }
      }

      if (fontFaceCssChunks.length === 0) {
        return '';
      }

      const rawCss = fontFaceCssChunks.join('\n\n');
      const processedCss = await processCssText(rawCss);
      cachedFontEmbedCSS = processedCss;
      return processedCss;
    } catch (err) {
      console.warn('[font-embed] Unexpected error generating fontEmbedCSS:', err);
      return '';
    } finally {
      embedPromise = null;
    }
  })();

  return embedPromise;
}

// Kick off background pre-caching when browser is idle
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => { getFontEmbedCSS(); });
  } else {
    setTimeout(() => { getFontEmbedCSS(); }, 2000);
  }
}
