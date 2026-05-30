import DocumentTool from './DocumentTool'

export default function DocumentGeneratorTool({ className }: { className?: string }) {
  return (
    <div className={className}>
      <DocumentTool mode="documents" />
    </div>
  )
}

export { DocumentGeneratorTool }
