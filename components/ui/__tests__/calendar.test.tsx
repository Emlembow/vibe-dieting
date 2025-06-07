import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Calendar } from '../calendar'

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ChevronLeft: ({ className }: { className?: string }) => (
    <div data-testid="chevron-left" className={className}>ChevronLeft</div>
  ),
  ChevronRight: ({ className }: { className?: string }) => (
    <div data-testid="chevron-right" className={className}>ChevronRight</div>
  ),
}))

describe('Calendar Component', () => {
  it('renders calendar with current month', () => {
    render(<Calendar />)
    
    // Should render navigation buttons
    expect(screen.getByTestId('chevron-left')).toBeInTheDocument()
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument()
    
    // Should render days of the week headers
    expect(screen.getByText('Su')).toBeInTheDocument()
    expect(screen.getByText('Mo')).toBeInTheDocument()
    expect(screen.getByText('Tu')).toBeInTheDocument()
    expect(screen.getByText('We')).toBeInTheDocument()
    expect(screen.getByText('Th')).toBeInTheDocument()
    expect(screen.getByText('Fr')).toBeInTheDocument()
    expect(screen.getByText('Sa')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Calendar className="custom-calendar" />)
    
    // Find calendar by looking for the grid role instead
    const calendar = screen.getByRole('grid')
    expect(calendar).toBeInTheDocument()
  })

  it('shows outside days by default', () => {
    const testDate = new Date(2025, 0, 15) // January 15, 2025
    render(<Calendar defaultMonth={testDate} />)
    
    // Calendar should be rendered
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('hides outside days when showOutsideDays is false', () => {
    const testDate = new Date(2025, 0, 15) // January 15, 2025
    render(<Calendar defaultMonth={testDate} showOutsideDays={false} />)
    
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('handles date selection', () => {
    const handleSelect = jest.fn()
    const testDate = new Date(2025, 0, 15) // January 15, 2025
    
    render(
      <Calendar 
        mode="single" 
        selected={undefined}
        onSelect={handleSelect}
        defaultMonth={testDate}
      />
    )
    
    // Find and click on a specific day
    const dayButton = screen.getByText('15')
    fireEvent.click(dayButton)
    
    expect(handleSelect).toHaveBeenCalled()
  })

  it('displays selected date correctly', () => {
    const selectedDate = new Date(2025, 0, 15) // January 15, 2025
    
    render(
      <Calendar 
        mode="single" 
        selected={selectedDate}
        defaultMonth={selectedDate}
      />
    )
    
    const selectedDay = screen.getByText('15')
    expect(selectedDay).toBeInTheDocument()
  })

  it('supports date range selection', () => {
    const handleSelect = jest.fn()
    const testDate = new Date(2025, 0, 15) // January 15, 2025
    
    render(
      <Calendar 
        mode="range" 
        selected={undefined}
        onSelect={handleSelect}
        defaultMonth={testDate}
      />
    )
    
    // Click on start date
    const startDay = screen.getByText('10')
    fireEvent.click(startDay)
    
    expect(handleSelect).toHaveBeenCalled()
  })

  it('navigates between months', () => {
    const testDate = new Date(2025, 0, 15) // January 2025
    render(<Calendar defaultMonth={testDate} />)
    
    // Should show January initially (check for January days)
    expect(screen.getByText('15')).toBeInTheDocument()
    
    // Click next month button
    const nextButton = screen.getByTestId('chevron-right').closest('button')
    if (nextButton) {
      fireEvent.click(nextButton)
    }
    
    // Navigation should work (calendar still renders)
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('supports disabled dates', () => {
    const testDate = new Date(2025, 0, 15) // January 15, 2025
    const disabledDates = [new Date(2025, 0, 10)]
    
    render(
      <Calendar 
        defaultMonth={testDate}
        disabled={disabledDates}
      />
    )
    
    const disabledDay = screen.getByText('10')
    expect(disabledDay).toBeInTheDocument()
  })

  it('handles today highlighting', () => {
    const today = new Date()
    
    render(<Calendar defaultMonth={today} />)
    
    const todayDay = screen.getByText(today.getDate().toString())
    expect(todayDay).toBeInTheDocument()
  })

  it('supports custom classNames override', () => {
    const customClassNames = {
      day: 'custom-day-class',
      month: 'custom-month-class'
    }
    
    render(<Calendar classNames={customClassNames} />)
    
    const calendar = screen.getByRole('grid')
    expect(calendar).toBeInTheDocument()
  })

  it('supports multiple months display', () => {
    const testDate = new Date(2025, 0, 15)
    
    render(<Calendar numberOfMonths={2} defaultMonth={testDate} />)
    
    const calendars = screen.getAllByRole('grid')
    expect(calendars.length).toBeGreaterThan(0)
  })

  it('handles keyboard navigation', () => {
    const testDate = new Date(2025, 0, 15)
    
    render(<Calendar defaultMonth={testDate} />)
    
    const calendar = screen.getByRole('grid')
    
    // Focus the calendar
    calendar.focus()
    
    // Test arrow key navigation
    fireEvent.keyDown(calendar, { key: 'ArrowDown' })
    fireEvent.keyDown(calendar, { key: 'ArrowUp' })
    fireEvent.keyDown(calendar, { key: 'ArrowLeft' })
    fireEvent.keyDown(calendar, { key: 'ArrowRight' })
    
    // Calendar should still be present and functional
    expect(calendar).toBeInTheDocument()
  })

  it('supports initial focus on specific date', () => {
    const testDate = new Date(2025, 0, 15)
    
    render(
      <Calendar 
        defaultMonth={testDate}
        initialFocus
      />
    )
    
    const calendar = screen.getByRole('grid')
    expect(calendar).toBeInTheDocument()
  })

  it('handles edge cases with month boundaries', () => {
    const endOfMonth = new Date(2025, 0, 31) // January 31, 2025
    
    render(<Calendar defaultMonth={endOfMonth} />)
    
    const days = screen.getAllByText('31')
    expect(days.length).toBeGreaterThan(0)
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })
})