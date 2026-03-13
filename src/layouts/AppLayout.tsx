import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import CreatorFilter from '../components/CreatorFilter'
import { creatorFromEmail } from '../utils/creator'
import '../App.css'

const NAV_ITEMS = [
  { to: '/app/dashboard', label: '# DASHBOARD' },
  { to: '/app/pipeline',  label: '> VIDEO PIPELINE' },
  { to: '/app/stats',     label: '~ CHANNEL STATS' },
]

export default function AppLayout() {
  const { user }                = useAuth()
  const navigate                = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const creator                 = creatorFromEmail(user?.email)

  async function handleLogout() {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <button
          className="menu-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '[X]' : '[=]'}
        </button>

        <span className="app-header-title">PABOPHER</span>

        <CreatorFilter />

        <div className="app-header-right">
          {creator && (
            <span className={`app-header-creator creator-tag creator-tag-${creator.toLowerCase()}`}>
              {creator.toUpperCase()}
            </span>
          )}
          <button onClick={handleLogout} className="app-logout-btn">LOGOUT</button>
        </div>
      </header>

      {/* Mobile dropdown nav */}
      {menuOpen && (
        <nav className="app-mobile-nav">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? 'mobile-nav-item mobile-nav-item-active' : 'mobile-nav-item'
              }
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}

      <div className="app-body">
        {/* Desktop sidebar */}
        <nav className="app-sidebar">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => isActive ? 'nav-item nav-item-active' : 'nav-item'}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
