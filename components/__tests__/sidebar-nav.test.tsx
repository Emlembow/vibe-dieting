import { render, screen, fireEvent } from '@/test-utils'
import { SidebarNav } from '../sidebar-nav'
import { useAuth } from '@/context/auth-context'

jest.mock('@/context/auth-context')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    },
  },
}))

// Mock UI components
jest.mock('@/components/ui/sidebar', () => {
  const Sidebar = ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar">{children}</div>;
  Sidebar.displayName = 'Sidebar';

  const SidebarContent = ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-content">{children}</div>;
  SidebarContent.displayName = 'SidebarContent';

  const SidebarHeader = ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-header">{children}</div>;
  SidebarHeader.displayName = 'SidebarHeader';

  const SidebarMenu = ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-menu">{children}</div>;
  SidebarMenu.displayName = 'SidebarMenu';

  const SidebarMenuItem = ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-menu-item">{children}</div>;
  SidebarMenuItem.displayName = 'SidebarMenuItem';

  const SidebarMenuButton = ({ children, isActive, asChild, ...props }: any) => (
    <div data-testid="sidebar-menu-button" data-active={isActive} {...props}>
      {children}
    </div>
  );
  SidebarMenuButton.displayName = 'SidebarMenuButton';

  const SidebarFooter = ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-footer">{children}</div>;
  SidebarFooter.displayName = 'SidebarFooter';

  const SidebarRail = () => <div data-testid="sidebar-rail" />;
  SidebarRail.displayName = 'SidebarRail';

  return {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarRail,
  };
})


jest.mock('next/link', () => {
  const Link = ({ children, href, ...props }: any) => (
    <a href={href} data-testid="link" {...props}>
      {children}
    </a>
  );
  Link.displayName = 'Link';
  return Link;
})

jest.mock('lucide-react', () => {
  const BarChart2 = () => <div data-testid="bar-chart-icon" />;
  BarChart2.displayName = 'BarChart2';

  const Home = () => <div data-testid="home-icon" />;
  Home.displayName = 'Home';

  const PlusCircle = () => <div data-testid="plus-circle-icon" />;
  PlusCircle.displayName = 'PlusCircle';

  const Settings = () => <div data-testid="settings-icon" />;
  Settings.displayName = 'Settings';

  const LogOut = () => <div data-testid="logout-icon" />;
  LogOut.displayName = 'LogOut';

  const IceCream = () => <div data-testid="ice-cream-icon" />;
  IceCream.displayName = 'IceCream';

  const Github = () => <div data-testid="github-icon" />;
  Github.displayName = 'Github';

  return {
    BarChart2,
    Home,
    PlusCircle,
    Settings,
    LogOut,
    IceCream,
    Github,
  };
})

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
    expect(screen.getByText('Vibe Dieting')).toBeInTheDocument()
    expect(screen.getByText('AI-powered nutrition')).toBeInTheDocument()
    expect(screen.getAllByTestId('sidebar-menu')).toHaveLength(2) // One in content, one in footer
  })

  it('renders all navigation menu items', () => {
    render(<SidebarNav />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Add Food')).toBeInTheDocument()
    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByText('Trends')).toBeInTheDocument()
  })

  it('renders all navigation icons', () => {
    render(<SidebarNav />)

    expect(screen.getByTestId('ice-cream-icon')).toBeInTheDocument()
    expect(screen.getByTestId('home-icon')).toBeInTheDocument()
    expect(screen.getByTestId('plus-circle-icon')).toBeInTheDocument()
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument()
  })

  it('includes sign out button in footer', () => {
    render(<SidebarNav />)

    expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
    expect(screen.getByText('View Source')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
    expect(screen.getByTestId('github-icon')).toBeInTheDocument()
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument()
  })

  it('calls signOut when sign out button is clicked', () => {
    const { supabase } = require('@/lib/supabase')
    render(<SidebarNav />)

    const signOutButton = screen.getByText('Sign Out').closest('[data-testid="sidebar-menu-button"]')
    expect(signOutButton).toBeInTheDocument()

    if (signOutButton) {
      fireEvent.click(signOutButton)
      expect(supabase.auth.signOut).toHaveBeenCalled()
    }
  })

  it('renders correct navigation links with href attributes', () => {
    render(<SidebarNav />)

    const links = screen.getAllByTestId('link')
    const hrefs = links.map(link => link.getAttribute('href'))

    expect(hrefs).toContain('/dashboard')
    expect(hrefs).toContain('/add-food')
    expect(hrefs).toContain('/goals')
    expect(hrefs).toContain('/trends')
    expect(hrefs).toContain('https://github.com/Emlembow/vibe-dieting')
  })

  it('renders sidebar content and header', () => {
    render(<SidebarNav />)

    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-header')).toBeInTheDocument()
  })
})