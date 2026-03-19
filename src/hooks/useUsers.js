import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export const useUsers = (skip = 0, limit = 50) => {
  const { token, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      setError('No authentication token')
      return
    }

    const fetchUsers = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`https://api.aiseras.com/aiseras/admin/users?skip=${skip}&limit=${limit}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-admin-token': token,
          },
        })

        // Handle 401 Unauthorized - token is invalid or expired
        if (response.status === 401) {
          logout()
          setError('Your session has expired. Please log in again.')
          return
        }

        const data = await response.json()

        if (data.status === 1) {
          setUsers(data.users || [])
          setTotal(data.total || 0)
        } else {
          setError(data.message || 'Failed to fetch users')
        }
      } catch (err) {
        console.error('Error fetching users:', err)
        setError('Failed to connect to server')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [token, skip, limit, logout])

  return { users, total, loading, error }
}
