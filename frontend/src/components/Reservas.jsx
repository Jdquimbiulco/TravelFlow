import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  PlusCircle,
  Loader2,
  Pencil,
  Trash2,
  X,
  Save,
  Calendar,
  User,
  MapPin,
  CheckCircle,
  Clock,
  CalendarDays,
  DollarSign,
  ListChecks,
  XCircle,
  CheckCircle2,
} from 'lucide-react'

const INITIAL_FORM = {
  usuarioId: '',
  destinoId: '',
  fechaInicio: '',
  fechaFin: '',
  precioTotal: 0,
}

const parseApiError = async (response) => {
  try {
    const body = await response.json()
    if (body.message) return body.message
    if (body.errors) {
      return Array.isArray(body.errors)
        ? body.errors.map((e) => e.msg ?? String(e)).join(', ')
        : JSON.stringify(body.errors)
    }
    return JSON.stringify(body)
  } catch {
    return `Error ${response.status}`
  }
}

const toDateInputValue = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const clampNonNegative = (value) => {
  const num = parseFloat(String(value))
  if (Number.isNaN(num) || num < 0) return 0
  return num
}

const isEndBeforeStart = (fechaInicio, fechaFin) =>
  Boolean(fechaInicio && fechaFin && fechaFin < fechaInicio)

const Reservas = ({ API_URL }) => {
  const [loading, setLoading] = useState(true)
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [dataList, setDataList] = useState([])
  const [users, setUsers] = useState([])
  const [destinations, setDestinations] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const isEditing = editingId !== null

  const dateRangeInvalid = useMemo(
    () => isEndBeforeStart(form.fechaInicio, form.fechaFin),
    [form.fechaInicio, form.fechaFin],
  )

  const showMessage = useCallback((text, type = 'success') => {
    setMessage({ text, type })
  }, [])

  const clearMessage = useCallback(() => {
    setMessage({ text: '', type: '' })
  }, [])

  const fetchReservations = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const res = await fetch(`${API_URL}/reservas`)
      if (!res.ok) throw new Error(await parseApiError(res))
      const data = await res.json()
      setDataList(Array.isArray(data) ? data : [])
    } catch (err) {
      showMessage(err.message || 'No se pudo cargar el listado de reservas', 'error')
      setDataList([])
    } finally {
      setLoading(false)
    }
  }, [API_URL, showMessage])

  const fetchUsers = useCallback(async () => {
    const res = await fetch(`${API_URL}/usuarios`)
    if (!res.ok) throw new Error(await parseApiError(res))
    const data = await res.json()
    return Array.isArray(data) ? data : []
  }, [API_URL])

  const fetchDestinations = useCallback(async () => {
    const res = await fetch(`${API_URL}/destinos`)
    if (!res.ok) throw new Error(await parseApiError(res))
    const data = await res.json()
    return Array.isArray(data) ? data : []
  }, [API_URL])

  useEffect(() => {
    let cancelled = false

    const loadInitialData = async () => {
      setOptionsLoading(true)
      try {
        const [usersData, destinationsData, reservationsRes] = await Promise.all([
          fetchUsers(),
          fetchDestinations(),
          fetch(`${API_URL}/reservas`),
        ])

        if (cancelled) return

        setUsers(usersData)
        setDestinations(destinationsData)

        if (!reservationsRes.ok) throw new Error(await parseApiError(reservationsRes))
        const reservationsData = await reservationsRes.json()
        setDataList(Array.isArray(reservationsData) ? reservationsData : [])
      } catch (err) {
        if (!cancelled) {
          showMessage(err.message || 'No se pudieron cargar los datos', 'error')
          setUsers([])
          setDestinations([])
          setDataList([])
        }
      } finally {
        if (!cancelled) {
          setOptionsLoading(false)
          setLoading(false)
        }
      }
    }

    loadInitialData()
    return () => {
      cancelled = true
    }
  }, [API_URL, fetchUsers, fetchDestinations, showMessage])

  useEffect(() => {
    if (!message.text) return undefined
    const timer = setTimeout(clearMessage, 5000)
    return () => clearTimeout(timer)
  }, [message.text, clearMessage])

  useEffect(() => {
    if (!form.destinoId || !form.fechaInicio || !form.fechaFin) return;
    const start = new Date(form.fechaInicio);
    const end = new Date(form.fechaFin);
    if (end < start) return;
    const destino = destinations.find(d => d.id === parseInt(form.destinoId, 10));
    if (!destino) return;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const days = diffDays > 0 ? diffDays : 1;
    const calculatedPrice = days * destino.precioPorDia;
    if (parseFloat(form.precioTotal) !== calculatedPrice) {
      setForm(prev => ({ ...prev, precioTotal: calculatedPrice }));
    }
  }, [form.destinoId, form.fechaInicio, form.fechaFin, destinations]);

  const resetForm = () => {
    setForm(INITIAL_FORM)
    setEditingId(null)
  }

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const updatePrecio = (e) => {
    const { value } = e.target
    if (value === '') {
      setForm((prev) => ({ ...prev, precioTotal: '' }))
      return
    }
    setForm((prev) => ({ ...prev, precioTotal: clampNonNegative(value) }))
  }

  const startEdit = (item) => {
    clearMessage()
    setPendingDeleteId(null)
    setEditingId(item.id)
    setForm({
      usuarioId: String(item.usuarioId ?? ''),
      destinoId: String(item.destinoId ?? ''),
      fechaInicio: toDateInputValue(item.fechaInicio),
      fechaFin: toDateInputValue(item.fechaFin),
      precioTotal: Number(item.precioTotal) || 0,
    })
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    resetForm()
    clearMessage()
  }

  const buildPayload = () => ({
    usuarioId: parseInt(form.usuarioId, 10),
    destinoId: parseInt(form.destinoId, 10),
    fechaInicio: form.fechaInicio,
    fechaFin: form.fechaFin,
    precioTotal: clampNonNegative(form.precioTotal),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearMessage()

    if (dateRangeInvalid) {
      showMessage('La fecha de fin no puede ser anterior a la fecha de inicio', 'error')
      return
    }

    setLoading(true)
    try {
      const url = isEditing
        ? `${API_URL}/reservas/${editingId}`
        : `${API_URL}/reservas`
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      if (!res.ok) throw new Error(await parseApiError(res))

      showMessage(
        isEditing ? 'Reserva actualizada correctamente' : 'Reserva creada correctamente',
        'success',
      )
      resetForm()
      await fetchReservations(false)
    } catch (err) {
      showMessage(err.message || 'Error de conexión', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    setLoading(true)
    clearMessage()
    try {
      const res = await fetch(`${API_URL}/reservas/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await parseApiError(res))

      showMessage('Reserva eliminada correctamente', 'success')
      if (editingId === id) resetForm()
      setPendingDeleteId(null)
      await fetchReservations(false)
    } catch (err) {
      showMessage(err.message || 'No se pudo eliminar la reserva', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getUserLabel = (item) =>
    item.usuario?.nombre
      ? `${item.usuario.nombre}`
      : `Usuario #${item.usuarioId}`

  const getDestinoLabel = (item) =>
    item.destino?.nombre
      ? `${item.destino.nombre} — ${item.destino.ciudad}`
      : `Destino #${item.destinoId}`

  const formatDisplayDate = (value) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const calcDays = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return null
    return Math.max(1, Math.ceil(Math.abs(new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24)))
  }

  const formDisabled = loading || optionsLoading
  const confirmadas = dataList.filter(r => r.estado === 'COMPLETADO' || r.estado === 'CONFIRMADA').length
  const pendientes = dataList.filter(r => r.estado === 'PENDIENTE' || r.estado === 'PENDING').length

  return (
    <div>
      {/* Hero Section */}
      <section className="section-hero">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--primary-dark)', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.85rem' }}>
            <CalendarDays size={15} /> Gestión de Reservas
          </div>
          <h1 className="section-hero-title">
            Tus <span>Reservas de Viaje</span>
          </h1>
          <p className="section-hero-subtitle">
            Crea, edita y gestiona todas las reservas turísticas. El precio se calcula automáticamente según el destino y las fechas elegidas.
          </p>
          {!loading && (
            <div className="stats-bar">
              <span className="stat-chip"><ListChecks size={14} /> {dataList.length} reservas totales</span>
              {confirmadas > 0 && <span className="stat-chip emerald"><CheckCircle size={14} /> {confirmadas} confirmadas</span>}
              {pendientes > 0 && <span className="stat-chip accent"><Clock size={14} /> {pendientes} pendientes</span>}
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
            {isEditing ? <Save size={18} /> : <PlusCircle size={18} />}
            {isEditing ? 'Editar reserva' : 'Nueva reserva'}
          </div>

          {optionsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', padding: '1rem 0' }}>
              <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)' }} />
              Cargando datos…
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Usuario */}
              <div className="field-group">
                <label className="field-label"><User size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />Usuario</label>
                <select
                  className="glass"
                  style={{ padding: '0.85rem 1rem' }}
                  value={form.usuarioId}
                  onChange={updateField('usuarioId')}
                  required
                  disabled={formDisabled}
                >
                  <option value="">Selecciona un usuario</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nombre} ({user.correo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destino */}
              <div className="field-group">
                <label className="field-label"><MapPin size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />Destino</label>
                <select
                  className="glass"
                  style={{ padding: '0.85rem 1rem' }}
                  value={form.destinoId}
                  onChange={updateField('destinoId')}
                  required
                  disabled={formDisabled}
                >
                  <option value="">Selecciona un destino</option>
                  {destinations.map((destino) => (
                    <option key={destino.id} value={destino.id}>
                      {destino.nombre} — {destino.ciudad}, {destino.pais}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fechas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="field-group">
                  <label className="field-label"><Calendar size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />Inicio</label>
                  <input
                    type="date"
                    className="glass"
                    style={{ padding: '0.85rem 0.75rem' }}
                    value={form.fechaInicio}
                    onChange={updateField('fechaInicio')}
                    required
                    disabled={formDisabled}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label"><Calendar size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />Fin</label>
                  <input
                    type="date"
                    className="glass"
                    style={{ padding: '0.85rem 0.75rem' }}
                    value={form.fechaFin}
                    min={form.fechaInicio || undefined}
                    onChange={updateField('fechaFin')}
                    required
                    disabled={formDisabled}
                  />
                </div>
              </div>

              {dateRangeInvalid && (
                <div className="account-message error" role="alert" style={{ margin: 0 }}>
                  <XCircle size={16} /> La fecha de fin no puede ser anterior a la de inicio.
                </div>
              )}

              {/* Precio */}
              <div className="field-group">
                <label className="field-label"><DollarSign size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />Precio total</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Se calcula automáticamente"
                  className="glass"
                  style={{ padding: '0.85rem 1rem' }}
                  value={form.precioTotal}
                  onChange={updatePrecio}
                  required
                  disabled={formDisabled}
                />
                {form.destinoId && form.fechaInicio && form.fechaFin && !dateRangeInvalid && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--emerald)', fontWeight: 600, marginTop: '0.25rem' }}>
                    ✓ Precio calculado automáticamente
                  </p>
                )}
              </div>

              <button type="submit" className="btn" disabled={formDisabled || dateRangeInvalid} style={{ marginTop: '0.25rem' }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Procesando…</> : isEditing ? 'Guardar cambios' : 'Crear reserva'}
              </button>

              {isEditing && (
                <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={formDisabled}>
                  <X size={16} /> Cancelar edición
                </button>
              )}
            </form>
          )}
        </div>

        {/* Main: Listado */}
        <div className="panel-main glass">
          <div className="panel-title">
            <CalendarDays size={18} />
            Listado de reservas
            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {dataList.length} en total
            </span>
          </div>

          {loading && dataList.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem' }}>
              <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Cargando reservas…</p>
            </div>
          ) : dataList.length === 0 ? (
            <div className="empty-state">
              <CalendarDays size={48} />
              <p>No hay reservas registradas aún. ¡Crea la primera usando el formulario!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {dataList.map((item) => {
                const days = calcDays(item.fechaInicio, item.fechaFin)
                const isCompleted = item.estado === 'COMPLETADO' || item.estado === 'CONFIRMADA'
                return (
                  <article
                    key={item.id}
                    className={`reserva-card ${editingId === item.id ? 'editing' : ''}`}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Reserva #{item.id}</strong>
                        {days && (
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                            {days} {days === 1 ? 'día' : 'días'}
                          </span>
                        )}
                      </div>
                      {item.estado && (
                        <span className={`badge-status ${isCompleted ? 'badge-confirmada' : 'badge-pendiente'}`}>
                          {isCompleted ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {item.estado}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        <User size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{getUserLabel(item)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        <MapPin size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        <span>{getDestinoLabel(item)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <Calendar size={14} style={{ flexShrink: 0 }} />
                        <span>{formatDisplayDate(item.fechaInicio)} → {formatDisplayDate(item.fechaFin)}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ paddingTop: '0.75rem', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                        ${Number(item.precioTotal).toFixed(2)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.55rem', fontSize: '0.84rem' }}
                        onClick={() => startEdit(item)}
                        disabled={loading}
                        aria-label={`Editar reserva ${item.id}`}
                      >
                        <Pencil size={14} /> Editar
                      </button>

                      {pendingDeleteId === item.id ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ flex: 1, padding: '0.55rem', fontSize: '0.82rem' }}
                            onClick={() => handleDelete(item.id)}
                            disabled={loading}
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.55rem' }}
                            onClick={() => setPendingDeleteId(null)}
                            disabled={loading}
                            aria-label="Cancelar eliminación"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '0.55rem' }}
                          onClick={() => setPendingDeleteId(item.id)}
                          disabled={loading}
                          aria-label={`Eliminar reserva ${item.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reservas
