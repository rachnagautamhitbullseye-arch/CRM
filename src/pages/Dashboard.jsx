import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Users, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

/* ------------------ Stat Card ------------------ */
function StatCard({ icon: Icon, label, value, color, sublabel }) {
  return (
    <div style={{
      background: '#fff',
      padding: 20,
      borderRadius: 16,
      boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
      borderLeft: `5px solid ${color}`,
      display: 'flex',
      gap: 14
    }}>
      <Icon color={color} size={26} />
      <div>
        <div style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
        <div style={{ fontSize: 14 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: '#6b7280' }}>{sublabel}</div>}
      </div>
    </div>
  )
}

/* ------------------ Badge ------------------ */
const badge = (status) => ({
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 500,
  background:
    status === 'Converted' ? '#dcfce7' :
    status === 'Pending' ? '#fef3c7' :
    '#fee2e2'
})

/* ------------------ Dashboard ------------------ */
export default function Dashboard() {
  const { profile } = useAuth()

  const [stats, setStats] = useState({
    total: 0,
    converted: 0,
    pending_tasks: 0,
    overdue: 0
  })

  const [recentLeads, setRecentLeads] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const { data: leads } = await supabase.from('leads').select('status')
      const total = leads?.length ?? 0
      const converted = leads?.filter(l => l.status === 'Converted').length ?? 0

      const today = new Date().toISOString().split('T')[0]
      const { data: tasks } = await supabase.from('tasks').select('status, due_date')

      const pending_tasks = tasks?.filter(t => t.status === 'Pending').length ?? 0
      const overdue = tasks?.filter(t => t.due_date < today && t.status !== 'Done').length ?? 0

      setStats({ total, converted, pending_tasks, overdue })

      const { data: recent } = await supabase
        .from('leads')
        .select('id, name, company, status')
        .limit(5)

      setRecentLeads(recent ?? [])

      const { data: upcoming } = await supabase
        .from('tasks')
        .select('id, title, due_date, status')
        .eq('status', 'Pending')
        .limit(5)

      setUpcomingTasks(upcoming ?? [])

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const conversionRate =
    stats.total > 0
      ? Math.round((stats.converted / stats.total) * 100)
      : 0

  return (
    <div style={{ padding: 30, background: '#f1f5f9', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>
          👋 Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p style={{ color: '#64748b' }}>
          Here’s what’s happening in your CRM today
        </p>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
            marginBottom: 30
          }}>
            <StatCard icon={Users} label="Total Leads" value={stats.total} color="#3b82f6" />
            <StatCard icon={TrendingUp} label="Conversion Rate" value={`${conversionRate}%`} color="#22c55e" sublabel={`${stats.converted} converted`} />
            <StatCard icon={Clock} label="Pending Tasks" value={stats.pending_tasks} color="#f59e0b" />
            <StatCard icon={AlertCircle} label="Overdue Tasks" value={stats.overdue} color="#ef4444" />
          </div>

          {/* Sections */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: 20
          }}>

            {/* Leads */}
            <div style={cardBox}>
              <div style={headerRow}>
                <h3>Recent Leads</h3>
                <Link to="/leads">View all →</Link>
              </div>

              {recentLeads.length === 0 && <p>No leads yet</p>}

              {recentLeads.map(l => (
                <div key={l.id} style={row}>
                  <div>
                    <strong>{l.name}</strong>
                    <p style={{ fontSize: 12 }}>{l.company}</p>
                  </div>
                  <span style={badge(l.status)}>{l.status}</span>
                </div>
              ))}
            </div>

            {/* Tasks */}
            <div style={cardBox}>
              <div style={headerRow}>
                <h3>Upcoming Tasks</h3>
                <Link to="/tasks">View all →</Link>
              </div>

              {upcomingTasks.length === 0 && <p>No tasks</p>}

              {upcomingTasks.map(t => (
                <div key={t.id} style={row}>
                  <div>
                    <strong>{t.title}</strong>
                    <p style={{ fontSize: 12 }}>Due: {t.due_date}</p>
                  </div>
                  <span style={badge(t.status)}>{t.status}</span>
                </div>
              ))}
            </div>

          </div>
        </>
      )}
    </div>
  )
}
const { profile, signOut } = useAuth()
const navigate = useNavigate()
const handleLogout = async () => {
  await signOut()
  navigate('/login')
}
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20
}}>
  <h1 style={{ fontSize: 24, fontWeight: 700 }}>
    Welcome, {profile?.full_name}
  </h1>

  <button
    onClick={handleLogout}
    style={{
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '8px 14px',
      borderRadius: 8,
      cursor: 'pointer'
    }}
  >
    Logout
  </button>
</div>

/* ------------------ Styles ------------------ */
const cardBox = {
  background: '#fff',
  padding: 20,
  borderRadius: 16,
  boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
}

const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 12
}

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 0',
  borderBottom: '1px solid #eee'
}