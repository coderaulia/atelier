import { PDFDocument } from 'pdf-lib';

export function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [''];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push('');
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      result.push(row);
      row = [''];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== '') {
    result.push(row);
  }
  // Filter out any completely empty rows
  return result.filter(r => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

export const DOCUMENT_FIELDS: Record<string, string[]> = {
  agreement: ['title', 'clientName', 'clientAddress', 'date', 'refNo', 'scope', 'deliverables', 'compensation', 'timeline', 'legal', 'signatoryName', 'clientSignatory'],
  invoice: ['clientName', 'clientAddress', 'invoiceNo', 'projectRef', 'issuedAt', 'dueAt', 'currency', 'itemDescription', 'itemQty', 'itemRate', 'taxPct', 'discountPct', 'notes'],
  proposal: ['title', 'clientName', 'date', 'refNo', 'summary', 'understanding', 'approach', 'deliverables', 'timeline', 'investment', 'about'],
  prd: ['title', 'tagline', 'author', 'status', 'date', 'release', 'problem', 'goals', 'stories', 'solution', 'metrics', 'risks'],
  retainer: ['clientName', 'studioName', 'monthlyFee', 'currency', 'scope', 'revisionLimit', 'paymentDueDay', 'startDate', 'contractDuration', 'governingLaw'],
  receipt: ['receiptNo', 'clientName', 'paymentDate', 'itemDescription', 'amount', 'currency', 'paymentMethod', 'notes'],
  onboarding: ['clientName', 'projectName', 'startDate', 'deliverables', 'assetsNeeded', 'communicationChannel', 'meetingSchedule', 'pointOfContact'],
  scopeguard: ['projectName', 'clientName', 'includedRevisions', 'whatIsRevision', 'whatIsOutOfScope', 'additionalRevisionRate', 'currency'],
  handover: ['projectName', 'clientName', 'handoverDate', 'deliverablesList', 'fileLocations', 'credentialsHandedOver', 'nextStepsForClient', 'studioSignOffName']
};

export const FIELD_LABELS: Record<string, Record<string, string>> = {
  agreement: {
    title: 'Agreement Title',
    clientName: 'Client Name',
    clientAddress: 'Client Address',
    date: 'Date',
    refNo: 'Reference No',
    scope: 'Scope of Work',
    deliverables: 'Deliverables',
    compensation: 'Compensation',
    timeline: 'Timeline',
    legal: 'Legal Terms',
    signatoryName: 'Studio Signatory',
    clientSignatory: 'Client Signatory'
  },
  invoice: {
    clientName: 'Client Name',
    clientAddress: 'Client Address',
    invoiceNo: 'Invoice Number',
    projectRef: 'Project Reference',
    issuedAt: 'Issued Date',
    dueAt: 'Due Date',
    currency: 'Currency (e.g. USD)',
    itemDescription: 'Item Description',
    itemQty: 'Item Quantity',
    itemRate: 'Item Rate',
    taxPct: 'Tax Percentage (%)',
    discountPct: 'Discount Percentage (%)',
    notes: 'Invoice Notes'
  },
  proposal: {
    title: 'Proposal Title',
    clientName: 'Client Name',
    date: 'Date',
    refNo: 'Reference No',
    summary: 'Executive Summary',
    understanding: 'Our Understanding',
    approach: 'Proposed Approach',
    deliverables: 'Deliverables',
    timeline: 'Project Timeline',
    investment: 'Investment Required',
    about: 'About Us'
  },
  prd: {
    title: 'Product Title',
    tagline: 'Tagline',
    author: 'Author',
    status: 'Status',
    date: 'Date',
    release: 'Target Release',
    problem: 'Problem Statement',
    goals: 'Goals & Non-Goals',
    stories: 'User Stories',
    solution: 'Proposed Solution',
    metrics: 'Key Metrics',
    risks: 'Risks & Open Questions'
  },
  retainer: {
    clientName: 'Client Name',
    studioName: 'Studio Name',
    monthlyFee: 'Monthly Fee Amount',
    currency: 'Currency (e.g. USD)',
    scope: 'Scope of Services',
    revisionLimit: 'Revision Limits',
    paymentDueDay: 'Payment Due Day',
    startDate: 'Start Date',
    contractDuration: 'Contract Duration',
    governingLaw: 'Governing Law'
  },
  receipt: {
    receiptNo: 'Receipt Number',
    clientName: 'Client Name',
    paymentDate: 'Payment Date',
    itemDescription: 'Item/Service Description',
    amount: 'Payment Amount',
    currency: 'Currency (e.g. USD)',
    paymentMethod: 'Payment Method',
    notes: 'Receipt Notes'
  },
  onboarding: {
    clientName: 'Client Name',
    projectName: 'Project Name',
    startDate: 'Kickoff/Start Date',
    deliverables: 'Deliverables Overview',
    assetsNeeded: 'Assets Required from Client',
    communicationChannel: 'Communication Channels',
    meetingSchedule: 'Meeting Schedule',
    pointOfContact: 'Points of Contact'
  },
  scopeguard: {
    projectName: 'Project Name',
    clientName: 'Client Name',
    includedRevisions: 'Included Revisions Count',
    whatIsRevision: 'Definition of Revision',
    whatIsOutOfScope: 'Out of Scope Definition',
    additionalRevisionRate: 'Additional Revision Hourly Rate',
    currency: 'Currency (e.g. USD)'
  },
  handover: {
    projectName: 'Project Name',
    clientName: 'Client Name',
    handoverDate: 'Handover Date',
    deliverablesList: 'Final Deliverables List',
    fileLocations: 'File/Asset Locations',
    credentialsHandedOver: 'Credentials Handed Over',
    nextStepsForClient: 'Next Steps for Client',
    studioSignOffName: 'Studio Sign-off Name'
  }
};

export function generateCSVTemplate(docType: string): string {
  const fields = DOCUMENT_FIELDS[docType];
  if (!fields) return '';

  const headers = fields.map(f => `"${f}"`).join(',');
  let sample = '';

  if (docType === 'invoice') {
    sample = '"Acme Corp","123 Tech Lane","INV-2026-001","Web App Dev","2026-07-11","2026-07-25","USD","Development Sprints",1,4500,10,0,"Net 14 payment terms"\n' +
             '"Beta Labs","456 Cloud Way","INV-2026-002","SEO Audit","2026-07-11","2026-07-25","USD","SEO Review",1,1200,0,5,"Thank you"';
  } else if (docType === 'agreement') {
    sample = '"Consulting Agreement","Acme Corp","123 Tech Lane","2026-07-11","AG-2026-001","Deliver website redesign","Website redesign build","4500 USD on signature","4 weeks duration","Studio owns source files","John Doe","Jane Smith"';
  } else if (docType === 'proposal') {
    sample = '"Brand Redesign","Beta Labs","2026-07-11","P-2026-002","A fresh site design","Clean visual layout","Wireframes and mockups","Guidelines and Figma","4 weeks","12000 USD","About us details"';
  } else if (docType === 'prd') {
    sample = '"Login Flow Upgrade","Auth v2","Maren Aksel","In Review","2026-07-11","v2.1","Passwordless auth needed","Increase signups","Users can sign in with OTP","OTP email and validation","Success rate","Email deliverability delay"';
  } else if (docType === 'retainer') {
    sample = '"Acme Corp","North & Quill","3500","USD","Design retainer","2 rounds per deliverable","1st of month","2026-08-01","6 months","New York, USA"';
  } else if (docType === 'receipt') {
    sample = '"REC-2026-001","Acme Corp","2026-07-11","Deposit Phase 1","4500","USD","Bank Transfer","Payment received"';
  } else if (docType === 'onboarding') {
    sample = '"Acme Corp","Redesign","2026-08-01","Design layout","Logo vector","Slack channel","Tuesdays 10 AM","Maren Aksel"';
  } else if (docType === 'scopeguard') {
    sample = '"Redesign","Acme Corp","3","Substantive changes to layouts","New features or branding","150","USD"';
  } else if (docType === 'handover') {
    sample = '"Redesign","Acme Corp","2026-08-15","Figma boards","Shared Google Drive","Admin credentials","Schedule launch","Maren Aksel"';
  }

  return headers + '\n' + sample;
}

export function autoMapHeaders(headers: string[], fields: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  fields.forEach(f => {
    const cleanF = f.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = headers.find(h => h.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanF);
    mapping[f] = found || '';
  });
  return mapping;
}

export function constructRowData(row: string[], headers: string[], mappings: Record<string, string>, docType: string, defaults: any) {
  const data = JSON.parse(JSON.stringify(defaults));
  Object.entries(mappings).forEach(([field, colName]) => {
    if (!colName) return;
    const colIdx = headers.indexOf(colName);
    if (colIdx === -1 || colIdx >= row.length) return;
    const val = row[colIdx];

    if (docType === 'invoice') {
      if (field === 'itemDescription') {
        if (!data.items || data.items.length === 0) data.items = [{}];
        data.items[0].desc = val;
      } else if (field === 'itemQty') {
        if (!data.items || data.items.length === 0) data.items = [{}];
        data.items[0].qty = Number(val) || 1;
      } else if (field === 'itemRate') {
        if (!data.items || data.items.length === 0) data.items = [{}];
        data.items[0].rate = Number(val) || 0;
      } else if (field === 'taxPct' || field === 'discountPct') {
        data[field] = Number(val) || 0;
      } else {
        data[field] = val;
      }
    } else {
      data[field] = val;
    }
  });
  return data;
}

export async function convertPngToPdf(pngDataUrl: string, paperSize: 'letter' | 'a4'): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const response = await fetch(pngDataUrl);
  const imageBytes = await response.arrayBuffer();
  const pngImage = await pdfDoc.embedPng(imageBytes);

  // A4 size: 595.27 x 841.89 points, Letter size: 612 x 792 points
  const width = paperSize === 'a4' ? 595.27 : 612;
  const height = paperSize === 'a4' ? 841.89 : 792;

  const page = pdfDoc.addPage([width, height]);
  page.drawImage(pngImage, { x: 0, y: 0, width, height });
  const bytes = await pdfDoc.save();
  return new Blob([bytes.buffer as any], { type: 'application/pdf' });
}
