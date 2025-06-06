import { render, screen, fireEvent } from '@testing-library/react'
import { YoloDayDialog } from '@/components/yolo-day-dialog'
import { YoloDayDisplay } from '@/components/yolo-day-display'
import type { YoloDay } from '@/types/database'

// Mock date
const mockDate = new Date('2024-01-06')

describe('YOLO Day Components', () => {
  describe('YoloDayDialog', () => {
    const mockProps = {
      isOpen: true,
      onClose: jest.fn(),
      onConfirm: jest.fn(),
      date: mockDate,
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('renders YOLO Day dialog with fun messaging', () => {
      render(<YoloDayDialog {...mockProps} />)
      
      expect(screen.getByText('YOLO Day!')).toBeInTheDocument()
      expect(screen.getByText('No judgment, just vibes! ✨')).toBeInTheDocument()
      expect(screen.getByText('Declare YOLO Day!')).toBeInTheDocument()
    })

    it('displays the formatted date', () => {
      render(<YoloDayDialog {...mockProps} />)
      
      expect(screen.getByText(/Saturday, January 6, 2024/)).toBeInTheDocument()
    })

    it('allows selecting predefined reasons', () => {
      render(<YoloDayDialog {...mockProps} />)
      
      const celebratingButton = screen.getByText('Celebrating life!')
      fireEvent.click(celebratingButton)
      
      expect(celebratingButton).toHaveClass('bg-pink-500')
    })

    it('calls onConfirm when YOLO Day is declared', () => {
      render(<YoloDayDialog {...mockProps} />)
      
      const confirmButton = screen.getByText('Declare YOLO Day!')
      fireEvent.click(confirmButton)
      
      expect(mockProps.onConfirm).toHaveBeenCalledWith(undefined)
    })

    it('calls onClose when dialog is cancelled', () => {
      render(<YoloDayDialog {...mockProps} />)
      
      const cancelButton = screen.getByText('Maybe Later')
      fireEvent.click(cancelButton)
      
      expect(mockProps.onClose).toHaveBeenCalled()
    })
  })

  describe('YoloDayDisplay', () => {
    const mockYoloDay: YoloDay = {
      id: '1',
      user_id: 'user-1',
      date: '2024-01-06',
      reason: 'Celebrating life!',
      created_at: '2024-01-06T10:00:00Z',
    }

    const mockProps = {
      yoloDay: mockYoloDay,
      onRemove: jest.fn(),
      date: mockDate,
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('renders YOLO Day display with celebration', () => {
      render(<YoloDayDisplay {...mockProps} />)
      
      expect(screen.getByText('YOLO DAY!')).toBeInTheDocument()
      expect(screen.getByText('You\'re living your best life today!')).toBeInTheDocument()
      expect(screen.getByText('No tracking, no stress, just vibes')).toBeInTheDocument()
    })

    it('displays the reason when provided', () => {
      render(<YoloDayDisplay {...mockProps} />)
      
      expect(screen.getByText('"Celebrating life!"')).toBeInTheDocument()
    })

    it('displays the formatted date', () => {
      render(<YoloDayDisplay {...mockProps} />)
      
      expect(screen.getByText('Saturday, January 6')).toBeInTheDocument()
    })

    it('calls onRemove when back to tracking is clicked', () => {
      render(<YoloDayDisplay {...mockProps} />)
      
      const backButton = screen.getByText('Back to Tracking')
      fireEvent.click(backButton)
      
      expect(mockProps.onRemove).toHaveBeenCalled()
    })

    it('handles YOLO day without reason', () => {
      const yoloDayWithoutReason = { ...mockYoloDay, reason: null }
      render(<YoloDayDisplay {...{ ...mockProps, yoloDay: yoloDayWithoutReason }} />)
      
      expect(screen.getByText('YOLO DAY!')).toBeInTheDocument()
      expect(screen.queryByText('Today\'s vibe:')).not.toBeInTheDocument()
    })
  })
})