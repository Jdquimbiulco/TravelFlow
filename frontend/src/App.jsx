import React, { useState } from 'react'
import { Compass, MapPin, Calendar, CreditCard, UserCircle2, Heart } from 'lucide-react'
import Destinos from './components/Destinos.jsx'
import Reservas from './components/Reservas.jsx'
import Pagos from './components/Pagos.jsx'
import Auth from './components/Auth.jsx'
import Account from './components/Account.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('destinos')
  const API_URL = 'http://localhost:3000/api'

  if (!user) {
    return <Auth API_URL={API_URL} onLogin={setUser} />
  }

  return (
    <>
      <nav className="navbar glass">
        <div className="logo"><Compass size={26} /> <span>TravelFlow</span></div>
        <div className="nav-links">
          <button onClick={() => setView('destinos')} className={`nav-link ${view === 'destinos' ? 'active' : ''}`}><MapPin size={18}/> Destinos</button>
          <button onClick={() => setView('reservas')} className={`nav-link ${view === 'reservas' ? 'active' : ''}`}><Calendar size={18}/> Reservas</button>
          <button onClick={() => setView('pagos')} className={`nav-link ${view === 'pagos' ? 'active' : ''}`}><CreditCard size={18}/> Pagos</button>
          <button className={`nav-link account-link ${view === 'account' ? 'active' : ''}`} onClick={() => setView('account')}><UserCircle2 size={18}/> Mi cuenta</button>
        </div>
      </nav>

      <main className="container">
        {view === 'destinos' && <Destinos API_URL={API_URL} user={user} />}
        {view === 'reservas' && <Reservas API_URL={API_URL} />}
        {view === 'pagos' && <Pagos API_URL={API_URL} />}
        {view === 'account' && <Account user={user} API_URL={API_URL} onLogout={() => { setUser(null); setView('destinos') }} onUpdate={setUser} />}
      </main>

      <footer className="footer">
        <div style={{ maxWdith: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
            <Compass size={20} /> TravelFlow &copy; {new Date().getFullYear()} — La mejor experiencia en gestión turística
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Diseñado para turistas exigentes con <Heart size={14} style={{ color: '#ef4444', verticalAlign: 'middle', margin: '0 2px' }} />
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
