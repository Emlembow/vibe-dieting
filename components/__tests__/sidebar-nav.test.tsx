import { render, screen } from '@/test-utils'
import { SidebarNav } from '../sidebar-nav'
import { useAuth } from '@/context/auth-context'

jest.mock('@/context/auth-context')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}))

// Mock UI components
jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar">{children}</div>,
  SidebarContent: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-content">{children}</div>,
  SidebarHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-header">{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-menu">{children}</div>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-menu-item">{children}</div>,
  SidebarMenuButton: ({ children, isActive, asChild, ...props }: any) => (
    <div data-testid="sidebar-menu-button" data-active={isActive} {...props}>
      {children}
    </div>
  ),
  SidebarFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-footer">{children}</div>,
  SidebarRail: () => <div data-testid="sidebar-rail" />,
}))

jest.mock('@/components/logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}))

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} data-testid="link" {...props}>
      {children}
    </a>
  )
})

jest.mock('lucide-react', () => ({
  BarChart3: () => <div data-testid="bar-chart-icon" />,
  Target: () => <div data-testid="target-icon" />,
  PlusCircle: () => <div data-testid="plus-circle-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
}))

const mockUseAuth = useAuth as jest.Mock
const mockSignOut = jest.fn()

describe('SidebarNav', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      signOut: mockSignOut,
    })
  })

  it('renders sidebar with logo and navigation items', () => {
    render(<SidebarNav />)

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('logo')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument()
  })

  it('renders all navigation menu items', () => {
    render(<SidebarNav />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByText('Add Food')).toBeInTheDocument()
    expect(screen.getByText('Trends')).toBeInTheDocument()
  })

  it('renders all navigation icons', () => {
    render(<SidebarNav />)

    expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument()
    expect(screen.getByTestId('target-icon')).toBeInTheDocument()
    expect(screen.getByTestId('plus-circle-icon')).toBeInTheDocument()
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument()
  })

  it('includes sign out button in footer', () => {
    render(<SidebarNav />)

    expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument()
  })

  it('calls signOut when sign out button is clicked', () => {
    render(<SidebarNav />)

    const signOutButton = screen.getByText('Sign Out').closest('[data-testid="sidebar-menu-button"]')
    expect(signOutButton).toBeInTheDocument()

    if (signOutButton) {
      fireEvent.click(signOutButton)
      expect(mockSignOut).toHaveBeenCalled()
    }
  })

  it('renders correct navigation links with href attributes', () => {
    render(<SidebarNav />)

    const links = screen.getAllByTestId('link')
    const hrefs = links.map(link => link.getAttribute('href'))

    expect(hrefs).toContain('/dashboard')
    expect(hrefs).toContain('/goals')
    expect(hrefs).toContain('/add-food')
    expect(hrefs).toContain('/trends')
  })

  it('includes sidebar rail component', () => {
    render(<SidebarNav />)

    expect(screen.getByTestId('sidebar-rail')).toBeInTheDocument()
  })
})