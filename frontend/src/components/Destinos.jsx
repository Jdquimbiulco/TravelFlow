import React, { useState, useEffect } from 'react'
import { PlusCircle, Loader2 } from 'lucide-react'

const Destinos = ({ API_URL }) => {
  const [loading, setLoading] = useState(false)
  const [dataList, setDataList] = useState([])
  const [form, setForm] = useState({ nombre: '', pais: '', ciudad: '', precioPorDia: 100, cuposDisponibles: 10 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/destinos`)
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
      const res = await fetch(`${API_URL}/destinos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        alert('Destino creado')
        fetchData()
        setForm({ nombre: '', pais: '', ciudad: '', precioPorDia: 100, cuposDisponibles: 10 })
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
        <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><PlusCircle size={20}/> Nuevo Destino</h3>
        <form onSubmit={handleCreate} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
          <input placeholder="Nombre Destino" className="glass" style={{padding: '0.8rem'}} value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
          <input placeholder="País" className="glass" style={{padding: '0.8rem'}} value={form.pais} onChange={e => setForm({...form, pais: e.target.value})} required />
          <input placeholder="Ciudad" className="glass" style={{padding: '0.8rem'}} value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} required />
          <input type="number" placeholder="Precio/Día" className="glass" style={{padding: '0.8rem'}} value={form.precioPorDia} onChange={e => setForm({...form, precioPorDia: parseFloat(e.target.value)})} required />
          <button type="submit" className="btn" disabled={loading}>Crear Destino</button>
        </form>
      </div>

      <div className="glass" style={{padding: '1.5rem', borderRadius: '16px'}}>
        <h3>Listado de Destinos</h3>
        {loading ? <Loader2 className="animate-spin" /> : (
          <div style={{marginTop: '1rem'}}>
            {dataList.map(item => (
              <div key={item.id} style={{padding: '0.75rem', borderBottom: '1px solid #eee'}}>
                <strong>ID: {item.id}</strong> - {item.nombre} ({item.ciudad}, {item.pais})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Destinos
