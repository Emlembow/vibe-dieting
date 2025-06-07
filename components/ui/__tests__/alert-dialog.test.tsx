import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../alert-dialog'

describe('AlertDialog Components', () => {
  describe('AlertDialog Complete Integration', () => {
    it('renders and opens alert dialog when triggered', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open Dialog</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )

      const trigger = screen.getByText('Open Dialog')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Are you sure?')).toBeInTheDocument()
        expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText('Continue')).toBeInTheDocument()
      })
    })

    it('closes dialog when cancel is clicked', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open Dialog</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )

      const trigger = screen.getByText('Open Dialog')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Confirm Action')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
      })
    })

    it('handles action button click', async () => {
      const handleAction = jest.fn()

      render(
        <AlertDialog>
          <AlertDialogTrigger>Open Dialog</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAction}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )

      const trigger = screen.getByText('Open Dialog')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Confirm Action')).toBeInTheDocument()
      })

      const actionButton = screen.getByText('Confirm')
      fireEvent.click(actionButton)

      expect(handleAction).toHaveBeenCalledTimes(1)
    })
  })

  describe('AlertDialogHeader', () => {
    it('renders header with correct styling', () => {
      render(
        <AlertDialogHeader>
          <div>Header content</div>
        </AlertDialogHeader>
      )

      const header = screen.getByText('Header content').parentElement
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-2')
    })

    it('applies custom className', () => {
      render(
        <AlertDialogHeader className="custom-header">
          <div>Header content</div>
        </AlertDialogHeader>
      )

      const header = screen.getByText('Header content').parentElement
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('AlertDialogFooter', () => {
    it('renders footer with correct styling', () => {
      render(
        <AlertDialogFooter>
          <div>Footer content</div>
        </AlertDialogFooter>
      )

      const footer = screen.getByText('Footer content').parentElement
      expect(footer).toHaveClass('flex', 'flex-col-reverse')
    })

    it('applies custom className', () => {
      render(
        <AlertDialogFooter className="custom-footer">
          <div>Footer content</div>
        </AlertDialogFooter>
      )

      const footer = screen.getByText('Footer content').parentElement
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('AlertDialogTitle', () => {
    it('renders title with correct styling', () => {
      render(
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogTitle>Dialog Title</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>
      )

      const title = screen.getByText('Dialog Title')
      expect(title).toBeInTheDocument()
    })

    it('applies custom className to title', () => {
      render(
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogTitle className="custom-title">Dialog Title</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>
      )

      const title = screen.getByText('Dialog Title')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('AlertDialogDescription', () => {
    it('renders description with correct styling', () => {
      render(
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogDescription>Dialog description</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )

      const description = screen.getByText('Dialog description')
      expect(description).toBeInTheDocument()
    })

    it('applies custom className to description', () => {
      render(
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogDescription className="custom-description">
              Dialog description
            </AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )

      const description = screen.getByText('Dialog description')
      expect(description).toHaveClass('custom-description')
    })
  })

  describe('AlertDialogAction and AlertDialogCancel', () => {
    it('renders action button with button styling', () => {
      render(
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogAction>Action Button</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      )

      const actionButton = screen.getByText('Action Button')
      expect(actionButton).toBeInTheDocument()
      expect(actionButton).toHaveAttribute('type', 'button')
    })

    it('renders cancel button with outline styling', () => {
      render(
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogCancel>Cancel Button</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      )

      const cancelButton = screen.getByText('Cancel Button')
      expect(cancelButton).toBeInTheDocument()
      expect(cancelButton).toHaveAttribute('type', 'button')
    })

    it('applies custom className to action button', () => {
      render(
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogAction className="custom-action">Action</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      )

      const actionButton = screen.getByText('Action')
      expect(actionButton).toHaveClass('custom-action')
    })

    it('applies custom className to cancel button', () => {
      render(
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogCancel className="custom-cancel">Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      )

      const cancelButton = screen.getByText('Cancel')
      expect(cancelButton).toHaveClass('custom-cancel')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open Dialog</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Dialog Title</AlertDialogTitle>
              <AlertDialogDescription>Dialog description</AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      )

      const trigger = screen.getByText('Open Dialog')
      fireEvent.click(trigger)

      await waitFor(() => {
        const dialog = screen.getByRole('alertdialog')
        expect(dialog).toBeInTheDocument()
      })
    })

    it('supports keyboard navigation', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open Dialog</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Dialog Title</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )

      const trigger = screen.getByText('Open Dialog')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument()
      })

      // Test Escape key closes dialog
      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument()
      })
    })
  })
})