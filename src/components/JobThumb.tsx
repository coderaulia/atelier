import { useEffect, useState } from 'react'

/**
 * Thumbnail preview for a File. Creates a single object URL per file and
 * revokes it on unmount/file change, preventing blob URL leaks on re-render.
 */
export default function JobThumb({
  file,
  alt,
  className
}: {
  file: File
  alt: string
  className?: string
}) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  if (!url) return null
  return <img src={url} alt={alt} className={className} />
}
