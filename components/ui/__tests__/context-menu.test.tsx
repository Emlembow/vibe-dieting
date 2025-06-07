import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '../context-menu'

describe('ContextMenu Components', () => {
  describe('ContextMenu', () => {
    it('renders context menu with trigger and content', () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div data-testid="trigger-area">Right click me</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem>Paste</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      const triggerArea = screen.getByTestId('trigger-area')
      expect(triggerArea).toBeInTheDocument()
      expect(triggerArea).toHaveTextContent('Right click me')
      
      // Right click to open context menu
      fireEvent.contextMenu(triggerArea)
      
      expect(screen.getByText('Copy')).toBeInTheDocument()
      expect(screen.getByText('Paste')).toBeInTheDocument()
    })

    it('handles controlled state', () => {
      const handleOpenChange = jest.fn()
      
      render(
        <ContextMenu open={true} onOpenChange={handleOpenChange}>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      // Menu should be open
      expect(screen.getByText('Item')).toBeInTheDocument()
    })
  })

  describe('ContextMenuTrigger', () => {
    it('renders trigger element', () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div data-testid="trigger">Context Menu Area</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Action</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveTextContent('Context Menu Area')
    })

    it('opens context menu on right click', () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <button data-testid="button">Right Click Button</button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Button Action</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      // Item should not be visible initially
      expect(screen.queryByText('Button Action')).not.toBeInTheDocument()
      
      // Right click trigger
      fireEvent.contextMenu(screen.getByTestId('button'))
      
      // Item should be visible
      expect(screen.getByText('Button Action')).toBeInTheDocument()
    })

    it('applies custom className to trigger child', () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="custom-trigger" data-testid="trigger">
              Custom Trigger
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      expect(screen.getByTestId('trigger')).toHaveClass('custom-trigger')
    })
  })

  describe('ContextMenuContent', () => {
    it('renders content with items', () => {
      render(
        <ContextMenu defaultOpen>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent data-testid="menu-content">
            <ContextMenuItem>Item 1</ContextMenuItem>
            <ContextMenuItem>Item 2</ContextMenuItem>
            <ContextMenuItem>Item 3</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      expect(screen.getByTestId('menu-content')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <ContextMenu defaultOpen>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent className="custom-content" data-testid="content">
            <ContextMenuItem>Item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      expect(screen.getByTestId('content')).toHaveClass('custom-content')
    })
  })

  describe('ContextMenuItem', () => {
    it('renders menu items', () => {
      render(
        <ContextMenu defaultOpen>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Edit</ContextMenuItem>
            <ContextMenuItem>Delete</ContextMenuItem>
            <ContextMenuItem disabled>Disabled</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.getByText('Disabled')).toBeInTheDocument()
    })

    it('handles click events', () => {
      const handleEdit = jest.fn()
      const handleDelete = jest.fn()
      
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div data-testid="trigger">Right Click</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={handleEdit}>Edit</ContextMenuItem>
            <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      // Open context menu
      fireEvent.contextMenu(screen.getByTestId('trigger'))
      
      fireEvent.click(screen.getByText('Edit'))
      expect(handleEdit).toHaveBeenCalled()

      // Reopen menu (it closes after click)
      fireEvent.contextMenu(screen.getByTestId('trigger'))
      fireEvent.click(screen.getByText('Delete'))
      expect(handleDelete).toHaveBeenCalled()
    })

    it('applies custom className', () => {
      render(
        <ContextMenu defaultOpen>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem className="custom-item">Custom</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      expect(screen.getByText('Custom')).toHaveClass('custom-item')
    })
  })

  describe('ContextMenuCheckboxItem', () => {
    it('renders checkbox items', () => {
      render(
        <ContextMenu defaultOpen>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuCheckboxItem>Show Grid</ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem checked>Show Rulers</ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      expect(screen.getByText('Show Grid')).toBeInTheDocument()
      expect(screen.getByText('Show Rulers')).toBeInTheDocument()
    })

    it('handles checkbox state changes', () => {
      const handleCheckedChange = jest.fn()
      
      render(
        <ContextMenu defaultOpen>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuCheckboxItem onCheckedChange={handleCheckedChange}>
              Enable Feature
            </ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      fireEvent.click(screen.getByText('Enable Feature'))
      expect(handleCheckedChange).toHaveBeenCalled()
    })
  })

  describe('ContextMenuRadioGroup and ContextMenuRadioItem', () => {
    it('renders radio group with items', () => {
      render(
        <ContextMenu defaultOpen>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuRadioGroup value="medium">
              <ContextMenuRadioItem value="small">Small</ContextMenuRadioItem>
              <ContextMenuRadioItem value="medium">Medium</ContextMenuRadioItem>
              <ContextMenuRadioItem value="large">Large</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
      )

      expect(screen.getByText('Small')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByText('Large')).toBeInTheDocument()
    })

    it('handles radio selection changes', () => {
      const handleValueChange = jest.fn()
      
      render(
        <ContextMenu defaultOpen>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuRadioGroup value="left" onValueChange={handleValueChange}>
              <ContextMenuRadioItem value="left">Left</ContextMenuRadioItem>
              <ContextMenuRadioItem value="center">Center</ContextMenuRadioItem>
              <ContextMenuRadioItem value="right">Right</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
      )

      fireEvent.click(screen.getByText('Right'))
      expect(handleValueChange).toHaveBeenCalledWith('right')
    })
  })

  describe('ContextMenuLabel', () => {
    it('renders menu labels', () => {
      render(
        <ContextMenu defaultOpen>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Actions</ContextMenuLabel>
            <ContextMenuItem>Cut</ContextMenuItem>
            <ContextMenuItem>Copy</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      expect(screen.getByText('Actions')).toBeInTheDocument()
      expect(screen.getByText('Cut')).toBeInTheDocument()
      expect(screen.getByText('Copy')).toBeInTheDocument()
    })
  })

  describe('ContextMenuSeparator', () => {
    it('renders separator', () => {
      render(
        <ContextMenu defaultOpen>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem>Paste</ContextMenuItem>
            <ContextMenuSeparator data-testid="separator" />
            <ContextMenuItem>Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      expect(screen.getByTestId('separator')).toBeInTheDocument()
    })
  })

  describe('ContextMenuShortcut', () => {
    it('renders keyboard shortcuts', () => {
      render(
        <ContextMenu defaultOpen>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              Copy
              <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Paste
              <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      expect(screen.getByText('Ctrl+C')).toBeInTheDocument()
      expect(screen.getByText('Ctrl+V')).toBeInTheDocument()
    })
  })

  describe('ContextMenuGroup', () => {
    it('renders grouped menu items', () => {
      render(
        <ContextMenu defaultOpen>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuGroup>
              <ContextMenuLabel>Text</ContextMenuLabel>
              <ContextMenuItem>Bold</ContextMenuItem>
              <ContextMenuItem>Italic</ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuLabel>Alignment</ContextMenuLabel>
              <ContextMenuItem>Left</ContextMenuItem>
              <ContextMenuItem>Center</ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
      )

      expect(screen.getByText('Text')).toBeInTheDocument()
      expect(screen.getByText('Bold')).toBeInTheDocument()
      expect(screen.getByText('Italic')).toBeInTheDocument()
      expect(screen.getByText('Alignment')).toBeInTheDocument()
      expect(screen.getByText('Left')).toBeInTheDocument()
      expect(screen.getByText('Center')).toBeInTheDocument()
    })
  })

  describe('ContextMenuSub', () => {
    it('renders submenu', () => {
      render(
        <ContextMenu defaultOpen>
          <ContextMenuTrigger>
            <div>Trigger</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Regular Item</ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>More Options</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Option 1</ContextMenuItem>
                <ContextMenuItem>Option 2</ContextMenuItem>
                <ContextMenuItem>Option 3</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>
      )

      expect(screen.getByText('Regular Item')).toBeInTheDocument()
      expect(screen.getByText('More Options')).toBeInTheDocument()
      
      // Hover to open submenu
      fireEvent.mouseEnter(screen.getByText('More Options'))
      
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
      expect(screen.getByText('Option 3')).toBeInTheDocument()
    })
  })

  describe('Integration tests', () => {
    it('handles complex context menu with all components', () => {
      const handleCopy = jest.fn()
      const handleAlignmentChange = jest.fn()
      
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div data-testid="text-editor" style={{ width: 200, height: 100, border: '1px solid' }}>
              Text Editor - Right click for options
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Edit</ContextMenuLabel>
            <ContextMenuItem onClick={handleCopy}>
              Copy
              <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Paste
              <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            
            <ContextMenuGroup>
              <ContextMenuLabel>Format</ContextMenuLabel>
              <ContextMenuCheckboxItem checked>Bold</ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem>Italic</ContextMenuCheckboxItem>
            </ContextMenuGroup>
            
            <ContextMenuSeparator />
            
            <ContextMenuRadioGroup value="left" onValueChange={handleAlignmentChange}>
              <ContextMenuLabel>Alignment</ContextMenuLabel>
              <ContextMenuRadioItem value="left">Left</ContextMenuRadioItem>
              <ContextMenuRadioItem value="center">Center</ContextMenuRadioItem>
              <ContextMenuRadioItem value="right">Right</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
            
            <ContextMenuSeparator />
            
            <ContextMenuSub>
              <ContextMenuSubTrigger>Insert</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Image</ContextMenuItem>
                <ContextMenuItem>Table</ContextMenuItem>
                <ContextMenuItem>Link</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>
      )

      const textEditor = screen.getByTestId('text-editor')
      
      // Right click to open context menu
      fireEvent.contextMenu(textEditor)

      // Test various components
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Copy')).toBeInTheDocument()
      expect(screen.getByText('Ctrl+C')).toBeInTheDocument()
      expect(screen.getByText('Bold')).toBeInTheDocument()
      expect(screen.getByText('Left')).toBeInTheDocument()
      expect(screen.getByText('Insert')).toBeInTheDocument()

      // Test copy action
      fireEvent.click(screen.getByText('Copy'))
      expect(handleCopy).toHaveBeenCalled()

      // Test alignment change
      fireEvent.contextMenu(textEditor)
      fireEvent.click(screen.getByText('Center'))
      expect(handleAlignmentChange).toHaveBeenCalledWith('center')
    })

    it('opens at cursor position on right click', () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>
            <div data-testid="canvas" style={{ width: 300, height: 200, background: '#f0f0f0' }}>
              Canvas Area
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Add Shape</ContextMenuItem>
            <ContextMenuItem>Add Text</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      const canvas = screen.getByTestId('canvas')
      
      // Right click at specific position
      fireEvent.contextMenu(canvas, { clientX: 100, clientY: 50 })
      
      expect(screen.getByText('Add Shape')).toBeInTheDocument()
      expect(screen.getByText('Add Text')).toBeInTheDocument()
    })

    it('closes on outside click', async () => {
      render(
        <div>
          <ContextMenu>
            <ContextMenuTrigger>
              <div data-testid="trigger">Right Click Area</div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Menu Item</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          <div data-testid="outside">Outside Area</div>
        </div>
      )

      // Open context menu
      fireEvent.contextMenu(screen.getByTestId('trigger'))
      expect(screen.getByText('Menu Item')).toBeInTheDocument()

      // Click outside
      fireEvent.click(screen.getByTestId('outside'))
      
      // Menu should close
      await waitFor(() => {
        expect(screen.queryByText('Menu Item')).not.toBeInTheDocument()
      })
    })

    it('handles multiple trigger areas', () => {
      render(
        <div>
          <ContextMenu>
            <ContextMenuTrigger>
              <div data-testid="area1">Area 1</div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Action 1</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          
          <ContextMenu>
            <ContextMenuTrigger>
              <div data-testid="area2">Area 2</div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Action 2</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      )

      // Test first context menu
      fireEvent.contextMenu(screen.getByTestId('area1'))
      expect(screen.getByText('Action 1')).toBeInTheDocument()
      expect(screen.queryByText('Action 2')).not.toBeInTheDocument()

      // Test second context menu
      fireEvent.contextMenu(screen.getByTestId('area2'))
      expect(screen.getByText('Action 2')).toBeInTheDocument()
    })
  })
})