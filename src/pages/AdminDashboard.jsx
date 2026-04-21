// src/pages/AdminDashboard.jsx

import AdminUsers from './AdminUsers'
import UploadLeads from './UploadLeads'
import Reports from './Reports'

export default function AdminDashboard() {
  return (
    <div style={{ padding: 30 }}>
      <h1>👑 Admin Panel</h1>

      <AdminUsers />
      <hr />

      <UploadLeads />
      <hr />

      <Reports />
    </div>
  )
}