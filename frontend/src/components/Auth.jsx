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
        {/* IZQUIERDA: 2 aviones + 1 maleta (en medio) */}
        <svg className="floating-plane plane-left-1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 L70 50 L50 60 L30 50 Z" fill="rgba(37, 99, 235, 0.5)" />
            <circle cx="50" cy="55" r="3" fill="rgba(37, 99, 235, 0.5)" />
        </svg>

        <svg className="floating-suitcase suitcase-left-1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="25" width="60" height="50" rx="4" fill="rgba(37, 99, 235, 0.5)" />
            <rect x="40" y="20" width="20" height="8" rx="2" fill="rgba(37, 99, 235, 0.5)" />
            <circle cx="35" cy="70" r="4" fill="rgba(37, 99, 235, 0.5)" />
            <circle cx="65" cy="70" r="4" fill="rgba(37, 99, 235, 0.5)" />
        </svg>

        <svg className="floating-plane plane-left-2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 L70 50 L50 60 L30 50 Z" fill="rgba(37, 99, 235, 0.5)" />
            <circle cx="50" cy="55" r="3" fill="rgba(37, 99, 235, 0.5)" />
        </svg>

        {/* DERECHA: 2 maletas + 1 avión */}
        <svg className="floating-suitcase suitcase-right-1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="25" width="60" height="50" rx="4" fill="rgba(37, 99, 235, 0.5)" />
            <rect x="40" y="20" width="20" height="8" rx="2" fill="rgba(37, 99, 235, 0.5)" />
            <circle cx="35" cy="70" r="4" fill="rgba(37, 99, 235, 0.5)" />
            <circle cx="65" cy="70" r="4" fill="rgba(37, 99, 235, 0.5)" />
        </svg>

        <svg className="floating-plane plane-right-1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 L70 50 L50 60 L30 50 Z" fill="rgba(37, 99, 235, 0.5)" />
            <circle cx="50" cy="55" r="3" fill="rgba(37, 99, 235, 0.5)" />
        </svg>

        <svg className="floating-suitcase suitcase-right-2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="25" width="60" height="50" rx="4" fill="rgba(37, 99, 235, 0.5)" />
            <rect x="40" y="20" width="20" height="8" rx="2" fill="rgba(37, 99, 235, 0.5)" />
            <circle cx="35" cy="70" r="4" fill="rgba(37, 99, 235, 0.5)" />
            <circle cx="65" cy="70" r="4" fill="rgba(37, 99, 235, 0.5)" />
        </svg>
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

