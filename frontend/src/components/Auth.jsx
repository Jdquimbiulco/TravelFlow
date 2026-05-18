import React, { useState } from 'react'

export default function Auth({ API_URL, onLogin }) {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginData, setLoginData] = useState({ correo: '', contrasena: '' })
  const [registerData, setRegisterData] = useState({
    nombre: '', correo: '', contrasena: '', telefono: '', documentoIdentidad: ''
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Credenciales inválidas')
      onLogin(body)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || JSON.stringify(body.errors || body))
      const loginResponse = await fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: registerData.correo, contrasena: registerData.contrasena })
      })
      const loginBody = await loginResponse.json()
      if (!loginResponse.ok) throw new Error(loginBody.message || 'No se pudo iniciar sesión')
      onLogin(loginBody)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-background">
        <span className="auth-icon plane">✈️</span>
        <span className="auth-icon suitcase">🧳</span>
        <span className="auth-icon map">🗺️</span>
        <span className="auth-icon compass">🧭</span>
        <span className="auth-icon star">⭐</span>
      </div>
      <div className="auth-panel glass">
        <h1>Bienvenido a TravelFlow</h1>
        <p>Inicia sesión para gestionar destinos, reservas y pagos, o crea tu cuenta en segundos.</p>
        <div className="auth-switch">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Iniciar Sesión</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Crear Cuenta</button>
        </div>
        {error && <div className="auth-error">{error}</div>}
        {mode === 'login' ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              Correo
              <input type="email" value={loginData.correo} onChange={(e) => setLoginData({ ...loginData, correo: e.target.value })} required />
            </label>
            <label>
              Contraseña
              <input type="password" value={loginData.contrasena} onChange={(e) => setLoginData({ ...loginData, contrasena: e.target.value })} required minLength={6} />
            </label>
            <button type="submit" className="btn" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <label>
              Nombre completo
              <input type="text" value={registerData.nombre} onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })} required />
            </label>
            <label>
              Correo
              <input type="email" value={registerData.correo} onChange={(e) => setRegisterData({ ...registerData, correo: e.target.value })} required />
            </label>
            <label>
              Contraseña
              <input type="password" value={registerData.contrasena} onChange={(e) => setRegisterData({ ...registerData, contrasena: e.target.value })} required minLength={6} />
            </label>
            <label>
              Teléfono
              <input type="tel" value={registerData.telefono} onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value })} placeholder="999999999" />
            </label>
            <label>
              Documento de identidad
              <input type="text" value={registerData.documentoIdentidad} onChange={(e) => setRegisterData({ ...registerData, documentoIdentidad: e.target.value })} placeholder="Opcional" />
            </label>
            <button type="submit" className="btn" disabled={loading}>{loading ? 'Creando cuenta...' : 'Crear Cuenta'}</button>
          </form>
        )}
      </div>
    </div>
  )
}

