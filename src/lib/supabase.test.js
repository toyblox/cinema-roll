import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoist mock references so they're available in vi.mock factory
const { mockAuth, mockQuery, mockFrom } = vi.hoisted(() => {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }
  const mockAuth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  }
  const mockFrom = vi.fn(() => mockQuery)
  return { mockAuth, mockQuery, mockFrom }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: mockAuth,
    from: mockFrom,
  })),
}))

import { signUp, signIn, signOut, getProfile, updateProfile } from './supabase'

beforeEach(() => {
  vi.clearAllMocks()
  // Re-apply mockReturnThis since clearAllMocks resets implementations
  mockQuery.select.mockReturnThis()
  mockQuery.update.mockReturnThis()
  mockQuery.eq.mockReturnThis()
  mockFrom.mockReturnValue(mockQuery)
})

describe('supabase auth helpers', () => {
  describe('signUp', () => {
    it('calls supabase.auth.signUp with email and password', async () => {
      mockAuth.signUp.mockResolvedValue({ data: {}, error: null })

      await signUp('test@example.com', 'password123')

      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('returns the result from supabase', async () => {
      const expected = { data: { user: { id: 'uuid-1' } }, error: null }
      mockAuth.signUp.mockResolvedValue(expected)

      const result = await signUp('test@example.com', 'password123')

      expect(result).toEqual(expected)
    })

    it('returns error when sign up fails', async () => {
      const expected = { data: null, error: { message: 'Email already exists' } }
      mockAuth.signUp.mockResolvedValue(expected)

      const result = await signUp('existing@example.com', 'password123')

      expect(result.error.message).toBe('Email already exists')
    })
  })

  describe('signIn', () => {
    it('calls supabase.auth.signInWithPassword with email and password', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({ data: {}, error: null })

      await signIn('test@example.com', 'password123')

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('returns the result from supabase', async () => {
      const expected = { data: { session: { access_token: 'tok' } }, error: null }
      mockAuth.signInWithPassword.mockResolvedValue(expected)

      const result = await signIn('test@example.com', 'password123')

      expect(result).toEqual(expected)
    })

    it('returns error on invalid credentials', async () => {
      const expected = { data: null, error: { message: 'Invalid login credentials' } }
      mockAuth.signInWithPassword.mockResolvedValue(expected)

      const result = await signIn('bad@example.com', 'wrongpass')

      expect(result.error.message).toBe('Invalid login credentials')
    })
  })

  describe('signOut', () => {
    it('calls supabase.auth.signOut', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null })

      await signOut()

      expect(mockAuth.signOut).toHaveBeenCalled()
    })

    it('returns the result from supabase', async () => {
      const expected = { error: null }
      mockAuth.signOut.mockResolvedValue(expected)

      const result = await signOut()

      expect(result).toEqual(expected)
    })
  })

  describe('getProfile', () => {
    it('queries the profiles table for the given userId', async () => {
      mockQuery.single.mockResolvedValue({ data: { id: 'uuid-1', display_name: 'alicia' }, error: null })

      await getProfile('uuid-1')

      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'uuid-1')
      expect(mockQuery.single).toHaveBeenCalled()
    })

    it('returns the profile data', async () => {
      const profileData = { id: 'uuid-1', display_name: 'alicia' }
      mockQuery.single.mockResolvedValue({ data: profileData, error: null })

      const result = await getProfile('uuid-1')

      expect(result.data).toEqual(profileData)
    })
  })

  describe('updateProfile', () => {
    it('updates the profiles table for the given userId', async () => {
      mockQuery.eq.mockResolvedValue({ data: null, error: null })

      await updateProfile('uuid-1', { display_name: 'alicia2' })

      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(mockQuery.update).toHaveBeenCalledWith({ display_name: 'alicia2' })
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'uuid-1')
    })

    it('returns the result from supabase', async () => {
      const expected = { data: null, error: null }
      mockQuery.eq.mockResolvedValue(expected)

      const result = await updateProfile('uuid-1', { display_name: 'alicia2' })

      expect(result).toEqual(expected)
    })
  })
})
