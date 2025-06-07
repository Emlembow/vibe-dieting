import React from 'react'
import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '../alert'

describe('Alert Components', () => {
  describe('Alert', () => {
    it('renders with default variant', () => {
      render(
        <Alert>
          <div>Alert content</div>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('Alert content')
    })

    it('renders with destructive variant', () => {
      render(
        <Alert variant="destructive">
          <div>Error message</div>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveClass(/border-destructive/)
    })

    it('applies custom className', () => {
      render(
        <Alert className="custom-class">
          <div>Alert content</div>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <Alert ref={ref}>
          <div>Alert content</div>
        </Alert>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('passes through additional props', () => {
      render(
        <Alert data-testid="custom-alert" id="alert-id">
          <div>Alert content</div>
        </Alert>
      )
      
      const alert = screen.getByTestId('custom-alert')
      expect(alert).toHaveAttribute('id', 'alert-id')
    })
  })

  describe('AlertTitle', () => {
    it('renders alert title correctly', () => {
      render(<AlertTitle>Alert Title</AlertTitle>)
      
      const title = screen.getByRole('heading', { level: 5 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Alert Title')
    })

    it('applies custom className', () => {
      render(<AlertTitle className="custom-title">Alert Title</AlertTitle>)
      
      const title = screen.getByRole('heading', { level: 5 })
      expect(title).toHaveClass('custom-title')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLHeadingElement>()
      render(<AlertTitle ref={ref}>Alert Title</AlertTitle>)
      
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
    })

    it('passes through additional props', () => {
      render(
        <AlertTitle data-testid="alert-title" id="title-id">
          Alert Title
        </AlertTitle>
      )
      
      const title = screen.getByTestId('alert-title')
      expect(title).toHaveAttribute('id', 'title-id')
    })
  })

  describe('AlertDescription', () => {
    it('renders alert description correctly', () => {
      render(<AlertDescription>Alert description text</AlertDescription>)
      
      const description = screen.getByText('Alert description text')
      expect(description).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <AlertDescription className="custom-description">
          Alert description text
        </AlertDescription>
      )
      
      const description = screen.getByText('Alert description text')
      expect(description).toHaveClass('custom-description')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <AlertDescription ref={ref}>Alert description text</AlertDescription>
      )
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('passes through additional props', () => {
      render(
        <AlertDescription data-testid="alert-description" id="desc-id">
          Alert description text
        </AlertDescription>
      )
      
      const description = screen.getByTestId('alert-description')
      expect(description).toHaveAttribute('id', 'desc-id')
    })

    it('handles paragraph content correctly', () => {
      render(
        <AlertDescription>
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </AlertDescription>
      )
      
      expect(screen.getByText('First paragraph')).toBeInTheDocument()
      expect(screen.getByText('Second paragraph')).toBeInTheDocument()
    })
  })

  describe('Alert Complete Integration', () => {
    it('renders complete alert with all components', () => {
      render(
        <Alert>
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription>
            This is an important message that requires your attention.
          </AlertDescription>
        </Alert>
      )
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Important Notice')
      expect(screen.getByText('This is an important message that requires your attention.')).toBeInTheDocument()
    })

    it('renders destructive alert with icon space', () => {
      render(
        <Alert variant="destructive">
          <svg role="img" aria-label="Error icon">
            <title>Error</title>
          </svg>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass(/border-destructive/)
      expect(screen.getByRole('img', { name: 'Error icon' })).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('applies variant-specific classes correctly', () => {
      const { rerender } = render(
        <Alert variant="default">
          <AlertTitle>Default Alert</AlertTitle>
        </Alert>
      )
      
      let alert = screen.getByRole('alert')
      expect(alert).toHaveClass(/bg-background/)
      
      rerender(
        <Alert variant="destructive">
          <AlertTitle>Destructive Alert</AlertTitle>
        </Alert>
      )
      
      alert = screen.getByRole('alert')
      expect(alert).toHaveClass(/border-destructive/)
    })
  })
})