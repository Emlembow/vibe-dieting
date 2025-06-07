import { supabase, createServerClient } from '@/lib/supabase'

describe('Supabase Client', () => {
  // Since the supabase client is created immediately when the module loads,
  // and we have a global mock in jest.setup.js, we'll test the behavior
  // rather than the implementation details
  
  describe('supabase client', () => {
    it('exports a supabase client', () => {
      expect(supabase).toBeDefined()
      expect(supabase.auth).toBeDefined()
      expect(supabase.from).toBeDefined()
    })
  })

  describe('createServerClient', () => {
    it('exports createServerClient function', () => {
      expect(createServerClient).toBeDefined()
      expect(typeof createServerClient).toBe('function')
    })
  })
})