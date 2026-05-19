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
      ? `${item.usuario.nombre} (${item.usuario.correo})`
      : `Usuario #${item.usuarioId}`

  const getDestinoLabel = (item) =>
    item.destino?.nombre
      ? `${item.destino.nombre} — ${item.destino.ciudad}`
      : `Destino #${item.destinoId}`

  const formatDisplayDate = (value) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-ES')
  }

  const inputStyle = { padding: '0.8rem' }
  const selectStyle = { ...inputStyle, width: '100%' }
  const messageClass =
    message.type === 'success' ? 'account-message success' : 'account-message error'
  const formDisabled = loading || optionsLoading

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
      <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isEditing ? <Save size={20} /> : <PlusCircle size={20} />}
          {isEditing ? 'Editar reserva' : 'Nueva reserva'}
        </h3>

        {message.text && (
          <p className={messageClass} style={{ marginTop: '1rem' }} role="status">
            {message.text}
          </p>
        )}

        {optionsLoading ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Loader2 size={18} className="animate-spin" />
            Cargando datos…
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}
          >
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Usuario</label>
            <select
              className="glass"
              style={selectStyle}
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

            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Destino</label>
            <select
              className="glass"
              style={selectStyle}
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

            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fecha de inicio</label>
            <input
              type="date"
              className="glass"
              style={inputStyle}
              value={form.fechaInicio}
              onChange={updateField('fechaInicio')}
              required
              disabled={formDisabled}
            />

            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fecha de fin</label>
            <input
              type="date"
              className="glass"
              style={inputStyle}
              value={form.fechaFin}
              min={form.fechaInicio || undefined}
              onChange={updateField('fechaFin')}
              required
              disabled={formDisabled}
            />

            {dateRangeInvalid && (
              <p className="account-message error" style={{ margin: 0 }} role="alert">
                La fecha de fin no puede ser anterior a la fecha de inicio.
              </p>
            )}

            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Precio total</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Precio total"
              className="glass"
              style={inputStyle}
              value={form.precioTotal}
              onChange={updatePrecio}
              required
              disabled={formDisabled}
            />

            <button
              type="submit"
              className="btn"
              disabled={formDisabled || dateRangeInvalid}
            >
              {loading ? 'Procesando…' : isEditing ? 'Guardar cambios' : 'Crear reserva'}
            </button>

            {isEditing && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelEdit}
                disabled={formDisabled}
              >
                Cancelar edición
              </button>
            )}
          </form>
        )}
      </div>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <h3>Listado de reservas</h3>

        {loading && dataList.length === 0 ? (
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={32} className="animate-spin" />
          </div>
        ) : dataList.length === 0 ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
            No hay reservas registradas.
          </p>
        ) : (
          <div
            style={{
              marginTop: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {dataList.map((item) => (
              <article
                key={item.id}
                className="glass"
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: editingId === item.id ? '2px solid var(--primary)' : undefined,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                  }}
                >
                  <strong style={{ fontSize: '1.05rem' }}>Reserva #{item.id}</strong>
                  {item.estado && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: 'var(--primary)',
                      }}
                    >
                      {item.estado}
                    </span>
                  )}
                </div>

                <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={14} />
                  {getUserLabel(item)}
                </p>
                <p style={{ marginTop: '0.35rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} />
                  {getDestinoLabel(item)}
                </p>
                <p style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} />
                  {formatDisplayDate(item.fechaInicio)} → {formatDisplayDate(item.fechaFin)}
                </p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  <strong>${Number(item.precioTotal).toFixed(2)}</strong>
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.5rem' }}
                    onClick={() => startEdit(item)}
                    disabled={loading}
                    aria-label={`Editar reserva ${item.id}`}
                  >
                    <Pencil size={16} />
                  </button>

                  {pendingDeleteId === item.id ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                        onClick={() => handleDelete(item.id)}
                        disabled={loading}
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem' }}
                        onClick={() => setPendingDeleteId(null)}
                        disabled={loading}
                        aria-label="Cancelar eliminación"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ flex: 1, padding: '0.5rem' }}
                      onClick={() => setPendingDeleteId(item.id)}
                      disabled={loading}
                      aria-label={`Eliminar reserva ${item.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Reservas
