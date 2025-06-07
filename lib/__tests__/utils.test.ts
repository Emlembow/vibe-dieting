import { cn } from '../utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('combines class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('handles conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
    })

    it('filters out falsy values', () => {
      const result = cn('base-class', false && 'hidden', null, undefined, 'visible')
      expect(result).toContain('base-class')
      expect(result).toContain('visible')
      expect(result).not.toContain('hidden')
    })

    it('handles array inputs', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('handles object inputs', () => {
      const result = cn({
        'active': true,
        'inactive': false,
        'visible': true
      })
      expect(result).toContain('active')
      expect(result).toContain('visible')
      expect(result).not.toContain('inactive')
    })
  })
})