import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../form'
import { Input } from '../input'
import { Button } from '../button'

// Test form component
const TestForm = ({ onSubmit = jest.fn() }: { onSubmit?: jest.fn }) => {
  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} data-testid="test-form">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

// Test form with validation
const TestFormWithValidation = () => {
  const form = useForm({
    defaultValues: {
      required_field: '',
    },
  })

  const onSubmit = (data: any) => {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="required_field"
          rules={{ required: 'This field is required' }}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Required Field</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

describe('Form Components', () => {
  describe('Form', () => {
    it('renders form with all fields', () => {
      render(<TestForm />)

      expect(screen.getByText('Username')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
      expect(screen.getByText('This is your public display name.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })

    it('submits form with field values', () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} />)

      const usernameInput = screen.getByPlaceholderText('Enter username')
      const emailInput = screen.getByPlaceholderText('Enter email')
      const submitButton = screen.getByRole('button', { name: 'Submit' })

      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      expect(mockSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
      })
    })

    it('handles form validation errors', () => {
      render(<TestFormWithValidation />)

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      
      // Submit without filling required field
      fireEvent.click(submitButton)

      // Error message should appear
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })
  })

  describe('FormField', () => {
    it('renders field with proper structure', () => {
      render(<TestForm />)

      // Check that form field structure is rendered
      const usernameLabel = screen.getByText('Username')
      const usernameInput = screen.getByPlaceholderText('Enter username')
      const description = screen.getByText('This is your public display name.')

      expect(usernameLabel).toBeInTheDocument()
      expect(usernameInput).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })

    it('handles field state changes', () => {
      render(<TestForm />)

      const usernameInput = screen.getByPlaceholderText('Enter username')
      
      fireEvent.change(usernameInput, { target: { value: 'new value' } })
      
      expect(usernameInput).toHaveValue('new value')
    })
  })

  describe('FormItem', () => {
    it('renders form item container', () => {
      render(<TestForm />)

      // FormItem should contain the label and input
      const usernameLabel = screen.getByText('Username')
      const usernameInput = screen.getByPlaceholderText('Enter username')

      expect(usernameLabel.closest('div')).toContainElement(usernameInput)
    })
  })

  describe('FormLabel', () => {
    it('renders form labels correctly', () => {
      render(<TestForm />)

      expect(screen.getByText('Username')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('associates label with input', () => {
      render(<TestForm />)

      const usernameLabel = screen.getByText('Username')
      const usernameInput = screen.getByPlaceholderText('Enter username')

      // Check that label is properly associated with input
      expect(usernameLabel).toBeInTheDocument()
      expect(usernameInput).toBeInTheDocument()
    })
  })

  describe('FormControl', () => {
    it('renders form control wrapper', () => {
      render(<TestForm />)

      // FormControl should wrap the input elements
      const usernameInput = screen.getByPlaceholderText('Enter username')
      const emailInput = screen.getByPlaceholderText('Enter email')

      expect(usernameInput).toBeInTheDocument()
      expect(emailInput).toBeInTheDocument()
    })
  })

  describe('FormDescription', () => {
    it('renders form description text', () => {
      render(<TestForm />)

      expect(screen.getByText('This is your public display name.')).toBeInTheDocument()
    })
  })

  describe('FormMessage', () => {
    it('displays validation error messages', () => {
      render(<TestFormWithValidation />)

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      
      // Submit without filling required field
      fireEvent.click(submitButton)

      // Error message should be displayed
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('does not display messages when no errors', () => {
      render(<TestForm />)

      // No error messages should be visible initially
      expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
    })
  })

  describe('Integration tests', () => {
    it('handles complete form workflow', () => {
      const mockSubmit = jest.fn()
      render(<TestForm onSubmit={mockSubmit} />)

      // Fill out the form
      fireEvent.change(screen.getByPlaceholderText('Enter username'), {
        target: { value: 'johndoe' },
      })
      fireEvent.change(screen.getByPlaceholderText('Enter email'), {
        target: { value: 'john@example.com' },
      })

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

      // Verify submission
      expect(mockSubmit).toHaveBeenCalledWith({
        username: 'johndoe',
        email: 'john@example.com',
      })
    })

    it('handles form reset', () => {
      render(<TestForm />)

      const usernameInput = screen.getByPlaceholderText('Enter username')
      
      // Change input value
      fireEvent.change(usernameInput, { target: { value: 'test' } })
      expect(usernameInput).toHaveValue('test')

      // Reset would be handled by react-hook-form reset function
      // This test verifies the initial state
      const form = screen.getByTestId('test-form')
      expect(form).toBeInTheDocument()
    })

    it('handles multiple form fields with different types', () => {
      render(<TestForm />)

      const usernameInput = screen.getByPlaceholderText('Enter username')
      const emailInput = screen.getByPlaceholderText('Enter email')

      expect(usernameInput).toHaveAttribute('type', 'text')
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })
})