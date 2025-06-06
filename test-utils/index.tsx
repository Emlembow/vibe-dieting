import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/context/auth-context'
import { User } from '@supabase/supabase-js'

// Mock user for testing
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  confirmation_sent_at: null,
  confirmed_at: new Date().toISOString(),
  recovery_sent_at: null,
  email_confirmed_at: new Date().toISOString(),
  phone: null,
  phone_confirmed_at: null,
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
}

interface TestAuthProviderProps {
  children: React.ReactNode
  user?: User | null
  isLoading?: boolean
}

// Test wrapper for auth context
const TestAuthProvider: React.FC<TestAuthProviderProps> = ({ 
  children, 
  user = mockUser,
  isLoading = false 
}) => {
  return (
    <AuthProvider value={{
      user,
      isLoading,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    }}>
      {children}
    </AuthProvider>
  )
}

// All providers that tests might need
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <TestAuthProvider>
      {children}
    </TestAuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Re-export screen separately to avoid conflicts
import { screen as rtlScreen } from '@testing-library/react'
export { rtlScreen as screen }

// Mock data generators
export const createMockFoodEntry = (overrides = {}) => ({
  id: 'test-food-id',
  user_id: mockUser.id,
  food_name: 'Test Food',
  calories: 200,
  protein: 20,
  carbs: 25,
  fat: 8,
  quantity: 1,
  unit: 'serving',
  consumed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const createMockMacroGoal = (overrides = {}) => ({
  id: 'test-goal-id',
  user_id: mockUser.id,
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 70,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

// Utility to wait for async operations
export const waitForLoadingToFinish = () => 
  rtlScreen.findByText((content, element) => {
    return element?.tagName.toLowerCase() !== 'script'
  })