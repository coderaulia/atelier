import { Icon } from './utils';
import { DOCUMENT_FIELDS, FIELD_LABELS, generateCSVTemplate } from './bulk-utils';

interface BulkCSVPanelProps {
  docType: string;
  csvHeaders: string[];
  csvRows: string[][];
  mappings: Record<string, string>;
  setMappings: (m: Record<string, string>) => void;
  handleBulkUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  bulkExportFormat: 'png' | 'pdf';
  setBulkExportFormat: (f: 'png' | 'pdf') => void;
  startBulkGeneration: () => void;
  bulkProcessing: boolean;
  bulkQueue: Array<{ id: string; name: string; status: 'pending' | 'processing' | 'done' | 'error' }>;
  bulkProgressIndex: number;
}

export function BulkCSVPanel({
  docType,
  csvHeaders,
  csvRows,
  mappings,
  setMappings,
  handleBulkUpload,
  bulkExportFormat,
  setBulkExportFormat,
  startBulkGeneration,
  bulkProcessing,
  bulkQueue,
  bulkProgressIndex,
}: BulkCSVPanelProps) {
  return (
    <div style={{ padding: '0 20px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--shell-muted)' }}>
          Import a CSV file to generate multiple documents in batch.
        </div>
        <button
          onClick={() => {
            const csv = generateCSVTemplate(docType);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${docType}-template.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="export-btn export-btn--ghost"
          style={{ fontSize: 12, padding: '4px 8px', border: '1px solid var(--shell-rule)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {Icon.download} CSV Template
        </button>
      </div>

      <label className="bulk-dropzone" style={{ display: 'block' }}>
        <input type="file" accept=".csv" onChange={handleBulkUpload} style={{ display: 'none' }} />
        <div style={{ marginBottom: 8 }}>{Icon.doc}</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--shell-ink)', marginBottom: 4 }}>Upload CSV Data</div>
        <div style={{ fontSize: 12 }}>Drag and drop or click to browse</div>
      </label>

      {csvHeaders.length > 0 && (
        <div className="bulk-mapping-wrap">
          <div style={{ marginBottom: 16, fontSize: 13, fontWeight: 500, color: 'var(--shell-ink)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Map Fields</span>
            <span style={{ color: 'var(--shell-muted)', fontWeight: 400 }}>{csvRows.length} rows detected</span>
          </div>

          <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 10, marginBottom: 20 }}>
            {(DOCUMENT_FIELDS[docType] || []).map((field: string) => (
              <div className="bulk-mapping-row" key={field}>
                <div style={{ color: 'var(--shell-muted)' }}>{FIELD_LABELS[docType]?.[field] || field}</div>
                <select
                  value={mappings[field] || ''}
                  onChange={(e: any) => setMappings({ ...mappings, [field]: e.target.value })}
                >
                  <option value="">-- Ignore --</option>
                  {csvHeaders.map((h: string) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--shell-rule)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <span style={{ fontSize: 12, color: 'var(--shell-muted)' }}>Format:</span>
              <select
                value={bulkExportFormat}
                onChange={(e: any) => setBulkExportFormat(e.target.value as 'png' | 'pdf')}
                style={{ background: "var(--shell-field-bg)", color: "var(--shell-ink)", border: "1px solid var(--shell-rule)", borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: 'pointer' }}
              >
                <option value="pdf">PDF (Vector)</option>
                <option value="png">PNG (Image)</option>
              </select>
            </div>

            <button
              onClick={startBulkGeneration}
              disabled={bulkProcessing}
              style={{ background: "var(--shell-ink)", color: "var(--shell-bg)", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: bulkProcessing ? "default" : "pointer", opacity: bulkProcessing ? 0.7 : 1 }}
            >
              {bulkProcessing ? "Processing..." : `Generate ${csvRows.length} Files`}
            </button>
          </div>
        </div>
      )}

      {bulkQueue.length > 0 && (
        <div className="bulk-progress-wrap">
          <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', color: 'var(--shell-muted)' }}>
            <span>Processing {bulkProgressIndex >= 0 ? Math.min(bulkProgressIndex + 1, bulkQueue.length) : 0} of {bulkQueue.length}</span>
            <span>{Math.round((Math.max(0, bulkProgressIndex) / Math.max(1, bulkQueue.length)) * 100)}%</span>
          </div>
          <div className="bulk-progress-bar">
            <div className="bulk-progress-fill" style={{ width: `${(Math.max(0, bulkProgressIndex) / Math.max(1, bulkQueue.length)) * 100}%` }}></div>
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {bulkQueue.map((q) => (
              <div key={q.id} className="bulk-queue-item">
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>{q.name}</span>
                <span className={`bulk-status--${q.status}`}>
                  {q.status === 'pending' ? 'Waiting' : q.status === 'processing' ? 'Rendering...' : q.status === 'done' ? 'Success' : 'Failed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
