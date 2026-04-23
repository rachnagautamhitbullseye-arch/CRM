import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import UploadLeads from './pages/UploadLeads'
import Reports from './pages/Reports'
import { useAuth } from './context/AuthContext'
console.log("Logged user:", user?.email)
console.log("Role:", profile?.role)

function AdminRoute({ user, profile, children }) {
  if (!user) return <Navigate to="/login" />

  if (!profile) return <div>Loading profile...</div>

  if (profile.role !== 'admin') {
    return <Navigate to="/dashboard" />
  }

  return children
}



function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" />
  return children
}

function App() {
  const { user, profile, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <Routes>
  <Route path="/login" element={<Login />} />

  <Route
    path="/"
    element={
      user
        ? profile?.role === 'admin'
          ? <Navigate to="/admin" />
          : <Navigate to="/dashboard" />
        : <Navigate to="/login" />
    }
  />

  <Route
    path="/dashboard"
    element={
      <ProtectedRoute user={user}>
        <Dashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin"
    element={
      <AdminRoute user={user} profile={profile}>
        <AdminDashboard />
      </AdminRoute>
    }
  />

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

  {/* fallback */}
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
    
  )
}

export default App