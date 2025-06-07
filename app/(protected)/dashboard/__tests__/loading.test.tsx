import { render, screen } from '@testing-library/react'
import Loading from '../loading'

describe('Dashboard Loading', () => {
  it('renders LoadingPage component', () => {
    render(<Loading />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays loading spinner', () => {
    const { container } = render(<Loading />)
    
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-12')
    expect(spinner).toHaveClass('w-12')
  })

  it('has proper container structure', () => {
    const { container } = render(<Loading />)
    
    const pageContainer = container.firstChild
    expect(pageContainer).toHaveClass('flex')
    expect(pageContainer).toHaveClass('min-h-[400px]')
    expect(pageContainer).toHaveClass('items-center')
    expect(pageContainer).toHaveClass('justify-center')
  })
})