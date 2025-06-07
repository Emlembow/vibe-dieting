import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from '../carousel'

// Mock embla-carousel-react
const mockEmblaCarousel = jest.fn()
const mockCarouselApi = {
  scrollPrev: jest.fn(),
  scrollNext: jest.fn(),
  canScrollPrev: jest.fn(() => true),
  canScrollNext: jest.fn(() => true),
  on: jest.fn(),
  off: jest.fn(),
}

jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => {
    mockEmblaCarousel()
    return [{ current: null }, mockCarouselApi]
  },
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ArrowLeft: ({ className }: { className?: string }) => (
    <div data-testid="arrow-left" className={className}>ArrowLeft</div>
  ),
  ArrowRight: ({ className }: { className?: string }) => (
    <div data-testid="arrow-right" className={className}>ArrowRight</div>
  ),
}))

// Test component that uses carousel context
const TestCarouselConsumer = () => {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel()
  
  return (
    <div>
      <span data-testid="can-scroll-prev">{canScrollPrev.toString()}</span>
      <span data-testid="can-scroll-next">{canScrollNext.toString()}</span>
      <button onClick={scrollPrev} data-testid="custom-prev">Custom Prev</button>
      <button onClick={scrollNext} data-testid="custom-next">Custom Next</button>
    </div>
  )
}

describe('Carousel Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCarouselApi.canScrollPrev.mockReturnValue(true)
    mockCarouselApi.canScrollNext.mockReturnValue(true)
  })

  describe('useCarousel hook', () => {
    it('throws error when used outside Carousel', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(() => {
        render(<TestCarouselConsumer />)
      }).toThrow('useCarousel must be used within a <Carousel />')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Carousel', () => {
    it('renders with default props', () => {
      render(
        <Carousel data-testid="carousel">
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByTestId('carousel')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Carousel className="custom-carousel" data-testid="carousel">
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByTestId('carousel')).toHaveClass('custom-carousel')
    })

    it('handles vertical orientation', () => {
      render(
        <Carousel orientation="vertical" data-testid="carousel">
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByTestId('carousel')).toBeInTheDocument()
    })

    it('provides context to children', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
          <TestCarouselConsumer />
        </Carousel>
      )

      expect(screen.getByTestId('can-scroll-prev')).toHaveTextContent('true')
      expect(screen.getByTestId('can-scroll-next')).toHaveTextContent('true')
    })

    it('calls setApi when provided', () => {
      const setApi = jest.fn()
      
      render(
        <Carousel setApi={setApi}>
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(setApi).toHaveBeenCalledWith(mockCarouselApi)
    })

    it('passes options to embla carousel', () => {
      const opts = { loop: true, align: 'start' as const }
      
      render(
        <Carousel opts={opts}>
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(mockEmblaCarousel).toHaveBeenCalled()
    })
  })

  describe('CarouselContent', () => {
    it('renders content container', () => {
      render(
        <Carousel>
          <CarouselContent data-testid="carousel-content">
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByTestId('carousel-content')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Carousel>
          <CarouselContent className="custom-content" data-testid="carousel-content">
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByTestId('carousel-content')).toHaveClass('custom-content')
    })
  })

  describe('CarouselItem', () => {
    it('renders individual items', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem data-testid="item-1">Item 1</CarouselItem>
            <CarouselItem data-testid="item-2">Item 2</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByTestId('item-1')).toBeInTheDocument()
      expect(screen.getByTestId('item-2')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem className="custom-item" data-testid="item">
              Item
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByTestId('item')).toHaveClass('custom-item')
    })
  })

  describe('CarouselPrevious', () => {
    it('renders previous button and handles click', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
          </CarouselContent>
          <CarouselPrevious data-testid="prev-button" />
        </Carousel>
      )

      const prevButton = screen.getByTestId('prev-button')
      expect(prevButton).toBeInTheDocument()
      expect(screen.getByTestId('arrow-left')).toBeInTheDocument()

      fireEvent.click(prevButton)
      expect(mockCarouselApi.scrollPrev).toHaveBeenCalled()
    })

    it('disables button when cannot scroll prev', () => {
      mockCarouselApi.canScrollPrev.mockReturnValue(false)
      
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
          <CarouselPrevious data-testid="prev-button" />
        </Carousel>
      )

      expect(screen.getByTestId('prev-button')).toBeDisabled()
    })

    it('applies custom className', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="custom-prev" data-testid="prev-button" />
        </Carousel>
      )

      expect(screen.getByTestId('prev-button')).toHaveClass('custom-prev')
    })

    it('forwards additional props', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
          <CarouselPrevious title="Previous slide" data-testid="prev-button" />
        </Carousel>
      )

      expect(screen.getByTestId('prev-button')).toHaveAttribute('title', 'Previous slide')
    })
  })

  describe('CarouselNext', () => {
    it('renders next button and handles click', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
          </CarouselContent>
          <CarouselNext data-testid="next-button" />
        </Carousel>
      )

      const nextButton = screen.getByTestId('next-button')
      expect(nextButton).toBeInTheDocument()
      expect(screen.getByTestId('arrow-right')).toBeInTheDocument()

      fireEvent.click(nextButton)
      expect(mockCarouselApi.scrollNext).toHaveBeenCalled()
    })

    it('disables button when cannot scroll next', () => {
      mockCarouselApi.canScrollNext.mockReturnValue(false)
      
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
          <CarouselNext data-testid="next-button" />
        </Carousel>
      )

      expect(screen.getByTestId('next-button')).toBeDisabled()
    })

    it('applies custom className', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
          <CarouselNext className="custom-next" data-testid="next-button" />
        </Carousel>
      )

      expect(screen.getByTestId('next-button')).toHaveClass('custom-next')
    })
  })

  describe('Integration tests', () => {
    it('handles complete carousel with navigation', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>
              <div>Slide 1</div>
            </CarouselItem>
            <CarouselItem>
              <div>Slide 2</div>
            </CarouselItem>
            <CarouselItem>
              <div>Slide 3</div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious data-testid="prev" />
          <CarouselNext data-testid="next" />
        </Carousel>
      )

      expect(screen.getByText('Slide 1')).toBeInTheDocument()
      expect(screen.getByText('Slide 2')).toBeInTheDocument()
      expect(screen.getByText('Slide 3')).toBeInTheDocument()

      const nextButton = screen.getByTestId('next')
      const prevButton = screen.getByTestId('prev')

      fireEvent.click(nextButton)
      expect(mockCarouselApi.scrollNext).toHaveBeenCalled()

      fireEvent.click(prevButton)
      expect(mockCarouselApi.scrollPrev).toHaveBeenCalled()
    })

    it('handles carousel with custom API usage', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
          <TestCarouselConsumer />
        </Carousel>
      )

      fireEvent.click(screen.getByTestId('custom-next'))
      expect(mockCarouselApi.scrollNext).toHaveBeenCalled()

      fireEvent.click(screen.getByTestId('custom-prev'))
      expect(mockCarouselApi.scrollPrev).toHaveBeenCalled()
    })

    it('handles scroll state changes', async () => {
      // Mock state change
      mockCarouselApi.canScrollPrev.mockReturnValue(false)
      mockCarouselApi.canScrollNext.mockReturnValue(true)

      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
          <TestCarouselConsumer />
          <CarouselPrevious data-testid="prev" />
          <CarouselNext data-testid="next" />
        </Carousel>
      )

      expect(screen.getByTestId('can-scroll-prev')).toHaveTextContent('false')
      expect(screen.getByTestId('can-scroll-next')).toHaveTextContent('true')
    })

    it('handles ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>()
      
      render(
        <Carousel ref={ref}>
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('handles different carousel orientations', () => {
      const { rerender } = render(
        <Carousel orientation="horizontal" data-testid="carousel">
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByTestId('carousel')).toBeInTheDocument()

      rerender(
        <Carousel orientation="vertical" data-testid="carousel">
          <CarouselContent>
            <CarouselItem>Item</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByTestId('carousel')).toBeInTheDocument()
    })
  })
})