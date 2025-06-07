import { render, screen, fireEvent } from '@/test-utils'
import { MobileNav } from '../mobile-nav'

// Mock the UI components
jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet">{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-content">{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-trigger">{children}</div>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/sidebar-nav', () => ({
  SidebarNav: () => <div data-testid="sidebar-nav">Sidebar Nav</div>,
}))

jest.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
}))

describe('MobileNav', () => {
  it('renders mobile navigation with menu button', () => {
    render(<MobileNav />)

    expect(screen.getByTestId('sheet')).toBeInTheDocument()
    expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument()
    expect(screen.getByTestId('button')).toBeInTheDocument()
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
  })

  it('includes sidebar navigation in sheet content', () => {
    render(<MobileNav />)

    expect(screen.getByTestId('sheet-content')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument()
  })

  it('has correct button variant and size', () => {
    render(<MobileNav />)

    const button = screen.getByTestId('button')
    expect(button).toHaveAttribute('variant', 'ghost')
    expect(button).toHaveAttribute('size', 'icon')
  })

  it('applies correct CSS classes', () => {
    const { container } = render(<MobileNav />)

    const nav = container.querySelector('nav')
    expect(nav).toHaveClass('flex', 'h-14', 'items-center', 'border-b', 'px-4', 'md:hidden')
  })
})