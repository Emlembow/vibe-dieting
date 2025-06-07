import { render, screen } from '@/test-utils'
import { HighlightMatch } from '../highlight-match'

describe('HighlightMatch Component', () => {
  it('highlights matching text', () => {
    render(<HighlightMatch text="Chicken Breast" highlight="chicken" />)
    
    const highlightedText = screen.getByText('Chicken')
    expect(highlightedText).toHaveClass('bg-yellow-200')
    expect(screen.getByText(' Breast')).toBeInTheDocument()
  })

  it('handles case insensitive matching', () => {
    render(<HighlightMatch text="Chicken Breast" highlight="CHICKEN" />)
    
    const highlightedText = screen.getByText('Chicken')
    expect(highlightedText).toHaveClass('bg-yellow-200')
  })

  it('handles multiple matches', () => {
    render(<HighlightMatch text="Chicken and Chicken" highlight="chicken" />)
    
    const highlightedElements = screen.getAllByText('Chicken')
    expect(highlightedElements).toHaveLength(2)
    highlightedElements.forEach(element => {
      expect(element).toHaveClass('bg-yellow-200')
    })
  })

  it('returns original text when no highlight provided', () => {
    render(<HighlightMatch text="Chicken Breast" highlight="" />)
    
    expect(screen.getByText('Chicken Breast')).toBeInTheDocument()
    expect(screen.queryByText('Chicken Breast')).not.toHaveClass('bg-yellow-200')
  })

  it('returns original text when no match found', () => {
    render(<HighlightMatch text="Chicken Breast" highlight="beef" />)
    
    expect(screen.getByText('Chicken Breast')).toBeInTheDocument()
    expect(screen.queryByText('beef')).not.toBeInTheDocument()
  })

  it('handles special regex characters', () => {
    render(<HighlightMatch text="Cost $5.99" highlight="$5.99" />)
    
    expect(screen.getByText('Cost ')).toBeInTheDocument()
    expect(screen.getByText('$5.99')).toHaveClass('bg-yellow-200')
  })
})