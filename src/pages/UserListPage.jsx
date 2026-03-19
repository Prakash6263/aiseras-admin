import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import { useUsers } from '../hooks/useUsers'

export default function UserListPage({ onNavigate }) {
  const { admin, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const skip = (currentPage - 1) * itemsPerPage
  const { users, total, loading: usersLoading } = useUsers(skip, itemsPerPage)
  const [adminApp, setAdminApp] = useState(null)
  const [userStatus, setUserStatus] = useState({})

  const totalPages = Math.ceil(total / itemsPerPage)

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    })

    if (result.isConfirmed) {
      logout()
      onNavigate('login')
      Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been logged out successfully.',
        timer: 1500,
        timerProgressBar: true,
      })
    }
  }

  useEffect(() => {
    const app = document.querySelector('.admin-app')
    setAdminApp(app)

    const toggleBtn = document.getElementById('toggleBtn')
    const sidebar = document.getElementById('sidebar')

    const handleToggle = () => {
      if (window.innerWidth >= 992) {
        const hidden = app.classList.toggle('sidebar-hidden')
        try {
          localStorage.setItem('cv_admin_sidebar_hidden', hidden ? '1' : '0')
        } catch (e) {}
        document.body.style.overflowX = hidden ? 'hidden' : ''
      } else {
        app.classList.toggle('sidebar-open')
        document.body.classList.toggle('admin-overlay')
      }
    }

    const handleClickOutside = (e) => {
      if (window.innerWidth < 992) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && app.classList.contains('sidebar-open')) {
          app.classList.remove('sidebar-open')
          document.body.classList.remove('admin-overlay')
        }
      }
    }

    const handleResize = () => {
      if (window.innerWidth >= 992) {
        app.classList.remove('sidebar-open')
        document.body.classList.remove('admin-overlay')
      }
    }

    if (toggleBtn) toggleBtn.addEventListener('click', handleToggle)
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', handleResize)

    const links = document.querySelectorAll('.sidebar .nav-link')
    links.forEach((l) => {
      l.classList.remove('active')
      const href = (l.getAttribute('href') || '').split('?')[0].toLowerCase()
      if (href.includes('users') || href.includes('user-list')) {
        l.classList.add('active')
      }
    })

    return () => {
      if (toggleBtn) toggleBtn.removeEventListener('click', handleToggle)
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="admin-app">
      <aside id="sidebar" className="sidebar">
        <div className="p-3 sidebar-header d-flex align-items-center gap-2">
          <div className="fw-bold ms-2">Admin</div>
        </div>
        <nav className="p-3">
          <a href="?page=dashboard" className="nav-link d-flex align-items-center">
            <i className="bi bi-speedometer2"></i>
            <span className="nav-text">Dashboard</span>
          </a>
          <a href="?page=users" className="nav-link d-flex align-items-center">
            <i className="bi bi-person"></i>
            <span className="nav-text">User List</span>
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="nav-link d-flex align-items-center">
            <i className="bi bi-box-arrow-in-right"></i>
            <span className="nav-text">Log Out</span>
          </a>
        </nav>
      </aside>
      <div className="content">
        <header>
          <div className="header-inner">
            <div className="page-title d-flex align-items-center">
              <button id="toggleBtn" className="btn btn-sm btn-outline-secondary me-2">
                <i className="bi bi-list"></i>
              </button>
              <span>User List</span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="dropdown">
                <a className="d-flex align-items-center text-decoration-none dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  <div className="avatar">{admin?.full_name?.charAt(0)?.toUpperCase() || 'A'}</div>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <a className="dropdown-item" href="#">
                      Profile
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                      Sign out
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>
        <main className="container-fluid">
          <div className="page-section">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">User List</h5>
                </div>
                <div className="table-responsive">
                  <table className="table datatable">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Joined</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : users.length > 0 ? (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.full_name || 'N/A'}</td>
                            <td>{user.email}</td>
                            <td>{user.age || 'N/A'}</td>
                            <td>{user.gender || 'N/A'}</td>
                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                            <td>
                              <span className={user.is_email_verified ? 'status-active' : 'status-block'}>
                                {user.is_email_verified ? 'Verified' : 'Not Verified'}
                              </span>
                            </td>
                            <td>
                              <div className="form-check form-switch">
                                <input 
                                  className="form-check-input" 
                                  type="checkbox" 
                                  id={`toggle-${user.id}`}
                                  checked={userStatus[user.id] !== false}
                                  onChange={(e) => setUserStatus({...userStatus, [user.id]: e.target.checked})}
                                />
                                <label className="form-check-label" htmlFor={`toggle-${user.id}`}>
                                  {userStatus[user.id] !== false ? 'Enabled' : 'Disabled'}
                                </label>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <nav aria-label="Table pagination" className="d-flex justify-content-between align-items-center" style={{ padding: '1rem', borderTop: '1px solid #eee' }}>
                  <div className="text-muted small">
                    Showing {users.length > 0 ? skip + 1 : 0} to {Math.min(skip + itemsPerPage, total)} of {total} users
                  </div>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
