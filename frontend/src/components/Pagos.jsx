import React, { useState, useEffect } from 'react'
import { PlusCircle, Loader2 } from 'lucide-react'

const Pagos = ({ API_URL }) => {
  const [loading, setLoading] = useState(false)
  const [dataList, setDataList] = useState([])
  const [form, setForm] = useState({ reservaId: '', monto: '', metodo: 'TARJETA' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/pagos`)
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
      const res = await fetch(`${API_URL}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          reservaId: parseInt(form.reservaId),
          monto: parseFloat(form.monto)
        })
      })
      if (res.ok) {
        alert('Pago registrado')
        fetchData()
        setForm({ reservaId: '', monto: '', metodo: 'TARJETA' })
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
        <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><PlusCircle size={20}/> Registrar Pago</h3>
        <form onSubmit={handleCreate} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
          <input type="number" placeholder="ID Reserva" className="glass" style={{padding: '0.8rem'}} value={form.reservaId} onChange={e => setForm({...form, reservaId: e.target.value})} required />
          <input type="number" placeholder="Monto" className="glass" style={{padding: '0.8rem'}} value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
          <select className="glass" style={{padding: '0.8rem'}} value={form.metodo} onChange={e => setForm({...form, metodo: e.target.value})}>
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="EFECTIVO">Efectivo</option>
          </select>
          <button type="submit" className="btn" disabled={loading}>Pagar Ahora</button>
        </form>
      </div>

      <div className="glass" style={{padding: '1.5rem', borderRadius: '16px'}}>
        <h3>Historial de Pagos</h3>
        {loading ? <Loader2 className="animate-spin" /> : (
          <div style={{marginTop: '1rem'}}>
            {dataList.map(item => (
              <div key={item.id} style={{padding: '0.75rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between'}}>
                <strong>Reserva #{item.reservaId}</strong>
                <span style={{color: 'green', fontWeight: 'bold'}}>${item.monto}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Pagos
