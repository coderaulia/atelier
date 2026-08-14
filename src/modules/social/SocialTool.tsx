import DocumentTool from '../documents/DocumentTool'

export default function SocialTool({ className }: { className?: string }) {
  return (
    <div className={className}>
      <DocumentTool mode="social" />
    </div>
  )
}
