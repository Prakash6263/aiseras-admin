import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export const useUsers = (skip = 0, limit = 50) => {
  const { token } = useAuth()
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
  }, [token, skip, limit])

  return { users, total, loading, error }
}
