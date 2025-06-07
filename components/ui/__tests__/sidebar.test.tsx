import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '../sidebar'

// Mock dependencies
jest.mock('lucide-react', () => ({
  PanelLeft: ({ className }: { className?: string }) => (
    <div data-testid="panel-left-icon" className={className}>PanelLeft</div>
  ),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(),
}))

const mockUseIsMobile = require('@/hooks/use-mobile').useIsMobile

// Test component that uses sidebar context
const TestComponent = () => {
  const { state, open, toggleSidebar } = useSidebar()
  return (
    <div>
      <span data-testid="sidebar-state">{state}</span>
      <span data-testid="sidebar-open">{open.toString()}</span>
      <button onClick={toggleSidebar} data-testid="toggle-button">
        Toggle
      </button>
    </div>
  )
}

describe('Sidebar Components', () => {
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false)
    // Clear localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
  })

  describe('SidebarProvider', () => {
    it('renders children and provides sidebar context', () => {
      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      )

      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('expanded')
      expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true')
    })

    it('handles default open state', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <TestComponent />
        </SidebarProvider>
      )

      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('collapsed')
      expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false')
    })

    it('handles controlled open state', () => {
      const handleOpenChange = jest.fn()
      
      render(
        <SidebarProvider open={false} onOpenChange={handleOpenChange}>
          <TestComponent />
        </SidebarProvider>
      )

      expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false')
      
      fireEvent.click(screen.getByTestId('toggle-button'))
      expect(handleOpenChange).toHaveBeenCalledWith(true)
    })

    it('handles mobile state correctly', () => {
      mockUseIsMobile.mockReturnValue(true)
      
      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      )

      // On mobile, sidebar should be collapsed by default
      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('collapsed')
    })

    it('handles keyboard shortcuts', () => {
      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      )

      // Test keyboard shortcut (Cmd+B or Ctrl+B)
      fireEvent.keyDown(document, { key: 'b', metaKey: true })
      
      // Should toggle the sidebar
      expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false')
    })
  })

  describe('useSidebar hook', () => {
    it('throws error when used outside SidebarProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow('useSidebar must be used within a SidebarProvider.')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Sidebar', () => {
    it('renders with default props', () => {
      render(
        <SidebarProvider>
          <Sidebar data-testid="sidebar">
            <div>Sidebar content</div>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByText('Sidebar content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <Sidebar className="custom-sidebar" data-testid="sidebar">
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByTestId('sidebar')).toHaveClass('custom-sidebar')
    })

    it('handles different variants', () => {
      render(
        <SidebarProvider>
          <Sidebar variant="floating" data-testid="sidebar">
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })

    it('handles different sides', () => {
      render(
        <SidebarProvider>
          <Sidebar side="right" data-testid="sidebar">
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })
  })

  describe('SidebarTrigger', () => {
    it('renders and toggles sidebar when clicked', () => {
      render(
        <SidebarProvider>
          <div>
            <SidebarTrigger data-testid="trigger" />
            <TestComponent />
          </div>
        </SidebarProvider>
      )

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
      
      // Initial state should be expanded
      expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true')
      
      // Click trigger to toggle
      fireEvent.click(trigger)
      expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarTrigger className="custom-trigger" data-testid="trigger" />
        </SidebarProvider>
      )

      expect(screen.getByTestId('trigger')).toHaveClass('custom-trigger')
    })
  })

  describe('SidebarRail', () => {
    it('renders and handles click', () => {
      render(
        <SidebarProvider>
          <div>
            <SidebarRail data-testid="rail" />
            <TestComponent />
          </div>
        </SidebarProvider>
      )

      const rail = screen.getByTestId('rail')
      expect(rail).toBeInTheDocument()
      
      fireEvent.click(rail)
      expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false')
    })
  })

  describe('SidebarInset', () => {
    it('renders children correctly', () => {
      render(
        <SidebarProvider>
          <SidebarInset data-testid="inset">
            <div>Inset content</div>
          </SidebarInset>
        </SidebarProvider>
      )

      expect(screen.getByTestId('inset')).toBeInTheDocument()
      expect(screen.getByText('Inset content')).toBeInTheDocument()
    })
  })

  describe('SidebarInput', () => {
    it('renders input with sidebar styling', () => {
      render(
        <SidebarProvider>
          <SidebarInput placeholder="Search..." data-testid="input" />
        </SidebarProvider>
      )

      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', 'Search...')
    })
  })

  describe('SidebarHeader', () => {
    it('renders header content', () => {
      render(
        <SidebarProvider>
          <SidebarHeader data-testid="header">
            <div>Header content</div>
          </SidebarHeader>
        </SidebarProvider>
      )

      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })
  })

  describe('SidebarContent', () => {
    it('renders content area', () => {
      render(
        <SidebarProvider>
          <SidebarContent data-testid="content">
            <div>Main content</div>
          </SidebarContent>
        </SidebarProvider>
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByText('Main content')).toBeInTheDocument()
    })
  })

  describe('SidebarFooter', () => {
    it('renders footer content', () => {
      render(
        <SidebarProvider>
          <SidebarFooter data-testid="footer">
            <div>Footer content</div>
          </SidebarFooter>
        </SidebarProvider>
      )

      expect(screen.getByTestId('footer')).toBeInTheDocument()
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })
  })

  describe('SidebarSeparator', () => {
    it('renders separator', () => {
      render(
        <SidebarProvider>
          <SidebarSeparator data-testid="separator" />
        </SidebarProvider>
      )

      expect(screen.getByTestId('separator')).toBeInTheDocument()
    })
  })

  describe('SidebarGroup', () => {
    it('renders group with label and content', () => {
      render(
        <SidebarProvider>
          <SidebarGroup data-testid="group">
            <SidebarGroupLabel>Group Label</SidebarGroupLabel>
            <SidebarGroupContent>
              <div>Group content</div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarProvider>
      )

      expect(screen.getByTestId('group')).toBeInTheDocument()
      expect(screen.getByText('Group Label')).toBeInTheDocument()
      expect(screen.getByText('Group content')).toBeInTheDocument()
    })

    it('renders group action', () => {
      render(
        <SidebarProvider>
          <SidebarGroup>
            <SidebarGroupAction title="Action" data-testid="group-action">
              <div>Action content</div>
            </SidebarGroupAction>
          </SidebarGroup>
        </SidebarProvider>
      )

      expect(screen.getByTestId('group-action')).toBeInTheDocument()
      expect(screen.getByText('Action content')).toBeInTheDocument()
    })
  })

  describe('SidebarMenu', () => {
    it('renders menu with items', () => {
      render(
        <SidebarProvider>
          <SidebarMenu data-testid="menu">
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Menu Item 1</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Menu Item 2</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarProvider>
      )

      expect(screen.getByTestId('menu')).toBeInTheDocument()
      expect(screen.getByText('Menu Item 1')).toBeInTheDocument()
      expect(screen.getByText('Menu Item 2')).toBeInTheDocument()
    })

    it('renders menu button with different variants', () => {
      render(
        <SidebarProvider>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton variant="outline" data-testid="menu-button">
                <span>Outline Button</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarProvider>
      )

      expect(screen.getByTestId('menu-button')).toBeInTheDocument()
      expect(screen.getByText('Outline Button')).toBeInTheDocument()
    })

    it('renders menu action and badge', () => {
      render(
        <SidebarProvider>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <span>Menu Item</span>
              </SidebarMenuButton>
              <SidebarMenuAction data-testid="menu-action">
                <div>Action</div>
              </SidebarMenuAction>
              <SidebarMenuBadge>3</SidebarMenuBadge>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarProvider>
      )

      expect(screen.getByTestId('menu-action')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders submenu', () => {
      render(
        <SidebarProvider>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton>
                    <span>Sub Item 1</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton>
                    <span>Sub Item 2</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarProvider>
      )

      expect(screen.getByText('Sub Item 1')).toBeInTheDocument()
      expect(screen.getByText('Sub Item 2')).toBeInTheDocument()
    })

    it('renders menu skeleton', () => {
      render(
        <SidebarProvider>
          <SidebarMenu>
            <SidebarMenuSkeleton data-testid="menu-skeleton" showIcon />
          </SidebarMenu>
        </SidebarProvider>
      )

      expect(screen.getByTestId('menu-skeleton')).toBeInTheDocument()
    })
  })

  describe('Integration tests', () => {
    it('handles complete sidebar with all components', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <SidebarInput placeholder="Search..." />
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Dashboard</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Settings</SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <div>Footer content</div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <div>Main content area</div>
          </SidebarInset>
        </SidebarProvider>
      )

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Footer content')).toBeInTheDocument()
      expect(screen.getByText('Main content area')).toBeInTheDocument()
    })

    it('handles mobile state changes', async () => {
      mockUseIsMobile.mockReturnValue(true)
      
      render(
        <SidebarProvider>
          <div>
            <SidebarTrigger data-testid="trigger" />
            <TestComponent />
          </div>
        </SidebarProvider>
      )

      // On mobile, should be collapsed initially
      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('collapsed')
      
      // Toggle should open
      fireEvent.click(screen.getByTestId('trigger'))
      expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true')
    })
  })
})