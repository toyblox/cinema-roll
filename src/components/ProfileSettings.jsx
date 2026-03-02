import { useState } from 'react'
import { updateProfile } from '../lib/supabase'

function ProfileSettings({ isOpen, onClose, user, profile, onProfileUpdate }) {
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!displayName.trim()) return

    setError('')
    setLoading(true)

    const { error: updateError } = await updateProfile(user.id, { display_name: displayName.trim() })

    if (updateError) {
      setError(updateError.message)
    } else {
      onProfileUpdate({ ...profile, display_name: displayName.trim() })
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <h2>Profile</h2>
        </div>

        <form className="auth-modal-body" onSubmit={handleSubmit}>
          <label className="auth-field-label">Display name</label>
          <input
            className="auth-input"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            autoFocus
          />

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit-btn" type="submit" disabled={loading || !displayName.trim()}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfileSettings
