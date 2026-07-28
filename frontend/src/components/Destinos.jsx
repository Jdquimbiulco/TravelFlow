import { useState, useEffect, useCallback } from 'react'
import {
  PlusCircle,
  Loader2,
  Pencil,
  Trash2,
  Save,
  MapPin,
  Search,
  Sparkles,
  Star,
  Globe,
  Filter,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Tag,
} from 'lucide-react'

const DESTINATION_IMAGES = {
  galapagos: 'https://images.unsplash.com/photo-1559732277-7453b141e3a1?auto=format&fit=crop&w=800&q=80',
  quito: 'https://images.unsplash.com/photo-1596706915582-7774786358c2?auto=format&fit=crop&w=800&q=80',
  cuenca: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
  cancun: 'https://images.unsplash.com/photo-1535530992830-e25d07cfa780?auto=format&fit=crop&w=800&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  roma: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
  tokio: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
  'new york': 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=800&q=80',
  miami: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?auto=format&fit=crop&w=800&q=80',
  madrid: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80',
  barcelona: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=800&q=80',
  londres: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  cuzco: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
  cusco: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
  amsterdam: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
  maldivas: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
  maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
  santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
  grecia: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
  punta: 'https://images.unsplash.com/photo-1584738766473-61c083514bf4?auto=format&fit=crop&w=800&q=80',
  cana: 'https://images.unsplash.com/photo-1584738766473-61c083514bf4?auto=format&fit=crop&w=800&q=80',
}

const FALLBACK_IMAGES = [
  'https://picsum.photos/seed/travel1/800/600',
  'https://picsum.photos/seed/travel2/800/600',
  'https://picsum.photos/seed/travel3/800/600',
  'https://picsum.photos/seed/travel4/800/600',
  'https://picsum.photos/seed/travel5/800/600',
  'https://picsum.photos/seed/travel6/800/600',
  'https://picsum.photos/seed/travel7/800/600',
]

const getDestinationImage = (nombre = '', ciudad = '', pais = '', id = 0) => {
  const combined = `${nombre} ${ciudad} ${pais}`.toLowerCase()
  for (const key of Object.keys(DESTINATION_IMAGES)) {
    if (combined.includes(key)) {
      return DESTINATION_IMAGES[key]
    }
  }
  const index = Math.abs(Number(id) || 0) % FALLBACK_IMAGES.length
  return FALLBACK_IMAGES[index]
}

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

const Destinos = ({ API_URL }) => {
  const [loading, setLoading] = useState(true)
  const [dataList, setDataList] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)

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
    setShowForm(false)
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
    setShowForm(true)
    setForm({
      nombre: item.nombre ?? '',
      pais: item.pais ?? '',
      ciudad: item.ciudad ?? '',
      precioPorDia: Number(item.precioPorDia) || 0,
      cuposDisponibles: item.cuposDisponibles ?? 0,
    })
    window.scrollTo({ top: 300, behavior: 'smooth' })
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

  const filteredDestinos = dataList.filter((item) => {
    const q = searchQuery.toLowerCase()
    return (
      (item.nombre && item.nombre.toLowerCase().includes(q)) ||
      (item.ciudad && item.ciudad.toLowerCase().includes(q)) ||
      (item.pais && item.pais.toLowerCase().includes(q))
    )
  })

  return (
    <div>
      {/* Hero Section para Turistas */}
      <section className="hero-banner">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--primary-dark)', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Sparkles size={16} /> ¡Descubre las mejores ofertas del mundo!
          </div>
          <h1 className="hero-title">
            Encuentra tu próximo <span>Destino Inolvidable</span>
          </h1>
          <p className="hero-subtitle">
            Explora paquetes turísticos exclusivos, playas exóticas y ciudades fascinantes con reserva inmediata y asesoría personalizada 24/7.
          </p>

          {/* Bar de Búsqueda */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar por destino, ciudad o país..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass"
                style={{ paddingLeft: '3rem' }}
              />
            </div>
            <button
              className="btn btn-accent"
              onClick={() => setShowForm(!showForm)}
            >
              <PlusCircle size={18} />
              {showForm ? 'Ocultar Formulario' : 'Nuevo Destino'}
            </button>
          </div>
        </div>
      </section>

      {/* Formulario Administrador / Agente de Viajes */}
      {showForm && (
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2.5rem', border: '1.5px solid var(--primary-light)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>
            {isEditing ? <Save size={22} /> : <PlusCircle size={22} />}
            {isEditing ? 'Editar destino turístico' : 'Registrar nuevo destino turístico'}
          </h3>

          {message.text && (
            <div className={`account-message ${message.type}`} style={{ marginBottom: '1.25rem' }} role="status">
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <input
              placeholder="Nombre destino"
              className="glass"
              value={form.nombre}
              onChange={updateField('nombre')}
              required
              disabled={loading}
            />
            <input
              placeholder="País"
              className="glass"
              value={form.pais}
              onChange={updateField('pais')}
              required
              disabled={loading}
            />
            <input
              placeholder="Ciudad"
              className="glass"
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
              value={form.cuposDisponibles}
              onChange={updateNumericField('cuposDisponibles', true)}
              required
              disabled={loading}
            />

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn" disabled={loading} style={{ flex: 1 }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : isEditing ? 'Guardar cambios' : 'Crear destino'}
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
            </div>
          </form>
        </div>
      )}

      {/* Grid de Destinos Visuales para Turistas */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Globe size={24} style={{ color: 'var(--primary)' }} /> Destinos Destacados
        </h2>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Mostrando {filteredDestinos.length} destinos disponibles
        </span>
      </div>

      {message.text && !showForm && (
        <div className={`account-message ${message.type}`} style={{ marginBottom: '1.5rem' }} role="status">
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {message.text}
        </div>
      )}

      {loading && dataList.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cargando increíbles destinos...</p>
        </div>
      ) : filteredDestinos.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '24px' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
            No se encontraron destinos que coincidan con tu búsqueda.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {filteredDestinos.map((item) => {
            const imageUrl = getDestinationImage(item.nombre, item.ciudad, item.pais, item.id)
            const isLowCupos = item.cuposDisponibles <= 5

            return (
              <article
                key={item.id}
                className="card-destination"
                style={{
                  border: editingId === item.id ? '2px solid var(--primary)' : undefined,
                }}
              >
                {/* Image Cover */}
                <div className="card-img-container">
                  <img
                    src={imageUrl}
                    alt={item.nombre}
                    className="card-img"
                    loading="lazy"
                    onError={(e) => {
                      const seed = `dest-${item.id || Math.random()}`
                      e.currentTarget.onerror = null
                      e.currentTarget.src = `https://picsum.photos/seed/${seed}/800/600`
                    }}
                  />
                  <div className="card-badge-rating">
                    <Star size={14} fill="#d97706" /> 4.9
                  </div>
                  <div className={`card-badge-cupos ${isLowCupos ? 'cupos-low' : 'cupos-high'}`}>
                    {isLowCupos ? `¡Últimos ${item.cuposDisponibles} cupos!` : `${item.cuposDisponibles} cupos`}
                  </div>
                </div>

                {/* Content */}
                <div className="card-body">
                  <div className="card-title-row">
                    <h3 className="card-title-name">{item.nombre}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      #{item.id}
                    </span>
                  </div>

                  <div className="card-location">
                    <MapPin size={16} style={{ color: 'var(--accent)' }} />
                    <span>{item.ciudad}, {item.pais}</span>
                  </div>

                  <div className="card-price-row">
                    <div>
                      <span className="card-price-amount">${Number(item.precioPorDia).toFixed(2)}</span>
                      <span className="card-price-unit"> / día</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                      onClick={() => startEdit(item)}
                      disabled={loading}
                      aria-label={`Editar ${item.nombre}`}
                    >
                      <Pencil size={15} style={{ marginRight: '0.3rem' }} /> Editar
                    </button>

                    {pendingDeleteId === item.id ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ flex: 1, padding: '0.6rem', fontSize: '0.82rem' }}
                          onClick={() => handleDelete(item.id)}
                          disabled={loading}
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.6rem' }}
                          onClick={() => setPendingDeleteId(null)}
                          disabled={loading}
                          aria-label="Cancelar eliminación"
                        >
                          <XCircle size={15} />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: '0.6rem' }}
                        onClick={() => setPendingDeleteId(item.id)}
                        disabled={loading}
                        aria-label={`Eliminar ${item.nombre}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Destinos
