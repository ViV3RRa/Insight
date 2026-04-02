# US-137: File Attachments Integration Across All Record Types

## Story
As the Insight platform user, I want file attachments to work consistently across all record types so that I can attach photos, receipts, and documents to any data entry.

## Dependencies
- US-031: File Upload Component
- US-045: Transaction CRUD Service
- US-082: Meter Reading CRUD Service
- US-083: Utility Bill CRUD Service
- US-109: Refueling CRUD Service
- US-110: Maintenance Event CRUD Service

## Requirements
- Verify file attachments work on all applicable record types (PRD §3.3):
  - **Transactions**: statement, confirmation
  - **Meter readings**: photo of meter display
  - **Utility bills**: scanned bill, PDF
  - **Refuelings**: receipt photo, trip counter photo
  - **Maintenance events**: receipt image
- **UI capabilities per PRD §3.3:**
  - "Attach file" button on relevant forms
  - Thumbnail previews for images
  - Download links for non-image files
  - Ability to delete attachments
- Verify file upload, preview, download, and delete in all relevant dialogs and table views

## Shared Components Used
- `FileUpload` (US-031) — in all dialogs
- File preview/download in table rows and mobile drawers

## UI Specification

**Attachment in table rows:**
```
{attachment ? (
  <a href={attachmentUrl} target="_blank" className="text-base-400 hover:text-accent-600">
    <Paperclip className="w-3.5 h-3.5" />
  </a>
) : (
  <span className="text-base-200 dark:text-base-600">—</span>
)}
```

**Thumbnail preview (images):**
```
<img src={attachmentUrl} className="w-8 h-8 rounded object-cover" />
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/home-overview.html` L462–468 — File upload drop zone in Add Reading dialog
- `design-artifacts/prototypes/home-overview.html` L522–528 — File upload in Add Bill dialog
- `design-artifacts/prototypes/portfolio-overview.html` L1363–1368 — File upload in Add Transaction dialog

## Acceptance Criteria
- [ ] Transaction attachment upload and preview works
- [ ] Meter reading attachment upload and preview works
- [ ] Utility bill attachment upload and preview works
- [ ] Refueling receipt and trip counter photo upload works
- [ ] Maintenance event receipt upload works
- [ ] Image attachments show thumbnail previews
- [ ] Non-image attachments show download links
- [ ] Attachments can be deleted/replaced in edit mode
- [ ] File URLs correct via PocketBase file API
- [ ] PRD §3.3: File attachments on all applicable record types
- [ ] PRD §14 criterion 41: File attachments work on all applicable types
- [ ] All tests pass and meet coverage target
- [ ] Integration tests verify file attachment behavior on all applicable record types

## Testing Requirements
- **Test file**: `src/test/integration/file-attachments.test.tsx`
- **Approach**: Integration tests verifying cross-component behavior
- Test file upload works on transaction records (statement/confirmation attachments)
- Test file upload works on meter reading records (photo of meter display)
- Test file upload works on utility bill records (scanned bill/PDF)
- Test file upload works on refueling records (receipt photo, trip counter photo)
- Test file upload works on maintenance event records (receipt image)
- Test image file preview renders thumbnail correctly
- Test non-image file (PDF) renders download link instead of thumbnail
- Test file download link generates correct PocketBase file URL
- Test file delete/replace in edit mode removes old attachment

## Technical Notes
- Integration/verification story — all file handling infrastructure exists in services (US-031, individual CRUD services)
- PocketBase file URL: `pb.files.getUrl(record, record.fieldName)`
- File types: images (jpg, png), PDFs, documents
- File size limits: enforce reasonable limits in FileUpload component
