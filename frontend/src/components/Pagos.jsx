import React, { useState, useEffect } from 'react'
import { PlusCircle, Loader2, CreditCard, User, MapPin, Calendar, CheckCircle, Trash2 } from 'lucide-react'

const Pagos = ({ API_URL }) => {
  const [loading, setLoading] = useState(false)
  const [dataList, setDataList] = useState([])
  const [reservasPendientes, setReservasPendientes] = useState([])
  const [form, setForm] = useState({ reservaId: '', monto: '', metodo: 'TARJETA' })
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    if (!message.text) return
    const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000)
    return () => clearTimeout(timer)
  }, [message.text])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resPagos, resReservas] = await Promise.all([
        fetch(`${API_URL}/pagos`),
        fetch(`${API_URL}/reservas`)
      ])
      
      const pagosData = await resPagos.json()
      setDataList(Array.isArray(pagosData) ? pagosData : [])

      const reservasData = await resReservas.json()
      if (Array.isArray(reservasData)) {
        setReservasPendientes(reservasData.filter(r => r.estado === 'PENDIENTE' || r.estado === 'PENDING'))
      }
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
          monto: parseFloat(form.monto),
          codigoTransaccion: `TRX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        })
      })
      if (res.ok) {
        setMessage({ text: 'Pago registrado exitosamente', type: 'success' })
        fetchData()
        setForm({ reservaId: '', monto: '', metodo: 'TARJETA' })
      } else {
        const err = await res.json()
        setMessage({ text: 'Error: ' + JSON.stringify(err), type: 'error' })
      }
    } catch (e) { setMessage({ text: 'Error de conexión', type: 'error' }) }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de anular este pago? La reserva volverá a estar pendiente.")) return;
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/pagos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessage({ text: 'Pago anulado exitosamente', type: 'success' })
        fetchData()
      } else {
        setMessage({ text: 'Error al anular pago', type: 'error' })
      }
    } catch (e) {
      setMessage({ text: 'Error de conexión', type: 'error' })
    }
    setLoading(false)
  }

  return (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem', alignItems: 'start'}}>
      <div className="glass" style={{padding: '1.5rem', borderRadius: '16px'}}>
        <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><PlusCircle size={20}/> Registrar Pago</h3>
        
        {message.text && (
          <div className={message.type === 'success' ? 'account-message success' : 'account-message error'} style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleCreate} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
          <select 
            className="glass" 
            style={{padding: '0.8rem'}} 
            value={form.reservaId} 
            onChange={e => {
              const rId = e.target.value;
              const reserva = reservasPendientes.find(r => r.id === parseInt(rId));
              setForm({
                ...form, 
                reservaId: rId,
                monto: reserva ? reserva.precioTotal : ''
              });
            }} 
            required
          >
            <option value="">Selecciona una Reserva Pendiente</option>
            {reservasPendientes.map(r => (
              <option key={r.id} value={r.id}>
                Reserva #{r.id} - {r.usuario?.nombre || 'Usuario'} ({r.destino?.nombre || 'Destino'})
              </option>
            ))}
          </select>
          <input 
            type="number" 
            step="0.01" 
            min="0.01" 
            placeholder="Monto" 
            className="glass" 
            style={{padding: '0.8rem'}} 
            value={form.monto} 
            onChange={e => setForm({...form, monto: e.target.value})} 
            onInvalid={e => e.target.setCustomValidity('El monto debe ser mayor a $0.00')}
            onInput={e => e.target.setCustomValidity('')}
            required 
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Método de Pago</span>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {['TARJETA', 'TRANSFERENCIA', 'EFECTIVO'].map(method => (
                <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input 
                    type="radio" 
                    name="metodo" 
                    value={method} 
                    checked={form.metodo === method} 
                    onChange={e => setForm({...form, metodo: e.target.value})} 
                    style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', margin: 0 }}
                  />
                  {method === 'TARJETA' ? 'Tarjeta' : method === 'TRANSFERENCIA' ? 'Transferencia' : 'Efectivo'}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn" disabled={loading}>Pagar Ahora</button>
        </form>
      </div>

      <div className="glass" style={{padding: '1.5rem', borderRadius: '16px'}}>
        <h3>Historial de Pagos</h3>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}><Loader2 className="animate-spin" size={24} /></div> : (
          <div style={{
            marginTop: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {dataList.map(item => (
              <div key={item.id} className="glass" style={{padding: '1rem', borderRadius: '12px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <strong style={{ fontSize: '1.1rem' }}>Pago #{item.id}</strong>
                  <span style={{color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem'}}>${Number(item.monto).toFixed(2)} {item.moneda || 'USD'}</span>
                </div>
                {item.codigoTransaccion && (
                  <p style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Ref: {item.codigoTransaccion}
                  </p>
                )}
                
                {item.reserva ? (
                  <>
                    <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={14} />
                      {item.reserva.usuario?.nombre || `Usuario #${item.reserva.usuarioId}`}
                    </p>
                    <p style={{ marginTop: '0.35rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} />
                      {item.reserva.destino?.nombre || `Destino #${item.reserva.destinoId}`}
                    </p>
                    <p style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} />
                      Reserva #{item.reserva.id}
                    </p>
                  </>
                ) : (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Reserva #{item.reservaId}</p>
                )}
                
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                    <CreditCard size={12} /> {item.metodo}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}
                      title="Anular Pago"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Pagos
