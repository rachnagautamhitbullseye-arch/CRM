import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed']
const STATUS_ORDER = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost']

export default function Analytics() {
  const [statusData, setStatusData] = useState([])
  const [sourceData, setSourceData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [conversionRate, setConversionRate] = useState(0)
  const [totalDealValue, setTotalDealValue] = useState(0)

  useEffect(() => { fetchAnalytics() }, [])

  const fetchAnalytics = async () => {
    const { data: leads } = await supabase
      .from('leads')
      .select('status, deal_value, created_at, lead_sources(name)')

    if (!leads) return

    // Status breakdown
    const statusCounts = STATUS_ORDER.map(s => ({
      name: s,
      value: leads.filter(l => l.status === s).length
    }))
    setStatusData(statusCounts)

    // Conversion rate
    const total = leads.length
    const converted = leads.filter(l => l.status === 'Converted').length
    setConversionRate(total > 0 ? Math.round((converted / total) * 100) : 0)

    // Total deal value from converted leads
    const dealVal = leads
      .filter(l => l.status === 'Converted')
      .reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0)
    setTotalDealValue(dealVal)

    // Source breakdown
    const sourceMap = {}
    leads.forEach(l => {
      const src = l.lead_sources?.name || 'Unknown'
      sourceMap[src] = (sourceMap[src] || 0) + 1
    })
    setSourceData(Object.entries(sourceMap).map(([name, value]) => ({ name, value })))

    // Monthly leads for last 6 months
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const month = d.toLocaleString('default', { month: 'short' })
      const year = d.getFullYear()
      const count = leads.filter(l => {
        const ld = new Date(l.created_at)
        return ld.getMonth() === d.getMonth() && ld.getFullYear() === year
      }).length
      months.push({ month, count })
    }
    setMonthlyData(months)
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Analytics</h1>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Conversion Rate',   value: `${conversionRate}%`, color: '#16a34a' },
          { label: 'Total Leads',        value: statusData.reduce((a, b) => a + b.value, 0), color: '#2563eb' },
          { label: 'Revenue from Wins',  value: `₹${totalDealValue.toLocaleString()}`, color: '#7c3aed' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
            <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Status Pie Chart */}
        <div className="card">
          <h2 style={{ fontWeight: 600, marginBottom: 16 }}>Lead Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={90}
                dataKey="value" nameKey="name" label={({ name, percent }) =>
                  percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Source Bar Chart */}
        <div className="card">
          <h2 style={{ fontWeight: 600, marginBottom: 16 }}>Leads by Source</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="card">
        <h2 style={{ fontWeight: 600, marginBottom: 16 }}>Monthly Lead Trend (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Leads Added" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}