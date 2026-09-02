import { useState, useCallback, useEffect } from 'react';
import {
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument as apiDeleteDocument,
  duplicateDocument as apiDuplicateDocument,
  type StoredDocumentItem,
} from '../../lib/api';
import { getInvoiceCalculations } from './helpers/invoiceCalc';

export function extractDocumentMetadata(docType: string, data: any) {
  let refNo: string | null = null;
  let title: string | null = null;
  let clientName: string | null = null;
  let docDate: string | null = null;
  let totalAmount = 0;
  const currency = data?.currency || 'USD';

  switch (docType) {
    case 'invoice':
      refNo = data.invoiceNo || null;
      title = data.projectRef || data.invoiceNo || 'Invoice';
      clientName = data.clientName || null;
      docDate = data.issuedAt || null;
      totalAmount = getInvoiceCalculations(data).grandTotal;
      break;

    case 'agreement':
      refNo = data.refNo || null;
      title = data.title || 'Agreement';
      clientName = data.clientName || null;
      docDate = data.date || null;
      break;

    case 'proposal':
      refNo = data.refNo || null;
      title = data.title || 'Proposal';
      clientName = data.clientName || null;
      docDate = data.date || null;
      break;

    case 'prd':
      title = data.title || 'Product Requirements Document';
      docDate = data.date || null;
      clientName = data.author || null;
      break;

    case 'retainer':
      title = `Retainer — ${data.clientName || 'Client'}`;
      clientName = data.clientName || null;
      docDate = data.startDate || null;
      totalAmount = Number(data.monthlyFee) || 0;
      break;

    case 'receipt':
      refNo = data.receiptNo || null;
      title = data.itemDescription || 'Receipt';
      clientName = data.clientName || null;
      docDate = data.paymentDate || null;
      totalAmount = Number(data.amount) || 0;
      break;

    case 'onboarding':
      title = data.projectName || 'Client Onboarding';
      clientName = data.clientName || null;
      docDate = data.startDate || null;
      break;

    case 'scopeguard':
      title = `Scope Guard — ${data.projectName || 'Project'}`;
      clientName = data.clientName || null;
      totalAmount = Number(data.additionalRevisionRate) || 0;
      break;

    case 'handover':
      title = `Handover — ${data.projectName || 'Project'}`;
      clientName = data.clientName || null;
      docDate = data.handoverDate || null;
      break;

    default:
      title = data.title || docType;
      break;
  }

  return {
    ref_no: refNo,
    title,
    client_name: clientName,
    doc_date: docDate,
    total_amount: totalAmount,
    currency,
  };
}

export function useDocumentStore(currentDocType: string) {
  const [items, setItems] = useState<StoredDocumentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const fetchItems = useCallback(async (type?: string, status?: string, q?: string) => {
    setIsLoading(true);
    try {
      const res = await listDocuments({
        type: type || (currentDocType !== 'social' && currentDocType !== 'quote' ? currentDocType : undefined),
        status: status && status !== 'all' ? status : undefined,
        q: q || undefined,
        limit: 100,
      });
      setItems(res.items || []);
      setTotalCount(res.total || 0);
    } catch {
      // Offline fallback: ignore network error
      setItems([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentDocType]);

  useEffect(() => {
    if (currentDocType && currentDocType !== 'social' && currentDocType !== 'quote') {
      fetchItems(currentDocType);
    }
  }, [currentDocType, fetchItems]);

  const save = async (docType: string, data: any, variant: string = 'classic', status: 'draft' | 'final' = 'draft') => {
    const meta = extractDocumentMetadata(docType, data);
    const payload = {
      doc_type: docType,
      ...meta,
      status,
      variant,
      data,
    };

    if (activeDocumentId) {
      const updated = await updateDocument(activeDocumentId, payload);
      await fetchItems(docType);
      return updated;
    } else {
      const created = await createDocument(payload);
      setActiveDocumentId(created.id);
      await fetchItems(docType);
      return created;
    }
  };

  const load = async (id: string) => {
    const doc = await getDocument(id);
    setActiveDocumentId(doc.id);
    return doc;
  };

  const remove = async (id: string) => {
    await apiDeleteDocument(id);
    if (activeDocumentId === id) {
      setActiveDocumentId(null);
    }
    await fetchItems(currentDocType);
  };

  const duplicate = async (id: string) => {
    const copy = await apiDuplicateDocument(id);
    await fetchItems(currentDocType);
    return copy;
  };

  return {
    items,
    totalCount,
    isLoading,
    activeDocumentId,
    setActiveDocumentId,
    fetchItems,
    save,
    load,
    remove,
    duplicate,
  };
}
