import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [leads, setLeads] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: usersData } = await supabase
      .from('profiles')
      .select('id, full_name, role')

    const { data: leadsData } = await supabase
      .from('leads')
      .select('id, name, status')

    setUsers(usersData || [])
    setLeads(leadsData || [])
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Admin Dashboard 👑</h1>

      <h2>Users</h2>
      {users.map(u => (
        <div key={u.id}>
          {u.full_name} — {u.role}
        </div>
      ))}

      <h2 style={{ marginTop: 20 }}>Leads</h2>
      {leads.map(l => (
        <div key={l.id}>
          {l.name} — {l.status}
        </div>
      ))}
    </div>
  )
}