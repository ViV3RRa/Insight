# US-031: FileUpload Component

## Story
As the Insight platform user, I want a file upload area in forms so that I can attach photos of meter readings, receipts, statements, and other documents to my records.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-013: Button Component

## Requirements
- Create a `FileUpload` component per PRD §3.3
- Dashed border drop zone for drag-and-drop and click-to-upload
- Shows thumbnail preview for image files
- Shows filename with icon for non-image files
- Delete button to remove attached files
- Integrates with PocketBase file field upload pattern (FormData)
- Supports common file types: images (jpg, png, webp), PDFs, documents

## Shared Components Used
- US-013: Button (for delete action)

## UI Specification

```tsx
/* === Empty state (no file attached) === */
<div
  className="
    border border-dashed border-base-200 dark:border-base-600
    rounded-lg
    bg-base-50 dark:bg-base-900
    p-6
    text-center
    cursor-pointer
    hover:border-base-300 hover:bg-base-100
    dark:hover:border-base-500 dark:hover:bg-base-800
    transition-colors duration-150
  "
  onClick={openFileDialog}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
>
  <svg className="w-8 h-8 mx-auto mb-2 text-base-300 dark:text-base-500">
    {/* CloudUpload icon from lucide-react */}
  </svg>
  <p className="text-sm text-base-400 dark:text-base-400">
    Drop file or click to upload
  </p>
  <p className="text-xs text-base-300 dark:text-base-500 mt-1">
    JPG, PNG, PDF up to 10MB
  </p>
  <input type="file" className="hidden" />
</div>

/* === Image file attached (thumbnail preview) === */
<div
  className="
    border border-base-200 dark:border-base-600
    rounded-lg
    bg-base-50 dark:bg-base-900
    p-3
  "
>
  <div className="flex items-center gap-3">
    {/* Thumbnail */}
    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-base-100 dark:bg-base-800">
      <img
        src="thumbnail-url"
        alt="Attached file"
        className="w-full h-full object-cover"
      />
    </div>

    {/* File info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-base-700 dark:text-base-300 truncate">
        meter-photo.jpg
      </p>
      <p className="text-xs text-base-300 dark:text-base-500">
        2.4 MB
      </p>
    </div>

    {/* Delete button */}
    <button
      className="
        p-1.5 rounded-lg flex-shrink-0
        text-base-300 hover:text-rose-500
        hover:bg-rose-50 dark:hover:bg-rose-900/20
        transition-colors duration-150
      "
      onClick={handleDelete}
    >
      <svg className="w-4 h-4">{/* Trash2 icon */}</svg>
    </button>
  </div>
</div>

/* === Non-image file attached (document) === */
<div
  className="
    border border-base-200 dark:border-base-600
    rounded-lg
    bg-base-50 dark:bg-base-900
    p-3
  "
>
  <div className="flex items-center gap-3">
    {/* File icon */}
    <div
      className="
        w-10 h-10 rounded-lg flex-shrink-0
        bg-base-100 dark:bg-base-800
        flex items-center justify-center
      "
    >
      <svg className="w-5 h-5 text-base-400">{/* FileText icon */}</svg>
    </div>

    {/* File info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-base-700 dark:text-base-300 truncate">
        electricity-bill-jan.pdf
      </p>
      <p className="text-xs text-base-300 dark:text-base-500">
        156 KB
      </p>
    </div>

    {/* Delete button */}
    <button
      className="
        p-1.5 rounded-lg flex-shrink-0
        text-base-300 hover:text-rose-500
        hover:bg-rose-50 dark:hover:bg-rose-900/20
        transition-colors duration-150
      "
      onClick={handleDelete}
    >
      <svg className="w-4 h-4">{/* Trash2 icon */}</svg>
    </button>
  </div>
</div>

/* === Drag-over state === */
<div
  className="
    border-2 border-dashed border-accent-400 dark:border-accent-500
    rounded-lg
    bg-accent-50/50 dark:bg-accent-900/20
    p-6
    text-center
  "
>
  <svg className="w-8 h-8 mx-auto mb-2 text-accent-500">{/* CloudUpload */}</svg>
  <p className="text-sm text-accent-600 dark:text-accent-400 font-medium">
    Drop to upload
  </p>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/home-overview.html` L462--468 -- File upload drop zone (dashed border, cloud icon, "Drop file or click to upload")
- `design-artifacts/prototypes/portfolio-overview.html` L1363--1368 -- Same upload pattern in transaction dialog

## Acceptance Criteria
- [ ] Empty state shows dashed border zone with CloudUpload icon and helper text
- [ ] Drop zone uses border-dashed border-base-200 rounded-lg bg-base-50
- [ ] Clicking the zone opens a file picker dialog
- [ ] Drag-and-drop is supported with visual feedback (accent border + bg on drag-over)
- [ ] Image files show a thumbnail preview (w-16 h-16 rounded-lg object-cover)
- [ ] Non-image files show a FileText icon with filename and size
- [ ] Delete button appears on attached files with hover:text-rose-500
- [ ] File size is displayed in human-readable format (KB, MB)
- [ ] File type hint text shows accepted formats
- [ ] Dark mode styles apply correctly
- [ ] Component calls onChange with the File object or null (on delete)
- [ ] All tests pass and meet coverage target
- [ ] File interaction tests use `userEvent.upload()` for realistic simulation

## Testing Requirements
- **Test file**: `src/components/shared/FileUpload.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test user interactions (click, keyboard) with `userEvent`
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied
- Test empty upload area renders with CloudUpload icon and helper text
- Test file selection via `userEvent.upload()` triggers `onChange` with the File object
- Test image file shows thumbnail preview (img element with object-cover)
- Test non-image file shows FileText icon with filename and size
- Test file size limit error: selecting a file exceeding `maxSizeMB` is rejected or shows an error
- Test MIME type filter: `accept` prop restricts selectable file types on the input
- Test remove/delete button calls `onChange` with null
- Test existing file URL (string value) renders as a preview

## Technical Notes
- File to create: `src/components/shared/FileUpload.tsx`
- Props: `value?: File | string` (string = existing PocketBase file URL), `onChange: (file: File | null) => void`, `accept?: string` (MIME types), `maxSizeMB?: number` (default: 10)
- For existing files from PocketBase, the `value` will be a URL string — display as thumbnail or document
- For new files selected by the user, `value` will be a File object — create a local preview URL with `URL.createObjectURL`
- The component does not handle the actual upload — it passes the File to the parent, which uses the PocketBase FormData pattern
- Export as named export: `export { FileUpload }`
