export interface CVPdfViewerProps {
  blobUrl: string | null;
}

export function CVPdfViewer({ blobUrl }: CVPdfViewerProps) {
  if (!blobUrl) {
    return (
      <div className="cv-preview__placeholder">
        <div className="cv-preview__icon">📄</div>
        <p>Click <strong>Refresh Preview</strong> to render PDF</p>
      </div>
    );
  }
  return (
    <iframe
      src={blobUrl}
      className="cv-preview__iframe"
      title="CV Preview"
    />
  );
}
