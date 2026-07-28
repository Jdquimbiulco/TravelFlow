import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import Auth from '../Auth'
import Account from '../Account'
import Usuarios from '../Usuarios'
import Pagos from '../Pagos'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

const mockFetch = vi.fn()


afterEach(() => {
  cleanup()
})

describe('Pruebas básicas de componentes', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    vi.stubGlobal('fetch', mockFetch)
  })

  it('renderiza el formulario de login por defecto', () => {
    render(<Auth API_URL="http://localhost:3000" onLogin={vi.fn()} />)

    expect(screen.getByRole('heading', { name: /bienvenido a travelflow/i })).toBeTruthy()
    expect(screen.getByLabelText(/correo/i)).toBeTruthy()
    expect(screen.getByLabelText(/contraseña/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeTruthy()
  })


  it('llama a onLogin cuando el login es exitoso', async () => {
    const onLogin = vi.fn()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'abc123', user: { nombre: 'Ana' } }),
    })

    render(<Auth API_URL="http://localhost:3000" onLogin={onLogin} />)

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'ana@test.com' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith({ token: 'abc123', user: { nombre: 'Ana' } })
    })
  })

  it('muestra los datos del usuario en la vista de cuenta', () => {
    render(
      <Account
        user={{ id: 1, correo: 'ana@test.com', nombre: 'Ana', telefono: '999999999' }}
        API_URL="http://localhost:3000"
        onLogout={vi.fn()}
        onUpdate={vi.fn()}
      />,
    )

    expect(screen.getByDisplayValue('ana@test.com')).toBeTruthy()
    expect(screen.getByDisplayValue('Ana')).toBeTruthy()
    expect(screen.getByText(/mi cuenta/i)).toBeTruthy()
  })

  it('muestra un mensaje cuando las contraseñas no coinciden', () => {
    render(
      <Account
        user={{ id: 1, correo: 'ana@test.com', nombre: 'Ana' }}
        API_URL="http://localhost:3000"
        onLogout={vi.fn()}
        onUpdate={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: '654321' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    expect(screen.getByText(/las contraseñas nuevas no coinciden/i)).toBeTruthy()
  })

  it('carga y muestra usuarios desde la API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, nombre: 'Ana', correo: 'ana@test.com' }],
    })

    render(<Usuarios API_URL="http://localhost:3000" />)

    await waitFor(() => {
      expect(screen.getByText(/ana@test.com/i)).toBeTruthy()
    })
  })

  it('renderiza el historial de pagos tras cargar los datos', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, monto: 150, metodo: 'TARJETA', reservaId: 7, codigoTransaccion: 'TRX-ABC' }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 7, estado: 'PENDIENTE', precioTotal: 150, usuario: { nombre: 'Ana' }, destino: { nombre: 'Cartagena' } }],
      })

    render(<Pagos API_URL="http://localhost:3000" />)

    await waitFor(() => {
      expect(screen.getByText(/pago #1/i)).toBeTruthy()
    })
    expect(screen.getByRole('heading', { name: /registrar pago/i })).toBeTruthy()
  })
})
