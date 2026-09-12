import { useState, useEffect } from 'react';
import { parseCSV, autoMapHeaders, constructRowData, convertPngToPdf, DOCUMENT_FIELDS } from '../bulk-utils';

export interface BulkQueueItem {
  id: string;
  name: string;
  data: any;
  status: 'pending' | 'processing' | 'done' | 'error';
  url?: string;
}

export interface UseBulkCSVOptions {
  docType: string;
  defaults: any;
  paper: string;
  plan: string | null;
  increment: () => void;
}

export function useBulkCSV({ docType, defaults, paper, plan, increment }: UseBulkCSVOptions) {
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [bulkExportFormat, setBulkExportFormat] = useState<'png' | 'pdf'>('pdf');
  const [bulkQueue, setBulkQueue] = useState<BulkQueueItem[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgressIndex, setBulkProgressIndex] = useState(-1);

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) {
        alert('CSV must have headers and at least one row.');
        return;
      }
      const headers = rows[0].map((h) => h.trim());
      const dataRows = rows.slice(1);
      setCsvHeaders(headers);
      setCsvRows(dataRows);
      const fields = DOCUMENT_FIELDS[docType] || [];
      setMappings(autoMapHeaders(headers, fields));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const startBulkGeneration = async () => {
    if (csvRows.length === 0) return;
    let itemsToProcess = [...csvRows];
    if (plan !== 'pro') {
      if (csvRows.length > 3) {
        itemsToProcess = csvRows.slice(0, 3);
        alert('Free plan limited to 3 items per bulk run. Upgrade to Pro for unlimited.');
      }
    }
    const newQueue: BulkQueueItem[] = itemsToProcess.map((row, idx) => {
      const rowData = constructRowData(row, csvHeaders, mappings, docType, defaults);
      const fileName = `${docType}-${rowData.invoiceNo || rowData.title || rowData.clientName || idx}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-');
      return { id: `item-${idx}`, name: fileName, data: rowData, status: 'pending' };
    });
    setBulkQueue(newQueue);
    setBulkProcessing(true);
    setBulkProgressIndex(0);
  };

  useEffect(() => {
    if (!bulkProcessing || bulkProgressIndex < 0 || bulkProgressIndex >= bulkQueue.length) {
      if (bulkProcessing && bulkProgressIndex === bulkQueue.length) {
        (async () => {
          const { default: JSZip } = await import('jszip');
          const zip = new JSZip();
          for (const item of bulkQueue) {
            if (item.status === 'done' && item.url) {
              const res = await fetch(item.url);
              const blob = await res.blob();
              zip.file(`${item.name}.${bulkExportFormat === 'pdf' ? 'pdf' : 'png'}`, blob);
            }
          }
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const url = URL.createObjectURL(zipBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `bulk-${docType}-${new Date().toISOString().slice(0, 10)}.zip`;
          a.click();
          URL.revokeObjectURL(url);
          setBulkProcessing(false);
        })();
      }
      return;
    }

    let isMounted = true;
    const processItem = async () => {
      setBulkQueue((prev) =>
        prev.map((q, idx) => (idx === bulkProgressIndex ? { ...q, status: 'processing' } : q))
      );
      try {
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const { captureImage } = await import('../utils');
        const dataUrl = await captureImage('#bulk-paper-target', 'png');
        if (!dataUrl) throw new Error('Capture failed');

        let fileBlob: Blob;
        if (bulkExportFormat === 'pdf') {
          fileBlob = await convertPngToPdf(dataUrl, paper as any);
        } else {
          const res = await fetch(dataUrl);
          fileBlob = await res.blob();
        }

        const objectUrl = URL.createObjectURL(fileBlob);
        if (isMounted) {
          setBulkQueue((prev) =>
            prev.map((q, idx) => (idx === bulkProgressIndex ? { ...q, status: 'done', url: objectUrl } : q))
          );
          increment();
          setBulkProgressIndex((prev) => prev + 1);
        }
      } catch (err) {
        if (isMounted) {
          setBulkQueue((prev) =>
            prev.map((q, idx) => (idx === bulkProgressIndex ? { ...q, status: 'error' } : q))
          );
          setBulkProgressIndex((prev) => prev + 1);
        }
      }
    };
    processItem();
    return () => {
      isMounted = false;
    };
  }, [bulkProgressIndex, bulkProcessing]);

  return {
    csvHeaders,
    csvRows,
    mappings,
    setMappings,
    bulkExportFormat,
    setBulkExportFormat,
    bulkQueue,
    bulkProcessing,
    bulkProgressIndex,
    handleBulkUpload,
    startBulkGeneration,
  };
}
