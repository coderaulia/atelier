import { useState, useMemo, useEffect } from 'react';
import type { StoredDocumentItem } from '../../lib/api';
import { Icon } from './utils';

export const HISTORY_CATEGORIES = [
  { id: "agreement",  name: "Agreement",   icon: Icon.doc },
  { id: "invoice",    name: "Invoice",     icon: Icon.receipt },
  { id: "proposal",   name: "Proposal",   icon: Icon.proposal },
  { id: "prd",        name: "PRD",         icon: Icon.prd },
  { id: "retainer",   name: "Retainer",   icon: Icon.doc },
  { id: "receipt",    name: "Receipt",    icon: Icon.receipt },
  { id: "onboarding", name: "Onboarding", icon: Icon.proposal },
  { id: "scopeguard", name: "Scope Guard",icon: Icon.prd },
  { id: "handover",   name: "Handover",   icon: Icon.doc },
] as const;

interface DocumentHistoryProps {
  docType: string;
  items: StoredDocumentItem[];
  isLoading: boolean;
  countsByCategory?: Record<string, number>;
  onCategoryChange?: (category: string) => void;
  onEdit: (id: string, docType: string) => void;
  onDuplicate: (id: string, docType: string) => void;
  onDelete: (id: string, docType: string) => void;
  onSearchChange: (q: string, category: string) => void;
  onStatusChange: (status: string, category: string) => void;
}

export function DocumentHistory({
  docType,
  items,
  isLoading,
  countsByCategory,
  onCategoryChange,
  onEdit,
  onDuplicate,
  onDelete,
  onSearchChange,
  onStatusChange,
}: DocumentHistoryProps) {
  const initialCategory = HISTORY_CATEGORIES.some(c => c.id === docType) ? docType : 'agreement';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  // Synchronize category if parent docType changes
  useEffect(() => {
    if (HISTORY_CATEGORIES.some(c => c.id === docType)) {
      setSelectedCategory(docType);
    }
  }, [docType]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setSearch('');
    setStatus('all');
    if (onCategoryChange) {
      onCategoryChange(catId);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onSearchChange(val, selectedCategory);
  };

  const handleStatus = (val: string) => {
    setStatus(val);
    onStatusChange(val, selectedCategory);
  };

  const currentCategoryDef = HISTORY_CATEGORIES.find(c => c.id === selectedCategory) || HISTORY_CATEGORIES[0];
  const hasFinancialSummary = ['invoice', 'receipt', 'retainer'].includes(selectedCategory);

  const totalSum = useMemo(() => {
    if (!hasFinancialSummary) return 0;
    return items.reduce((acc, it) => acc + (Number(it.total_amount) || 0), 0);
  }, [items, hasFinancialSummary]);

  const currencySample = items[0]?.currency || 'USD';

  return (
    <div className="doc-history" style={{ padding: '0 20px 30px' }}>
      {/* Category Tabs */}
      <div
        className="doc-history__tabs"
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 14,
          marginBottom: 16,
          borderBottom: '1px solid var(--shell-rule)',
        }}
      >
        {HISTORY_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = countsByCategory?.[cat.id] ?? 0;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySelect(cat.id)}
              className={`history-cat-tab ${isActive ? 'history-cat-tab--active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 12px',
                borderRadius: 6,
                border: '1px solid',
                borderColor: isActive ? 'var(--accent)' : 'var(--shell-rule)',
                background: isActive ? 'var(--accent-soft)' : 'var(--shell-bg)',
                color: isActive ? 'var(--shell-ink)' : 'var(--shell-muted)',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ display: 'inline-flex', width: 14, height: 14, opacity: isActive ? 1 : 0.6 }}>
                {cat.icon}
              </span>
              <span>{cat.name}</span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  padding: '1px 6px',
                  borderRadius: 999,
                  background: isActive ? 'var(--accent)' : 'var(--shell-bg-3)',
                  color: isActive ? 'var(--accent-ink)' : 'var(--shell-muted)',
                  fontWeight: 600,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Status Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <input
            type="search"
            value={search}
            onChange={handleSearch}
            placeholder={`Search ${currentCategoryDef.name.toLowerCase()} by ref no, title, client…`}
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

      {/* Content Table or Empty State */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--shell-muted)', fontSize: 13 }}>
          Loading {currentCategoryDef.name.toLowerCase()}s…
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--shell-bg)', borderRadius: 8, border: '1px solid var(--shell-rule)' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--shell-ink)', marginBottom: 4 }}>
            No {currentCategoryDef.name.toLowerCase()} documents found
          </div>
          <div style={{ fontSize: 12, color: 'var(--shell-muted)' }}>
            {search || status !== 'all'
              ? 'Try adjusting your search or status filter.'
              : `Save your first ${currentCategoryDef.name.toLowerCase()} from the editor to view it here.`}
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--shell-rule)', borderRadius: 8, background: 'var(--shell-bg)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--shell-rule)', background: 'rgba(148, 163, 184, 0.05)', color: 'var(--shell-muted)' }}>
                <th style={{ padding: '10px 12px', width: 40 }}>#</th>
                {selectedCategory === 'invoice' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Invoice No.</th>
                    <th style={{ padding: '10px 12px' }}>Issued Date</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total Amount</th>
                  </>
                )}
                {selectedCategory === 'agreement' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Ref No.</th>
                    <th style={{ padding: '10px 12px' }}>Agreement Title</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                  </>
                )}
                {selectedCategory === 'proposal' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Ref No.</th>
                    <th style={{ padding: '10px 12px' }}>Proposal Title</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                  </>
                )}
                {selectedCategory === 'prd' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Document Title</th>
                    <th style={{ padding: '10px 12px' }}>Author</th>
                    <th style={{ padding: '10px 12px' }}>Updated</th>
                  </>
                )}
                {selectedCategory === 'retainer' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px' }}>Start Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Monthly Fee</th>
                  </>
                )}
                {selectedCategory === 'receipt' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Receipt No.</th>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
                  </>
                )}
                {selectedCategory === 'onboarding' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Project Name</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px' }}>Start Date</th>
                  </>
                )}
                {selectedCategory === 'scopeguard' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Project Name</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Add'l Rate</th>
                  </>
                )}
                {selectedCategory === 'handover' && (
                  <>
                    <th style={{ padding: '10px 12px' }}>Project Name</th>
                    <th style={{ padding: '10px 12px' }}>Client</th>
                    <th style={{ padding: '10px 12px' }}>Handover Date</th>
                  </>
                )}
                {!['invoice', 'agreement', 'proposal', 'prd', 'retainer', 'receipt', 'onboarding', 'scopeguard', 'handover'].includes(selectedCategory) && (
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
                  {selectedCategory === 'invoice' && (
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
                  {selectedCategory === 'agreement' && (
                    <>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>{doc.ref_no || '—'}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.title || 'Untitled'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                    </>
                  )}
                  {selectedCategory === 'proposal' && (
                    <>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>{doc.ref_no || '—'}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.title || 'Untitled'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                    </>
                  )}
                  {selectedCategory === 'prd' && (
                    <>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.title || 'Untitled'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                    </>
                  )}
                  {selectedCategory === 'retainer' && (
                    <>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {doc.total_amount.toLocaleString()} {doc.currency}
                      </td>
                    </>
                  )}
                  {selectedCategory === 'receipt' && (
                    <>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>{doc.ref_no || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {doc.total_amount.toLocaleString()} {doc.currency}
                      </td>
                    </>
                  )}
                  {selectedCategory === 'onboarding' && (
                    <>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.title || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                    </>
                  )}
                  {selectedCategory === 'scopeguard' && (
                    <>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.title || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {doc.total_amount.toLocaleString()} {doc.currency}
                      </td>
                    </>
                  )}
                  {selectedCategory === 'handover' && (
                    <>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.title || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{doc.client_name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--shell-muted)' }}>{doc.doc_date || '—'}</td>
                    </>
                  )}
                  {!['invoice', 'agreement', 'proposal', 'prd', 'retainer', 'receipt', 'onboarding', 'scopeguard', 'handover'].includes(selectedCategory) && (
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
                        onClick={() => onEdit(doc.id, doc.doc_type || selectedCategory)}
                        className="export-btn export-btn--ghost"
                        style={{ padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}
                        title="Edit in form"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicate(doc.id, doc.doc_type || selectedCategory)}
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
                            onDelete(doc.id, doc.doc_type || selectedCategory);
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
                  <td colSpan={selectedCategory === 'invoice' ? 4 : 3} style={{ padding: '12px 14px', textAlign: 'right' }}>
                    Total:
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

