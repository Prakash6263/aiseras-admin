import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Mark active link in sidebar if present
    const links = document.querySelectorAll('.sidebar .nav-link')
    links.forEach((l) => {
      const href = (l.getAttribute('href') || '').split('?')[0].toLowerCase()
      if (href.includes('login') || href === '') {
        l.classList.add('active')
      } else {
        l.classList.remove('active')
      }
    })
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new URLSearchParams()
      formData.append('email', email)
      formData.append('password', password)

      const response = await fetch('https://api.aiseras.com/aiseras/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: formData.toString(),
      })

      const data = await response.json()

      if (data.status === 1) {
        // Login successful
        login(data.token, data.admin)
        
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: `Welcome back, ${data.admin.full_name}!`,
          timer: 2000,
          timerProgressBar: true,
          didClose: () => {
            onNavigate('dashboard')
          }
        })
      } else {
        // Login failed
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: data.message || 'Invalid credentials. Please try again.',
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Unable to connect to the server. Please check your internet connection.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <div className="card login-card">
        <div className="card-body">
          <h5 className="card-title mb-3">Admin Login</h5>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-3 form-check">
              <input type="checkbox" className="form-check-input" id="remember" disabled={isLoading} />
              <label className="form-check-label" htmlFor="remember">
                Remember me
              </label>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
