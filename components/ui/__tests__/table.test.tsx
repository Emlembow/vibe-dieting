import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../table'

describe('Table Components', () => {
  describe('Table', () => {
    it('renders table element', () => {
      render(
        <Table data-testid="table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      const table = screen.getByTestId('table')
      expect(table).toBeInTheDocument()
      expect(table.tagName).toBe('TABLE')
    })

    it('applies custom className', () => {
      render(
        <Table className="custom-table" data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      expect(screen.getByTestId('table')).toHaveClass('custom-table')
    })
  })

  describe('TableHeader', () => {
    it('renders table header element', () => {
      render(
        <Table>
          <TableHeader data-testid="header">
            <TableRow>
              <TableHead>Column 1</TableHead>
              <TableHead>Column 2</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )

      const header = screen.getByTestId('header')
      expect(header).toBeInTheDocument()
      expect(header.tagName).toBe('THEAD')
    })

    it('applies custom className', () => {
      render(
        <Table>
          <TableHeader className="custom-header" data-testid="header">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )

      expect(screen.getByTestId('header')).toHaveClass('custom-header')
    })
  })

  describe('TableBody', () => {
    it('renders table body element', () => {
      render(
        <Table>
          <TableBody data-testid="body">
            <TableRow>
              <TableCell>Cell 1</TableCell>
              <TableCell>Cell 2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      const body = screen.getByTestId('body')
      expect(body).toBeInTheDocument()
      expect(body.tagName).toBe('TBODY')
    })

    it('applies custom className', () => {
      render(
        <Table>
          <TableBody className="custom-body" data-testid="body">
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      expect(screen.getByTestId('body')).toHaveClass('custom-body')
    })
  })

  describe('TableFooter', () => {
    it('renders table footer element', () => {
      render(
        <Table>
          <TableFooter data-testid="footer">
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>$100</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )

      const footer = screen.getByTestId('footer')
      expect(footer).toBeInTheDocument()
      expect(footer.tagName).toBe('TFOOT')
    })

    it('applies custom className', () => {
      render(
        <Table>
          <TableFooter className="custom-footer" data-testid="footer">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )

      expect(screen.getByTestId('footer')).toHaveClass('custom-footer')
    })
  })

  describe('TableRow', () => {
    it('renders table row element', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row">
              <TableCell>Row content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      const row = screen.getByTestId('row')
      expect(row).toBeInTheDocument()
      expect(row.tagName).toBe('TR')
    })

    it('applies custom className', () => {
      render(
        <Table>
          <TableBody>
            <TableRow className="custom-row" data-testid="row">
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      expect(screen.getByTestId('row')).toHaveClass('custom-row')
    })
  })

  describe('TableHead', () => {
    it('renders table head element', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head">Column Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )

      const head = screen.getByTestId('head')
      expect(head).toBeInTheDocument()
      expect(head.tagName).toBe('TH')
      expect(head).toHaveTextContent('Column Header')
    })

    it('applies custom className', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="custom-head" data-testid="head">
                Header
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )

      expect(screen.getByTestId('head')).toHaveClass('custom-head')
    })
  })

  describe('TableCell', () => {
    it('renders table cell element', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell data-testid="cell">Cell content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      const cell = screen.getByTestId('cell')
      expect(cell).toBeInTheDocument()
      expect(cell.tagName).toBe('TD')
      expect(cell).toHaveTextContent('Cell content')
    })

    it('applies custom className', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="custom-cell" data-testid="cell">
                Content
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      expect(screen.getByTestId('cell')).toHaveClass('custom-cell')
    })
  })

  describe('TableCaption', () => {
    it('renders table caption element', () => {
      render(
        <Table>
          <TableCaption data-testid="caption">
            A list of your recent invoices.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )

      const caption = screen.getByTestId('caption')
      expect(caption).toBeInTheDocument()
      expect(caption.tagName).toBe('CAPTION')
      expect(caption).toHaveTextContent('A list of your recent invoices.')
    })

    it('applies custom className', () => {
      render(
        <Table>
          <TableCaption className="custom-caption" data-testid="caption">
            Caption text
          </TableCaption>
        </Table>
      )

      expect(screen.getByTestId('caption')).toHaveClass('custom-caption')
    })
  })

  describe('Integration tests', () => {
    it('renders complete table structure', () => {
      render(
        <Table>
          <TableCaption>Monthly Invoice Summary</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>INV001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell>$250.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>INV002</TableCell>
              <TableCell>Pending</TableCell>
              <TableCell>PayPal</TableCell>
              <TableCell>$150.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>INV003</TableCell>
              <TableCell>Unpaid</TableCell>
              <TableCell>Bank Transfer</TableCell>
              <TableCell>$350.00</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell>$750.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )

      // Check caption
      expect(screen.getByText('Monthly Invoice Summary')).toBeInTheDocument()

      // Check headers
      expect(screen.getByText('Invoice ID')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Method')).toBeInTheDocument()
      expect(screen.getByText('Amount')).toBeInTheDocument()

      // Check body content
      expect(screen.getByText('INV001')).toBeInTheDocument()
      expect(screen.getByText('Paid')).toBeInTheDocument()
      expect(screen.getByText('Credit Card')).toBeInTheDocument()
      expect(screen.getByText('$250.00')).toBeInTheDocument()

      expect(screen.getByText('INV002')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('PayPal')).toBeInTheDocument()
      expect(screen.getByText('$150.00')).toBeInTheDocument()

      expect(screen.getByText('INV003')).toBeInTheDocument()
      expect(screen.getByText('Unpaid')).toBeInTheDocument()
      expect(screen.getByText('Bank Transfer')).toBeInTheDocument()
      expect(screen.getByText('$350.00')).toBeInTheDocument()

      // Check footer
      expect(screen.getByText('Total')).toBeInTheDocument()
      expect(screen.getByText('$750.00')).toBeInTheDocument()
    })

    it('handles empty table', () => {
      render(
        <Table data-testid="empty-table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* No rows */}
          </TableBody>
        </Table>
      )

      expect(screen.getByTestId('empty-table')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('handles table with only header', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column 1</TableHead>
              <TableHead>Column 2</TableHead>
              <TableHead>Column 3</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )

      expect(screen.getByText('Column 1')).toBeInTheDocument()
      expect(screen.getByText('Column 2')).toBeInTheDocument()
      expect(screen.getByText('Column 3')).toBeInTheDocument()
    })

    it('handles table with custom attributes', () => {
      render(
        <Table id="data-table" role="table" data-testid="custom-table">
          <TableBody>
            <TableRow>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      const table = screen.getByTestId('custom-table')
      expect(table).toHaveAttribute('id', 'data-table')
      expect(table).toHaveAttribute('role', 'table')
    })

    it('handles complex table with mixed content', () => {
      render(
        <Table>
          <TableCaption>User Data Table</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell>Alice Johnson</TableCell>
              <TableCell>Yes</TableCell>
              <TableCell>
                <button>Edit</button>
                <button>Delete</button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2</TableCell>
              <TableCell>Bob Smith</TableCell>
              <TableCell>No</TableCell>
              <TableCell>
                <button>Edit</button>
                <button>Delete</button>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>
                <div>2 users total</div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )

      // Check all content is rendered
      expect(screen.getByText('User Data Table')).toBeInTheDocument()
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(screen.getByText('Bob Smith')).toBeInTheDocument()
      expect(screen.getAllByText('Edit')).toHaveLength(2)
      expect(screen.getAllByText('Delete')).toHaveLength(2)
      expect(screen.getByText('2 users total')).toBeInTheDocument()
    })
  })
})