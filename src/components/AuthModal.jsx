import { useState, useEffect } from 'react'
import { signIn, signUp } from '../lib/supabase'

function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset form state every time the modal opens, picking up the new initialMode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setEmail('')
      setPassword('')
      setError('')
    }
  }, [isOpen, initialMode])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password)

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      // Auth state change listener in App will handle session update
      onClose()
    }
  }

  const switchMode = () => {
    setMode(m => m === 'signin' ? 'signup' : 'signin')
    setError('')
  }

  return (
    <div className="modal-overlay" onClick={() => !loading && onClose()}>
      <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={loading}>×</button>

        <div className="modal-header">
          <h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
        </div>

        <form className="auth-modal-body" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === 'signin' ? (
            <span>New here? <button type="button" onClick={switchMode}>Create an account</button></span>
          ) : (
            <span>Already have an account? <button type="button" onClick={switchMode}>Sign in</button></span>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal
