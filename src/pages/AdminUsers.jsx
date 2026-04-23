import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import toast from 'react-hot-toast'
import { Plus, Trash2, X, Eye, EyeOff, UserPlus } from 'lucide-react'

const EMPTY_FORM = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
  role: 'member',
}

function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(err => ({ ...err, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.full_name.trim())    e.full_name = 'Name is required.'
    if (!form.email.trim())        e.email     = 'Email is required.'
    if (!form.phone.trim())        e.phone     = 'Contact number is required.'
    if (form.password.length < 6)  e.password  = 'Password must be at least 6 characters.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)

    // Step 1 — create auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: form.full_name.trim(),
          role: form.role,
        }
      }
    })

    if (signUpError) {
      toast.error(signUpError.message)
      setLoading(false)
      return
    }

    // Step 2 — upsert profile with phone + role
    // (Supabase trigger may have already created the row; upsert is safe either way)
    if (data?.user?.id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id:        data.user.id,
          full_name: form.full_name.trim(),
          phone:     form.phone.trim(),
          role:      form.role,
        })

      if (profileError) {
        toast.error(`User created but profile update failed: ${profileError.message}`)
        setLoading(false)
        return
      }
    }

    toast.success(`User "${form.full_name}" created successfully!`)
    setLoading(false)
    onCreated()
    onClose()
  }

  return (
    <div style={overlay}>
      <div style={modal}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={iconCircle}>
              <UserPlus size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Create New User</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fill in the details below</p>
            </div>
          </div>
          <button onClick={onClose} style={closeBtn}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Full Name */}
            <div style={{ gridColumn: 'span 2' }}>
              <label>Full Name *</label>
              <input
                className="input"
                name="full_name"
                placeholder="Rahul Sharma"
                value={form.full_name}
                onChange={handleChange}
              />
              {errors.full_name && <p style={errText}>{errors.full_name}</p>}
            </div>

            {/* Email */}
            <div>
              <label>Email Address *</label>
              <input
                className="input"
                name="email"
                type="email"
                placeholder="rahul@company.com"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <p style={errText}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label>Contact Number *</label>
              <input
                className="input"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
              />
              {errors.phone && <p style={errText}>{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label>Password *</label>
              <div style={pwWrapper}>
                <input
                  className="input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={eyeBtn}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={errText}>{errors.password}</p>}
            </div>

            {/* Role */}
            <div>
              <label>Role *</label>
              <select
                className="input"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ opacity: loading ? 0.75 : 1 }}
            >
              {loading ? 'Creating...' : <><Plus size={15} /> Create User</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

/* ─────────── Main Page ─────────── */
export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*')
    setUsers(data || [])
    setLoading(false)
  }

  const changeRole = async (id, role) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Role updated'); fetchUsers() }
  }

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('User deleted'); fetchUsers() }
  }

  return (
    <AdminLayout>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Users</h2>
          <p style={{ color: 'var(--text-muted)' }}>{users.length} team member{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New User
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Contact', 'Role', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontWeight: 600, fontSize: 12,
                  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No users found. Click "New User" to get started.
                </td>
              </tr>
            )}
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500 }}>{u.full_name || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email || ''}</div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                  {u.phone || '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <select
                    className="input"
                    style={{ width: 'auto' }}
                    value={u.role}
                    onChange={e => changeRole(u.id, e.target.value)}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    className="btn btn-ghost"
                    style={{ color: 'var(--danger)', padding: '5px 10px' }}
                    onClick={() => deleteUser(u.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onCreated={fetchUsers}
        />
      )}

    </AdminLayout>
  )
}

/* ─────────── Styles ─────────── */
const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 200, padding: 20,
}

const modal = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  padding: '28px 32px',
  width: '100%',
  maxWidth: 520,
}

const iconCircle = {
  width: 40, height: 40, borderRadius: 10,
  background: 'linear-gradient(135deg, var(--primary), #1d4ed8)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
}

const closeBtn = {
  background: 'none', border: 'none',
  cursor: 'pointer', color: 'var(--text-muted)',
  padding: 4, borderRadius: 6,
  display: 'flex', alignItems: 'center',
}

const pwWrapper = {
  position: 'relative', display: 'flex', alignItems: 'center',
}

const eyeBtn = {
  position: 'absolute', right: 10,
  background: 'none', border: 'none',
  cursor: 'pointer', color: 'var(--text-muted)',
  padding: 4, display: 'flex', alignItems: 'center',
}

const errText = {
  fontSize: 12, color: 'var(--danger)', marginTop: 4,
}