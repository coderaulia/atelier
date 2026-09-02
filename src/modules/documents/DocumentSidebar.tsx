import { Icon } from './utils';

interface DocumentSidebarProps {
  docTypes: readonly any[];
  currentDocType: string;
  onSelectDocType: (id: string) => void;
  variantsCount: number;
  isSocialDemo?: boolean;
  isDocumentsDemo?: boolean;
  isMarketingDemo?: boolean;
  onSocialPick: () => void;
  socialCount: number;
  brand: any;
  onOpenSettings: () => void;
  pinnedDocTypes?: string[];
  onTogglePin?: (id: string) => void;
}

export function DocumentSidebar({
  docTypes,
  currentDocType,
  onSelectDocType,
  variantsCount,
  isSocialDemo = false,
  isDocumentsDemo = false,
  isMarketingDemo = false,
  onSocialPick,
  socialCount,
  brand,
  onOpenSettings,
  pinnedDocTypes = [],
  onTogglePin,
}: DocumentSidebarProps) {
  const isPinned = (id: string) => pinnedDocTypes.includes(id);

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark"></span>
        <span className="sidebar__brand-name">Studio</span>
        <span className="sidebar__brand-tag">v 0.1</span>
      </div>

      {!isSocialDemo && (
        <div className="sidebar__group">
          <div className="sidebar__heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Documents</span>
            {onTogglePin && (
              <span title="Click the star on each document to pin as priority on your dashboard" style={{ fontSize: 9, opacity: 0.6, cursor: 'help' }}>
                ⭐ Priority
              </span>
            )}
          </div>
          {docTypes.filter((d: any) => d.id !== "social" && !d.isTool).map((d: any) => {
            const active = currentDocType === d.id;
            const pinned = isPinned(d.id);
            return (
              <div
                key={d.id}
                style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                className={active ? "sidebar__item-wrap--active" : ""}
              >
                <button
                  className={"sidebar__item " + (active ? "sidebar__item--active" : "")}
                  onClick={() => onSelectDocType(d.id)}
                  style={{ paddingRight: onTogglePin ? 32 : undefined }}
                >
                  <span className="sidebar__item-icon">{d.icon}</span>
                  <span>{d.name}</span>
                  {d.hasVariants && <span className="sidebar__item-count">{String(variantsCount).padStart(2, "0")}</span>}
                </button>
                {onTogglePin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(d.id);
                    }}
                    title={pinned ? "Unpin from priority" : "Pin as priority"}
                    style={{
                      position: 'absolute',
                      right: 8,
                      background: 'none',
                      border: 'none',
                      padding: 2,
                      cursor: 'pointer',
                      fontSize: 12,
                      opacity: pinned ? 1 : 0.25,
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    ⭐
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isDocumentsDemo && (
        <div className="sidebar__group">
          <div className="sidebar__heading">Social</div>
          <button
            className={"sidebar__item " + (currentDocType === "social" ? "sidebar__item--active" : "")}
            onClick={onSocialPick}
          >
            <span className="sidebar__item-icon">{Icon.social}</span>
            <span>Social media</span>
            <span className="sidebar__item-count">{socialCount}</span>
          </button>
        </div>
      )}

      {!isMarketingDemo && (
        <div className="sidebar__group">
          <div className="sidebar__heading">Tools</div>
          {docTypes.filter((d: any) => d.isTool).map((d: any) => (
            <button
              key={d.id}
              className={"sidebar__item " + (currentDocType === d.id ? "sidebar__item--active" : "")}
              onClick={() => onSelectDocType(d.id)}
            >
              <span className="sidebar__item-icon">{d.icon}</span>
              <span>{d.name}</span>
            </button>
          ))}
        </div>
      )}

      {!isMarketingDemo && (
        <>
          <div className="sidebar__footer">
            <span className="sidebar__avatar">
              {((brand as any).fullName || "M A").split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase()}
            </span>
            <div className="sidebar__user">
              <div className="sidebar__user-name">{(brand as any).fullName || "—"}</div>
              <div className="sidebar__user-tag">{(brand as any).handle || "—"}</div>
            </div>
            <button className="sidebar__settings-btn" onClick={onOpenSettings} title="Settings & Backup">
              {Icon.gear}
            </button>
          </div>
          <div className="sidebar__attribution">
            <a href="https://vanaila.com" target="_blank" rel="noopener noreferrer" className="sidebar__attribution-link">
              Vanaila Digital · Open source
            </a>
          </div>
        </>
      )}
    </aside>
  );
}
