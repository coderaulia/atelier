---
name: client-side-workers
description: Guide and patterns for offloading heavy client-side computations (PDF rendering/export, Tesseract OCR, image processing with JSQuash/Canvas) to Web Workers while preventing memory leaks and UI freezes.
---

# Client-Side Worker & Heavy Processing Guide

## Core Principles
1. **Never block the main UI thread**: Any task taking >50ms (OCR, PDF compilation, image re-encoding, large ZIP packaging) must execute in a Web Worker or be sliced into non-blocking chunks.
2. **Deterministic memory lifecycle**: Always clean up binary buffers, revoke blob URLs, and terminate idle single-use workers to prevent memory leaks in long sessions.
3. **Graceful degradation & progress feedback**: Provide cancellable jobs, typed error boundaries, and real-time progress callbacks (0-100%).

---

## 1. Web Worker Architecture in Vite
In Vite / React environments, instantiate typed module workers using standard ESM URLs:

```typescript
// Worker instantiation
const worker = new Worker(
  new URL('../workers/image-processor.worker.ts', import.meta.url),
  { type: 'module' }
);
```

### Communication Contract
Always structure worker messages with explicit action types, payload, and job IDs:

```typescript
export interface WorkerRequest<T = unknown> {
  id: string;
  type: 'CONVERT_IMAGE' | 'PARSE_PDF' | 'RUN_OCR';
  payload: T;
}

export interface WorkerResponse<T = unknown> {
  id: string;
  success: boolean;
  progress?: number;
  data?: T;
  error?: string;
}
```

---

## 2. Specific Processing Engines

### A. Tesseract.js (OCR)
- **Worker Pooling**: Reuse a single initialized `createWorker` instance across sequential OCR operations rather than re-downloading traineddata models.
- **Explicit Disposal**: Call `await worker.terminate()` only when unmounting the tool view or when memory pressure requires teardown.
- **Worker Initialization Options**:
  ```typescript
  import { createWorker } from 'tesseract.js';

  const worker = await createWorker('eng+ind', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        onProgress(Math.round(m.progress * 100));
      }
    }
  });
  ```

### B. PDF Processing (`pdfjs-dist` & `pdf-lib`)
- **Worker Source Configuration**: Ensure `pdfjsLib.GlobalWorkerOptions.workerSrc` points to the bundled/configured worker URL to avoid synchronous main-thread rendering.
- **Page-by-Page Rendering**: When rendering multi-page PDFs to images, render pages sequentially with canvas reuse to avoid unbounded GPU texture allocations.
- **CancellationToken**: Always pass a render cancellation token to cancel previous render jobs when the user zooms, changes page, or swaps files.

### C. Image Conversions (`@jsquash/avif`, `@jsquash/webp`, Canvas)
- **Transferable Objects**: Pass `ArrayBuffer` instances via transferable object arrays in `postMessage(data, [data.buffer])` to avoid zero-copy overhead.
- **Canvas Memory Cleanup**:
  ```typescript
  // Free canvas bitmap resources
  canvas.width = 0;
  canvas.height = 0;
  ```

---

## 3. Blob & Object URL Hygiene
- **Immediate Revocation**: Call `URL.revokeObjectURL(blobUrl)` as soon as the user completes the download or the image preview element unmounts.
- **Cleanup Hook Pattern**:
  ```typescript
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  ```

---

## 4. Verification & Debugging Checklist
- [ ] Profiler check: Main thread stays responsive (60fps) during heavy processing.
- [ ] Memory check: Heap snapshots do not retain detached canvas elements or dangling ArrayBuffers.
- [ ] Cancellation: Aborting an ongoing task stops worker computation immediately.
- [ ] Error boundary: Worker crash/OOM displays an actionable retry banner instead of crashing the UI.
