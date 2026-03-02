import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileSettings from './ProfileSettings'

vi.mock('../lib/supabase', () => ({
  updateProfile: vi.fn(),
}))

import { updateProfile } from '../lib/supabase'

const mockUser = { id: 'user-uuid-1' }
const mockProfile = { id: 'user-uuid-1', display_name: 'alicia' }

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  user: mockUser,
  profile: mockProfile,
  onProfileUpdate: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProfileSettings', () => {
  describe('rendering', () => {
    it('shows "Profile" heading', () => {
      render(<ProfileSettings {...defaultProps} />)
      expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    })

    it('pre-fills display name from profile', () => {
      render(<ProfileSettings {...defaultProps} />)
      expect(screen.getByDisplayValue('alicia')).toBeInTheDocument()
    })

    it('returns null when isOpen is false', () => {
      const { container } = render(<ProfileSettings {...defaultProps} isOpen={false} />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('saving changes', () => {
    it('calls updateProfile with new display name', async () => {
      const user = userEvent.setup()
      updateProfile.mockResolvedValue({ error: null })
      render(<ProfileSettings {...defaultProps} />)

      const input = screen.getByDisplayValue('alicia')
      await user.clear(input)
      await user.type(input, 'alicia2')
      await user.click(screen.getByRole('button', { name: 'Save Changes' }))

      expect(updateProfile).toHaveBeenCalledWith('user-uuid-1', { display_name: 'alicia2' })
    })

    it('trims whitespace from display name before saving', async () => {
      const user = userEvent.setup()
      updateProfile.mockResolvedValue({ error: null })
      render(<ProfileSettings {...defaultProps} />)

      const input = screen.getByDisplayValue('alicia')
      await user.clear(input)
      await user.type(input, '  alicia  ')
      await user.click(screen.getByRole('button', { name: 'Save Changes' }))

      expect(updateProfile).toHaveBeenCalledWith('user-uuid-1', { display_name: 'alicia' })
    })

    it('calls onProfileUpdate with updated profile on success', async () => {
      const user = userEvent.setup()
      const onProfileUpdate = vi.fn()
      updateProfile.mockResolvedValue({ error: null })
      render(<ProfileSettings {...defaultProps} onProfileUpdate={onProfileUpdate} />)

      const input = screen.getByDisplayValue('alicia')
      await user.clear(input)
      await user.type(input, 'alicia2')
      await user.click(screen.getByRole('button', { name: 'Save Changes' }))

      await waitFor(() =>
        expect(onProfileUpdate).toHaveBeenCalledWith({ ...mockProfile, display_name: 'alicia2' })
      )
    })

    it('calls onClose on successful save', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      updateProfile.mockResolvedValue({ error: null })
      render(<ProfileSettings {...defaultProps} onClose={onClose} />)

      await user.click(screen.getByRole('button', { name: 'Save Changes' }))

      await waitFor(() => expect(onClose).toHaveBeenCalled())
    })

    it('shows error message on save failure', async () => {
      const user = userEvent.setup()
      updateProfile.mockResolvedValue({ error: { message: 'Update failed' } })
      render(<ProfileSettings {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: 'Save Changes' }))

      await waitFor(() => expect(screen.getByText('Update failed')).toBeInTheDocument())
    })

    it('does not call onClose on save failure', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      updateProfile.mockResolvedValue({ error: { message: 'Update failed' } })
      render(<ProfileSettings {...defaultProps} onClose={onClose} />)

      await user.click(screen.getByRole('button', { name: 'Save Changes' }))

      await waitFor(() => expect(screen.getByText('Update failed')).toBeInTheDocument())
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('save button state', () => {
    it('disables Save Changes when display name is empty', async () => {
      const user = userEvent.setup()
      render(<ProfileSettings {...defaultProps} />)

      const input = screen.getByDisplayValue('alicia')
      await user.clear(input)

      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled()
    })

    it('disables Save Changes when display name is only whitespace', async () => {
      const user = userEvent.setup()
      render(<ProfileSettings {...defaultProps} />)

      const input = screen.getByDisplayValue('alicia')
      await user.clear(input)
      await user.type(input, '   ')

      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled()
    })

    it('shows "Saving..." while loading', async () => {
      const user = userEvent.setup()
      updateProfile.mockReturnValue(new Promise(() => {}))
      render(<ProfileSettings {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: 'Save Changes' }))

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
      )
    })
  })

  describe('closing', () => {
    it('calls onClose when clicking the × button', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<ProfileSettings {...defaultProps} onClose={onClose} />)

      await user.click(screen.getByRole('button', { name: '×' }))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when clicking the overlay', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const { container } = render(<ProfileSettings {...defaultProps} onClose={onClose} />)

      await user.click(container.firstChild)

      expect(onClose).toHaveBeenCalled()
    })
  })
})
