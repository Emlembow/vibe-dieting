import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { YoloDayDisplay } from '../yolo-day-display'

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button data-testid="button" onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-dialog">{children}</div>,
  AlertDialogTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-dialog-trigger">{children}</div>,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-dialog-content">{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-dialog-header">{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-dialog-title">{children}</div>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-dialog-description">{children}</div>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-dialog-footer">{children}</div>,
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="alert-dialog-cancel">{children}</button>
  ),
  AlertDialogAction: ({ children, onClick }: any) => (
    <button data-testid="alert-dialog-action" onClick={onClick}>{children}</button>
  ),
}))

jest.mock('lucide-react', () => ({
  Star: () => <div data-testid="star-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  MessageCircle: () => <div data-testid="message-circle-icon" />,
}))

const mockYoloDay = {
  id: 'yolo-1',
  user_id: 'test-user',
  date: '2024-01-15',
  reason: 'Birthday celebration',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
}

const mockDate = new Date('2024-01-15')

describe('YoloDayDisplay', () => {
  const mockOnRemove = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders YOLO day information', () => {
    render(
      <YoloDayDisplay 
        yoloDay={mockYoloDay} 
        onRemove={mockOnRemove} 
        date={mockDate} 
      />
    )

    expect(screen.getByText('🎉 YOLO Day!')).toBeInTheDocument()
    expect(screen.getByText(/you're taking a break from tracking today/i)).toBeInTheDocument()
    expect(screen.getByTestId('star-icon')).toBeInTheDocument()
  })

  it('displays reason when provided', () => {
    render(
      <YoloDayDisplay 
        yoloDay={mockYoloDay} 
        onRemove={mockOnRemove} 
        date={mockDate} 
      />
    )

    expect(screen.getByText('Birthday celebration')).toBeInTheDocument()
    expect(screen.getByTestId('message-circle-icon')).toBeInTheDocument()
  })

  it('does not show reason section when reason is null', () => {
    const yoloDayWithoutReason = { ...mockYoloDay, reason: null }

    render(
      <YoloDayDisplay 
        yoloDay={yoloDayWithoutReason} 
        onRemove={mockOnRemove} 
        date={mockDate} 
      />
    )

    expect(screen.queryByTestId('message-circle-icon')).not.toBeInTheDocument()
    expect(screen.queryByText('Birthday celebration')).not.toBeInTheDocument()
  })

  it('does not show reason section when reason is empty', () => {
    const yoloDayWithEmptyReason = { ...mockYoloDay, reason: '' }

    render(
      <YoloDayDisplay 
        yoloDay={yoloDayWithEmptyReason} 
        onRemove={mockOnRemove} 
        date={mockDate} 
      />
    )

    expect(screen.queryByTestId('message-circle-icon')).not.toBeInTheDocument()
    expect(screen.queryByText('Birthday celebration')).not.toBeInTheDocument()
  })

  it('formats date correctly', () => {
    render(
      <YoloDayDisplay 
        yoloDay={mockYoloDay} 
        onRemove={mockOnRemove} 
        date={mockDate} 
      />
    )

    expect(screen.getByText('Monday, January 15, 2024')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
  })

  it('shows remove button with alert dialog', () => {
    render(
      <YoloDayDisplay 
        yoloDay={mockYoloDay} 
        onRemove={mockOnRemove} 
        date={mockDate} 
      />
    )

    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('alert-dialog-trigger')).toBeInTheDocument()
    expect(screen.getByText('Back to Tracking')).toBeInTheDocument()
  })

  it('calls onRemove when confirmation button is clicked', () => {
    render(
      <YoloDayDisplay 
        yoloDay={mockYoloDay} 
        onRemove={mockOnRemove} 
        date={mockDate} 
      />
    )

    const confirmButton = screen.getByTestId('alert-dialog-action')
    fireEvent.click(confirmButton)

    expect(mockOnRemove).toHaveBeenCalled()
  })

  it('shows correct alert dialog content', () => {
    render(
      <YoloDayDisplay 
        yoloDay={mockYoloDay} 
        onRemove={mockOnRemove} 
        date={mockDate} 
      />
    )

    expect(screen.getByText('End YOLO Day?')).toBeInTheDocument()
    expect(screen.getByText(/are you sure you want to end your yolo day/i)).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('End YOLO Day')).toBeInTheDocument()
  })

  it('applies correct button variants', () => {
    render(
      <YoloDayDisplay 
        yoloDay={mockYoloDay} 
        onRemove={mockOnRemove} 
        date={mockDate} 
      />
    )

    const removeButton = screen.getByText('Back to Tracking').closest('button')
    expect(removeButton).toHaveAttribute('data-variant', 'outline')
  })
})