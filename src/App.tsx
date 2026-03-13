import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { FilterProvider } from './context/FilterContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout  from './layouts/AppLayout'
import Landing    from './pages/Landing'
import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Pipeline   from './pages/Pipeline'
import Stats      from './pages/Stats'

export default function App() {
  return (
    <AuthProvider>
      <FilterProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"      element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected — all app pages live under /app */}
          <Route path="/app" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pipeline"  element={<Pipeline />} />
            <Route path="stats"     element={<Stats />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </FilterProvider>
    </AuthProvider>
  )
}
