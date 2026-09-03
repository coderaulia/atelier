import React, { Fragment } from 'react';

/**
 * Parses markdown inline formatting (bold, italic) and preserves newlines
 * for social template text rendering.
 *
 * Examples:
 * - "**Hello** world" -> <strong>Hello</strong> world
 * - "Line 1\nLine 2" -> Line 1<br/>Line 2
 * - "**Bold 1**\n*Italic 2*" -> <strong>Bold 1</strong><br/><em>Italic 2</em>
 */
export function renderSocialMd(text: string | undefined | null): React.ReactNode {
  if (!text) return text ?? '';
  const str = String(text);

  // Split by newlines to preserve multi-line input
  const lines = str.split('\n');

  return lines.map((line, lineIndex) => {
    // If line has no formatting markers, return plain text
    if (!line.includes('*') && !line.includes('_')) {
      return (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          {line}
        </Fragment>
      );
    }

    // Parse **bold** / __bold__ and *italic* / _italic_
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    // Match **bold** or __bold__ as group 2, or *italic* or _italic_ as group 4
    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }
      if (match[2] !== undefined) {
        // Bold
        parts.push(
          <strong key={`${lineIndex}-b-${match.index}`} style={{ fontWeight: 700 }}>
            {match[2]}
          </strong>
        );
      } else if (match[4] !== undefined) {
        // Italic
        parts.push(
          <em key={`${lineIndex}-i-${match.index}`} style={{ fontStyle: 'italic' }}>
            {match[4]}
          </em>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    return (
      <Fragment key={lineIndex}>
        {lineIndex > 0 && <br />}
        {parts}
      </Fragment>
    );
  });
}
