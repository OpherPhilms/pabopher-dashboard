import { useEffect } from 'react'
import './App.css'

const features: { id: string; icon: string; name: string; color: string }[] = [
  { id: 'analytics', icon: '#',  name: 'Shared Analytics',  color: 'coral'  },
  { id: 'calendar',  icon: '@',  name: 'Content Calendar',  color: 'teal'   },
  { id: 'tasks',     icon: '+',  name: 'Task Board',         color: 'navy'   },
  { id: 'ideas',     icon: '!',  name: 'Idea Inbox',         color: 'yellow' },
  { id: 'assets',    icon: '=',  name: 'Asset Library',      color: 'green'  },
  { id: 'goals',     icon: '^',  name: 'Goal Tracker',       color: 'purple' },
]

const STARS  = '★  '.repeat(60)
const SPACER = Array(12).fill('★').join(' -=- ')

const SPARKLE_COLORS = ['#FFD700', '#FF5533', '#007B7B', '#1A1A6E', '#FF9900']

export default function App() {
  // Sparkle trail
  useEffect(() => {
    let last = 0
    let ci = 0

    const onMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - last < 90) return
      last = now

      const el = document.createElement('div')
      el.className = 'sparkle'
      const size = 6 + Math.floor(Math.random() * 6)
      el.style.cssText = `
        left: ${e.clientX - size / 2}px;
        top:  ${e.clientY - size / 2}px;
        width:  ${size}px;
        height: ${size}px;
        background: ${SPARKLE_COLORS[ci % SPARKLE_COLORS.length]};
      `
      ci++
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 600)
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      {/* Top star band */}
      <div className="star-band" aria-hidden="true">{STARS}</div>

      {/* Hero */}
      <div className="hero">
        <p className="hero-welcome">* * * WELCOME TO * * *</p>
        <h1 className="hero-title">PABOPHER</h1>
        <hr className="hero-rule" />
        <p className="hero-desc">
          A collaborative content dashboard for two creators sharing one channel.
        </p>
        <div className="hero-badges">
          <span className="badge badge-new">NEW!</span>
          <span className="badge badge-made">By Pab + Opher</span>
        </div>
      </div>

      {/* Divider */}
      <div className="pixel-divider" aria-hidden="true">{SPACER}</div>

      {/* Features */}
      <section className="features">
        <h2 className="features-heading">FEATURES</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.id} className={`card card-${f.color}`}>
              <div className="card-icon">{f.icon}</div>
              <div className="card-name">{f.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="pixel-divider" aria-hidden="true">{SPACER}</div>

      {/* Footer */}
      <footer className="footer">
        <span>PAB + OPHER</span>
        <span className="footer-sep">*</span>
        <span>EST. 2026</span>
        <span className="footer-sep">*</span>
        <span className="footer-counter">VISITORS: 00042</span>
        <p className="footer-small">BEST VIEWED AT 800x600 IN NETSCAPE NAVIGATOR</p>
      </footer>

      {/* Bottom star band */}
      <div className="star-band" aria-hidden="true">{STARS}</div>
    </>
  )
}
