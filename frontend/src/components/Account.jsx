import React, { useState, useEffect } from 'react'

export default function Account({ user, API_URL, onLogout, onUpdate }) {
  const [form, setForm] = useState({ correo: '', nombre: '', telefono: '', contrasenaNueva: '', confirmarContrasena: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

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
      setMessage('Cuenta actualizada correctamente')
      onUpdate(body)
      setForm((prev) => ({ ...prev, contrasenaNueva: '', confirmarContrasena: '' }))
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="account-shell">
      <div className="account-header">
        <div>
          <h2>Mi cuenta</h2>
          <p>Gestiona tu perfil y seguridad en un solo lugar.</p>
        </div>
        <button className="btn btn-secondary" onClick={onLogout}>Cerrar sesión</button>
      </div>
      <div className="account-grid">
        <div className="account-card glass">
          <h3>Información personal</h3>
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
          <h3>Seguridad</h3>
          <p className="account-note">Cambia tu contraseña cuando quieras. Deja los campos vacíos si no deseas actualizarla.</p>
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
      <div className="account-actions">
        <button type="button" className="btn" onClick={handleSubmit} disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</button>
        {message && <p className="account-message">{message}</p>}
      </div>
    </div>
  )
}

