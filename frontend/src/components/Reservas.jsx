import React, { useState, useEffect } from 'react'
import { PlusCircle, Loader2 } from 'lucide-react'

const Reservas = ({ API_URL }) => {
  const [loading, setLoading] = useState(false)
  const [dataList, setDataList] = useState([])
  const [form, setForm] = useState({ usuarioId: '', destinoId: '', fechaInicio: '', fechaFin: '', precioTotal: 0 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/reservas`)
      const data = await res.json()
      setDataList(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          usuarioId: parseInt(form.usuarioId),
          destinoId: parseInt(form.destinoId),
          precioTotal: parseFloat(form.precioTotal)
        })
      })
      if (res.ok) {
        alert('Reserva creada')
        fetchData()
        setForm({ usuarioId: '', destinoId: '', fechaInicio: '', fechaFin: '', precioTotal: 0 })
      } else {
        const err = await res.json()
        alert('Error: ' + JSON.stringify(err))
      }
    } catch (e) { alert('Error de conexión') }
    setLoading(false)
  }

  return (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem'}}>
      <div className="glass" style={{padding: '1.5rem', borderRadius: '16px'}}>
        <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><PlusCircle size={20}/> Nueva Reserva</h3>
        <form onSubmit={handleCreate} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
          <input type="number" placeholder="ID Usuario" className="glass" style={{padding: '0.8rem'}} value={form.usuarioId} onChange={e => setForm({...form, usuarioId: e.target.value})} required />
          <input type="number" placeholder="ID Destino" className="glass" style={{padding: '0.8rem'}} value={form.destinoId} onChange={e => setForm({...form, destinoId: e.target.value})} required />
          <input type="date" className="glass" style={{padding: '0.8rem'}} value={form.fechaInicio} onChange={e => setForm({...form, fechaInicio: e.target.value})} required />
          <input type="date" className="glass" style={{padding: '0.8rem'}} value={form.fechaFin} onChange={e => setForm({...form, fechaFin: e.target.value})} required />
          <input type="number" placeholder="Precio Total" className="glass" style={{padding: '0.8rem'}} value={form.precioTotal} onChange={e => setForm({...form, precioTotal: e.target.value})} required />
          <button type="submit" className="btn" disabled={loading}>Crear Reserva</button>
        </form>
      </div>

      <div className="glass" style={{padding: '1.5rem', borderRadius: '16px'}}>
        <h3>Listado de Reservas</h3>
        {loading ? <Loader2 className="animate-spin" /> : (
          <div style={{marginTop: '1rem'}}>
            {dataList.map(item => (
              <div key={item.id} style={{padding: '0.75rem', borderBottom: '1px solid #eee'}}>
                <strong>Reserva #{item.id}</strong> - User: {item.usuarioId} | Dest: {item.destinoId}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Reservas
