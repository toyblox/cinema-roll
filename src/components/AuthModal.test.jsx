import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthModal from './AuthModal'

vi.mock('../lib/supabase', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}))

import { signIn, signUp } from '../lib/supabase'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  initialMode: 'signin',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthModal', () => {
  describe('rendering', () => {
    it('shows "Sign In" heading in signin mode', () => {
      render(<AuthModal {...defaultProps} initialMode="signin" />)
      expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    })

    it('shows "Create Account" heading in signup mode', () => {
      render(<AuthModal {...defaultProps} initialMode="signup" />)
      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
    })

    it('renders email and password fields', () => {
      render(<AuthModal {...defaultProps} />)
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    })

    it('returns null when isOpen is false', () => {
      const { container } = render(<AuthModal {...defaultProps} isOpen={false} />)
      expect(container.firstChild).toBeNull()
    })

    it('shows "Create an account" link in signin mode', () => {
      render(<AuthModal {...defaultProps} initialMode="signin" />)
      expect(screen.getByText('Create an account')).toBeInTheDocument()
    })

    it('shows "Sign in" link in signup mode', () => {
      render(<AuthModal {...defaultProps} initialMode="signup" />)
      expect(screen.getByText('Sign in')).toBeInTheDocument()
    })
  })

  describe('mode switching', () => {
    it('switches to signup mode when "Create an account" is clicked', async () => {
      const user = userEvent.setup()
      render(<AuthModal {...defaultProps} initialMode="signin" />)

      await user.click(screen.getByText('Create an account'))

      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
    })

    it('switches back to signin mode when "Sign in" link is clicked', async () => {
      const user = userEvent.setup()
      render(<AuthModal {...defaultProps} initialMode="signup" />)

      await user.click(screen.getByText('Sign in'))

      expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    })

    it('resets to correct mode when modal is reopened', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<AuthModal {...defaultProps} initialMode="signin" />)

      // Switch to signup internally
      await user.click(screen.getByText('Create an account'))
      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()

      // Close and reopen as signup
      rerender(<AuthModal {...defaultProps} isOpen={false} initialMode="signup" />)
      rerender(<AuthModal {...defaultProps} isOpen={true} initialMode="signup" />)

      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
    })

    it('resets to signin mode when reopened with initialMode="signin"', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<AuthModal {...defaultProps} initialMode="signup" />)

      // Verify we start in signup mode
      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()

      // Close and reopen as signin
      rerender(<AuthModal {...defaultProps} isOpen={false} initialMode="signin" />)
      rerender(<AuthModal {...defaultProps} isOpen={true} initialMode="signin" />)

      expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    })
  })

  describe('form submission — sign in', () => {
    it('calls signIn with email and password', async () => {
      const user = userEvent.setup()
      signIn.mockResolvedValue({ error: null })
      render(<AuthModal {...defaultProps} initialMode="signin" />)

      await user.type(screen.getByPlaceholderText('Email'), 'alicia@example.com')
      await user.type(screen.getByPlaceholderText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Sign In' }))

      expect(signIn).toHaveBeenCalledWith('alicia@example.com', 'password123')
    })

    it('calls onClose on successful sign in', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      signIn.mockResolvedValue({ error: null })
      render(<AuthModal {...defaultProps} onClose={onClose} initialMode="signin" />)

      await user.type(screen.getByPlaceholderText('Email'), 'alicia@example.com')
      await user.type(screen.getByPlaceholderText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Sign In' }))

      await waitFor(() => expect(onClose).toHaveBeenCalled())
    })

    it('shows error message on failed sign in', async () => {
      const user = userEvent.setup()
      signIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
      render(<AuthModal {...defaultProps} initialMode="signin" />)

      await user.type(screen.getByPlaceholderText('Email'), 'wrong@example.com')
      await user.type(screen.getByPlaceholderText('Password'), 'wrongpass')
      await user.click(screen.getByRole('button', { name: 'Sign In' }))

      await waitFor(() =>
        expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
      )
    })

    it('does not call onClose on failed sign in', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      signIn.mockResolvedValue({ error: { message: 'Invalid credentials' } })
      render(<AuthModal {...defaultProps} onClose={onClose} initialMode="signin" />)

      await user.type(screen.getByPlaceholderText('Email'), 'bad@example.com')
      await user.type(screen.getByPlaceholderText('Password'), 'badpass')
      await user.click(screen.getByRole('button', { name: 'Sign In' }))

      await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument())
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('form submission — create account', () => {
    it('calls signUp with email and password', async () => {
      const user = userEvent.setup()
      signUp.mockResolvedValue({ error: null })
      render(<AuthModal {...defaultProps} initialMode="signup" />)

      await user.type(screen.getByPlaceholderText('Email'), 'chris@example.com')
      await user.type(screen.getByPlaceholderText('Password'), 'securepass')
      await user.click(screen.getByRole('button', { name: 'Create Account' }))

      expect(signUp).toHaveBeenCalledWith('chris@example.com', 'securepass')
    })

    it('calls onClose on successful sign up', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      signUp.mockResolvedValue({ error: null })
      render(<AuthModal {...defaultProps} onClose={onClose} initialMode="signup" />)

      await user.type(screen.getByPlaceholderText('Email'), 'chris@example.com')
      await user.type(screen.getByPlaceholderText('Password'), 'securepass')
      await user.click(screen.getByRole('button', { name: 'Create Account' }))

      await waitFor(() => expect(onClose).toHaveBeenCalled())
    })

    it('shows error message on failed sign up', async () => {
      const user = userEvent.setup()
      signUp.mockResolvedValue({ error: { message: 'Email already registered' } })
      render(<AuthModal {...defaultProps} initialMode="signup" />)

      await user.type(screen.getByPlaceholderText('Email'), 'existing@example.com')
      await user.type(screen.getByPlaceholderText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Create Account' }))

      await waitFor(() =>
        expect(screen.getByText('Email already registered')).toBeInTheDocument()
      )
    })

    it('clears error when switching modes', async () => {
      const user = userEvent.setup()
      signUp.mockResolvedValue({ error: { message: 'Email already registered' } })
      render(<AuthModal {...defaultProps} initialMode="signup" />)

      await user.type(screen.getByPlaceholderText('Email'), 'existing@example.com')
      await user.type(screen.getByPlaceholderText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Create Account' }))
      await waitFor(() => expect(screen.getByText('Email already registered')).toBeInTheDocument())

      await user.click(screen.getByText('Sign in'))

      expect(screen.queryByText('Email already registered')).not.toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows "Please wait..." and disables submit while loading', async () => {
      const user = userEvent.setup()
      // Never resolves — keeps modal in loading state
      signIn.mockReturnValue(new Promise(() => {}))
      render(<AuthModal {...defaultProps} initialMode="signin" />)

      await user.type(screen.getByPlaceholderText('Email'), 'alicia@example.com')
      await user.type(screen.getByPlaceholderText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Sign In' }))

      await waitFor(() => {
        const btn = screen.getByRole('button', { name: 'Please wait...' })
        expect(btn).toBeDisabled()
      })
    })
  })

  describe('closing', () => {
    it('calls onClose when clicking the × button', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<AuthModal {...defaultProps} onClose={onClose} />)

      await user.click(screen.getByRole('button', { name: '×' }))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when clicking the overlay', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const { container } = render(<AuthModal {...defaultProps} onClose={onClose} />)

      // Click the overlay (first child = the overlay div)
      await user.click(container.firstChild)

      expect(onClose).toHaveBeenCalled()
    })

    it('does not close when clicking inside the modal content', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<AuthModal {...defaultProps} onClose={onClose} />)

      await user.click(screen.getByRole('heading', { name: 'Sign In' }))

      expect(onClose).not.toHaveBeenCalled()
    })
  })
})
