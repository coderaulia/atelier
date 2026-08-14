import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import type { CVData } from './types';

function bulletParagraph(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text: text.replace(/^[-•]\s*/, ''), size: 20 })],
  });
}

function sectionHeading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    border: {
      bottom: { color: 'D9D9D9', space: 1, style: BorderStyle.SINGLE, size: 6 },
    },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: '1F2937' })],
  });
}

function line(text: string, options: { bold?: boolean; italics?: boolean; size?: number } = {}) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, size: options.size ?? 20, bold: options.bold, italics: options.italics })],
  });
}

function splitBullets(text: string) {
  return text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function exportCVToDocx(data: CVData): Promise<Blob> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: data.personal.fullName || 'Your Name', bold: true, size: 36 })],
    })
  );

  if (data.personal.title) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: data.personal.title, size: 24, color: '4B5563' })],
      })
    );
  }

  const contact = [data.personal.email, data.personal.phone, data.personal.location, data.personal.linkedin, data.personal.website]
    .filter(Boolean)
    .join(' | ');
  if (contact) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 220 },
        children: [new TextRun({ text: contact, size: 18, color: '6B7280' })],
      })
    );
  }

  if (data.summary) {
    children.push(sectionHeading('Professional Summary'));
    children.push(line(data.summary));
  }

  if (data.experience.length) {
    children.push(sectionHeading('Experience'));
    data.experience.forEach((exp) => {
      children.push(line(`${exp.role || 'Role'} — ${exp.company || 'Company'}`, { bold: true, size: 22 }));
      const dateLine = [exp.location, [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')]
        .filter(Boolean)
        .join(' | ');
      if (dateLine) children.push(line(dateLine, { italics: true, size: 18 }));
      splitBullets(exp.description).forEach((b) => children.push(bulletParagraph(b)));
    });
  }

  if (data.education.length) {
    children.push(sectionHeading('Education'));
    data.education.forEach((edu) => {
      children.push(line(`${edu.degree || 'Degree'}${edu.field ? `, ${edu.field}` : ''}`, { bold: true, size: 22 }));
      children.push(line(`${edu.institution || 'Institution'}${edu.location ? ` — ${edu.location}` : ''}`, { size: 20 }));
      const dateLine = [edu.startDate, edu.current ? 'Present' : edu.endDate].filter(Boolean).join(' – ');
      if (dateLine) children.push(line(dateLine, { italics: true, size: 18 }));
      if (edu.description) splitBullets(edu.description).forEach((b) => children.push(bulletParagraph(b)));
    });
  }

  if (data.skills.length) {
    children.push(sectionHeading('Skills'));
    children.push(line(data.skills.map((s) => s.name).filter(Boolean).join(', ')));
  }

  if (data.certifications.length) {
    children.push(sectionHeading('Certifications'));
    data.certifications.forEach((cert) => {
      children.push(line(`${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ''}`, { bold: true, size: 20 }));
      if (cert.date || cert.credentialId) {
        children.push(line([cert.date, cert.credentialId].filter(Boolean).join(' | '), { italics: true, size: 18 }));
      }
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}
