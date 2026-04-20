import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { getApiUrl } from '../../utils/api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: auth, isLoading: checkingAuth } = useQuery({
    queryKey: ['checkAuth'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/admin/me'), { credentials: 'include' })
      if (!res.ok) throw new Error('Not authenticated')
      return res.json()
    },
    retry: false
  })

  useEffect(() => {
    if (!checkingAuth && !auth?.authenticated) {
      navigate('/admin/login')
    }
  }, [auth, checkingAuth, navigate])

  const { data: enquiries, isLoading: loadingEnquiries } = useQuery({
    queryKey: ['enquiries'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/admin/enquiries'), { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch enquiries')
      return res.json()
    },
    enabled: !!auth?.authenticated
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(getApiUrl(`/api/admin/enquiries/${id}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      })

      if (!res.ok) throw new Error('Failed to update status')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] })
    }
  })

  const handleStatusUpdate = (id, newStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus })
  }

  if (checkingAuth || (auth?.authenticated && loadingEnquiries)) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-crystal-gold text-xl font-serif">Loading Dashboard...</div>
      </div>
    )
  }

  if (!auth?.authenticated) return null;

  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen bg-crystal-light">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif text-crystal-blue">Enquiries Dashboard</h1>
          <button 
            onClick={() => {
              document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              navigate('/admin/login')
            }}
            className="px-6 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-sm uppercase tracking-wide font-medium"
          >
            Logout
          </button>
        </div>

        <div className="bg-white shadow-xl overflow-hidden rounded-sm border-t-4 border-crystal-gold">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Event Details</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enquiries?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">No enquiries found.</td>
                  </tr>
                ) : (
                  enquiries?.map(enq => (
                    <tr key={enq.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-crystal-dark">{enq.firstName} {enq.lastName}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600">{enq.email}</div>
                        <div className="text-sm text-gray-500">{enq.phone}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-crystal-blue">{enq.eventType}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {enq.branch} - {enq.hall || 'Any'} • {enq.guests} guests • {enq.date}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={enq.status}
                          onChange={(e) => handleStatusUpdate(enq.id, e.target.value)}
                          disabled={updateStatusMutation.isPending}
                          className={`text-xs font-medium uppercase tracking-wider rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-crystal-gold cursor-pointer transition-colors
                            ${enq.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              enq.status === 'contacted' ? 'bg-blue-100 text-blue-800' : 
                              'bg-green-100 text-green-800'}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="contacted">Contacted</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
