// src/pages/AdminDashboard.jsx

import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div style={{ padding: 10 }}>

        {/* Header */}
        <h1 style={{
          fontSize: 26,
          fontWeight: 700,
          marginBottom: 6
        }}>
          👑 Admin Dashboard
        </h1>

        <p style={{
          color: '#64748b',
          marginBottom: 30
        }}>
          Manage users, leads, and reports from here.
        </p>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20
        }}>

          {/* Users Card */}
          <div style={card}>
            <h3 style={title}>👥 Users</h3>
            <p style={desc}>Add, edit, and manage user roles</p>
            <Link to="/admin/users" style={link}>
              Manage Users →
            </Link>
          </div>

          {/* Upload Leads */}
          <div style={card}>
            <h3 style={title}>📂 Upload Leads</h3>
            <p style={desc}>Bulk upload leads using CSV</p>
            <Link to="/admin/upload" style={link}>
              Upload Leads →
            </Link>
          </div>

          {/* Reports */}
          <div style={card}>
            <h3 style={title}>📊 Reports</h3>
            <p style={desc}>View performance analytics</p>
            <Link to="/admin/reports" style={link}>
              View Reports →
            </Link>
          </div>

        </div>

      </div>
    </AdminLayout>
  )
}

/* ------------------ Styles ------------------ */

const card = {
  background: '#ffffff',
  padding: 20,
  borderRadius: 16,
  boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
  transition: '0.2s',
  cursor: 'pointer'
}

const title = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 6
}

const desc = {
  fontSize: 13,
  color: '#64748b',
  marginBottom: 14
}

const link = {
  color: '#2563eb',
  fontWeight: 500,
  textDecoration: 'none'
}