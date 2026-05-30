import './tool-skeleton.css'

export default function ToolSkeleton() {
  return (
    <div className="tool-skeleton" aria-label="Loading tool">
      <div className="tool-skeleton__panel">
        <div className="tool-skeleton__line tool-skeleton__line--title" />
        <div className="tool-skeleton__line" />
        <div className="tool-skeleton__dropzone" />
        <div className="tool-skeleton__controls">
          <div className="tool-skeleton__pill" />
          <div className="tool-skeleton__pill" />
        </div>
      </div>
      <div className="tool-skeleton__panel tool-skeleton__panel--preview">
        <div className="tool-skeleton__preview" />
        <div className="tool-skeleton__line" />
        <div className="tool-skeleton__line tool-skeleton__line--short" />
      </div>
    </div>
  )
}
