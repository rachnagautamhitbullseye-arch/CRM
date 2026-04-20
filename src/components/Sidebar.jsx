import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, CheckSquare, BarChart2, LogOut, Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads',     icon: Users,           label: 'Leads'     },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks'     },
  { to: '/analytics', icon: BarChart2,       label: 'Analytics' },
]

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-w)',
      background: '#0f172a',
      color: '#94a3b8',
      display: 'flex', flexDirection: 'column',
      padding: '20px 0',
      zIndex: 100
    }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: 'var(--primary)', borderRadius: 8,
            width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Briefcase size={18} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>CRM Pro</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              color: isActive ? 'white' : '#94a3b8',
              background: isActive ? '#1e293b' : 'transparent',
              textDecoration: 'none', marginBottom: 4,
              fontWeight: isActive ? 500 : 400,
              transition: 'all 0.15s'
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid #1e293b' }}>
        <div style={{ padding: '0 12px 12px', fontSize: 13 }}>
          <div style={{ color: 'white', fontWeight: 500 }}>{profile?.full_name}</div>
          <div style={{ color: '#64748b', textTransform: 'capitalize' }}>{profile?.role}</div>
        </div>
        <button onClick={handleSignOut} className="btn btn-ghost" style={{
          width: '100%', justifyContent: 'center',
          color: '#94a3b8', borderColor: '#1e293b'
        }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  )
}