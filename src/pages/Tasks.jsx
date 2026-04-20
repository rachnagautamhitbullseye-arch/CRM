import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { format, isPast, isToday } from 'date-fns'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('Pending')

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*, leads(id, name), profiles(full_name)')
      .order('due_date', { ascending: true })
    setTasks(data ?? [])
  }

  const updateStatus = async (id, status) => {
    await supabase.from('tasks').update({ status }).eq('id', id)
    fetchTasks()
  }

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter)

  const getDueBadge = (due_date, status) => {
    if (status === 'Done') return null
    if (!due_date) return null
    const d = new Date(due_date)
    if (isPast(d) && !isToday(d)) return <span className="badge badge-overdue">Overdue</span>
    if (isToday(d)) return <span className="badge badge-medium">Today</span>
    return null
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Tasks & Follow-ups</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['All', 'Pending', 'In Progress', 'Done'].map(s => (
          <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              {['Task', 'Lead', 'Assigned To', 'Due Date', 'Status', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                No tasks found.
              </td></tr>
            )}
            {filtered.map(task => (
              <tr key={task.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500 }}>{task.title}</div>
                  {getDueBadge(task.due_date, task.status)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {task.leads ? (
                    <Link to={`/leads/${task.leads.id}`} style={{ color: 'var(--primary)' }}>
                      {task.leads.name}
                    </Link>
                  ) : '—'}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                  {task.profiles?.full_name || '—'}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                  {task.due_date ? format(new Date(task.due_date), 'dd MMM yyyy') : '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge badge-${task.status.toLowerCase().replace(' ', '-')}`}>
                    {task.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <select className="input" style={{ width: 'auto', fontSize: 12 }}
                    value={task.status}
                    onChange={e => updateStatus(task.id, e.target.value)}>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}