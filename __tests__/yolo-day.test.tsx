import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { YoloDayDialog } from '../components/yolo-day-dialog'
import { YoloDayDisplay } from '../components/yolo-day-display'
import type { YoloDay } from '../types/database'

// Mock the UI components
jest.mock('../components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
  DialogContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children, className }: any) => <h2 className={className}>{children}</h2>,
  DialogFooter: ({ children, className }: any) => <div className={className}>{children}</div>,
}))

jest.mock('../components/ui/button', () => ({
  Button: ({ children, onClick, variant, className, size }: any) => (
    <button onClick={onClick} className={className} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}))

jest.mock('../components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Star: () => <div>Star Icon</div>,
  RotateCcw: () => <div>RotateCcw Icon</div>,
}))

describe('YOLO Day Components', () => {
  describe('YoloDayDialog', () => {
    const mockOnClose = jest.fn()
    const mockOnConfirm = jest.fn()
    const testDate = new Date('2024-01-05')

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('renders YOLO Day dialog with simplified messaging', () => {
      render(
        <YoloDayDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          date={testDate}
        />
      )

      expect(screen.getByText('Take a YOLO Day?')).toBeInTheDocument()
      expect(screen.getByText('Skip tracking for today. No judgment.')).toBeInTheDocument()
    })

    it('displays the formatted date', () => {
      render(
        <YoloDayDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          date={testDate}
        />
      )

      // Check for date text - may vary by timezone
      expect(screen.getByText(/Jan 4|Jan 5/)).toBeInTheDocument()
    })

    it('calls onConfirm when confirmed', () => {
      render(
        <YoloDayDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          date={testDate}
        />
      )

      const confirmButton = screen.getByText('Confirm')
      fireEvent.click(confirmButton)

      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
      expect(mockOnConfirm).toHaveBeenCalledWith()
    })

    it('calls onClose when dialog is cancelled', () => {
      render(
        <YoloDayDialog
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          date={testDate}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('YoloDayDisplay', () => {
    const mockOnRemove = jest.fn()
    const testDate = new Date('2024-01-05')
    const mockYoloDay: YoloDay = {
      id: '123',
      user_id: '456',
      date: '2024-01-05',
      reason: null,
      created_at: '2024-01-05T00:00:00Z'
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('renders YOLO Day display with simplified UI', () => {
      render(
        <YoloDayDisplay
          yoloDay={mockYoloDay}
          onRemove={mockOnRemove}
          date={testDate}
        />
      )

      expect(screen.getByText('YOLO Day')).toBeInTheDocument()
      expect(screen.getByText('Taking a break from tracking today')).toBeInTheDocument()
    })

    it('displays the formatted date', () => {
      render(
        <YoloDayDisplay
          yoloDay={mockYoloDay}
          onRemove={mockOnRemove}
          date={testDate}
        />
      )

      // Check for date text - may vary by timezone
      expect(screen.getByText(/January 4|January 5/)).toBeInTheDocument()
    })

    it('calls onRemove when resume tracking is clicked', () => {
      render(
        <YoloDayDisplay
          yoloDay={mockYoloDay}
          onRemove={mockOnRemove}
          date={testDate}
        />
      )

      const resumeButton = screen.getByText('Resume Tracking')
      fireEvent.click(resumeButton)

      expect(mockOnRemove).toHaveBeenCalledTimes(1)
    })

    it('handles YOLO day without reason', () => {
      render(
        <YoloDayDisplay
          yoloDay={mockYoloDay}
          onRemove={mockOnRemove}
          date={testDate}
        />
      )

      // Should not show any reason-related UI
      expect(screen.queryByText(/Today's vibe:/)).not.toBeInTheDocument()
    })
  })
})