import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2, StickyNote, CheckSquare } from 'lucide-react'
import { format } from 'date-fns'

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [lead, setLead] = useState(null)
  const [notes, setNotes] = useState([])
  const [tasks, setTasks] = useState([])
  const [newNote, setNewNote] = useState('')
  const [newTask, setNewTask] = useState({ title: '', due_date: '' })
  const [profiles, setProfiles] = useState([])

  useEffect(() => {
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    const { data: leadData } = await supabase
      .from('leads')
      .select('*, lead_sources(name), profiles!leads_assigned_to_fkey(full_name)')
      .eq('id', id)
      .single()
    setLead(leadData)

    const { data: notesData } = await supabase
      .from('notes').select('*, profiles(full_name)')
      .eq('lead_id', id).order('created_at', { ascending: false })
    setNotes(notesData ?? [])

    const { data: tasksData } = await supabase
      .from('tasks').select('*, profiles(full_name)')
      .eq('lead_id', id).order('due_date', { ascending: true })
    setTasks(tasksData ?? [])

    const { data: profilesData } = await supabase.from('profiles').select('id, full_name')
    setProfiles(profilesData ?? [])
  }

  const addNote = async () => {
    if (!newNote.trim()) return
    const { error } = await supabase.from('notes').insert({
      lead_id: id, content: newNote, created_by: user.id
    })
    if (error) toast.error(error.message)
    else { setNewNote(''); fetchAll(); toast.success('Note added!') }
  }

  const deleteNote = async (noteId) => {
    await supabase.from('notes').delete().eq('id', noteId)
    fetchAll()
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return
    const { error } = await supabase.from('tasks').insert({
      lead_id: id, ...newTask, created_by: user.id
    })
    if (error) toast.error(error.message)
    else { setNewTask({ title: '', due_date: '' }); fetchAll(); toast.success('Task added!') }
  }

  const updateTaskStatus = async (taskId, status) => {
    await supabase.from('tasks').update({ status }).eq('id', taskId)
    fetchAll()
  }

  if (!lead) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading...</div>

  return (
    <div>
      {/* Back & Header */}
      <button className="btn btn-ghost" onClick={() => navigate('/leads')} style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Leads
      </button>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>{lead.name}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{lead.company} • {lead.email} • {lead.phone}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`badge badge-${lead.status?.toLowerCase()}`}>{lead.status}</span>
            <span className={`badge badge-${lead.priority?.toLowerCase()}`}>{lead.priority}</span>
            {lead.deal_value > 0 && (
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                ₹{Number(lead.deal_value).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 24, flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: 13 }}>
          <span>Source: <strong>{lead.lead_sources?.name || '—'}</strong></span>
          <span>Assigned to: <strong>{lead.profiles?.full_name || 'Unassigned'}</strong></span>
          <span>Added: <strong>{format(new Date(lead.created_at), 'dd MMM yyyy')}</strong></span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Notes Section */}
        <div className="card">
          <h2 style={{ fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <StickyNote size={18} /> Notes
          </h2>
          <div style={{ marginBottom: 14 }}>
            <textarea className="input" rows={3}
              placeholder="Add a note about this lead..."
              value={newNote} onChange={e => setNewNote(e.target.value)}
              style={{ resize: 'vertical' }} />
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={addNote}>
              <Plus size={14} /> Add Note
            </button>
          </div>
          <div>
            {notes.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No notes yet.</p>}
            {notes.map(note => (
              <div key={note.id} style={{
                background: 'var(--bg)', borderRadius: 8, padding: 12,
                marginBottom: 10, position: 'relative'
              }}>
                <p style={{ fontSize: 14, lineHeight: 1.6 }}>{note.content}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {note.profiles?.full_name} • {format(new Date(note.created_at), 'dd MMM, HH:mm')}
                  </span>
                  {(isAdmin || note.created_by === user.id) && (
                    <button onClick={() => deleteNote(note.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="card">
          <h2 style={{ fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckSquare size={18} /> Tasks & Follow-ups
          </h2>
          <form onSubmit={addTask} style={{ marginBottom: 14 }}>
            <input className="input" placeholder="Task title..."
              value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))}
              style={{ marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" type="date"
                value={newTask.due_date} onChange={e => setNewTask(t => ({ ...t, due_date: e.target.value }))} />
              <button type="submit" className="btn btn-primary">
                <Plus size={14} /> Add
              </button>
            </div>
          </form>
          <div>
            {tasks.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No tasks yet.</p>}
            {tasks.map(task => (
              <div key={task.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--border)'
              }}>
                <div>
                  <div style={{
                    fontWeight: 500,
                    textDecoration: task.status === 'Done' ? 'line-through' : 'none',
                    color: task.status === 'Done' ? 'var(--text-muted)' : 'var(--text)'
                  }}>
                    {task.title}
                  </div>
                  {task.due_date && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Due: {format(new Date(task.due_date), 'dd MMM yyyy')}
                    </div>
                  )}
                </div>
                <select className="input" style={{ width: 'auto', fontSize: 12 }}
                  value={task.status}
                  onChange={e => updateTaskStatus(task.id, e.target.value)}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}