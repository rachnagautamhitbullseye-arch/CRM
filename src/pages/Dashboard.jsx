import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Users, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

/* ------------------ Stat Card Component ------------------ */
function StatCard({ icon: Icon, label, value, color, sublabel }) {
  return (
    <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        background: color + '20',
        borderRadius: 10,
        padding: 12,
        flexShrink: 0
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
        <div style={{ fontWeight: 500, marginTop: 2 }}>{label}</div>
        {sublabel && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  )
}

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

  /* ------------------ Fetch Data ------------------ */
  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      /* ---------- Leads ---------- */
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('status')

      if (leadsError) throw leadsError

      const total = leads?.length ?? 0
      const converted = leads?.filter(l => l.status === 'Converted').length ?? 0

      /* ---------- Tasks ---------- */
      const today = new Date().toISOString().split('T')[0]

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('status, due_date')

      if (tasksError) throw tasksError

      const pending_tasks = tasks?.filter(t => t.status === 'Pending').length ?? 0
      const overdue = tasks?.filter(
        t => t.due_date < today && t.status !== 'Done'
      ).length ?? 0

      setStats({ total, converted, pending_tasks, overdue })

      /* ---------- Recent Leads ---------- */
      const { data: recent, error: recentError } = await supabase
        .from('leads')
        .select('id, name, company, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!recentError) setRecentLeads(recent ?? [])

      /* ---------- Upcoming Tasks ---------- */
      const { data: upcoming, error: upcomingError } = await supabase
        .from('tasks')
        .select('id, title, due_date, status')
        .eq('status', 'Pending')
        .order('due_date', { ascending: true })
        .limit(5)

      if (!upcomingError) setUpcomingTasks(upcoming ?? [])

    } catch (err) {
      console.error('Dashboard Error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const conversionRate =
    stats.total > 0
      ? Math.round((stats.converted / stats.total) * 100)
      : 0

  /* ------------------ UI ------------------ */
  return (
    <div style={{ padding: 20 }}>

      {/* Header */}
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        Good morning, {profile?.full_name?.split(' ')[0] || 'User'} 👋
      </h1>

      <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
        Here's what's happening with your leads today.
      </p>

      {/* Loading */}
      {loading && <p>Loading dashboard...</p>}

      {/* Stats */}
      {!loading && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 28
          }}>
            <StatCard icon={Users} label="Total Leads" value={stats.total} color="#2563eb" />
            <StatCard
              icon={TrendingUp}
              label="Conversion Rate"
              value={`${conversionRate}%`}
              color="#16a34a"
              sublabel={`${stats.converted} converted`}
            />
            <StatCard icon={Clock} label="Pending Tasks" value={stats.pending_tasks} color="#d97706" />
            <StatCard icon={AlertCircle} label="Overdue Tasks" value={stats.overdue} color="#dc2626" />
          </div>

          {/* Lists */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Recent Leads */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Recent Leads</h2>
                <Link to="/leads">View all →</Link>
              </div>

              {recentLeads.length === 0 && (
                <p>No leads yet.</p>
              )}

              {recentLeads.map(lead => (
                <div key={lead.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div>{lead.name}</div>
                  <div style={{ fontSize: 12 }}>{lead.company}</div>
                </div>
              ))}
            </div>

            {/* Tasks */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Upcoming Tasks</h2>
                <Link to="/tasks">View all →</Link>
              </div>

              {upcomingTasks.length === 0 && (
                <p>No pending tasks.</p>
              )}

              {upcomingTasks.map(task => (
                <div key={task.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div>{task.title}</div>
                  <div style={{ fontSize: 12 }}>
                    Due: {task.due_date}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </>
      )}
    </div>
  )
}