interface Props {
  onClose: () => void;
}

export default function UpgradeModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <span className="modal__title">Upgrade to Pro</span>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <div className="modal__body">
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--shell-muted)', marginBottom: 20 }}>
            You've reached your free daily limit. Upgrade to Pro for 100 exports/day,
            premium templates, and bulk export.
          </p>
          <a
            href="/pricing"
            className="btn btn--accent"
            style={{ display: 'inline-block', padding: '10px 20px', textDecoration: 'none' }}
          >
            See Pro plans →
          </a>
        </div>
      </div>
    </div>
  );
}
