import { useState } from 'react';
import { CVData, CVRegionalMode } from './types';
import { CVEditor } from './CVEditor';

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
  regionalMode?: CVRegionalMode;
}

type Step = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications';

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'summary', label: 'Summary', icon: '📝' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'certifications', label: 'Certifications', icon: '🏆' },
];

export default function CVStepEditor({ data, onChange, regionalMode }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  return (
    <div className="cv-step-editor">
      <div className="cv-step-progress">
        {STEPS.map((step, idx) => (
          <button
            key={step.id}
            className={`cv-step-progress__item ${currentStep === step.id ? 'cv-step-progress__item--active' : ''} ${idx < currentIndex ? 'cv-step-progress__item--completed' : ''}`}
            onClick={() => setCurrentStep(step.id)}
          >
            <div className="cv-step-progress__icon">{step.icon}</div>
            <div className="cv-step-progress__label">{step.label}</div>
          </button>
        ))}
      </div>

      <div className="cv-step-content">
        <CVEditor data={data} onChange={onChange} activeSection={currentStep} regionalMode={regionalMode} />
      </div>

      <div className="cv-step-nav">
        <button
          className="cv-btn cv-btn--secondary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>
        <div className="cv-step-nav__indicator">
          Step {currentIndex + 1} of {STEPS.length}
        </div>
        <button
          className="cv-btn cv-btn--primary"
          onClick={handleNext}
          disabled={currentIndex === STEPS.length - 1}
        >
          {currentIndex === STEPS.length - 1 ? 'Done' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
