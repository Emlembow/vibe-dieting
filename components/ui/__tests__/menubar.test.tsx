import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from '../menubar'

describe('Menubar Components', () => {
  describe('Menubar', () => {
    it('renders menubar container', () => {
      render(
        <Menubar data-testid="menubar">
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
              <MenubarItem>Open</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      expect(screen.getByTestId('menubar')).toBeInTheDocument()
      expect(screen.getByText('File')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Menubar className="custom-menubar" data-testid="menubar">
          <MenubarMenu>
            <MenubarTrigger>Menu</MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      )

      expect(screen.getByTestId('menubar')).toHaveClass('custom-menubar')
    })
  })

  describe('MenubarMenu', () => {
    it('renders menu with trigger and content', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New File</MenubarItem>
              <MenubarItem>Open File</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      expect(screen.getByText('File')).toBeInTheDocument()
      
      // Click trigger to open menu
      fireEvent.click(screen.getByText('File'))
      
      expect(screen.getByText('New File')).toBeInTheDocument()
      expect(screen.getByText('Open File')).toBeInTheDocument()
    })
  })

  describe('MenubarTrigger', () => {
    it('renders trigger button', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Cut</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('Edit')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveRole('button')
    })

    it('opens menu when clicked', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Zoom In</MenubarItem>
              <MenubarItem>Zoom Out</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('View'))
      
      expect(screen.getByText('Zoom In')).toBeInTheDocument()
      expect(screen.getByText('Zoom Out')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger className="custom-trigger">Help</MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      )

      expect(screen.getByText('Help')).toHaveClass('custom-trigger')
    })
  })

  describe('MenubarContent', () => {
    it('renders menu content', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Tools</MenubarTrigger>
            <MenubarContent data-testid="menu-content">
              <MenubarItem>Settings</MenubarItem>
              <MenubarItem>Preferences</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('Tools'))
      
      expect(screen.getByTestId('menu-content')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Preferences')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Format</MenubarTrigger>
            <MenubarContent className="custom-content" data-testid="menu-content">
              <MenubarItem>Bold</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('Format'))
      expect(screen.getByTestId('menu-content')).toHaveClass('custom-content')
    })
  })

  describe('MenubarItem', () => {
    it('renders menu items', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Copy</MenubarItem>
              <MenubarItem>Paste</MenubarItem>
              <MenubarItem disabled>Delete</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('Edit'))
      
      expect(screen.getByText('Copy')).toBeInTheDocument()
      expect(screen.getByText('Paste')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('handles click events', () => {
      const handleClick = jest.fn()
      
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleClick}>Save</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('File'))
      fireEvent.click(screen.getByText('Save'))
      
      expect(handleClick).toHaveBeenCalled()
    })

    it('applies custom className', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Window</MenubarTrigger>
            <MenubarContent>
              <MenubarItem className="custom-item">Minimize</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('Window'))
      expect(screen.getByText('Minimize')).toHaveClass('custom-item')
    })
  })

  describe('MenubarSeparator', () => {
    it('renders separator', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
              <MenubarSeparator data-testid="separator" />
              <MenubarItem>Exit</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('File'))
      expect(screen.getByTestId('separator')).toBeInTheDocument()
    })
  })

  describe('MenubarShortcut', () => {
    it('renders keyboard shortcuts', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New
                <MenubarShortcut>Ctrl+N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Save
                <MenubarShortcut>Ctrl+S</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('File'))
      
      expect(screen.getByText('Ctrl+N')).toBeInTheDocument()
      expect(screen.getByText('Ctrl+S')).toBeInTheDocument()
    })
  })

  describe('MenubarCheckboxItem', () => {
    it('renders checkbox items', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem>Show Toolbar</MenubarCheckboxItem>
              <MenubarCheckboxItem checked>Show Sidebar</MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('View'))
      
      expect(screen.getByText('Show Toolbar')).toBeInTheDocument()
      expect(screen.getByText('Show Sidebar')).toBeInTheDocument()
    })

    it('handles checkbox state changes', () => {
      const handleCheckedChange = jest.fn()
      
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem onCheckedChange={handleCheckedChange}>
                Status Bar
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('View'))
      fireEvent.click(screen.getByText('Status Bar'))
      
      expect(handleCheckedChange).toHaveBeenCalled()
    })
  })

  describe('MenubarRadioGroup and MenubarRadioItem', () => {
    it('renders radio group with items', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value="dark">
                <MenubarRadioItem value="light">Light Theme</MenubarRadioItem>
                <MenubarRadioItem value="dark">Dark Theme</MenubarRadioItem>
                <MenubarRadioItem value="system">System Theme</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('View'))
      
      expect(screen.getByText('Light Theme')).toBeInTheDocument()
      expect(screen.getByText('Dark Theme')).toBeInTheDocument()
      expect(screen.getByText('System Theme')).toBeInTheDocument()
    })

    it('handles radio selection changes', () => {
      const handleValueChange = jest.fn()
      
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value="light" onValueChange={handleValueChange}>
                <MenubarRadioItem value="light">Light</MenubarRadioItem>
                <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('View'))
      fireEvent.click(screen.getByText('Dark'))
      
      expect(handleValueChange).toHaveBeenCalledWith('dark')
    })
  })

  describe('MenubarLabel', () => {
    it('renders menu labels', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Text Formatting</MenubarLabel>
              <MenubarItem>Bold</MenubarItem>
              <MenubarItem>Italic</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('Edit'))
      expect(screen.getByText('Text Formatting')).toBeInTheDocument()
    })
  })

  describe('MenubarSub', () => {
    it('renders submenu', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger>Recent Files</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>document1.txt</MenubarItem>
                  <MenubarItem>document2.txt</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('File'))
      
      expect(screen.getByText('Recent Files')).toBeInTheDocument()
      
      // Hover to open submenu
      fireEvent.mouseEnter(screen.getByText('Recent Files'))
      
      expect(screen.getByText('document1.txt')).toBeInTheDocument()
      expect(screen.getByText('document2.txt')).toBeInTheDocument()
    })
  })

  describe('Integration tests', () => {
    it('handles complete menubar with multiple menus', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
              <MenubarItem>Open</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Exit</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Cut</MenubarItem>
              <MenubarItem>Copy</MenubarItem>
              <MenubarItem>Paste</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem checked>Show Toolbar</MenubarCheckboxItem>
              <MenubarCheckboxItem>Show Sidebar</MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      // Test File menu
      fireEvent.click(screen.getByText('File'))
      expect(screen.getByText('New')).toBeInTheDocument()
      expect(screen.getByText('Open')).toBeInTheDocument()
      expect(screen.getByText('Exit')).toBeInTheDocument()

      // Test Edit menu
      fireEvent.click(screen.getByText('Edit'))
      expect(screen.getByText('Cut')).toBeInTheDocument()
      expect(screen.getByText('Copy')).toBeInTheDocument()
      expect(screen.getByText('Paste')).toBeInTheDocument()

      // Test View menu
      fireEvent.click(screen.getByText('View'))
      expect(screen.getByText('Show Toolbar')).toBeInTheDocument()
      expect(screen.getByText('Show Sidebar')).toBeInTheDocument()
    })

    it('handles keyboard navigation', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Save
                <MenubarShortcut>Ctrl+S</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('File')
      
      // Test keyboard interaction
      fireEvent.keyDown(trigger, { key: 'Enter' })
      expect(screen.getByText('Save')).toBeInTheDocument()
      expect(screen.getByText('Ctrl+S')).toBeInTheDocument()
    })

    it('handles menu item actions with shortcuts', () => {
      const handleSave = jest.fn()
      const handleNew = jest.fn()
      
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleNew}>
                New
                <MenubarShortcut>Ctrl+N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleSave}>
                Save
                <MenubarShortcut>Ctrl+S</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      fireEvent.click(screen.getByText('File'))
      
      fireEvent.click(screen.getByText('New'))
      expect(handleNew).toHaveBeenCalled()
      
      fireEvent.click(screen.getByText('File'))
      fireEvent.click(screen.getByText('Save'))
      expect(handleSave).toHaveBeenCalled()
    })
  })
})