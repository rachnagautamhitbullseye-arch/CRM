import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'

export default function Reports() {
  const [data, setData] = useState({})

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    const { data: leads } = await supabase
      .from('leads')
      .select('status, assigned_to')

    const grouped = {}

    leads.forEach(l => {
      if (!grouped[l.assigned_to]) {
        grouped[l.assigned_to] = { total: 0, converted: 0 }
      }

      grouped[l.assigned_to].total++
      if (l.status === 'Converted') grouped[l.assigned_to].converted++
    })

    setData(grouped)
  }

  return (
    <AdminLayout>
      <h2>Reports</h2>

      {Object.entries(data).map(([user, stats]) => (
        <div key={user}>
          User: {user} → {stats.converted}/{stats.total}
        </div>
      ))}
    </AdminLayout>
  )
}