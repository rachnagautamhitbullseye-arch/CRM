import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Search, Download, Trash2, Edit2, Eye } from 'lucide-react'
import { exportToCsv } from '../utils/exportCsv'

const STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost']

// Modal for Add/Edit Lead
function LeadModal({ lead, onClose, onSave, sources, teamMembers }) {
  const { user } = useAuth()
  const [form, setForm] = useState(lead || {
    name: '', email: '', phone: '', company: '',
    status: 'New', source_id: '', assigned_to: '',
    deal_value: '', priority: 'Medium'
  })

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form, created_by: user.id }
    if (!payload.source_id) delete payload.source_id
    if (!payload.assigned_to) delete payload.assigned_to
    if (!payload.deal_value) payload.deal_value = 0

    let error
    if (lead?.id) {
      // Update existing
      ({ error } = await supabase.from('leads').update(payload).eq('id', lead.id))
    } else {
      // Insert new
      ({ error } = await supabase.from('leads').insert(payload))
    }

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(lead?.id ? 'Lead updated!' : 'Lead added!')
      onSave()
      onClose()
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontWeight: 700, marginBottom: 20, fontSize: 18 }}>
          {lead?.id ? 'Edit Lead' : 'Add New Lead'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label>Full Name *</label>
              <input className="input" name="name" value={form.name}
                onChange={handleChange} required placeholder="Jane Doe" />
            </div>
            <div>
              <label>Email</label>
              <input className="input" name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="jane@example.com" />
            </div>
            <div>
              <label>Phone</label>
              <input className="input" name="phone" value={form.phone}
                onChange={handleChange} placeholder="+1 555 000 0000" />
            </div>
            <div>
              <label>Company</label>
              <input className="input" name="company" value={form.company}
                onChange={handleChange} placeholder="Acme Inc." />
            </div>
            <div>
              <label>Deal Value (₹)</label>
              <input className="input" name="deal_value" type="number"
                value={form.deal_value} onChange={handleChange} placeholder="50000" />
            </div>
            <div>
              <label>Status</label>
              <select className="input" name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label>Priority</label>
              <select className="input" name="priority" value={form.priority} onChange={handleChange}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <div>
              <label>Lead Source</label>
              <select className="input" name="source_id" value={form.source_id} onChange={handleChange}>
                <option value="">— Select —</option>
                {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label>Assign To</label>
              <select className="input" name="assigned_to" value={form.assigned_to} onChange={handleChange}>
                <option value="">— Unassigned —</option>
                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {lead?.id ? 'Update Lead' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Leads() {
  const { isAdmin } = useAuth()
  const [leads, setLeads] = useState([])
  const [sources, setSources] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [modal, setModal] = useState(null)   // null | 'add' | lead_object

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    // Leads with related data
    const { data: leadsData } = await supabase
      .from('leads')
      .select('*, lead_sources(name), profiles!leads_assigned_to_fkey(full_name)')
      .order('created_at', { ascending: false })
    setLeads(leadsData ?? [])

    const { data: sourcesData } = await supabase.from('lead_sources').select('*')
    setSources(sourcesData ?? [])

    const { data: membersData } = await supabase.from('profiles').select('id, full_name')
    setTeamMembers(membersData ?? [])
  }

  const deleteLead = async (id) => {
    if (!confirm('Delete this lead and all related tasks/notes?')) return
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Lead deleted'); fetchAll() }
  }

  // Filter leads based on search and status
  const filtered = leads.filter(lead => {
    const matchSearch = search === '' ||
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (lead.email || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || lead.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Leads</h1>
          <p style={{ color: 'var(--text-muted)' }}>{filtered.length} leads found</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => exportToCsv(filtered, 'leads')}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => setModal('add')}>
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input className="input" placeholder="Search by name, company, email..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }} />
        </div>
        <select className="input" style={{ width: 'auto' }}
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Company', 'Status', 'Priority', 'Source', 'Assigned To', 'Deal Value', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No leads found. Click "Add Lead" to get started.
              </td></tr>
            )}
            {filtered.map(lead => (
              <tr key={lead.id} style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500 }}>{lead.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.email}</div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{lead.company || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge badge-${lead.priority?.toLowerCase()}`}>{lead.priority}</span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                  {lead.lead_sources?.name || '—'}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                  {lead.profiles?.full_name || 'Unassigned'}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                  {lead.deal_value > 0 ? `₹${Number(lead.deal_value).toLocaleString()}` : '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Link to={`/leads/${lead.id}`}>
                      <button className="btn btn-ghost" style={{ padding: '5px 9px' }}>
                        <Eye size={14} />
                      </button>
                    </Link>
                    <button className="btn btn-ghost" style={{ padding: '5px 9px' }}
                      onClick={() => setModal(lead)}>
                      <Edit2 size={14} />
                    </button>
                    {isAdmin && (
                      <button className="btn btn-ghost" style={{ padding: '5px 9px', color: 'var(--danger)' }}
                        onClick={() => deleteLead(lead.id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <LeadModal
          lead={modal === 'add' ? null : modal}
          sources={sources}
          teamMembers={teamMembers}
          onClose={() => setModal(null)}
          onSave={fetchAll}
        />
      )}
    </div>
  )
}