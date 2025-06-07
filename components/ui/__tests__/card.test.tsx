import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card with children', () => {
      render(
        <Card data-testid="card">
          <div>Card content</div>
        </Card>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm')
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(<Card ref={ref}>Content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardHeader', () => {
    it('renders card header with children', () => {
      render(
        <CardHeader data-testid="card-header">
          <div>Header content</div>
        </CardHeader>
      )
      
      const header = screen.getByTestId('card-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<CardHeader className="custom-header" data-testid="card-header">Content</CardHeader>)
      const header = screen.getByTestId('card-header')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('renders card title with children', () => {
      render(
        <CardTitle data-testid="card-title">
          Card Title
        </CardTitle>
      )
      
      const title = screen.getByTestId('card-title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
      expect(screen.getByText('Card Title')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<CardTitle className="custom-title" data-testid="card-title">Title</CardTitle>)
      const title = screen.getByTestId('card-title')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('renders card description with children', () => {
      render(
        <CardDescription data-testid="card-description">
          Card description text
        </CardDescription>
      )
      
      const description = screen.getByTestId('card-description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
      expect(screen.getByText('Card description text')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<CardDescription className="custom-desc" data-testid="card-description">Description</CardDescription>)
      const description = screen.getByTestId('card-description')
      expect(description).toHaveClass('custom-desc')
    })
  })

  describe('CardContent', () => {
    it('renders card content with children', () => {
      render(
        <CardContent data-testid="card-content">
          <p>Card body content</p>
        </CardContent>
      )
      
      const content = screen.getByTestId('card-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('p-6', 'pt-0')
      expect(screen.getByText('Card body content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<CardContent className="custom-content" data-testid="card-content">Content</CardContent>)
      const content = screen.getByTestId('card-content')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('CardFooter', () => {
    it('renders card footer with children', () => {
      render(
        <CardFooter data-testid="card-footer">
          <div>Footer content</div>
        </CardFooter>
      )
      
      const footer = screen.getByTestId('card-footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="card-footer">Footer</CardFooter>)
      const footer = screen.getByTestId('card-footer')
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('Complete Card', () => {
    it('renders complete card structure', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content area</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByTestId('complete-card')).toBeInTheDocument()
      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('This is a test card')).toBeInTheDocument()
      expect(screen.getByText('Main content area')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })
  })
})