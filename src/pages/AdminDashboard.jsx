// src/pages/AdminDashboard.jsx

import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <div style={{ padding: 30 }}>

      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10 }}>
        👑 Admin Dashboard
      </h1>

      <p style={{ color: '#64748b', marginBottom: 30 }}>
        Manage users, leads and reports from here.
      </p>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 20
      }}>

        {/* Users */}
        <div style={card}>
          <h3>👥 Users</h3>
          <p>Manage team members and roles</p>
          <Link to="/admin/users">Go to Users →</Link>
        </div>

        {/* Upload */}
        <div style={card}>
          <h3>📂 Upload Leads</h3>
          <p>Bulk upload leads via CSV</p>
          <Link to="/admin/upload">Upload Now →</Link>
        </div>

        {/* Reports */}
        <div style={card}>
          <h3>📊 Reports</h3>
          <p>View user-wise performance</p>
          <Link to="/admin/reports">View Reports →</Link>
        </div>

      </div>
    </div>
  )
}

const card = {
  background: '#fff',
  padding: 20,
  borderRadius: 14,
  boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
}