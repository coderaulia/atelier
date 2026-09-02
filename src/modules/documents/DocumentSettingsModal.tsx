import { useEffect } from 'react';
import { Field, TextInput, Textarea, ImageField } from './utils';

export function DocumentSettingsModal({ brand, setBrand, onClose }: any) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const set = (k: string, v: any) => setBrand({ ...brand, [k]: v });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e: any) => e.stopPropagation()}>
        <div className="modal__head">
          <span className="modal__title">Studio settings</span>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <div className="modal__body">
          <div style={{ fontSize: 12, color: "var(--shell-muted)", marginBottom: 14, lineHeight: 1.5 }}>
            Used as the "from" details on every document. Stored locally on this device.
          </div>
          <Field label="Studio / Business name">
            <TextInput value={brand.studioName} onChange={(v: any) => set("studioName", v)} />
          </Field>
          <Field label="Your full name">
            <TextInput value={brand.fullName} onChange={(v: any) => set("fullName", v)} />
          </Field>
          <div className="field__row">
            <Field label="Social handle">
              <TextInput value={brand.handle} onChange={(v: any) => set("handle", v)} />
            </Field>
            <Field label="Email">
              <TextInput value={brand.email} onChange={(v: any) => set("email", v)} />
            </Field>
          </div>
          <Field label="Studio address">
            <Textarea value={brand.studioAddress} onChange={(v: any) => set("studioAddress", v)} />
          </Field>
          <Field label="Payment details (markdown)">
            <Textarea value={brand.payment} onChange={(v: any) => set("payment", v)} />
          </Field>
          <Field label="Tax ID / Business no.">
            <TextInput value={brand.taxId} onChange={(v: any) => set("taxId", v)} />
          </Field>

          <div style={{ borderTop: "1px solid var(--shell-rule)", paddingTop: 20, marginTop: 8 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--shell-muted)", marginBottom: 14 }}>
              Brand Identity
            </div>
            <ImageField
              label="Company logo (Dark / Default version)"
              hint="Used on light backgrounds. SVG, PNG or JPG format."
              value={brand.logo}
              onChange={(v: any) => set("logo", v)}
            />
            <ImageField
              label="Company logo (Light / White version)"
              hint="Used on dark backgrounds. SVG, PNG or JPG format."
              value={brand.logoLight}
              onChange={(v: any) => set("logoLight", v)}
            />
            <ImageField
              label="Social profile picture / Avatar"
              hint="Used for social feed templates. Square format recommended."
              value={brand.logoAvatar}
              onChange={(v: any) => set("logoAvatar", v)}
            />
            {(brand.logo || brand.logoLight || brand.logoAvatar) && (
              <Field label="Show logo on templates">
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 0" }}>
                  <input
                    type="checkbox"
                    checked={brand.logoEnabled !== false}
                    onChange={(e: any) => set("logoEnabled", e.target.checked)}
                    style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--accent)" }}
                  />
                  <span style={{ fontSize: 13, color: "var(--shell-muted)" }}>
                    {brand.logoEnabled !== false ? "Enabled — showing on all templates" : "Disabled"}
                  </span>
                </label>
              </Field>
            )}
            <div style={{ borderTop: "1px solid var(--shell-rule)", paddingTop: 20, marginTop: 20 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--shell-muted)", marginBottom: 14 }}>
                Backup &amp; Restore
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    const keys = ["dg.data.v2", "dg.brand.v2", "dg.drafts.v3", "dg.variant.v2", "dg.socialTemplateId.v2"];
                    const backup: Record<string, any> = {};
                    keys.forEach(k => {
                      try {
                        const val = localStorage.getItem(k);
                        if (val) backup[k] = JSON.parse(val);
                      } catch (e) {}
                    });
                    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `atelier-backup-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={{ flex: 1, background: "var(--shell-btn-bg)", color: "var(--shell-ink)", border: "1px solid var(--shell-rule)", borderRadius: 6, padding: "10px 14px", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-mono)" }}
                >
                  📥 Export Backup
                </button>
                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".json";
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (evt: any) => {
                        try {
                          const data = JSON.parse(evt.target.result);
                          const ALLOWED_KEYS = ["dg.data.v2", "dg.brand.v2", "dg.drafts.v3", "dg.variant.v2", "dg.socialTemplateId.v2"];
                          if (confirm("This will overwrite your current settings, drafts, and content. Proceed?")) {
                            Object.entries(data).forEach(([k, v]) => {
                              if (ALLOWED_KEYS.includes(k)) localStorage.setItem(k, JSON.stringify(v));
                            });
                            window.location.reload();
                          }
                        } catch (err) {
                          alert("Invalid backup file format.");
                        }
                      };
                      reader.readAsText(file);
                    };
                    input.click();
                  }}
                  style={{ flex: 1, background: "var(--shell-btn-bg)", color: "var(--shell-ink)", border: "1px solid var(--shell-rule)", borderRadius: 6, padding: "10px 14px", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-mono)" }}
                >
                  📤 Import Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
