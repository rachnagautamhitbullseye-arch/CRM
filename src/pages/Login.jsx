import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }

    setLoading(false)
  }

  return (
    <div style={styles.page}>

      {/* Background decorative blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>

        {/* Logo / Brand */}
        <div style={styles.brand}>
          <div style={styles.logoCircle}>
            <LogIn size={22} color="#fff" />
          </div>
          <div>
            <h1 style={styles.appName}>CRM Portal</h1>
            <p style={styles.tagline}>Sign in to your workspace</p>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <span style={{ fontSize: 15 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Email Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                onFocus={e => e.target.parentNode.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.parentNode.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...styles.input, paddingRight: 42 }}
                onFocus={e => e.target.parentNode.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.parentNode.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <span style={styles.spinner} />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </button>

        </form>

        {/* Footer note */}
        <p style={styles.footerNote}>
          Contact your administrator to get access.
        </p>

      </div>
    </div>
  )
}

/* ─────────── Styles ─────────── */
const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },

  blob1: {
    position: 'fixed',
    top: -120,
    right: -120,
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  blob2: {
    position: 'fixed',
    bottom: -100,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    boxShadow: '0 8px 40px rgba(0,0,0,0.09)',
    padding: '36px 40px',
    width: '100%',
    maxWidth: 420,
    position: 'relative',
    zIndex: 1,
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },

  logoCircle: {
    width: 46,
    height: 46,
    borderRadius: 12,
    background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(37,99,235,0.30)',
  },

  appName: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text)',
    lineHeight: 1.2,
  },

  tagline: {
    fontSize: 13,
    color: 'var(--text-muted)',
    marginTop: 2,
  },

  divider: {
    height: 1,
    background: 'var(--border)',
    marginBottom: 24,
  },

  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 20,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },

  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: 0,
  },

  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border)',
    borderRadius: 9,
    background: 'var(--bg)',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },

  inputIcon: {
    position: 'absolute',
    left: 12,
    color: 'var(--text-muted)',
    pointerEvents: 'none',
    flexShrink: 0,
  },

  input: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    border: 'none',
    borderRadius: 9,
    fontSize: 14,
    fontFamily: 'inherit',
    background: 'transparent',
    color: 'var(--text)',
    outline: 'none',
  },

  eyeBtn: {
    position: 'absolute',
    right: 10,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },

  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 9,
    padding: '11px 20px',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'inherit',
    marginTop: 4,
    boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
    transition: 'opacity 0.15s, transform 0.1s',
  },

  spinner: {
    width: 15,
    height: 15,
    border: '2px solid rgba(255,255,255,0.35)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },

  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 24,
  },
}

/* Inject spinner keyframes */
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
  document.head.appendChild(style)
}