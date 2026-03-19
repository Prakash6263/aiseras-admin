import { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [admin, setAdmin] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedAdmin = localStorage.getItem('adminData')

    if (storedToken && storedAdmin) {
      setToken(storedToken)
      setAdmin(JSON.parse(storedAdmin))
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = (token, adminData) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('adminData', JSON.stringify(adminData))
    setToken(token)
    setAdmin(adminData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('adminData')
    setToken(null)
    setAdmin(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, admin, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
