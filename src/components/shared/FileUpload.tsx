import { useRef, useState, useCallback, useEffect, type DragEvent } from 'react'
import { CloudUpload, FileText, Trash2 } from 'lucide-react'

interface FileUploadProps {
  value?: File | string
  onChange: (file: File | null) => void
  accept?: string
  maxSizeMB?: number
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImageFile(file: File | string): boolean {
  if (typeof file === 'string') {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
  }
  return file.type.startsWith('image/')
}

function getFileName(file: File | string): string {
  if (typeof file === 'string') {
    const parts = file.split('/')
    return parts[parts.length - 1] ?? file
  }
  return file.name
}

function getFileSize(file: File | string): string | null {
  if (typeof file === 'string') return null
  return formatFileSize(file.size)
}

function getPreviewUrl(file: File | string): string {
  if (typeof file === 'string') return file
  return URL.createObjectURL(file)
}

function FileUpload({ value, onChange, accept, maxSizeMB = 10 }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (value) {
      const url = getPreviewUrl(value)
      setPreviewUrl(url)
      return () => {
        if (typeof value !== 'string') {
          URL.revokeObjectURL(url)
        }
      }
    }
    setPreviewUrl(null)
  }, [value])

  const validateAndSet = useCallback(
    (file: File) => {
      const maxBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxBytes) {
        setSizeError(`File exceeds ${maxSizeMB}MB limit`)
        return
      }
      setSizeError(null)
      onChange(file)
    },
    [maxSizeMB, onChange],
  )

  function handleClick() {
    inputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSet(file)
    }
    // Reset input so re-selecting the same file triggers change
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      validateAndSet(file)
    }
  }

  function handleDelete() {
    setSizeError(null)
    onChange(null)
  }

  // File attached state
  if (value && !sizeError) {
    const isImage = isImageFile(value)
    const fileName = getFileName(value)
    const fileSize = getFileSize(value)

    return (
      <div className="border border-base-200 dark:border-base-600 rounded-lg bg-base-50 dark:bg-base-900 p-3">
        <div className="flex items-center gap-3">
          {isImage && previewUrl ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-base-100 dark:bg-base-800">
              <img
                src={previewUrl}
                alt="Attached file"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg flex-shrink-0 bg-base-100 dark:bg-base-800 flex items-center justify-center">
              <FileText className="w-5 h-5 text-base-400" aria-hidden="true" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-base-700 dark:text-base-300 truncate">
              {fileName}
            </p>
            {fileSize && (
              <p className="text-xs text-base-300 dark:text-base-500">{fileSize}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 rounded-lg flex-shrink-0 text-base-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors duration-150"
            aria-label="Remove file"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  }

  // Empty / drag-over state
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={
          isDragOver
            ? 'border-2 border-dashed border-accent-400 dark:border-accent-500 rounded-lg bg-accent-50/50 dark:bg-accent-900/20 p-6 text-center'
            : 'border border-dashed border-base-200 dark:border-base-600 rounded-lg bg-base-50 dark:bg-base-900 p-6 text-center cursor-pointer hover:border-base-300 hover:bg-base-100 dark:hover:border-base-500 dark:hover:bg-base-800 transition-colors duration-150'
        }
      >
        <CloudUpload
          className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-accent-500' : 'text-base-300 dark:text-base-500'}`}
          aria-hidden="true"
        />
        {isDragOver ? (
          <p className="text-sm text-accent-600 dark:text-accent-400 font-medium">
            Drop to upload
          </p>
        ) : (
          <>
            <p className="text-sm text-base-400 dark:text-base-400">
              Drop file or click to upload
            </p>
            <p className="text-xs text-base-300 dark:text-base-500 mt-1">
              JPG, PNG, PDF up to {maxSizeMB}MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
          tabIndex={-1}
        />
      </div>
      {sizeError && (
        <p className="text-xs text-rose-500 mt-1">{sizeError}</p>
      )}
    </div>
  )
}

export { FileUpload }
export type { FileUploadProps }
