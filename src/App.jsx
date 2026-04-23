import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import UploadLeads from './pages/UploadLeads'
import Reports from './pages/Reports'
import { useAuth } from './context/AuthContext'

/* ------------------ Admin Route ------------------ */
function AdminRoute({ user, profile, children }) {
  if (!user) return <Navigate to="/login" />

  // wait for profile
  if (!profile) return <div>Loading profile...</div>

  if (profile.role?.toLowerCase() !== 'admin') {
    return <Navigate to="/dashboard" />
  }

  return children
}

/* ------------------ Protected Route ------------------ */
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" />
  return children
}

/* ------------------ App ------------------ */
function App() {
  const { user, profile, loading } = useAuth()

  // DEBUG (optional)
  console.log("Logged user:", user?.email)
  console.log("Role:", profile?.role)

  // wait for auth + profile
  if (loading || (user && !profile)) {
    return <div>Loading...</div>
  }

  return (
    <Routes>

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Root Redirect */}
      <Route
        path="/"
        element={
          !user
            ? <Navigate to="/login" />
            : profile.role?.toLowerCase() === 'admin'
              ? <Navigate to="/admin" />
              : <Navigate to="/dashboard" />
        }
      />

      {/* User Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <AdminRoute user={user} profile={profile}>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Admin Pages */}
      <Route
        path="/admin/users"
        element={
          <AdminRoute user={user} profile={profile}>
            <AdminUsers />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/upload"
        element={
          <AdminRoute user={user} profile={profile}>
            <UploadLeads />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <AdminRoute user={user} profile={profile}>
            <Reports />
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  )
}

export default App