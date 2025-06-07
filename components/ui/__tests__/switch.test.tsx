import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Switch } from '../switch'

describe('Switch Component', () => {
  it('renders switch element', () => {
    render(<Switch data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toHaveRole('switch')
  })

  it('handles default unchecked state', () => {
    render(<Switch data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveAttribute('aria-checked', 'false')
    expect(switchElement).toHaveAttribute('data-state', 'unchecked')
  })

  it('handles checked state', () => {
    render(<Switch checked data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveAttribute('aria-checked', 'true')
    expect(switchElement).toHaveAttribute('data-state', 'checked')
  })

  it('handles disabled state', () => {
    render(<Switch disabled data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toBeDisabled()
    expect(switchElement).toHaveAttribute('data-disabled', '')
  })

  it('calls onCheckedChange when clicked', () => {
    const handleChange = jest.fn()
    render(<Switch onCheckedChange={handleChange} data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    fireEvent.click(switchElement)
    
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('does not call onCheckedChange when disabled', () => {
    const handleChange = jest.fn()
    render(<Switch disabled onCheckedChange={handleChange} data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    fireEvent.click(switchElement)
    
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Switch className="custom-switch" data-testid="switch" />)
    
    expect(screen.getByTestId('switch')).toHaveClass('custom-switch')
  })

  it('forwards additional props', () => {
    render(<Switch id="my-switch" title="Toggle switch" data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveAttribute('id', 'my-switch')
    expect(switchElement).toHaveAttribute('title', 'Toggle switch')
  })

  it('handles controlled component pattern', () => {
    const handleChange = jest.fn()
    const { rerender } = render(
      <Switch checked={false} onCheckedChange={handleChange} data-testid="switch" />
    )
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveAttribute('aria-checked', 'false')
    
    // Click to trigger change
    fireEvent.click(switchElement)
    expect(handleChange).toHaveBeenCalledWith(true)
    
    // Rerender with new checked state
    rerender(<Switch checked={true} onCheckedChange={handleChange} data-testid="switch" />)
    expect(switchElement).toHaveAttribute('aria-checked', 'true')
  })

  it('handles uncontrolled component pattern', () => {
    const handleChange = jest.fn()
    render(<Switch defaultChecked={false} onCheckedChange={handleChange} data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveAttribute('aria-checked', 'false')
    
    // Click to change state
    fireEvent.click(switchElement)
    expect(handleChange).toHaveBeenCalledWith(true)
    expect(switchElement).toHaveAttribute('aria-checked', 'true')
    
    // Click again to toggle back
    fireEvent.click(switchElement)
    expect(handleChange).toHaveBeenCalledWith(false)
    expect(switchElement).toHaveAttribute('aria-checked', 'false')
  })

  it('handles keyboard interactions', () => {
    const handleChange = jest.fn()
    render(<Switch onCheckedChange={handleChange} data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    
    // Test Enter key
    fireEvent.keyDown(switchElement, { key: 'Enter' })
    expect(handleChange).toHaveBeenCalledWith(true)
    
    // Test Space key
    fireEvent.keyDown(switchElement, { key: ' ' })
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('has proper accessibility attributes', () => {
    render(
      <div>
        <label htmlFor="settings-switch">Enable notifications</label>
        <Switch id="settings-switch" data-testid="switch" />
      </div>
    )
    
    const switchElement = screen.getByTestId('switch')
    const label = screen.getByText('Enable notifications')
    
    expect(switchElement).toHaveAttribute('role', 'switch')
    expect(switchElement).toHaveAttribute('id', 'settings-switch')
    expect(label).toHaveAttribute('for', 'settings-switch')
  })

  it('handles focus states', () => {
    render(<Switch data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    
    // Focus the switch
    switchElement.focus()
    expect(document.activeElement).toBe(switchElement)
    
    // Should be focusable by default
    expect(switchElement).toHaveAttribute('tabindex', '0')
  })

  it('renders with initial checked state from defaultChecked', () => {
    render(<Switch defaultChecked={true} data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveAttribute('aria-checked', 'true')
    expect(switchElement).toHaveAttribute('data-state', 'checked')
  })

  it('handles rapid clicking', () => {
    const handleChange = jest.fn()
    render(<Switch onCheckedChange={handleChange} data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    
    // Rapid clicks
    fireEvent.click(switchElement)
    fireEvent.click(switchElement)
    fireEvent.click(switchElement)
    
    expect(handleChange).toHaveBeenCalledTimes(3)
    expect(handleChange).toHaveBeenNthCalledWith(1, true)
    expect(handleChange).toHaveBeenNthCalledWith(2, false)
    expect(handleChange).toHaveBeenNthCalledWith(3, true)
  })

  describe('Integration tests', () => {
    it('works with form labels', () => {
      const handleChange = jest.fn()
      render(
        <div>
          <label htmlFor="notifications">
            Enable email notifications
            <Switch id="notifications" onCheckedChange={handleChange} data-testid="switch" />
          </label>
        </div>
      )
      
      const label = screen.getByText('Enable email notifications')
      const switchElement = screen.getByTestId('switch')
      
      // Clicking label should trigger switch
      fireEvent.click(label)
      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('works in a settings form', () => {
      const settings = {
        notifications: false,
        darkMode: true,
        autoSave: false,
      }
      
      const handleNotificationChange = jest.fn()
      const handleDarkModeChange = jest.fn()
      const handleAutoSaveChange = jest.fn()
      
      render(
        <form>
          <div>
            <label htmlFor="notifications">Notifications</label>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={handleNotificationChange}
              data-testid="notifications-switch"
            />
          </div>
          
          <div>
            <label htmlFor="dark-mode">Dark Mode</label>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={handleDarkModeChange}
              data-testid="dark-mode-switch"
            />
          </div>
          
          <div>
            <label htmlFor="auto-save">Auto Save</label>
            <Switch
              id="auto-save"
              checked={settings.autoSave}
              onCheckedChange={handleAutoSaveChange}
              data-testid="auto-save-switch"
              disabled
            />
          </div>
        </form>
      )
      
      // Check initial states
      expect(screen.getByTestId('notifications-switch')).toHaveAttribute('aria-checked', 'false')
      expect(screen.getByTestId('dark-mode-switch')).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByTestId('auto-save-switch')).toHaveAttribute('aria-checked', 'false')
      expect(screen.getByTestId('auto-save-switch')).toBeDisabled()
      
      // Test interactions
      fireEvent.click(screen.getByTestId('notifications-switch'))
      expect(handleNotificationChange).toHaveBeenCalledWith(true)
      
      fireEvent.click(screen.getByTestId('dark-mode-switch'))
      expect(handleDarkModeChange).toHaveBeenCalledWith(false)
      
      fireEvent.click(screen.getByTestId('auto-save-switch'))
      expect(handleAutoSaveChange).not.toHaveBeenCalled()
    })

    it('handles complex state management', () => {
      let isEnabled = false
      const handleChange = (checked: boolean) => {
        isEnabled = checked
      }
      
      const { rerender } = render(
        <Switch checked={isEnabled} onCheckedChange={handleChange} data-testid="switch" />
      )
      
      const switchElement = screen.getByTestId('switch')
      
      // Initial state
      expect(switchElement).toHaveAttribute('aria-checked', 'false')
      
      // Toggle on
      fireEvent.click(switchElement)
      rerender(<Switch checked={isEnabled} onCheckedChange={handleChange} data-testid="switch" />)
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
      
      // Toggle off
      fireEvent.click(switchElement)
      rerender(<Switch checked={isEnabled} onCheckedChange={handleChange} data-testid="switch" />)
      expect(switchElement).toHaveAttribute('aria-checked', 'false')
    })
  })
})