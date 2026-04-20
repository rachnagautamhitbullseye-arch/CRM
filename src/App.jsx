import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useAuth } from './context/AuthContext'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
    </Routes>
  )
}

export default App