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
    <div style={{ padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>

  {/* Header */}
  <div style={{ marginBottom: 28 }}>
    <h1 style={{ fontSize: 26, fontWeight: 700 }}>
      👋 Welcome back, {profile?.full_name?.split(" ")[0] || "User"}
    </h1>
    <p style={{ color: "#64748b", marginTop: 4 }}>
      Here's your CRM performance overview
    </p>
  </div>

  {/* Stats */}
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    marginBottom: 30
  }}>

    {/* Card */}
    <div style={cardStyle("#3b82f6")}>
      <p>Total Leads</p>
      <h2>{stats.total}</h2>
    </div>

    <div style={cardStyle("#22c55e")}>
      <p>Conversion Rate</p>
      <h2>{conversionRate}%</h2>
      <span>{stats.converted} converted</span>
    </div>

    <div style={cardStyle("#f59e0b")}>
      <p>Pending Tasks</p>
      <h2>{stats.pending_tasks}</h2>
    </div>

    <div style={cardStyle("#ef4444")}>
      <p>Overdue Tasks</p>
      <h2>{stats.overdue}</h2>
    </div>
  </div>

  {/* Sections */}
  <div style={{
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: 20
  }}>

    {/* Leads */}
    <div style={boxStyle}>
      <h3>Recent Leads</h3>

      {recentLeads.map(l => (
        <div key={l.id} style={rowStyle}>
          <div>
            <strong>{l.name}</strong>
            <p>{l.company}</p>
          </div>
          <span style={badge(l.status)}>{l.status}</span>
        </div>
      ))}
    </div>

    {/* Tasks */}
    <div style={boxStyle}>
      <h3>Upcoming Tasks</h3>

      {upcomingTasks.map(t => (
        <div key={t.id} style={rowStyle}>
          <div>
            <strong>{t.title}</strong>
            <p>Due: {t.due_date}</p>
          </div>
          <span style={badge(t.status)}>{t.status}</span>
        </div>
      ))}
    </div>

  </div>
</div>
  )
}