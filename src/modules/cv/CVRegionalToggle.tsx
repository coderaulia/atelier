import { CV_REGIONAL_CONFIGS, type CVRegionalMode } from './types';

interface Props {
  value: CVRegionalMode;
  onChange: (mode: CVRegionalMode) => void;
}

export default function CVRegionalToggle({ value, onChange }: Props) {
  return (
    <div className="cv-regional">
      <div className="cv-regional__header">
        <span className="cv-regional__title">Regional mode</span>
        <span className="cv-regional__badge">ATS Safety</span>
      </div>
      <div className="cv-regional__options">
        {CV_REGIONAL_CONFIGS.map((config) => (
          <button
            key={config.id}
            type="button"
            className={`cv-regional__option ${value === config.id ? 'cv-regional__option--active' : ''}`}
            onClick={() => onChange(config.id)}
          >
            <span className="cv-regional__label">{config.label}</span>
            <span className="cv-regional__desc">{config.description}</span>
          </button>
        ))}
      </div>
      {value === 'international' ? (
        <p className="cv-regional__note">Photo, DOB, marital status, and religion stay hidden for Western ATS compatibility.</p>
      ) : (
        <p className="cv-regional__note">Indonesia mode enables optional local CV fields. Hide them before applying to Western roles.</p>
      )}
    </div>
  );
}
