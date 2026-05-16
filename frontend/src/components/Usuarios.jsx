import React, { useState, useEffect } from 'react'
import { PlusCircle, Loader2 } from 'lucide-react'

const Usuarios = ({ API_URL }) => {
  const [loading, setLoading] = useState(false)
  const [dataList, setDataList] = useState([])
  const [form, setForm] = useState({ correo: '', nombre: '', contrasena: '123456' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/usuarios`)
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
      const res = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        alert('Usuario creado')
        fetchData()
        setForm({ correo: '', nombre: '', contrasena: '123456' })
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
        <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><PlusCircle size={20}/> Nuevo Usuario</h3>
        <form onSubmit={handleCreate} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
          <input placeholder="Nombre" className="glass" style={{padding: '0.8rem'}} value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
          <input placeholder="Correo" className="glass" style={{padding: '0.8rem'}} value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} required />
          <button type="submit" className="btn" disabled={loading}>Crear Usuario</button>
        </form>
      </div>

      <div className="glass" style={{padding: '1.5rem', borderRadius: '16px'}}>
        <h3>Listado de Usuarios</h3>
        {loading ? <Loader2 className="animate-spin" /> : (
          <div style={{marginTop: '1rem'}}>
            {dataList.map(item => (
              <div key={item.id} style={{padding: '0.75rem', borderBottom: '1px solid #eee'}}>
                <strong>ID: {item.id}</strong> - {item.nombre} ({item.correo})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Usuarios
