import React, { useState } from 'react'
import { Compass, Users, MapPin, Calendar, CreditCard } from 'lucide-react'
import Usuarios from './components/Usuarios'
import Destinos from './components/Destinos'
import Reservas from './components/Reservas'
import Pagos from './components/Pagos'

function App() {
  const [view, setView] = useState('usuarios')
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

  return (
    <>
      <nav className="navbar glass">
        <div className="logo"><Compass size={24} /> <span>TravelFlow</span></div>
        <div className="nav-links">
          <button onClick={() => setView('usuarios')} className={`nav-link ${view === 'usuarios' ? 'active' : ''}`}><Users size={18}/> Usuarios</button>
          <button onClick={() => setView('destinos')} className={`nav-link ${view === 'destinos' ? 'active' : ''}`}><MapPin size={18}/> Destinos</button>
          <button onClick={() => setView('reservas')} className={`nav-link ${view === 'reservas' ? 'active' : ''}`}><Calendar size={18}/> Reservas</button>
          <button onClick={() => setView('pagos')} className={`nav-link ${view === 'pagos' ? 'active' : ''}`}><CreditCard size={18}/> Pagos</button>
        </div>
      </nav>

      <main className="container">
        {view === 'usuarios' && <Usuarios API_URL={API_URL} />}
        {view === 'destinos' && <Destinos API_URL={API_URL} />}
        {view === 'reservas' && <Reservas API_URL={API_URL} />}
        {view === 'pagos' && <Pagos API_URL={API_URL} />}
      </main>
    </>
  )
}

export default App
