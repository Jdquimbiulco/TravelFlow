import React, { useState, useEffect } from 'react'
import {
  PlusCircle,
  Loader2,
  CreditCard,
  User,
  MapPin,
  Calendar,
  Trash2,
  Banknote,
  ArrowRightLeft,
  DollarSign,
  CheckCircle2,
  XCircle,
  Receipt,
} from 'lucide-react'

const PAYMENT_METHODS = [
  { value: 'TARJETA', label: 'Tarjeta', icon: CreditCard },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: ArrowRightLeft },
  { value: 'EFECTIVO', label: 'Efectivo', icon: Banknote },
]

const Pagos = ({ API_URL }) => {
  const [loading, setLoading] = useState(false)
  const [dataList, setDataList] = useState([])
  const [reservasPendientes, setReservasPendientes] = useState([])
  const [form, setForm] = useState({ reservaId: '', monto: '', metodo: 'TARJETA' })
  const [message, setMessage] = useState({ text: '', type: '' })
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

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
    } catch (e) {
      console.error(e)
    }
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
        setMessage({ text: 'Error: ' + (err.message || JSON.stringify(err)), type: 'error' })
      }
    } catch (e) {
      setMessage({ text: 'Error de conexión', type: 'error' })
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/pagos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessage({ text: 'Pago anulado exitosamente', type: 'success' })
        setPendingDeleteId(null)
        fetchData()
      } else {
        setMessage({ text: 'Error al anular pago', type: 'error' })
      }
    } catch (e) {
      setMessage({ text: 'Error de conexión', type: 'error' })
    }
    setLoading(false)
  }

  const totalPagado = dataList.reduce((sum, p) => sum + Number(p.monto || 0), 0)

  const getMethodIcon = (metodo) => {
    const m = PAYMENT_METHODS.find(pm => pm.value === metodo)
    return m ? m.icon : CreditCard
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="section-hero">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--emerald)', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.85rem' }}>
            <CreditCard size={15} /> Gestión de Pagos
          </div>
          <h1 className="section-hero-title">
            Historial de <span>Pagos</span>
          </h1>
          <p className="section-hero-subtitle">
            Registra y gestiona todos los pagos de reservas. Los pagos confirman automáticamente las reservas pendientes.
          </p>
          {!loading && (
            <div className="stats-bar">
              <span className="stat-chip emerald"><Receipt size={14} /> {dataList.length} pagos registrados</span>
              {totalPagado > 0 && (
                <span className="stat-chip">
                  <DollarSign size={14} /> ${totalPagado.toFixed(2)} total recaudado
                </span>
              )}
              {reservasPendientes.length > 0 && (
                <span className="stat-chip accent">
                  <Loader2 size={14} /> {reservasPendientes.length} reservas por cobrar
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Mensaje global */}
      {message.text && (
        <div className={`account-message ${message.type}`} style={{ marginBottom: '1.5rem' }} role="status">
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Panel layout */}
      <div className="panel-layout">
        {/* Sidebar: Formulario */}
        <div className="panel-sidebar glass">
          <div className="panel-title">
            <PlusCircle size={18} />
            Registrar Pago
          </div>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Reserva */}
            <div className="field-group">
              <label className="field-label"><Calendar size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />Reserva pendiente</label>
              <select
                className="glass"
                style={{ padding: '0.85rem 1rem' }}
                value={form.reservaId}
                onChange={e => {
                  const rId = e.target.value
                  const reserva = reservasPendientes.find(r => r.id === parseInt(rId))
                  setForm({ ...form, reservaId: rId, monto: reserva ? reserva.precioTotal : '' })
                }}
                required
                disabled={loading}
              >
                <option value="">Selecciona una Reserva Pendiente</option>
                {reservasPendientes.map(r => (
                  <option key={r.id} value={r.id}>
                    #{r.id} · {r.usuario?.nombre || 'Usuario'} — {r.destino?.nombre || 'Destino'}
                  </option>
                ))}
              </select>
              {reservasPendientes.length === 0 && (
                <p style={{ fontSize: '0.78rem', color: 'var(--emerald)', fontWeight: 600, marginTop: '0.2rem' }}>
                  ✓ No hay reservas pendientes de pago
                </p>
              )}
            </div>

            {/* Monto */}
            <div className="field-group">
              <label className="field-label"><DollarSign size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />Monto a pagar</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="glass"
                style={{ padding: '0.85rem 1rem' }}
                value={form.monto}
                onChange={e => setForm({ ...form, monto: e.target.value })}
                onInvalid={e => e.target.setCustomValidity('El monto debe ser mayor a $0.00')}
                onInput={e => e.target.setCustomValidity('')}
                required
                disabled={loading}
              />
            </div>

            {/* Método de pago */}
            <div className="field-group">
              <label className="field-label"><CreditCard size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />Método de pago</label>
              <div className="method-selector">
                {PAYMENT_METHODS.map(method => {
                  const Icon = method.icon
                  return (
                    <label
                      key={method.value}
                      className={`method-option ${form.metodo === method.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="metodo"
                        value={method.value}
                        checked={form.metodo === method.value}
                        onChange={e => setForm({ ...form, metodo: e.target.value })}
                        style={{ display: 'none' }}
                      />
                      <Icon size={18} />
                      {method.label}
                    </label>
                  )
                })}
              </div>
            </div>

            <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.25rem' }}>
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Procesando…</>
                : <><CreditCard size={16} /> Confirmar Pago</>
              }
            </button>
          </form>
        </div>

        {/* Main: Historial */}
        <div className="panel-main glass">
          <div className="panel-title">
            <Receipt size={18} />
            Historial de pagos
            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {dataList.length} registros
            </span>
          </div>

          {loading && dataList.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem' }}>
              <Loader2 size={36} className="animate-spin" style={{ color: 'var(--emerald)' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Cargando pagos…</p>
            </div>
          ) : dataList.length === 0 ? (
            <div className="empty-state">
              <CreditCard size={48} />
              <p>No hay pagos registrados aún. ¡Registra el primer pago desde el formulario!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {dataList.map(item => {
                const MethodIcon = getMethodIcon(item.metodo)
                return (
                  <div key={item.id} className="pago-card">
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Pago #{item.id}</strong>
                        {item.codigoTransaccion && (
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontFamily: 'monospace' }}>
                            {item.codigoTransaccion}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald)' }}>
                        ${Number(item.monto).toFixed(2)}
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '0.2rem' }}>
                          {item.moneda || 'USD'}
                        </span>
                      </span>
                    </div>

                    {/* Info */}
                    {item.reserva && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem' }}>
                          <User size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {item.reserva.usuario?.nombre || `Usuario #${item.reserva.usuarioId}`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                          <MapPin size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                          <span>{item.reserva.destino?.nombre || `Destino #${item.reserva.destinoId}`}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <Calendar size={13} style={{ flexShrink: 0 }} />
                          <span>Reserva #{item.reserva.id}</span>
                        </div>
                      </div>
                    )}

                    {!item.reserva && (
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Reserva #{item.reservaId}
                      </p>
                    )}

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px dashed #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        <MethodIcon size={14} />
                        {item.metodo}
                      </div>

                      {pendingDeleteId === item.id ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                            onClick={() => handleDelete(item.id)}
                            disabled={loading}
                          >
                            Confirmar
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.6rem' }}
                            onClick={() => setPendingDeleteId(null)}
                            disabled={loading}
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                          onClick={() => setPendingDeleteId(item.id)}
                          disabled={loading}
                          title="Anular Pago"
                        >
                          <Trash2 size={13} /> Anular
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Pagos
