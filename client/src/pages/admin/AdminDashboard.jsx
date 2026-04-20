import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getApiUrl } from '../../utils/api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, enquiry: null, totalAmount: '', paidAmount: '' })

  const { data: auth, isLoading: checkingAuth } = useQuery({
    queryKey: ['checkAuth'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/admin/me'), { 
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
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
      const res = await fetch(getApiUrl('/api/admin/enquiries'), { 
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      if (!res.ok) throw new Error('Failed to fetch enquiries')
      return res.json()
    },
    enabled: !!auth?.authenticated
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(getApiUrl(`/api/admin/enquiries/${id}/status`), {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
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

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, totalAmount, paidAmount }) => {
      const res = await fetch(getApiUrl(`/api/admin/enquiries/${id}/payment`), {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ totalAmount, paidAmount })
      })
      if (!res.ok) throw new Error('Failed to update payment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] })
      setPaymentModal({ isOpen: false, enquiry: null, totalAmount: '', paidAmount: '' })
    }
  })

  const sendReminderMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(getApiUrl(`/api/admin/enquiries/${id}/remind`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      if (!res.ok) throw new Error('Failed to send reminder')
      return res.json()
    },
    onSuccess: () => {
      alert('Reminder sent successfully!')
    }
  })

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    updatePaymentMutation.mutate({
      id: paymentModal.enquiry.id,
      totalAmount: paymentModal.totalAmount === '' ? undefined : Number(paymentModal.totalAmount),
      paidAmount: paymentModal.paidAmount === '' ? undefined : Number(paymentModal.paidAmount)
    })
  }

  const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })

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
              localStorage.removeItem('adminToken');
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
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider">Payment</th>
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
                        <div className="text-xs text-gray-600 mb-1">
                          Total: {enq.totalAmount !== null ? formatter.format(enq.totalAmount) : 'Not Set'}
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          Paid: {formatter.format(enq.paidAmount)}
                        </div>
                        <div className="text-xs font-medium mb-2 text-crystal-dark">
                          Bal: {enq.totalAmount !== null ? formatter.format(enq.totalAmount - enq.paidAmount) : 'N/A'}
                        </div>
                        <button 
                          onClick={() => setPaymentModal({ isOpen: true, enquiry: enq, totalAmount: enq.totalAmount || '', paidAmount: enq.paidAmount || 0 })}
                          className="text-xs px-3 py-1 border border-crystal-gold text-crystal-gold hover:bg-crystal-gold hover:text-white transition-colors uppercase"
                        >
                          Manage
                        </button>
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

      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 max-w-md w-full shadow-2xl border-t-4 border-crystal-gold">
            <h2 className="text-2xl font-serif text-crystal-blue mb-6">Manage Payment</h2>
            <div className="mb-6 text-sm text-gray-600">
              <p><strong>Client:</strong> {paymentModal.enquiry.firstName} {paymentModal.enquiry.lastName}</p>
              <p><strong>Event:</strong> {paymentModal.enquiry.eventType} at {paymentModal.enquiry.branch}</p>
            </div>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-crystal-dark mb-1">Total Agreed Price (£)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={paymentModal.totalAmount}
                  onChange={(e) => setPaymentModal({ ...paymentModal, totalAmount: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-crystal-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-crystal-dark mb-1">Amount Paid So Far (£)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={paymentModal.paidAmount}
                  onChange={(e) => setPaymentModal({ ...paymentModal, paidAmount: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-crystal-gold"
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setPaymentModal({ isOpen: false, enquiry: null, totalAmount: '', paidAmount: '' })}
                  className="w-1/2 px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 uppercase tracking-wide text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={updatePaymentMutation.isPending}
                  className="w-1/2 px-4 py-2 bg-crystal-gold text-white hover:bg-crystal-dark transition-colors uppercase tracking-wide text-sm font-medium disabled:opacity-50"
                >
                  {updatePaymentMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button 
                onClick={() => {
                  if (window.confirm('Send a payment reminder email to the client?')) {
                    sendReminderMutation.mutate(paymentModal.enquiry.id)
                  }
                }}
                disabled={sendReminderMutation.isPending || paymentModal.enquiry.totalAmount === null}
                className="w-full px-4 py-2 border border-crystal-blue text-crystal-blue hover:bg-crystal-blue hover:text-white transition-colors uppercase tracking-wide text-sm font-medium disabled:opacity-50"
              >
                {sendReminderMutation.isPending ? 'Sending...' : 'Send Email Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
