import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../dropdown-menu'
import { Button } from '../button'

describe('DropdownMenu Components', () => {
  describe('DropdownMenu', () => {
    it('renders dropdown with trigger and content', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText('Open Menu')).toBeInTheDocument()
      
      // Click to open dropdown
      fireEvent.click(screen.getByText('Open Menu'))
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
      })
    })

    it('handles controlled state', () => {
      const handleOpenChange = jest.fn()
      
      render(
        <DropdownMenu open={true} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button>Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      // Menu should be open
      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })
  })

  describe('DropdownMenuTrigger', () => {
    it('renders trigger button', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button data-testid="trigger">Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Action 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveTextContent('Actions')
    })

    it('opens dropdown when clicked', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Click Me</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Hidden Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      // Item should not be visible initially
      expect(screen.queryByText('Hidden Item')).not.toBeInTheDocument()
      
      // Click trigger
      fireEvent.click(screen.getByText('Click Me'))
      
      // Item should be visible
      await waitFor(() => {
        expect(screen.getByText('Hidden Item')).toBeInTheDocument()
      })
    })
  })

  describe('DropdownMenuContent', () => {
    it('renders content with items', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent data-testid="menu-content">
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuItem>Item 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByTestId('menu-content')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="custom-content" data-testid="content">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByTestId('content')).toHaveClass('custom-content')
    })
  })

  describe('DropdownMenuItem', () => {
    it('renders menu items', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
            <DropdownMenuItem disabled>Disabled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.getByText('Disabled')).toBeInTheDocument()
    })

    it('handles click events', () => {
      const handleEdit = jest.fn()
      const handleDelete = jest.fn()
      
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      fireEvent.click(screen.getByText('Edit'))
      expect(handleEdit).toHaveBeenCalled()

      // Reopen menu (it closes after click)
      fireEvent.click(screen.getByText('Actions'))
      fireEvent.click(screen.getByText('Delete'))
      expect(handleDelete).toHaveBeenCalled()
    })

    it('applies custom className', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="custom-item">Custom</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText('Custom')).toHaveClass('custom-item')
    })
  })

  describe('DropdownMenuCheckboxItem', () => {
    it('renders checkbox items', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>View</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem>Show Toolbar</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>Show Sidebar</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText('Show Toolbar')).toBeInTheDocument()
      expect(screen.getByText('Show Sidebar')).toBeInTheDocument()
    })

    it('handles checkbox state changes', () => {
      const handleCheckedChange = jest.fn()
      
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Options</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem onCheckedChange={handleCheckedChange}>
              Enable Feature
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      fireEvent.click(screen.getByText('Enable Feature'))
      expect(handleCheckedChange).toHaveBeenCalled()
    })
  })

  describe('DropdownMenuRadioGroup and DropdownMenuRadioItem', () => {
    it('renders radio group with items', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Theme</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="light">
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })

    it('handles radio selection changes', () => {
      const handleValueChange = jest.fn()
      
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Size</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="medium" onValueChange={handleValueChange}>
              <DropdownMenuRadioItem value="small">Small</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="large">Large</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      fireEvent.click(screen.getByText('Large'))
      expect(handleValueChange).toHaveBeenCalledWith('large')
    })
  })

  describe('DropdownMenuLabel', () => {
    it('renders menu labels', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Account</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText('My Account')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Billing')).toBeInTheDocument()
    })
  })

  describe('DropdownMenuSeparator', () => {
    it('renders separator', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>File</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>New</DropdownMenuItem>
            <DropdownMenuItem>Open</DropdownMenuItem>
            <DropdownMenuSeparator data-testid="separator" />
            <DropdownMenuItem>Exit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByTestId('separator')).toBeInTheDocument()
    })
  })

  describe('DropdownMenuShortcut', () => {
    it('renders keyboard shortcuts', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Edit</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Copy
              <DropdownMenuShortcut>Ctrl+C</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Paste
              <DropdownMenuShortcut>Ctrl+V</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText('Ctrl+C')).toBeInTheDocument()
      expect(screen.getByText('Ctrl+V')).toBeInTheDocument()
    })
  })

  describe('DropdownMenuGroup', () => {
    it('renders grouped menu items', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Options</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuItem>Theme</DropdownMenuItem>
              <DropdownMenuItem>Font Size</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText('Appearance')).toBeInTheDocument()
      expect(screen.getByText('Theme')).toBeInTheDocument()
      expect(screen.getByText('Font Size')).toBeInTheDocument()
      expect(screen.getByText('Account')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })
  })

  describe('DropdownMenuSub', () => {
    it('renders submenu', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>More</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Regular Item</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>SMS</DropdownMenuItem>
                <DropdownMenuItem>Social Media</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText('Regular Item')).toBeInTheDocument()
      expect(screen.getByText('Share')).toBeInTheDocument()
      
      // Hover to open submenu
      fireEvent.mouseEnter(screen.getByText('Share'))
      
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('SMS')).toBeInTheDocument()
      expect(screen.getByText('Social Media')).toBeInTheDocument()
    })
  })

  describe('Integration tests', () => {
    it('handles complex dropdown with all components', () => {
      const handleAction = jest.fn()
      const handleThemeChange = jest.fn()
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Main Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleAction}>
              New File
              <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>Open File</DropdownMenuItem>
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuLabel>View Options</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked>Show Toolbar</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Show Sidebar</DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuRadioGroup value="light" onValueChange={handleThemeChange}>
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>PDF</DropdownMenuItem>
                <DropdownMenuItem>CSV</DropdownMenuItem>
                <DropdownMenuItem>JSON</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      // Open main menu
      fireEvent.click(screen.getByText('Main Menu'))

      // Test various components
      expect(screen.getByText('Actions')).toBeInTheDocument()
      expect(screen.getByText('New File')).toBeInTheDocument()
      expect(screen.getByText('Ctrl+N')).toBeInTheDocument()
      expect(screen.getByText('Show Toolbar')).toBeInTheDocument()
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Export')).toBeInTheDocument()

      // Test action click
      fireEvent.click(screen.getByText('New File'))
      expect(handleAction).toHaveBeenCalled()

      // Test theme change
      fireEvent.click(screen.getByText('Main Menu'))
      fireEvent.click(screen.getByText('Dark'))
      expect(handleThemeChange).toHaveBeenCalledWith('dark')
    })

    it('handles keyboard navigation', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Keyboard Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>First Item</DropdownMenuItem>
            <DropdownMenuItem>Second Item</DropdownMenuItem>
            <DropdownMenuItem>Third Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByText('Keyboard Menu')
      
      // Open with keyboard
      fireEvent.keyDown(trigger, { key: 'Enter' })
      
      expect(screen.getByText('First Item')).toBeInTheDocument()
      expect(screen.getByText('Second Item')).toBeInTheDocument()
      expect(screen.getByText('Third Item')).toBeInTheDocument()
    })

    it('closes on outside click', async () => {
      render(
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Outside Click Test</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div data-testid="outside">Outside</div>
        </div>
      )

      // Open menu
      fireEvent.click(screen.getByText('Outside Click Test'))
      expect(screen.getByText('Item')).toBeInTheDocument()

      // Click outside
      fireEvent.click(screen.getByTestId('outside'))
      
      // Menu should close
      await waitFor(() => {
        expect(screen.queryByText('Item')).not.toBeInTheDocument()
      })
    })
  })
})