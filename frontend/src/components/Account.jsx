import React, { useState, useEffect } from 'react'
import { User, Lock, LogOut, Trash2 } from 'lucide-react'

export default function Account({ user, API_URL, onLogout, onUpdate }) {
  const [form, setForm] = useState({ correo: '', nombre: '', telefono: '', contrasenaNueva: '', confirmarContrasena: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (user) setForm({ correo: user.correo, nombre: user.nombre, telefono: user.telefono || '', contrasenaNueva: '', confirmarContrasena: '' })
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    if (form.contrasenaNueva && form.contrasenaNueva !== form.confirmarContrasena) {
      setMessage('Las contraseñas nuevas no coinciden')
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
      setMessage('✓ Cuenta actualizada correctamente')
      onUpdate(body)
      setForm((prev) => ({ ...prev, contrasenaNueva: '', confirmarContrasena: '' }))
    } catch (err) {
      setMessage(err.message)
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
      setMessage(err.message)
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <>
      <div className="account-shell">
        <div className="account-header">
          <div>
            <h2>Mi cuenta</h2>
            <p>Gestiona tu perfil y seguridad en un solo lugar.</p>
          </div>
          <button className="btn btn-secondary" onClick={onLogout}><LogOut size={18} /> Cerrar sesión</button>
        </div>
        <div className="account-grid-wide">
          <div className="account-card glass">
            <div className="card-header-icon">
              <User size={24} />
              <h3>Información personal</h3>
            </div>
            <form className="account-form" onSubmit={handleSubmit}>
              <label>
                Correo
                <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} required />
              </label>
              <label>
                Nombre completo
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </label>
              <label>
                Teléfono
                <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="999999999" />
              </label>
            </form>
          </div>
          <div className="account-card glass">
            <div className="card-header-icon">
              <Lock size={24} />
              <h3>Seguridad</h3>
            </div>
            <p className="account-note">Cambia tu contraseña cuando quieras. Deja los campos vacíos si no deseas actualizarla.</p>
            <div className="password-section">
              <label>
                Nueva contraseña
                <input type="password" value={form.contrasenaNueva} onChange={(e) => setForm({ ...form, contrasenaNueva: e.target.value })} minLength={6} placeholder="Mínimo 6 caracteres" />
              </label>
              <label>
                Confirmar contraseña
                <input type="password" value={form.confirmarContrasena} onChange={(e) => setForm({ ...form, confirmarContrasena: e.target.value })} minLength={6} placeholder="Repite la nueva contraseña" />
              </label>
            </div>
          </div>
        </div>
        <div className="account-actions">
          <div className="actions-primary">
            <button type="button" className="btn" onClick={handleSubmit} disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</button>
            <button type="button" className="btn btn-danger" onClick={() => setShowDeleteModal(true)}><Trash2 size={18} /> Eliminar cuenta</button>
          </div>
          {message && <p className={`account-message ${message.startsWith('✓') ? 'success' : 'error'}`}>{message}</p>}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Eliminar cuenta</h2>
            <p>Estás a punto de eliminar tu cuenta de manera permanente.</p>
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
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDeleteUser} disabled={deleteLoading}>{deleteLoading ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

