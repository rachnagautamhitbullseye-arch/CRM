import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Briefcase } from 'lucide-react'

export default function Login() {
  const [mode, setMode] = useState('login')   // 'login' | 'signup'
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'member' })
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(form.email, form.password)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Welcome back!')
        navigate('/')
      }
    } else {
      const { error } = await signUp(form.email, form.password, form.fullName, form.role)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Account created! Check your email to confirm.')
        setMode('login')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            background: 'var(--primary)', borderRadius: 12,
            width: 48, height: 48, display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
          }}>
            <Briefcase size={24} color="white" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>CRM Pro</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: 16 }}>
              <label>Full Name</label>
              <input className="input" name="fullName" placeholder="John Smith"
                value={form.fullName} onChange={handleChange} required />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label>Email</label>
            <input className="input" name="email" type="email" placeholder="john@company.com"
              value={form.email} onChange={handleChange} required />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label>Password</label>
            <input className="input" name="password" type="password" placeholder="••••••••"
              value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          {mode === 'signup' && (
            <div style={{ marginBottom: 16 }}>
              <label>Role</label>
              <select className="input" name="role" value={form.role} onChange={handleChange}>
                <option value="member">Team Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '11px 16px' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')}
            style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}