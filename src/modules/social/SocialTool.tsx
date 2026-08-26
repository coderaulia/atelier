import DocumentTool from '../documents/DocumentTool'

export default function SocialTool({ className }: { className?: string }) {
  return (
    <div className={`document-tool-wrapper ${className || ''}`} style={{ width: '100%', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <DocumentTool mode="social" />
    </div>
  )
}
