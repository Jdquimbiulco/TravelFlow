import React, { useState } from 'react'
import { Compass, Loader2, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react'

export default function Auth({ API_URL, onLogin }) {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
      {/* Floating background elements */}
      <div className="auth-background">
        <svg className="floating-plane plane-left-1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10 L70 50 L50 60 L30 50 Z" fill="rgba(2, 132, 199, 0.4)" />
          <circle cx="50" cy="55" r="3" fill="rgba(2, 132, 199, 0.4)" />
        </svg>
        <svg className="floating-suitcase suitcase-left-1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="25" width="60" height="50" rx="4" fill="rgba(255, 107, 53, 0.35)" />
          <rect x="40" y="20" width="20" height="8" rx="2" fill="rgba(255, 107, 53, 0.35)" />
          <circle cx="35" cy="70" r="4" fill="rgba(255, 107, 53, 0.35)" />
          <circle cx="65" cy="70" r="4" fill="rgba(255, 107, 53, 0.35)" />
        </svg>
        <svg className="floating-plane plane-left-2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10 L70 50 L50 60 L30 50 Z" fill="rgba(2, 132, 199, 0.3)" />
          <circle cx="50" cy="55" r="3" fill="rgba(2, 132, 199, 0.3)" />
        </svg>
        <svg className="floating-suitcase suitcase-right-1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="25" width="60" height="50" rx="4" fill="rgba(2, 132, 199, 0.35)" />
          <rect x="40" y="20" width="20" height="8" rx="2" fill="rgba(2, 132, 199, 0.35)" />
          <circle cx="35" cy="70" r="4" fill="rgba(2, 132, 199, 0.35)" />
          <circle cx="65" cy="70" r="4" fill="rgba(2, 132, 199, 0.35)" />
        </svg>
        <svg className="floating-plane plane-right-1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10 L70 50 L50 60 L30 50 Z" fill="rgba(255, 107, 53, 0.3)" />
          <circle cx="50" cy="55" r="3" fill="rgba(255, 107, 53, 0.3)" />
        </svg>
        <svg className="floating-suitcase suitcase-right-2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="25" width="60" height="50" rx="4" fill="rgba(255, 107, 53, 0.28)" />
          <rect x="40" y="20" width="20" height="8" rx="2" fill="rgba(255, 107, 53, 0.28)" />
          <circle cx="35" cy="70" r="4" fill="rgba(255, 107, 53, 0.28)" />
          <circle cx="65" cy="70" r="4" fill="rgba(255, 107, 53, 0.28)" />
        </svg>
      </div>

      <div className="auth-panel glass">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)', marginBottom: '1rem' }}>
            <Compass size={30} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', marginBottom: '0.35rem' }}>
            Bienvenido a <span style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TravelFlow</span>
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {mode === 'login'
              ? 'Inicia sesión para gestionar tus viajes'
              : 'Crea tu cuenta y empieza a explorar el mundo'
            }
          </p>
        </div>

        {/* Tabs */}
        <div className="auth-switch">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError('') }}>
            Iniciar Sesión
          </button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError('') }}>
            Crear Cuenta
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-error" role="alert">
            <XCircle size={16} /> {error}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              Correo electrónico
              <input
                type="email"
                value={loginData.correo}
                onChange={(e) => setLoginData({ ...loginData, correo: e.target.value })}
                placeholder="tu@correo.com"
                required
                autoComplete="email"
              />
            </label>
            <label>
              Contraseña
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.contrasena}
                  onChange={(e) => setLoginData({ ...loginData, contrasena: e.target.value })}
                  placeholder="Tu contraseña"
                  required
                  minLength={6}
                  style={{ paddingRight: '3rem' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Ingresando...</> : 'Ingresar'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <label>
              Nombre completo
              <input
                type="text"
                value={registerData.nombre}
                onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                placeholder="Juan Pérez"
                required
              />
            </label>
            <label>
              Correo electrónico
              <input
                type="email"
                value={registerData.correo}
                onChange={(e) => setRegisterData({ ...registerData, correo: e.target.value })}
                placeholder="tu@correo.com"
                required
              />
            </label>
            <label>
              Contraseña
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={registerData.contrasena}
                  onChange={(e) => setRegisterData({ ...registerData, contrasena: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <label>
              Teléfono <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span>
              <input
                type="tel"
                value={registerData.telefono}
                onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value })}
                placeholder="999999999"
              />
            </label>
            <label>
              Documento de identidad <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span>
              <input
                type="text"
                value={registerData.documentoIdentidad}
                onChange={(e) => setRegisterData({ ...registerData, documentoIdentidad: e.target.value })}
                placeholder="Cédula o pasaporte"
              />
            </label>
            <button type="submit" className="btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creando cuenta...</> : 'Crear Cuenta'}
            </button>
          </form>
        )}

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.25rem', lineHeight: 1.5 }}>
          Al usar TravelFlow, aceptas nuestros términos y política de privacidad.
        </p>
      </div>
    </div>
  )
}
