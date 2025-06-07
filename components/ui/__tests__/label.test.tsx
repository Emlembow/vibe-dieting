import React from 'react'
import { render, screen } from '@testing-library/react'
import { Label } from '../label'

describe('Label Component', () => {
  it('renders label correctly', () => {
    render(<Label>Test Label</Label>)
    
    const label = screen.getByText('Test Label')
    expect(label).toBeInTheDocument()
    expect(label.tagName).toBe('LABEL')
  })

  it('applies default styling classes', () => {
    render(<Label>Test Label</Label>)
    
    const label = screen.getByText('Test Label')
    expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none')
  })

  it('applies custom className', () => {
    render(<Label className="custom-label">Test Label</Label>)
    
    const label = screen.getByText('Test Label')
    expect(label).toHaveClass('custom-label')
    expect(label).toHaveClass('text-sm') // Should still have default classes
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLLabelElement>()
    render(<Label ref={ref}>Test Label</Label>)
    
    expect(ref.current).toBeInstanceOf(HTMLLabelElement)
    expect(ref.current?.textContent).toBe('Test Label')
  })

  it('passes through additional props', () => {
    render(
      <Label data-testid="custom-label" id="label-id" htmlFor="input-id">
        Test Label
      </Label>
    )
    
    const label = screen.getByTestId('custom-label')
    expect(label).toHaveAttribute('id', 'label-id')
    expect(label).toHaveAttribute('for', 'input-id')
  })

  it('handles htmlFor attribute correctly', () => {
    render(<Label htmlFor="email-input">Email Address</Label>)
    
    const label = screen.getByText('Email Address')
    expect(label).toHaveAttribute('for', 'email-input')
  })

  it('supports click events', () => {
    const handleClick = jest.fn()
    render(<Label onClick={handleClick}>Clickable Label</Label>)
    
    const label = screen.getByText('Clickable Label')
    label.click()
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('works with form controls', () => {
    render(
      <div>
        <Label htmlFor="test-input">Input Label</Label>
        <input id="test-input" type="text" />
      </div>
    )
    
    const label = screen.getByText('Input Label')
    const input = screen.getByRole('textbox')
    
    expect(label).toHaveAttribute('for', 'test-input')
    expect(input).toHaveAttribute('id', 'test-input')
    
    // Label should be properly associated with input
    expect(label).toBeInTheDocument()
    expect(input).toBeInTheDocument()
  })

  it('applies peer-disabled styles when appropriate', () => {
    render(
      <div className="peer-disabled:cursor-not-allowed">
        <Label className="peer-disabled:opacity-70">Disabled Label</Label>
        <input disabled className="peer" />
      </div>
    )
    
    const label = screen.getByText('Disabled Label')
    expect(label).toHaveClass('peer-disabled:opacity-70')
  })

  it('handles complex content', () => {
    render(
      <Label>
        <span>Required</span>
        <span className="text-red-500">*</span>
      </Label>
    )
    
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('supports custom styling variants', () => {
    render(<Label className="text-lg font-bold">Large Bold Label</Label>)
    
    const label = screen.getByText('Large Bold Label')
    expect(label).toHaveClass('text-lg', 'font-bold')
    // Custom classes should be applied
    expect(label).toHaveClass('text-lg')
  })

  it('handles empty content gracefully', () => {
    render(<Label data-testid="empty-label"></Label>)
    
    const label = screen.getByTestId('empty-label')
    expect(label).toBeInTheDocument()
    expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none')
  })

  it('supports aria attributes for accessibility', () => {
    render(
      <Label 
        htmlFor="password-input" 
        aria-describedby="password-help"
        data-testid="password-label"
      >
        Password
      </Label>
    )
    
    const label = screen.getByTestId('password-label')
    expect(label).toHaveAttribute('for', 'password-input')
    expect(label).toHaveAttribute('aria-describedby', 'password-help')
  })
})