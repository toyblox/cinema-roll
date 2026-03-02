import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// ─── Supabase mock ────────────────────────────────────────────────────────────

const { mockSupabase, mockSignOut, mockGetProfile } = vi.hoisted(() => {
  const mockOrder = vi.fn().mockResolvedValue({ data: [] })
  const mockEq = vi.fn().mockReturnThis()
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    eq: mockEq,
    order: mockOrder,
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    delete: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
  }
  // Make eq() chain back to the same object but also support being the terminal call
  mockEq.mockReturnValue(mockQuery)

  const mockAuth = {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  }

  const mockSupabase = {
    auth: mockAuth,
    from: vi.fn(() => mockQuery),
  }

  const mockSignOut = vi.fn().mockResolvedValue({})
  const mockGetProfile = vi.fn()

  return { mockSupabase, mockSignOut, mockGetProfile }
})

vi.mock('./lib/supabase', () => ({
  supabase: mockSupabase,
  signOut: mockSignOut,
  getProfile: mockGetProfile,
  signIn: vi.fn(),
  signUp: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock('./lib/tmdb', () => ({
  searchMovies: vi.fn().mockResolvedValue([]),
  getSimilarMovieRecommendations: vi.fn().mockResolvedValue([]),
}))

vi.mock('./lib/claude', () => ({
  getRecommendations: vi.fn(),
}))

// ─── Test helpers ─────────────────────────────────────────────────────────────

const mockUser = { id: 'user-uuid-1', email: 'alicia@example.com' }
const mockProfile = { id: 'user-uuid-1', display_name: 'alicia' }

function setupLoggedOut() {
  mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })
}

function setupLoggedIn(user = mockUser, profile = mockProfile) {
  mockSupabase.auth.getSession.mockResolvedValue({
    data: { session: { user } },
  })
  mockGetProfile.mockResolvedValue({ data: profile })
}

async function renderApp() {
  render(<App />)
  // Wait for auth initialization to complete
  await waitFor(() => expect(mockSupabase.auth.getSession).toHaveBeenCalled())
}

beforeEach(() => {
  vi.clearAllMocks()
  // Restore default chaining behavior after clearAllMocks
  mockSupabase.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  })
  const mockQuery = mockSupabase.from()
  mockQuery.select.mockReturnThis()
  mockQuery.eq.mockReturnValue(mockQuery)
  mockQuery.order.mockResolvedValue({ data: [] })
  mockSupabase.from.mockReturnValue(mockQuery)
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('App — auth header', () => {
  it('shows Sign In and Create Account buttons when logged out', async () => {
    setupLoggedOut()
    await renderApp()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
    })
  })

  it('shows user display name and Sign Out when logged in', async () => {
    setupLoggedIn()
    await renderApp()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'alicia' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
    })
  })

  it('does not show Sign In / Create Account when logged in', async () => {
    setupLoggedIn()
    await renderApp()

    await waitFor(() => expect(screen.getByText('alicia')).toBeInTheDocument())

    expect(screen.queryByRole('button', { name: 'Sign In' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Create Account' })).not.toBeInTheDocument()
  })

  it('calls signOut when Sign Out button is clicked', async () => {
    const user = userEvent.setup()
    setupLoggedIn()
    await renderApp()

    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Sign Out' }))

    expect(mockSignOut).toHaveBeenCalled()
  })
})

describe('App — auth modals', () => {
  it('opens auth modal in signin mode when "Sign In" header button is clicked', async () => {
    const user = userEvent.setup()
    setupLoggedOut()
    await renderApp()

    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    // Modal heading should be "Sign In" (not "Create Account")
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('opens auth modal in signup mode when "Create Account" header button is clicked', async () => {
    const user = userEvent.setup()
    setupLoggedOut()
    await renderApp()

    await waitFor(() => expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Create Account' }))

    // Modal heading should be "Create Account" (the bug this fixes)
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
  })

  it('opens signin modal when "Sign in" link in the recommend hint is clicked', async () => {
    const user = userEvent.setup()
    setupLoggedOut()
    await renderApp()

    // The recommend hint contains a "Sign in" button distinct from the header button
    await waitFor(() => expect(screen.getByText(/sign in to get personalized picks/i)).toBeInTheDocument())

    // There are two "Sign In"-ish buttons: header "Sign In" and the hint inline "Sign in"
    // The hint button has exact text "Sign in" (lowercase 'i')
    const hintSignIn = screen.getByRole('button', { name: 'Sign in' })
    await user.click(hintSignIn)

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('opens signin modal when "Sign In" button in Lists empty state is clicked', async () => {
    const user = userEvent.setup()
    setupLoggedOut()
    await renderApp()

    await waitFor(() => screen.getByRole('button', { name: 'Sign In' }))

    // Navigate to Lists tab
    await user.click(screen.getByRole('button', { name: 'Lists' }))

    const signInBtn = screen.getAllByRole('button', { name: 'Sign In' }).find(
      btn => !btn.closest('.header-auth')
    )
    await user.click(signInBtn)

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
  })
})

describe('App — recommend tab', () => {
  it('shows the recommend button as always enabled when logged out', async () => {
    setupLoggedOut()
    await renderApp()

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: 'Recommend Me a Movie' })
      expect(btn).not.toBeDisabled()
    })
  })

  it('shows "sign in" hint when logged out', async () => {
    setupLoggedOut()
    await renderApp()

    await waitFor(() =>
      expect(screen.getByText(/sign in to get personalized picks/i)).toBeInTheDocument()
    )
  })

  it('shows no sign-in hint when logged in with movies', async () => {
    setupLoggedIn()
    // Simulate having movies loaded
    const mockQuery = mockSupabase.from()
    mockQuery.order
      .mockResolvedValueOnce({ data: [{ id: 'uuid-1', tmdb_id: 550, title: 'Fight Club', list_type: 'to_watch' }] })
      .mockResolvedValueOnce({ data: [] })
    await renderApp()

    await waitFor(() => expect(screen.queryByText(/sign in to get personalized picks/i)).not.toBeInTheDocument())
  })

  it('shows 0/0 stats when logged out', async () => {
    setupLoggedOut()
    await renderApp()

    await waitFor(() => {
      const statNumbers = screen.getAllByText('0')
      expect(statNumbers.length).toBeGreaterThanOrEqual(2)
    })
  })
})

describe('App — lists tab', () => {
  it('shows logged-out empty state in Lists tab when not authenticated', async () => {
    const user = userEvent.setup()
    setupLoggedOut()
    await renderApp()

    await waitFor(() => screen.getByRole('button', { name: 'Sign In' }))
    await user.click(screen.getByRole('button', { name: 'Lists' }))

    expect(screen.getByText('Your lists await')).toBeInTheDocument()
    expect(screen.getByText('Sign in to save movies and build your lists')).toBeInTheDocument()
  })

  it('shows list toggle buttons when logged in', async () => {
    const user = userEvent.setup()
    setupLoggedIn()
    await renderApp()

    await waitFor(() => expect(screen.getByText('alicia')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Lists' }))

    // Use role query to target the toggle buttons specifically, not the empty-state heading
    expect(screen.getByRole('button', { name: /To Watch/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Watched/ })).toBeInTheDocument()
  })

  it('shows empty-list message (not auth prompt) when logged in but list is empty', async () => {
    const user = userEvent.setup()
    setupLoggedIn()
    await renderApp()

    await waitFor(() => expect(screen.getByText('alicia')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Lists' }))

    expect(screen.getByText('Your To Watch list is empty')).toBeInTheDocument()
    expect(screen.queryByText('Your lists await')).not.toBeInTheDocument()
  })
})

describe('App — search tab', () => {
  it('shows logged-out empty state in Search tab when not authenticated', async () => {
    const user = userEvent.setup()
    setupLoggedOut()
    await renderApp()

    await waitFor(() => screen.getByRole('button', { name: 'Sign In' }))
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(screen.getByText('Save movies to your lists')).toBeInTheDocument()
    expect(screen.getByText('Sign in to search and add movies')).toBeInTheDocument()
  })

  it('shows the search form when logged in', async () => {
    const user = userEvent.setup()
    setupLoggedIn()
    await renderApp()

    await waitFor(() => expect(screen.getByText('alicia')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(screen.getByPlaceholderText('Search for a movie...')).toBeInTheDocument()
  })
})

describe('App — add to list auth gate', () => {
  it('opens auth modal when logged-out user clicks recommend hint Sign in link', async () => {
    const user = userEvent.setup()
    setupLoggedOut()
    await renderApp()

    await waitFor(() => expect(screen.getByText(/sign in to get personalized picks/i)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
  })
})

describe('App — profile settings', () => {
  it('opens ProfileSettings modal when display name is clicked', async () => {
    const user = userEvent.setup()
    setupLoggedIn()
    await renderApp()

    await waitFor(() => expect(screen.getByRole('button', { name: 'alicia' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'alicia' }))

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
  })

  it('pre-fills display name in settings modal', async () => {
    const user = userEvent.setup()
    setupLoggedIn()
    await renderApp()

    await waitFor(() => expect(screen.getByRole('button', { name: 'alicia' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'alicia' }))

    expect(screen.getByDisplayValue('alicia')).toBeInTheDocument()
  })
})
