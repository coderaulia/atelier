interface Props {
  isLight: boolean
  onToggle: () => void
}

export default function PDFThemeToggle({ isLight, onToggle }: Props) {
  return <button type="button" className="pdf-theme-toggle" onClick={onToggle} aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}>
    {isLight ? 'Dark' : 'Light'}
  </button>
}
