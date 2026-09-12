import { CVTemplate, CV_TEMPLATES } from '../types';

export interface TemplatePickerProps {
  current: CVTemplate;
  onSelect: (id: CVTemplate) => void;
  isPro: boolean;
}

export function TemplatePicker({
  current,
  onSelect,
  isPro,
}: TemplatePickerProps) {
  return (
    <div className="cv-template-grid">
      {CV_TEMPLATES.map((tpl) => {
        const locked = tpl.pro && !isPro;
        return (
          <button
            key={tpl.id}
            className={`cv-template-card ${current === tpl.id ? 'cv-template-card--active' : ''} ${locked ? 'cv-template-card--locked' : ''}`}
            onClick={() => onSelect(tpl.id)}
            title={locked ? 'Upgrade to Pro to unlock' : tpl.description}
            style={{ borderColor: current === tpl.id ? tpl.accent : undefined }}
          >
            <span className="cv-template-card__swatch" style={{ backgroundColor: tpl.accent }} />
            <span className="cv-template-card__name">{tpl.name}</span>
            {locked && (
              <span className="cv-template-card__lock">
                🔒 Pro
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
