import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import UploadLeads from './pages/UploadLeads'
import Reports from './pages/Reports'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" />
  return children
}

function App() {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute user={user}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute user={user}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute user={user}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/upload"
        element={
          <ProtectedRoute user={user}>
            <UploadLeads />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute user={user}>
            <Reports />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App