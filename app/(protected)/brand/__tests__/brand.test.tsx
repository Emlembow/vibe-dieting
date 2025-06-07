import { render, screen } from '@/test-utils'
import BrandPage from '../page'

// Mock the LogoShowcase component
jest.mock('@/components/ui/logo-showcase', () => ({
  LogoShowcase: () => <div data-testid="logo-showcase">Logo Showcase</div>
}))

describe('Brand Page', () => {
  it('renders brand page with title and description', () => {
    render(<BrandPage />)
    
    expect(screen.getByText('Brand Assets')).toBeInTheDocument()
    expect(screen.getByText('Logo variations and brand assets for Vibe Dieting')).toBeInTheDocument()
  })

  it('renders logo showcase component', () => {
    render(<BrandPage />)
    
    expect(screen.getByTestId('logo-showcase')).toBeInTheDocument()
  })

  it('renders usage guidelines heading', () => {
    render(<BrandPage />)
    
    expect(screen.getByText('Usage Guidelines')).toBeInTheDocument()
  })

  it('renders all usage guideline items', () => {
    render(<BrandPage />)
    
    const guidelines = [
      'Use the default logo on marketing materials and primary app screens',
      'The icon-only version works well for app icons and small spaces',
      'Horizontal layout is ideal for headers and navigation bars',
      'Vertical layout works well for splash screens and centered layouts',
      'Always maintain the logo\'s aspect ratio when resizing',
      'Use the light version on dark backgrounds and dark version on light backgrounds'
    ]
    
    guidelines.forEach(guideline => {
      expect(screen.getByText(guideline)).toBeInTheDocument()
    })
  })

  it('renders usage guidelines as a list', () => {
    const { container } = render(<BrandPage />)
    
    const list = container.querySelector('ul')
    expect(list).toBeInTheDocument()
    expect(list).toHaveClass('list-disc', 'pl-5', 'space-y-2')
    
    const listItems = list?.querySelectorAll('li')
    expect(listItems).toHaveLength(6)
  })

  it('has proper page structure', () => {
    const { container } = render(<BrandPage />)
    
    const mainContainer = container.querySelector('.container')
    expect(mainContainer).toBeInTheDocument()
    expect(mainContainer).toHaveClass('py-6', 'space-y-6')
  })
})