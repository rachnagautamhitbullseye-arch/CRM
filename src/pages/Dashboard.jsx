import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Users, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, color, sublabel }) {
  return (
    <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        background: color + '20', borderRadius: 10,
        padding: 12, flexShrink: 0
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
        <div style={{ fontWeight: 500, marginTop: 2 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sublabel}</div>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile, isAdmin } = useAuth()
  const [stats, setStats] = useState({ total: 0, converted: 0, pending_tasks: 0, overdue: 0 })
  const [recentLeads, setRecentLeads] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    // Fetch lead counts
    const { data: leads } = await supabase.from('leads').select('status')
    const total     = leads?.length ?? 0
    const converted = leads?.filter(l => l.status === 'Converted').length ?? 0

    // Fetch task counts
    const today = new Date().toISOString().split('T')[0]
    const { data: tasks } = await supabase.from('tasks').select('status, due_date')
    const pending_tasks = tasks?.filter(t => t.status === 'Pending').length ?? 0
    const overdue = tasks?.filter(t => t.due_date < today && t.status !== 'Done').length ?? 0

    setStats({ total, converted, pending_tasks, overdue })

    // Recent leads
    const { data: recent } = await supabase
      .from('leads')
      .select('id, name, company, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    setRecentLeads(recent ?? [])

    // Upcoming tasks
    const { data: upcoming } = await supabase
      .from('tasks')
      .select('id, title, due_date, status, leads(name)')
      .eq('status', 'Pending')
      .order('due_date', { ascending: true })
      .limit(5)
    setUpcomingTasks(upcoming ?? [])
  }

  const conversionRate = stats.total > 0
    ? Math.round((stats.converted / stats.total) * 100)
    : 0

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        Good morning, {profile?.full_name?.split(' ')[0]} 👋
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
        Here's what's happening with your leads today.
      </p>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={Users}       label="Total Leads"     value={stats.total}        color="#2563eb" />
        <StatCard icon={TrendingUp}  label="Conversion Rate" value={`${conversionRate}%`} color="#16a34a"
          sublabel={`${stats.converted} converted`} />
        <StatCard icon={Clock}       label="Pending Tasks"   value={stats.pending_tasks} color="#d97706" />
        <StatCard icon={AlertCircle} label="Overdue Tasks"   value={stats.overdue}       color="#dc2626" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Leads */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 600, fontSize: 16 }}>Recent Leads</h2>
            <Link to="/leads" style={{ color: 'var(--primary)', fontSize: 13, textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          {recentLeads.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              No leads yet. <Link to="/leads">Add one →</Link>
            </p>
          )}
          {recentLeads.map(lead => (
            <Link key={lead.id} to={`/leads/${lead.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--border)'
              }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{lead.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.company}</div>
                </div>
                <span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 600, fontSize: 16 }}>Upcoming Tasks</h2>
            <Link to="/tasks" style={{ color: 'var(--primary)', fontSize: 13, textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          {upcomingTasks.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              No pending tasks.
            </p>
          )}
          {upcomingTasks.map(task => (
            <div key={task.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid var(--border)'
            }}>
              <div>
                <div style={{ fontWeight: 500 }}>{task.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {task.leads?.name} • Due {task.due_date}
                </div>
              </div>
              <span className={`badge badge-${task.status.toLowerCase()}`}>{task.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}