import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { TransactionDialog } from '@/components/portfolio/dialogs/TransactionDialog'
import { MeterReadingDialog } from '@/components/home/dialogs/MeterReadingDialog'
import { BillDialog } from '@/components/home/dialogs/BillDialog'
import { RefuelingDialog } from '@/components/vehicles/dialogs/RefuelingDialog'
import { MaintenanceDialog } from '@/components/vehicles/dialogs/MaintenanceDialog'
import { buildUtility, buildVehicle } from '@/test/factories'
import type { PlatformOption } from '@/components/portfolio/dialogs/TransactionDialog'

// Mock services used by dialogs with mutations
vi.mock('@/services/meterReadings', () => ({
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/services/utilityBills', () => ({
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/services/refuelings', () => ({
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
  getReceiptUrl: vi.fn().mockReturnValue('https://pb.example.com/receipt.jpg'),
  getTripCounterPhotoUrl: vi.fn().mockReturnValue('https://pb.example.com/trip.jpg'),
}))

vi.mock('@/services/maintenanceEvents', () => ({
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
}))

function createFile(name: string, size: number, type: string): File {
  const content = new Uint8Array(size)
  return new File([content], name, { type })
}

/** Dialog uses createPortal — file inputs are on document.body, not in container */
function getFileInputs(): HTMLInputElement[] {
  return Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"]'))
}

// Shared test data
const platforms: PlatformOption[] = [
  { id: 'plat-1', name: 'Nordnet', type: 'investment', currency: 'DKK', icon: 'nordnet.png' },
]

const utilities = [buildUtility({ name: 'Electricity', unit: 'kWh' })]
const vehicles = [buildVehicle({ name: 'Family Car', fuelType: 'Petrol' })]

describe('File Attachments Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('TransactionDialog', () => {
    it('renders FileUpload component', () => {
      renderWithProviders(
        <TransactionDialog
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          platforms={platforms}
        />,
      )

      expect(screen.getAllByText('Drop file or click to upload').length).toBeGreaterThan(0)
    })

    it('accepts image and PDF files', () => {
      renderWithProviders(
        <TransactionDialog
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          platforms={platforms}
        />,
      )

      const inputs = getFileInputs()
      expect(inputs.length).toBeGreaterThan(0)
      expect(inputs[0]!).toHaveAttribute('accept', 'image/*,.pdf')
    })
  })

  describe('MeterReadingDialog', () => {
    it('renders FileUpload component', () => {
      renderWithProviders(
        <MeterReadingDialog
          isOpen={true}
          onClose={vi.fn()}
          utilityId={utilities[0]!.id}
          utilities={utilities}
        />,
      )

      expect(screen.getAllByText('Drop file or click to upload').length).toBeGreaterThan(0)
    })

    it('accepts image and PDF files', () => {
      renderWithProviders(
        <MeterReadingDialog
          isOpen={true}
          onClose={vi.fn()}
          utilityId={utilities[0]!.id}
          utilities={utilities}
        />,
      )

      const inputs = getFileInputs()
      expect(inputs.length).toBeGreaterThan(0)
      expect(inputs[0]!).toHaveAttribute('accept', 'image/*,.pdf')
    })
  })

  describe('BillDialog', () => {
    it('renders FileUpload component', () => {
      renderWithProviders(
        <BillDialog
          isOpen={true}
          onClose={vi.fn()}
          utilityId={utilities[0]!.id}
          utilities={utilities}
        />,
      )

      expect(screen.getAllByText('Drop file or click to upload').length).toBeGreaterThan(0)
    })

    it('accepts image and PDF files', () => {
      renderWithProviders(
        <BillDialog
          isOpen={true}
          onClose={vi.fn()}
          utilityId={utilities[0]!.id}
          utilities={utilities}
        />,
      )

      const inputs = getFileInputs()
      expect(inputs.length).toBeGreaterThan(0)
      expect(inputs[0]!).toHaveAttribute('accept', 'image/*,.pdf')
    })
  })

  describe('RefuelingDialog', () => {
    it('renders two FileUpload components (receipt + trip counter)', () => {
      renderWithProviders(
        <RefuelingDialog
          isOpen={true}
          onClose={vi.fn()}
          vehicleId={vehicles[0]!.id}
          vehicles={vehicles}
          vehicleFuelType="Petrol"
        />,
      )

      const uploadTexts = screen.getAllByText('Drop file or click to upload')
      // Dialog renders desktop + mobile versions, each with 2 FileUpload instances.
      // We verify there are at least 2 upload zones.
      expect(uploadTexts.length).toBeGreaterThanOrEqual(2)
    })

    it('receipt accepts image and PDF, trip counter accepts images only', () => {
      renderWithProviders(
        <RefuelingDialog
          isOpen={true}
          onClose={vi.fn()}
          vehicleId={vehicles[0]!.id}
          vehicles={vehicles}
          vehicleFuelType="Petrol"
        />,
      )

      const inputs = getFileInputs()
      const acceptValues = inputs.map((i) => i.getAttribute('accept'))

      // Should have at least one with 'image/*,.pdf' (receipt) and one with 'image/*' (trip counter)
      expect(acceptValues).toContain('image/*,.pdf')
      expect(acceptValues).toContain('image/*')
    })

    it('renders Receipt and Odometer Photo labels', () => {
      renderWithProviders(
        <RefuelingDialog
          isOpen={true}
          onClose={vi.fn()}
          vehicleId={vehicles[0]!.id}
          vehicles={vehicles}
          vehicleFuelType="Petrol"
        />,
      )

      expect(screen.getAllByText('Receipt').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Odometer Photo').length).toBeGreaterThan(0)
    })
  })

  describe('MaintenanceDialog', () => {
    it('renders FileUpload component', () => {
      renderWithProviders(
        <MaintenanceDialog
          isOpen={true}
          onClose={vi.fn()}
          vehicleId={vehicles[0]!.id}
          vehicles={vehicles}
        />,
      )

      expect(screen.getAllByText('Drop file or click to upload').length).toBeGreaterThan(0)
    })

    it('renders Receipt label', () => {
      renderWithProviders(
        <MaintenanceDialog
          isOpen={true}
          onClose={vi.fn()}
          vehicleId={vehicles[0]!.id}
          vehicles={vehicles}
        />,
      )

      expect(screen.getAllByText('Receipt').length).toBeGreaterThan(0)
    })

    it('accepts image and PDF files', () => {
      renderWithProviders(
        <MaintenanceDialog
          isOpen={true}
          onClose={vi.fn()}
          vehicleId={vehicles[0]!.id}
          vehicles={vehicles}
        />,
      )

      const inputs = getFileInputs()
      expect(inputs.length).toBeGreaterThan(0)
      expect(inputs[0]!).toHaveAttribute('accept', 'image/*,.pdf')
    })
  })

  describe('File selection and preview', () => {
    it('file selection triggers onChange and shows filename', async () => {
      renderWithProviders(
        <TransactionDialog
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          platforms={platforms}
        />,
      )

      const fileInput = getFileInputs()[0]!
      const file = createFile('receipt.jpg', 1024, 'image/jpeg')

      const user = userEvent.setup()
      await user.upload(fileInput, file)

      // Dialog renders desktop + mobile, so filename may appear twice
      expect(screen.getAllByText('receipt.jpg').length).toBeGreaterThan(0)
    })

    it('image file shows thumbnail preview', async () => {
      renderWithProviders(
        <TransactionDialog
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          platforms={platforms}
        />,
      )

      const fileInput = getFileInputs()[0]!
      const file = createFile('photo.jpg', 2048, 'image/jpeg')

      const user = userEvent.setup()
      await user.upload(fileInput, file)

      const imgs = screen.getAllByAltText('Attached file')
      expect(imgs.length).toBeGreaterThan(0)
      expect(imgs[0]!).toHaveAttribute('src', 'blob:mock-url')
    })

    it('delete button removes attachment', async () => {
      renderWithProviders(
        <TransactionDialog
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          platforms={platforms}
        />,
      )

      const fileInput = getFileInputs()[0]!
      const file = createFile('receipt.jpg', 1024, 'image/jpeg')

      const user = userEvent.setup()
      await user.upload(fileInput, file)

      // File is shown
      expect(screen.getAllByText('receipt.jpg').length).toBeGreaterThan(0)

      // Click first delete button
      const deleteButtons = screen.getAllByRole('button', { name: 'Remove file' })
      await user.click(deleteButtons[0]!)

      // Upload zone re-appears for at least the desktop version
      expect(screen.getAllByText('Drop file or click to upload').length).toBeGreaterThan(0)
    })

    it('PDF file shows document icon instead of thumbnail', async () => {
      renderWithProviders(
        <BillDialog
          isOpen={true}
          onClose={vi.fn()}
          utilityId={utilities[0]!.id}
          utilities={utilities}
        />,
      )

      const fileInput = getFileInputs()[0]!
      const file = createFile('invoice.pdf', 5000, 'application/pdf')

      const user = userEvent.setup()
      await user.upload(fileInput, file)

      // Dialog renders desktop + mobile, so filename may appear twice
      expect(screen.getAllByText('invoice.pdf').length).toBeGreaterThan(0)
      // PDF should not show image thumbnail
      expect(screen.queryByAltText('Attached file')).not.toBeInTheDocument()
    })
  })
})
