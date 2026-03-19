import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UserListPage from './pages/UserListPage'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState(() => {
    const page = new URLSearchParams(window.location.search).get('page') || 'dashboard'
    return page
  })

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!loading && !isAuthenticated && currentPage !== 'login') {
      setCurrentPage('login')
      window.history.replaceState(null, '', '?page=login')
    }
    // If authenticated and trying to access login, redirect to dashboard
    if (!loading && isAuthenticated && currentPage === 'login') {
      setCurrentPage('dashboard')
      window.history.replaceState(null, '', '?page=dashboard')
    }
  }, [isAuthenticated, currentPage, loading])

  const handleNavigate = (page) => {
    // Prevent navigation to login page if authenticated
    if (isAuthenticated && page === 'login') {
      // Redirect to dashboard instead
      setCurrentPage('dashboard')
      window.history.replaceState(null, '', '?page=dashboard')
      return
    }
    setCurrentPage(page)
    window.history.replaceState(null, '', `?page=${page}`)
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>
  }

  return (
    <>
      {currentPage === 'login' && !isAuthenticated && <LoginPage onNavigate={handleNavigate} />}
      {isAuthenticated && currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {isAuthenticated && currentPage === 'users' && <UserListPage onNavigate={handleNavigate} />}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
