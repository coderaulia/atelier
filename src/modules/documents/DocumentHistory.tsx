import { useState, useMemo } from 'react';
import type { StoredDocumentItem } from '../../lib/api';

interface DocumentHistoryProps {
  docType: string;
  items: StoredDocumentItem[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onSearchChange: (q: string) => void;
  onStatusChange: (status: string) => void;
}

export function DocumentHistory({
  docType,
  items,
  isLoading,
  onEdit,
  onDuplicate,
  onDelete,
  onSearchChange,
  onStatusChange,
}: DocumentHistoryProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onSearchChange(val);
  };

  const handleStatus = (val: string) => {
    setStatus(val);
    onStatusChange(val);
  };

  const hasFinancialSummary = ['invoice', 'receipt', 'retainer'].includes(docType);

  const totalSum = useMemo(() => {
    if (!hasFinancialSummary) return 0;
    return items.reduce((acc, it) => acc + (Number(it.total_amount) || 0), 0);
  }, [items, hasFinancialSummary]);

  const currencySample = items[0]?.currency || 'USD';

  return (
    <div className="doc-history" style={{ padding: '0 20px 30px' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <input
            type="search"
            value={search}
            onChange={handleSearch}
            placeholder="Search ref no, title, client name…"
            className="field__input"
            style={{ width: '100%', paddingLeft: 32, fontSize: 13 }}
          />
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
            🔍
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'draft', 'final'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleStatus(s)}
              className={`social-search__pill ${status === s ? 'social-search__pill--active' : ''}`}
              style={{ textTransform: 'capitalize', fontSize: 12 }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--shell-muted)', fontSize: 13 }}>
          Loading documents…
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--shell-bg)', borderRadius: 8, border: '1px solid var(--shell-rule)' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--shell-ink)', marginBottom: 4 }}>No documents found</div>
          <div style={{ fontSize: 12, color: 'var(--shell-muted)' }}>
            {search ? 'Try adjusting your search or filters.' : 'Save your first document from the editor to see it here.'}
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--shell-rule)', borderRadius: 8, background: 'var(--shell-bg)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--shell-rule)', background: 'rgba(148, 163, 184, 0.05)', color: 'var(--shell-muted)' }}>
                <th style={{ padding: '10px 12px', width: 40 }}>#</th>
                {docType === 'invoice' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Invoice No.</th>
                    <th style={{ padding: '10px 12px' }}>Issued Date</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total Amount</th>
                  </>
                )}
                {docType === 'agreement' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Ref No.</th>
                    <th style={{ padding: '10px 12px' }}>Agreement Title</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                  </>
                )}
                {docType === 'proposal' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Ref No.</th>
                    <th style={{ padding: '10px 12px' }}>Proposal Title</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                  </>
                )}
                {docType === 'prd' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Document Title</th>
                    <th style={{ padding: '10px 12px' }}>Author</th>
                    <th style={{ padding: '10px 12px' }}>Updated</th>
                  </>
                )}
                {docType === 'retainer' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px' }}>Start Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Monthly Fee</th>
                  </>
                )}
                {docType === 'receipt' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Receipt No.</th>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
                  </>
                )}
                {docType === 'onboarding' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Project Name</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px' }}>Start Date</th>
                  </>
                )}
                {docType === 'scopeguard' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Project Name</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Add'l Rate</th>
                  </>
                )}
                {docType === 'handover' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Project Name</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px' }}>Handover Date</th>
                  </>
                )}
                {!['invoice', 'agreement', 'proposal', 'prd', 'retainer', 'receipt', 'onboarding', 'scopeguard', 'handover'].includes(docType) && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Title</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                  </>
                )}
                <th style={{ padding: '10px 12px', width: 70 }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((doc, idx) => (
                <tr
                  key={doc.id}
                  style={{
                    borderBottom: '1px solid var(--shell-rule)',
                    transition: 'background 0.1s ease',
                  }}
                >
                  <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{idx + 1}</td>
                  {docType === 'invoice' && (
                    <>
                      <td style={{ padding: '10px 12px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        {doc.ref_no || '—'}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>
                        {doc.doc_date || '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {doc.total_amount.toLocaleString()} {doc.currency}
                      </td>
                    </>
                  )}
                  {docType === 'agreement' && (
                    <>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>{doc.ref_no || '—'}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.title || 'Untitled'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                    </>
                  )}
                  {docType === 'proposal' && (
                    <>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>{doc.ref_no || '—'}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.title || 'Untitled'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                    </>
                  )}
                  {docType === 'prd' && (
                    <>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.title || 'Untitled'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                    </>
                  )}
                  {docType === 'retainer' && (
                    <>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {doc.total_amount.toLocaleString()} {doc.currency}
                      </td>
                    </>
                  )}
                  {docType === 'receipt' && (
                    <>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>{doc.ref_no || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {doc.total_amount.toLocaleString()} {doc.currency}
                      </td>
                    </>
                  )}
                  {docType === 'onboarding' && (
                    <>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.title || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                    </>
                  )}
                  {docType === 'scopeguard' && (
                    <>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.title || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {doc.total_amount.toLocaleString()} {doc.currency}
                      </td>
                    </>
                  )}
                  {docType === 'handover' && (
                    <>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.title || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                    </>
                  )}
                  {!['invoice', 'agreement', 'proposal', 'prd', 'retainer', 'receipt', 'onboarding', 'scopeguard', 'handover'].includes(docType) && (
                    <>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.title || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                    </>
                  )}
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        fontSize: 10,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: doc.status === 'final' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                        color: doc.status === 'final' ? '#4ade80' : 'var(--shell-muted)',
                      }}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => onEdit(doc.id)}
                        className="export-btn export-btn--ghost"
                        style={{ padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}
                        title="Edit in form"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicate(doc.id)}
                        className="export-btn export-btn--ghost"
                        style={{ padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}
                        title="Duplicate as new draft"
                      >
                        📄
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete this document (${doc.ref_no || doc.title || 'document'})?`)) {
                            onDelete(doc.id);
                          }
                        }}
                        className="export-btn export-btn--ghost"
                        style={{ padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: '#f87171' }}
                        title="Delete document"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {hasFinancialSummary && items.length > 0 && (
              <tfoot>
                <tr style={{ background: 'rgba(148, 163, 184, 0.08)', fontWeight: 600, borderTop: '2px solid var(--shell-rule)' }}>
                  <td colSpan={docType === 'invoice' ? 4 : 3} style={{ padding: '12px 14px', textAlign: 'right' }}>
                    Total Ringkasan:
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: '#5a8fc7' }}>
                    {totalSum.toLocaleString()} {currencySample}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
