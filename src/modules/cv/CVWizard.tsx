import { useState } from 'react';
import type { CVStartupConfig } from './types';

interface Props {
  onComplete: (config: CVStartupConfig) => void;
  onSkip: () => void;
}

const ROLE_SUGGESTIONS = [
  'Software Engineer',
  'Product Manager',
  'UX Designer',
  'Data Scientist',
  'Marketing Manager',
  'Financial Analyst',
  'Project Manager',
  'DevOps Engineer',
  'Business Analyst',
  'Graphic Designer',
  'Sales Manager',
  'Accountant',
  'Teacher',
  'Consultant',
  'Other'
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry-level / New Grad', description: '0-2 years of experience' },
  { value: 'mid', label: 'Mid-level', description: '2-5 years of experience' },
  { value: 'senior', label: 'Senior / Lead', description: '5-10 years of experience' },
  { value: 'executive', label: 'Executive / Director', description: '10+ years of experience' }
];

const INDUSTRIES = [
  { value: 'tech', label: 'Technology', icon: '💻' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'creative', label: 'Creative / Design', icon: '🎨' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'other', label: 'Other', icon: '📋' }
];

export default function CVWizard({ onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<CVStartupConfig>({
    targetRole: '',
    experienceLevel: 'mid',
    industry: 'tech'
  });

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onComplete(config);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const isStepValid = () => {
    if (step === 0) return config.targetRole.trim().length > 0;
    return true;
  };

  return (
    <div className="cv-wizard">
      <div className="cv-wizard__header">
        <h2 className="cv-wizard__title">Build your CV in 30 seconds</h2>
        <p className="cv-wizard__subtitle">
          Tell us about your goals and we'll set up the perfect template
        </p>
        <button className="cv-wizard__skip" onClick={onSkip}>
          Skip and start from scratch
        </button>
      </div>

      <div className="cv-wizard__progress">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className={`cv-wizard__step ${i === step ? 'cv-wizard__step--active' : ''} ${i < step ? 'cv-wizard__step--completed' : ''}`}
          >
            <div className="cv-wizard__step-number">
              {i < step ? '✓' : i + 1}
            </div>
            <div className="cv-wizard__step-label">
              {i === 0 ? 'Role' : i === 1 ? 'Experience' : 'Industry'}
            </div>
          </div>
        ))}
      </div>

      <div className="cv-wizard__content">
        {step === 0 && (
          <div className="cv-wizard__section">
            <label className="cv-wizard__label">
              What role are you applying for?
            </label>
            <input
              type="text"
              className="cv-wizard__input"
              value={config.targetRole}
              onChange={(e) => setConfig({ ...config, targetRole: e.target.value })}
              placeholder="e.g. Senior Product Manager"
              autoFocus
            />
            <div className="cv-wizard__suggestions">
              {ROLE_SUGGESTIONS.map((role) => (
                <button
                  key={role}
                  className={`cv-wizard__suggestion ${config.targetRole === role ? 'cv-wizard__suggestion--active' : ''}`}
                  onClick={() => setConfig({ ...config, targetRole: role })}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="cv-wizard__section">
            <label className="cv-wizard__label">
              How many years of experience do you have?
            </label>
            <div className="cv-wizard__options">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  className={`cv-wizard__option ${config.experienceLevel === level.value ? 'cv-wizard__option--active' : ''}`}
                  onClick={() => setConfig({ ...config, experienceLevel: level.value as any })}
                >
                  <div className="cv-wizard__option-title">{level.label}</div>
                  <div className="cv-wizard__option-desc">{level.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="cv-wizard__section">
            <label className="cv-wizard__label">
              What industry are you in?
            </label>
            <div className="cv-wizard__options cv-wizard__options--grid">
              {INDUSTRIES.map((industry) => (
                <button
                  key={industry.value}
                  className={`cv-wizard__option cv-wizard__option--icon ${config.industry === industry.value ? 'cv-wizard__option--active' : ''}`}
                  onClick={() => setConfig({ ...config, industry: industry.value as any })}
                >
                  <div className="cv-wizard__option-icon">{industry.icon}</div>
                  <div className="cv-wizard__option-title">{industry.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="cv-wizard__footer">
        <button 
          className="cv-wizard__btn cv-wizard__btn--secondary"
          onClick={handleBack}
          disabled={step === 0}
        >
          Back
        </button>
        <button 
          className="cv-wizard__btn cv-wizard__btn--primary"
          onClick={handleNext}
          disabled={!isStepValid()}
        >
          {step === 2 ? 'Create my CV' : 'Next'}
        </button>
      </div>
    </div>
  );
}
