import { useEffect, useState, useRef } from 'react'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import { useUsers } from '../hooks/useUsers'

export default function DashboardPage({ onNavigate }) {
  const { admin, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7
  const skip = (currentPage - 1) * itemsPerPage
  const { users, total, loading: usersLoading } = useUsers(skip, itemsPerPage)
  const [adminApp, setAdminApp] = useState(null)
  const barRef = useRef(null)
  const donutRef = useRef(null)
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  
  const totalPages = Math.ceil(total / itemsPerPage)

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://api.aiseras.com/aiseras/admin/stats', {
          headers: {
            'accept': 'application/json',
            'x-admin-token': '3eJX4dU1oazZAPPWqZ6nx-LcEycxgWeXZwl7smtJHLpE2oMdLTtWag'
          }
        })
        const data = await response.json()
        if (data.status === 1) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [])

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

    // Mark active link
    const links = document.querySelectorAll('.sidebar .nav-link')
    links.forEach((l) => {
      l.classList.remove('active')
      const href = (l.getAttribute('href') || '').split('?')[0].toLowerCase()
      if (href.includes('dashboard') || href === '') {
        l.classList.add('active')
      }
    })

    return () => {
      if (toggleBtn) toggleBtn.removeEventListener('click', handleToggle)
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Initialize charts using React refs - guaranteed DOM is ready
  useEffect(() => {
    if (typeof Chart === 'undefined' || !stats) {
      return
    }

    // Destroy old charts if they exist
    if (window.barChartInstance) {
      window.barChartInstance.destroy()
    }
    if (window.donutChartInstance) {
      window.donutChartInstance.destroy()
    }

    // Initialize Bar Chart with media data
    if (barRef.current) {
      window.barChartInstance = new Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: ['Videos', 'Audios', 'Images'],
          datasets: [
            {
              label: 'Total Files',
              data: [stats.video_files, stats.audio_files, stats.image_files],
              backgroundColor: '#3945eb',
              borderColor: '#3945eb',
              borderWidth: 1,
              borderRadius: 8,
              barPercentage: 0.7,
            },
          ],
        },
        options: {
          indexAxis: 'x',
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            tooltip: { padding: 12, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.8)' },
          },
          scales: {
            x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            y: { grid: { display: false } },
          },
        },
      })
    }

    // Initialize Donut Chart with user status data
    if (donutRef.current) {
      const unverifiedUsers = stats.total_users - stats.verified_users
      window.donutChartInstance = new Chart(donutRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Verified Users', 'Unverified Users'],
          datasets: [
            {
              data: [stats.verified_users, unverifiedUsers],
              backgroundColor: ['#39ab71', '#d4a5b4'],
              borderColor: '#ffffff',
              borderWidth: 3,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', padding: 20 },
            tooltip: { padding: 12, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.8)' },
          },
        },
      })
    }
  }, [stats])

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
              <span>Dashboard</span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="dropdown">
                <a className="d-flex align-items-center text-decoration-none dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  <div className="avatar">{admin?.full_name?.charAt(0)?.toUpperCase() || 'A'}</div>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                      Log out
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>
        <main className="container-fluid">
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stat-box" style={{ background: 'linear-gradient(135deg, #ff3570, #871835)' }}>
                <div>
                  <h6>Total Users</h6>
                  <h3>{statsLoading ? '...' : stats?.total_users || 0}</h3>
                  <p className="small muted mt-2 mb-0">✓ {statsLoading ? '...' : stats?.verified_users || 0} verified</p>
                </div>
                <div className="icon-box">
                  <i className="bi bi-person"></i>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stat-box" style={{ background: 'linear-gradient(135deg,#00305c,#004a8a)' }}>
                <div>
                  <h6>Total Videos</h6>
                  <h3>{statsLoading ? '...' : stats?.video_files || 0}</h3>
                  <p className="small muted mt-2 mb-0">Total media: {statsLoading ? '...' : stats?.total_media || 0}</p>
                </div>
                <div className="icon-box">
                  <i className="bi bi-camera-video"></i>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stat-box" style={{ background: 'linear-gradient(135deg, #39ab71, #21651d)' }}>
                <div>
                  <h6>Total Audios</h6>
                  <h3>{statsLoading ? '...' : stats?.audio_files || 0}</h3>
                  <p className="small muted mt-2 mb-0">Voices: {statsLoading ? '...' : stats?.total_voices || 0}</p>
                </div>
                <div className="icon-box">
                  <i className="bi bi-speaker"></i>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stat-box" style={{ background: 'linear-gradient(135deg, #FF5722, #9f3b00)' }}>
                <div>
                  <h6>Total Images</h6>
                  <h3>{statsLoading ? '...' : stats?.image_files || 0}</h3>
                  <p className="small muted mt-2 mb-0">Avatars: {statsLoading ? '...' : stats?.total_avatars || 0}</p>
                </div>
                <div className="icon-box">
                  <i className="bi bi-image"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-lg-8">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Overview video/audio</h5>
                  <div style={{ height: '320px' }}>
                    <canvas ref={barRef}></canvas>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">User Status</h5>
                  <div style={{ height: '320px' }}>
                    <canvas ref={donutRef}></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-lg-12">
              <div className="card">
                <div className="card-header border-0 pb-0">
                  <h5 className="card-title mb-0">User List</h5>
                </div>
                <div className="card-body">
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
                        </tr>
                      </thead>
                      <tbody>
                        {usersLoading ? (
                          <tr>
                            <td colSpan="7" className="text-center py-4">
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
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center py-4">
                              No users found
                            </td>
                          </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
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
        </div>
        </main>
      </div>
    </div>
  )
}
