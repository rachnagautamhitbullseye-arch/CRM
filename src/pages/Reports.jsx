import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import { TrendingUp, Users, Target } from 'lucide-react'
 
export default function Reports() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    fetchReports()
  }, [])
 
  const fetchReports = async () => {
    setLoading(true)
 
    // Join leads with profiles to get the assignee's full_name
    const { data: leads, error } = await supabase
      .from('leads')
      .select('status, assigned_to, profiles!leads_assigned_to_fkey(full_name)')
 
    if (error || !leads) {
      setLoading(false)
      return
    }
 
    // Group by assignee name
    const grouped = {}
 
    leads.forEach(l => {
      const name = l.profiles?.full_name || 'Unassigned'
      if (!grouped[name]) {
        grouped[name] = { total: 0, converted: 0 }
      }
      grouped[name].total++
      if (l.status === 'Converted') grouped[name].converted++
    })
 
    // Sort by most leads first
    const sorted = Object.entries(grouped)
      .map(([name, stats]) => ({
        name,
        ...stats,
        rate: stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total)
 
    setRows(sorted)
    setLoading(false)
  }
 
  const totalLeads     = rows.reduce((s, r) => s + r.total, 0)
  const totalConverted = rows.reduce((s, r) => s + r.converted, 0)
  const overallRate    = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0
 
  return (
    <AdminLayout>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Reports</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
        Lead conversion performance by team member.
      </p>
 
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { icon: Users,     label: 'Total Leads',      value: totalLeads,       color: '#2563eb' },
          { icon: TrendingUp, label: 'Total Converted',  value: totalConverted,   color: '#16a34a' },
          { icon: Target,    label: 'Overall Conv. Rate', value: `${overallRate}%`, color: '#7c3aed' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: `${color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>
 
      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              {['Team Member', 'Total Leads', 'Converted', 'Conversion Rate'].map(h => (
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
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No data available.
                </td>
              </tr>
            )}
            {rows.map(row => (
              <tr key={row.name} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{row.name}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{row.total}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="badge badge-converted">{row.converted}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      flex: 1, height: 6, background: 'var(--border)',
                      borderRadius: 99, overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${row.rate}%`,
                        background: row.rate >= 50 ? '#16a34a' : row.rate >= 25 ? '#d97706' : '#dc2626',
                        borderRadius: 99,
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 36 }}>{row.rate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}