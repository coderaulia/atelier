import { useMemo } from 'react';
import { calculateATSScore, type LintIssue } from './cvAtsCheck';
import type { CVData } from './types';

interface Props {
  data: CVData;
  jdKeywords?: string[];
}

export default function CVATSPanel({ data, jdKeywords }: Props) {
  const score = useMemo(() => calculateATSScore(data, jdKeywords), [data, jdKeywords]);

  const topIssues = score.issues
    .filter((i) => i.severity === 'error' || i.severity === 'warning')
    .slice(0, 5);

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#50c878';
    if (s >= 60) return '#f5a623';
    return '#ff6b6b';
  };

  const getSeverityIcon = (severity: LintIssue['severity']) => {
    switch (severity) {
      case 'error': return '🔴';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'tip': return '💡';
    }
  };

  return (
    <div className="cv-ats-panel">
      <div className="cv-ats-panel__header">
        <span className="cv-ats-panel__title">ATS Score</span>
        <div className="cv-ats-panel__score" style={{ color: getScoreColor(score.overall) }}>
          {score.overall}
          <span className="cv-ats-panel__score-max">/100</span>
        </div>
      </div>

      <div className="cv-ats-sections">
        {Object.entries(score.sections).map(([key, value]) => (
          <div key={key} className="cv-ats-section">
            <span className="cv-ats-section__label">{key}</span>
            <div className="cv-ats-section__bar">
              <div
                className="cv-ats-section__fill"
                style={{
                  width: `${value}%`,
                  backgroundColor: getScoreColor(value),
                }}
              />
            </div>
            <span className="cv-ats-section__value">{value}</span>
          </div>
        ))}
      </div>

      {topIssues.length > 0 && (
        <div className="cv-ats-issues">
          <div className="cv-ats-issues__header">Top Issues</div>
          {topIssues.map((issue) => (
            <div key={issue.id} className="cv-ats-issue">
              <span className="cv-ats-issue__icon">{getSeverityIcon(issue.severity)}</span>
              <div className="cv-ats-issue__content">
                <div className="cv-ats-issue__message">{issue.message}</div>
                {issue.suggestion && (
                  <div className="cv-ats-issue__suggestion">{issue.suggestion}</div>
                )}
              </div>
            </div>
          ))}
          {score.issues.length > 5 && (
            <div className="cv-ats-issues__more">
              +{score.issues.length - 5} more issues
            </div>
          )}
        </div>
      )}

      {jdKeywords && jdKeywords.length > 0 && (
        <div className="cv-ats-keywords">
          <div className="cv-ats-keywords__header">
            JD Keywords ({score.keywordMatches.filter((k) => k.found).length}/{jdKeywords.length} matched)
          </div>
          <div className="cv-ats-keywords__list">
            {score.keywordMatches.slice(0, 8).map((kw) => (
              <span
                key={kw.keyword}
                className={`cv-ats-keyword ${kw.found ? 'cv-ats-keyword--found' : ''}`}
                title={kw.found ? `Found ${kw.count}x` : 'Not found'}
              >
                {kw.found ? '✓' : '✗'} {kw.keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
