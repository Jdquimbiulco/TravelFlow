import React, { useState, useEffect } from 'react'
import { Compass, Users, MapPin, Calendar, CreditCard, Loader2, PlusCircle } from 'lucide-react'

function App() {
  const [view, setView] = useState('usuarios')
  const [loading, setLoading] = useState(false)
  const [dataList, setDataList] = useState([])

  // Formularios
  const [userForm, setUserForm] = useState({ correo: '', nombre: '', contrasena: '123456' })
  const [destForm, setDestForm] = useState({ nombre: '', pais: '', ciudad: '', precioPorDia: 100, cuposDisponibles: 10 })
  const [resForm, setResForm] = useState({ usuarioId: '', destinoId: '', fechaInicio: '', fechaFin: '', precioTotal: 100 })
  const [pagoForm, setPagoForm] = useState({ reservaId: '', monto: '', metodo: 'TARJETA' })

  const API_URL = 'http://localhost:3000/api'

  useEffect(() => {
    fetchData()
  }, [view])

  const fetchData = async () => {
    setLoading(true)
    try {
      const endpoint = view === 'usuarios' ? 'usuarios' : view === 'destinos' ? 'destinos' : view === 'reservas' ? 'reservas' : 'pagos'
      const res = await fetch(`${API_URL}/${endpoint}`)
      const data = await res.json()
      setDataList(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleCreate = async (endpoint, body) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        alert('Creado con éxito')
        fetchData()
      } else {
        const err = await res.json()
        alert('Error: ' + JSON.stringify(err))
      }
    } catch (e) { alert('Error de conexión') }
    setLoading(false)
  }

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
        <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem'}}>
          
          {/* COLUMNA 1: FORMULARIOS */}
          <div className="glass" style={{padding: '1.5rem', borderRadius: '16px'}}>
            <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><PlusCircle size={20}/> Nuevo {view.slice(0, -1)}</h3>
            
            {view === 'usuarios' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
                <input placeholder="Nombre" className="glass" style={{padding: '0.8rem'}} value={userForm.nombre} onChange={e => setUserForm({...userForm, nombre: e.target.value})} />
                <input placeholder="Correo" className="glass" style={{padding: '0.8rem'}} value={userForm.correo} onChange={e => setUserForm({...userForm, correo: e.target.value})} />
                <button className="btn" onClick={() => handleCreate('usuarios', userForm)}>Crear Usuario</button>
              </div>
            )}

            {view === 'destinos' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
                <input placeholder="Nombre Destino" className="glass" style={{padding: '0.8rem'}} value={destForm.nombre} onChange={e => setDestForm({...destForm, nombre: e.target.value})} />
                <input placeholder="País" className="glass" style={{padding: '0.8rem'}} value={destForm.pais} onChange={e => setDestForm({...destForm, pais: e.target.value})} />
                <input placeholder="Ciudad" className="glass" style={{padding: '0.8rem'}} value={destForm.ciudad} onChange={e => setDestForm({...destForm, ciudad: e.target.value})} />
                <input type="number" placeholder="Precio" className="glass" style={{padding: '0.8rem'}} value={destForm.precioPorDia} onChange={e => setDestForm({...destForm, precioPorDia: parseFloat(e.target.value)})} />
                <button className="btn" onClick={() => handleCreate('destinos', destForm)}>Crear Destino</button>
              </div>
            )}

            {view === 'reservas' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
                <input type="number" placeholder="ID Usuario" className="glass" style={{padding: '0.8rem'}} value={resForm.usuarioId} onChange={e => setResForm({...resForm, usuarioId: parseInt(e.target.value)})} />
                <input type="number" placeholder="ID Destino" className="glass" style={{padding: '0.8rem'}} value={resForm.destinoId} onChange={e => setResForm({...resForm, destinoId: parseInt(e.target.value)})} />
                <input type="date" placeholder="Inicio" className="glass" style={{padding: '0.8rem'}} value={resForm.fechaInicio} onChange={e => setResForm({...resForm, fechaInicio: e.target.value})} />
                <input type="date" placeholder="Fin" className="glass" style={{padding: '0.8rem'}} value={resForm.fechaFin} onChange={e => setResForm({...resForm, fechaFin: e.target.value})} />
                <input type="number" placeholder="Precio Total" className="glass" style={{padding: '0.8rem'}} value={resForm.precioTotal} onChange={e => setResForm({...resForm, precioTotal: parseFloat(e.target.value)})} />
                <button className="btn" onClick={() => handleCreate('reservas', resForm)}>Crear Reserva</button>
              </div>
            )}

            {view === 'pagos' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
                <input type="number" placeholder="ID Reserva" className="glass" style={{padding: '0.8rem'}} value={pagoForm.reservaId} onChange={e => setPagoForm({...pagoForm, reservaId: parseInt(e.target.value)})} />
                <input type="number" placeholder="Monto" className="glass" style={{padding: '0.8rem'}} value={pagoForm.monto} onChange={e => setPagoForm({...pagoForm, monto: parseFloat(e.target.value)})} />
                <select className="glass" style={{padding: '0.8rem'}} value={pagoForm.metodo} onChange={e => setPagoForm({...pagoForm, metodo: e.target.value})}>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="EFECTIVO">Efectivo</option>
                </select>
                <button className="btn" onClick={() => handleCreate('pagos', pagoForm)}>Registrar Pago</button>
              </div>
            )}
          </div>

          {/* COLUMNA 2: LISTADO */}
          <div className="glass" style={{padding: '1.5rem', borderRadius: '16px', maxHeight: '70vh', overflowY: 'auto'}}>
            <h3>Listado de {view}</h3>
            {loading ? <Loader2 className="animate-spin" /> : (
              <div style={{marginTop: '1rem'}}>
                {dataList.map(item => (
                  <div key={item.id} style={{padding: '0.75rem', borderBottom: '1px solid #eee', fontSize: '0.9rem'}}>
                    <strong>ID: {item.id}</strong> - {item.nombre || item.correo || `Reserva #${item.id}`} 
                    {item.monto && <span style={{float: 'right', color: 'green'}}>${item.monto}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  )
}

export default App
