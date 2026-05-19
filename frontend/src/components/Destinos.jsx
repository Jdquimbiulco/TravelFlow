import { useState, useEffect, useCallback } from 'react'
import {
  PlusCircle,
  Loader2,
  Pencil,
  Trash2,
  Save,
  MapPin,
} from 'lucide-react'

const INITIAL_FORM = {
  nombre: '',
  pais: '',
  ciudad: '',
  precioPorDia: '',
  cuposDisponibles: '',
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

const clampNonNegative = (value, isInteger = false) => {
  const num = isInteger ? parseInt(String(value), 10) : parseFloat(String(value))
  if (Number.isNaN(num) || num < 0) return 0
  return isInteger ? Math.floor(num) : num
}

const Destinos = ({ API_URL, user }) => {
  const [loading, setLoading] = useState(true)
  const [dataList, setDataList] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const isEditing = editingId !== null

  const showMessage = useCallback((text, type = 'success') => {
    setMessage({ text, type })
  }, [])

  const clearMessage = useCallback(() => {
    setMessage({ text: '', type: '' })
  }, [])

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const res = await fetch(`${API_URL}/destinos`)
      if (!res.ok) throw new Error(await parseApiError(res))
      const data = await res.json()
      setDataList(Array.isArray(data) ? data : [])
    } catch (err) {
      showMessage(err.message || 'No se pudo cargar el listado', 'error')
      setDataList([])
    } finally {
      setLoading(false)
    }
  }, [API_URL, showMessage])

  useEffect(() => {
    let cancelled = false

    const loadInitialData = async () => {
      try {
        const res = await fetch(`${API_URL}/destinos`)
        if (!res.ok) throw new Error(await parseApiError(res))
        const data = await res.json()
        if (!cancelled) setDataList(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) {
          showMessage(err.message || 'No se pudo cargar el listado', 'error')
          setDataList([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadInitialData()
    return () => {
      cancelled = true
    }
  }, [API_URL, showMessage])

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

  const updateNumericField = (field, isInteger) => (e) => {
    const { value } = e.target
    if (value === '') {
      setForm((prev) => ({ ...prev, [field]: '' }))
      return
    }
    setForm((prev) => ({
      ...prev,
      [field]: clampNonNegative(value, isInteger),
    }))
  }

  const startEdit = (item) => {
    clearMessage()
    setPendingDeleteId(null)
    setEditingId(item.id)
    setForm({
      nombre: item.nombre ?? '',
      pais: item.pais ?? '',
      ciudad: item.ciudad ?? '',
      precioPorDia: Number(item.precioPorDia) || 0,
      cuposDisponibles: item.cuposDisponibles ?? 0,
    })
  }

  const cancelEdit = () => {
    resetForm()
    clearMessage()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearMessage()

    const payload = {
      nombre: form.nombre.trim(),
      pais: form.pais.trim(),
      ciudad: form.ciudad.trim(),
      precioPorDia: clampNonNegative(form.precioPorDia),
      cuposDisponibles: clampNonNegative(form.cuposDisponibles, true),
    }

    try {
      const url = isEditing
        ? `${API_URL}/destinos/${editingId}`
        : `${API_URL}/destinos`
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await parseApiError(res))

      showMessage(
        isEditing ? 'Destino actualizado correctamente' : 'Destino creado correctamente',
        'success',
      )
      resetForm()
      await fetchData()
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
      const res = await fetch(`${API_URL}/destinos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await parseApiError(res))

      showMessage('Destino eliminado correctamente', 'success')
      if (editingId === id) resetForm()
      setPendingDeleteId(null)
      await fetchData()
    } catch (err) {
      showMessage(err.message || 'No se pudo eliminar el destino', 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { padding: '0.8rem' }
  const messageClass =
    message.type === 'success' ? 'account-message success' : 'account-message error'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem', alignItems: 'start' }}>
      <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isEditing ? <Save size={20} /> : <PlusCircle size={20} />}
          {isEditing ? 'Editar destino' : 'Nuevo destino'}
        </h3>

        {message.text && (
          <p className={messageClass} style={{ marginTop: '1rem' }} role="status">
            {message.text}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}
        >
          <input
            placeholder="Nombre destino"
            className="glass"
            style={inputStyle}
            value={form.nombre}
            onChange={updateField('nombre')}
            required
            disabled={loading}
          />
          <input
            placeholder="País"
            className="glass"
            style={inputStyle}
            value={form.pais}
            onChange={updateField('pais')}
            required
            disabled={loading}
          />
          <input
            placeholder="Ciudad"
            className="glass"
            style={inputStyle}
            value={form.ciudad}
            onChange={updateField('ciudad')}
            required
            disabled={loading}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Precio por día"
            className="glass"
            style={inputStyle}
            value={form.precioPorDia}
            onChange={updateNumericField('precioPorDia', false)}
            required
            disabled={loading}
          />
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Cupos disponibles"
            className="glass"
            style={inputStyle}
            value={form.cuposDisponibles}
            onChange={updateNumericField('cuposDisponibles', true)}
            required
            disabled={loading}
          />

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Procesando…' : isEditing ? 'Guardar cambios' : 'Crear destino'}
          </button>

          {isEditing && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={cancelEdit}
              disabled={loading}
            >
              Cancelar edición
            </button>
          )}
        </form>
      </div>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <h3>Listado de destinos</h3>

        {loading && dataList.length === 0 ? (
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={32} className="animate-spin" />
          </div>
        ) : dataList.length === 0 ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
            No hay destinos registrados.
          </p>
        ) : (
          <div
            style={{
              marginTop: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
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
                  <div>
                    <strong style={{ fontSize: '1.05rem' }}>{item.nombre}</strong>
                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      <MapPin
                        size={14}
                        style={{ verticalAlign: 'middle', marginRight: '0.25rem' }}
                      />
                      {item.ciudad}, {item.pais}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    #{item.id}
                  </span>
                </div>

                <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                  <strong>${Number(item.precioPorDia).toFixed(2)}</strong> / día
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Cupos: {item.cuposDisponibles}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.5rem' }}
                      onClick={() => startEdit(item)}
                      disabled={loading}
                      aria-label={`Editar ${item.nombre}`}
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
                        aria-label={`Eliminar ${item.nombre}`}
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

export default Destinos
