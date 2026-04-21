import { Link, useLocation } from 'react-router-dom'
import { Users, Upload, BarChart } from 'lucide-react'

export default function Sidebar() {
  const { pathname } = useLocation()

  const menu = [
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Upload Leads', path: '/admin/upload', icon: Upload },
    { name: 'Reports', path: '/admin/reports', icon: BarChart },
  ]

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>CRM Admin</h2>

      {menu.map(item => {
        const Icon = item.icon
        const active = pathname === item.path

        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.link,
              background: active ? '#2563eb' : 'transparent',
              color: active ? '#fff' : '#cbd5f5'
            }}
          >
            <Icon size={18} />
            {item.name}
          </Link>
        )
      })}
    </div>
  )
}

const styles = {
  sidebar: {
    width: 220,
    background: '#1e293b',
    color: '#fff',
    padding: 20,
    minHeight: '100vh'
  },
  logo: {
    marginBottom: 30
  },
  link: {
    display: 'flex',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    textDecoration: 'none',
    marginBottom: 8
  }
}