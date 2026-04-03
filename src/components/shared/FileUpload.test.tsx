import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent, fireEvent } from '@/test/utils'
import { FileUpload } from './FileUpload'

function createFile(name: string, size: number, type: string): File {
  const content = new Uint8Array(size)
  return new File([content], name, { type })
}

describe('FileUpload', () => {
  describe('empty state', () => {
    it('renders upload zone with CloudUpload icon', () => {
      const onChange = vi.fn()
      renderWithProviders(<FileUpload onChange={onChange} />)
      expect(screen.getByText('Drop file or click to upload')).toBeInTheDocument()
    })

    it('shows accepted formats hint', () => {
      const onChange = vi.fn()
      renderWithProviders(<FileUpload onChange={onChange} />)
      expect(screen.getByText('JPG, PNG, PDF up to 10MB')).toBeInTheDocument()
    })

    it('shows custom maxSizeMB in hint text', () => {
      const onChange = vi.fn()
      renderWithProviders(<FileUpload onChange={onChange} maxSizeMB={5} />)
      expect(screen.getByText('JPG, PNG, PDF up to 5MB')).toBeInTheDocument()
    })

    it('renders with dashed border classes', () => {
      const onChange = vi.fn()
      renderWithProviders(<FileUpload onChange={onChange} />)
      const zone = screen.getByRole('button')
      expect(zone.className).toContain('border-dashed')
      expect(zone.className).toContain('border-base-200')
    })

    it('renders with dark mode classes', () => {
      const onChange = vi.fn()
      renderWithProviders(<FileUpload onChange={onChange} />)
      const zone = screen.getByRole('button')
      expect(zone.className).toContain('dark:border-base-600')
      expect(zone.className).toContain('dark:bg-base-900')
    })

    it('has a hidden file input', () => {
      const onChange = vi.fn()
      const { container } = renderWithProviders(<FileUpload onChange={onChange} />)
      const input = container.querySelector('input[type="file"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('hidden')
    })

    it('passes accept prop to file input', () => {
      const onChange = vi.fn()
      const { container } = renderWithProviders(
        <FileUpload onChange={onChange} accept="image/*" />,
      )
      const input = container.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('accept', 'image/*')
    })
  })

  describe('file selection', () => {
    it('calls onChange with File on selection via upload', async () => {
      const onChange = vi.fn()
      const { container } = renderWithProviders(<FileUpload onChange={onChange} />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      const file = createFile('test.jpg', 1024, 'image/jpeg')
      const user = userEvent.setup()
      await user.upload(input, file)

      expect(onChange).toHaveBeenCalledWith(file)
    })

    it('rejects files exceeding maxSizeMB', async () => {
      const onChange = vi.fn()
      const { container } = renderWithProviders(
        <FileUpload onChange={onChange} maxSizeMB={1} />,
      )
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      const largeFile = createFile('big.jpg', 2 * 1024 * 1024, 'image/jpeg')
      const user = userEvent.setup()
      await user.upload(input, largeFile)

      expect(onChange).not.toHaveBeenCalled()
      expect(screen.getByText('File exceeds 1MB limit')).toBeInTheDocument()
    })
  })

  describe('drag and drop', () => {
    it('shows drag-over state on dragover', () => {
      const onChange = vi.fn()
      renderWithProviders(<FileUpload onChange={onChange} />)
      const zone = screen.getByRole('button')

      fireEvent.dragOver(zone)

      expect(screen.getByText('Drop to upload')).toBeInTheDocument()
    })

    it('applies accent styling during drag-over', () => {
      const onChange = vi.fn()
      renderWithProviders(<FileUpload onChange={onChange} />)
      const zone = screen.getByRole('button')

      fireEvent.dragOver(zone)

      expect(zone.className).toContain('border-accent-400')
      expect(zone.className).toContain('border-2')
    })

    it('reverts on drag leave', () => {
      const onChange = vi.fn()
      renderWithProviders(<FileUpload onChange={onChange} />)
      const zone = screen.getByRole('button')

      fireEvent.dragOver(zone)
      fireEvent.dragLeave(zone)

      expect(screen.getByText('Drop file or click to upload')).toBeInTheDocument()
    })

    it('calls onChange with dropped file', () => {
      const onChange = vi.fn()
      renderWithProviders(<FileUpload onChange={onChange} />)
      const zone = screen.getByRole('button')

      const file = createFile('dropped.png', 500, 'image/png')
      fireEvent.drop(zone, {
        dataTransfer: { files: [file] },
      })

      expect(onChange).toHaveBeenCalledWith(file)
    })
  })

  describe('image file attached', () => {
    it('shows thumbnail preview for image files', () => {
      const onChange = vi.fn()
      const file = createFile('photo.jpg', 2400000, 'image/jpeg')
      renderWithProviders(<FileUpload value={file} onChange={onChange} />)

      const img = screen.getByAltText('Attached file')
      expect(img).toBeInTheDocument()
      expect(img).toHaveClass('object-cover')
    })

    it('shows filename for image files', () => {
      const onChange = vi.fn()
      const file = createFile('photo.jpg', 2400000, 'image/jpeg')
      renderWithProviders(<FileUpload value={file} onChange={onChange} />)

      expect(screen.getByText('photo.jpg')).toBeInTheDocument()
    })

    it('shows file size in human-readable format', () => {
      const onChange = vi.fn()
      const file = createFile('photo.jpg', 2400000, 'image/jpeg')
      renderWithProviders(<FileUpload value={file} onChange={onChange} />)

      expect(screen.getByText('2.3 MB')).toBeInTheDocument()
    })

    it('shows delete button', () => {
      const onChange = vi.fn()
      const file = createFile('photo.jpg', 1024, 'image/jpeg')
      renderWithProviders(<FileUpload value={file} onChange={onChange} />)

      expect(screen.getByRole('button', { name: 'Remove file' })).toBeInTheDocument()
    })

    it('calls onChange with null on delete', async () => {
      const onChange = vi.fn()
      const file = createFile('photo.jpg', 1024, 'image/jpeg')
      renderWithProviders(<FileUpload value={file} onChange={onChange} />)

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Remove file' }))

      expect(onChange).toHaveBeenCalledWith(null)
    })

    it('thumbnail container has w-16 h-16 rounded-lg classes', () => {
      const onChange = vi.fn()
      const file = createFile('photo.jpg', 1024, 'image/jpeg')
      renderWithProviders(<FileUpload value={file} onChange={onChange} />)

      const img = screen.getByAltText('Attached file')
      const container = img.parentElement!
      expect(container).toHaveClass('w-16', 'h-16', 'rounded-lg', 'overflow-hidden')
    })
  })

  describe('non-image file attached', () => {
    it('shows FileText icon for non-image files', () => {
      const onChange = vi.fn()
      const file = createFile('document.pdf', 156000, 'application/pdf')
      renderWithProviders(<FileUpload value={file} onChange={onChange} />)

      expect(screen.queryByAltText('Attached file')).not.toBeInTheDocument()
      expect(screen.getByText('document.pdf')).toBeInTheDocument()
    })

    it('shows file size for non-image files', () => {
      const onChange = vi.fn()
      const file = createFile('document.pdf', 156000, 'application/pdf')
      renderWithProviders(<FileUpload value={file} onChange={onChange} />)

      expect(screen.getByText('152.3 KB')).toBeInTheDocument()
    })

    it('shows delete button for non-image files', () => {
      const onChange = vi.fn()
      const file = createFile('document.pdf', 156000, 'application/pdf')
      renderWithProviders(<FileUpload value={file} onChange={onChange} />)

      expect(screen.getByRole('button', { name: 'Remove file' })).toBeInTheDocument()
    })
  })

  describe('existing file URL (string value)', () => {
    it('renders as image preview for image URLs', () => {
      const onChange = vi.fn()
      renderWithProviders(
        <FileUpload value="https://pb.example.com/files/photo.jpg" onChange={onChange} />,
      )

      const img = screen.getByAltText('Attached file')
      expect(img).toHaveAttribute('src', 'https://pb.example.com/files/photo.jpg')
    })

    it('renders as document for non-image URLs', () => {
      const onChange = vi.fn()
      renderWithProviders(
        <FileUpload value="https://pb.example.com/files/report.pdf" onChange={onChange} />,
      )

      expect(screen.queryByAltText('Attached file')).not.toBeInTheDocument()
      expect(screen.getByText('report.pdf')).toBeInTheDocument()
    })

    it('does not show file size for string URLs', () => {
      const onChange = vi.fn()
      renderWithProviders(
        <FileUpload value="https://pb.example.com/files/photo.jpg" onChange={onChange} />,
      )

      // Only filename should show, no size
      expect(screen.getByText('photo.jpg')).toBeInTheDocument()
    })

    it('shows delete button for existing files', () => {
      const onChange = vi.fn()
      renderWithProviders(
        <FileUpload value="https://pb.example.com/files/photo.jpg" onChange={onChange} />,
      )

      expect(screen.getByRole('button', { name: 'Remove file' })).toBeInTheDocument()
    })
  })

  describe('delete button styling', () => {
    it('has correct hover classes', () => {
      const onChange = vi.fn()
      const file = createFile('test.jpg', 1024, 'image/jpeg')
      renderWithProviders(<FileUpload value={file} onChange={onChange} />)

      const btn = screen.getByRole('button', { name: 'Remove file' })
      expect(btn.className).toContain('hover:text-rose-500')
      expect(btn.className).toContain('hover:bg-rose-50')
      expect(btn.className).toContain('dark:hover:bg-rose-900/20')
    })
  })

  describe('keyboard interaction', () => {
    it('opens file dialog on Enter key', () => {
      const onChange = vi.fn()
      const { container } = renderWithProviders(<FileUpload onChange={onChange} />)
      const zone = screen.getByRole('button')
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      fireEvent.keyDown(zone, { key: 'Enter' })
      expect(clickSpy).toHaveBeenCalled()
    })

    it('opens file dialog on Space key', () => {
      const onChange = vi.fn()
      const { container } = renderWithProviders(<FileUpload onChange={onChange} />)
      const zone = screen.getByRole('button')
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      fireEvent.keyDown(zone, { key: ' ' })
      expect(clickSpy).toHaveBeenCalled()
    })
  })

  describe('attached state border', () => {
    it('uses solid border (not dashed) when file is attached', () => {
      const onChange = vi.fn()
      const file = createFile('test.jpg', 1024, 'image/jpeg')
      const { container } = renderWithProviders(
        <FileUpload value={file} onChange={onChange} />,
      )

      const wrapper = container.firstElementChild!
      expect(wrapper.className).toContain('border-base-200')
      expect(wrapper.className).not.toContain('border-dashed')
    })
  })
})
