import React, { useState, useEffect } from 'react'
import { User, Lock, LogOut, Trash2, UserCircle2, CheckCircle2, XCircle, Shield } from 'lucide-react'

export default function Account({ user, API_URL, onLogout, onUpdate }) {
  const [form, setForm] = useState({ correo: '', nombre: '', telefono: '', contrasenaNueva: '', confirmarContrasena: '' })
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (user) setForm({ correo: user.correo, nombre: user.nombre, telefono: user.telefono || '', contrasenaNueva: '', confirmarContrasena: '' })
  }, [user])

  useEffect(() => {
    if (!message.text) return
    const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000)
    return () => clearTimeout(timer)
  }, [message.text])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ text: '', type: '' })
    if (form.contrasenaNueva && form.contrasenaNueva !== form.confirmarContrasena) {
      setMessage({ text: 'Las contraseñas nuevas no coinciden', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const payload = {
        correo: form.correo,
        nombre: form.nombre,
        telefono: form.telefono || undefined,
        ...(form.contrasenaNueva ? { contrasena: form.contrasenaNueva } : {})
      }
      const response = await fetch(`${API_URL}/usuarios/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || JSON.stringify(body.errors || body))
      setMessage({ text: 'Cuenta actualizada correctamente', type: 'success' })
      onUpdate(body)
      setForm((prev) => ({ ...prev, contrasenaNueva: '', confirmarContrasena: '' }))
    } catch (err) {
      setMessage({ text: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    setDeleteLoading(true)
    try {
      const response = await fetch(`${API_URL}/usuarios/${user.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('No se pudo eliminar la cuenta')
      onLogout()
    } catch (err) {
      setMessage({ text: err.message, type: 'error' })
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  const initials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?'

  return (
    <>
      <div className="account-shell">
        {/* Header */}
        <div className="account-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 800, color: '#fff',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{user?.nombre || 'Mi cuenta'}</h2>
              <p style={{ marginTop: '0.2rem' }}>{user?.correo}</p>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={onLogout}>
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>

        {/* Cards */}
        <div className="account-grid-wide">
          {/* Información personal */}
          <div className="account-card glass">
            <div className="card-header-icon">
              <User size={24} />
              <h3>Información personal</h3>
            </div>
            <form className="account-form" onSubmit={handleSubmit}>
              <label>
                Nombre completo
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </label>
              <label>
                Correo electrónico
                <input
                  type="email"
                  value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  required
                />
              </label>
              <label>
                Teléfono
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="999999999"
                />
              </label>
            </form>
          </div>

          {/* Seguridad */}
          <div className="account-card glass">
            <div className="card-header-icon">
              <Shield size={24} />
              <h3>Seguridad</h3>
            </div>
            <p className="account-note">
              Cambia tu contraseña cuando quieras. Deja los campos vacíos si no deseas actualizarla ahora.
            </p>
            <div className="password-section">
              <label>
                Nueva contraseña
                <input
                  type="password"
                  value={form.contrasenaNueva}
                  onChange={(e) => setForm({ ...form, contrasenaNueva: e.target.value })}
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
              </label>
              <label>
                Confirmar contraseña
                <input
                  type="password"
                  value={form.confirmarContrasena}
                  onChange={(e) => setForm({ ...form, confirmarContrasena: e.target.value })}
                  minLength={6}
                  placeholder="Repite la nueva contraseña"
                />
              </label>
              {form.contrasenaNueva && form.confirmarContrasena && form.contrasenaNueva !== form.confirmarContrasena && (
                <div className="account-message error" role="alert">
                  <XCircle size={16} /> Las contraseñas no coinciden
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="account-actions">
          <div className="actions-primary">
            <button type="button" className="btn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={18} /> Eliminar cuenta
            </button>
          </div>
          {message.text && (
            <div className={`account-message ${message.type}`} role="status">
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* Modal eliminación */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626' }}>
              <Trash2 size={22} /> Eliminar cuenta
            </h2>
            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
              Estás a punto de eliminar tu cuenta de manera permanente.
            </p>
            <div className="modal-warning">
              <p><strong>Se perderán todos tus datos incluyendo:</strong></p>
              <ul>
                <li>Información personal</li>
                <li>Reservas realizadas</li>
                <li>Historial de pagos</li>
                <li>Preferencias guardadas</li>
              </ul>
              <p><strong>Esta acción no se puede deshacer.</strong></p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleDeleteUser} disabled={deleteLoading}>
                {deleteLoading ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
