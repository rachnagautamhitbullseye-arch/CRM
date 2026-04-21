// src/pages/AdminUsers.jsx

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*')
    setUsers(data || [])
  }

  const changeRole = async (id, role) => {
    await supabase.from('profiles').update({ role }).eq('id', id)
    fetchUsers()
  }

  const deleteUser = async (id) => {
    await supabase.from('profiles').delete().eq('id', id)
    fetchUsers()
  }

  return (
    <div>
      <h2>User Management</h2>

      {users.map(u => (
        <div key={u.id} style={{ display: 'flex', gap: 10 }}>
          <span>{u.full_name}</span>

          <select
            value={u.role}
            onChange={(e) => changeRole(u.id, e.target.value)}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>

          <button onClick={() => deleteUser(u.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}