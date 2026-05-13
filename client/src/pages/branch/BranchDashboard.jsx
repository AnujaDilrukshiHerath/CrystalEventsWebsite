import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Mail, Phone, LogOut, RefreshCw } from 'lucide-react'
import { getApiUrl } from '../../utils/api'
import Logo from '../../components/common/Logo'

export default function BranchDashboard() {
  const { branch } = useParams() // 'slough' or 'wembley'
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const branchLabel = branch ? branch.charAt(0).toUpperCase() + branch.slice(1) : 'Branch'

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('branchToken')
    const role = localStorage.getItem('branchRole')
    if (!token || role !== `branch-${branch}`) {
      navigate(`/branch/${branch}/login`)
    }
  }, [branch, navigate])

  const { data: enquiries, isLoading } = useQuery({
    queryKey: ['branch-enquiries', branch],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/admin/branch/enquiries'), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('branchToken')}` }
      })
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })

  const handleLogout = () => {
    localStorage.removeItem('branchToken')
    localStorage.removeItem('branchRole')
    navigate(`/branch/${branch}/login`)
  }

  const handleStatusChange = async (enquiryId, currentStatus, field, newValue) => {
    // Parse composite status
    const parts = (currentStatus === 'pending' ? 'not-called' : currentStatus).split('::')
    const leadStatus = parts[0] || 'not-called'
    const bookingStatus = parts[1] || 'not-confirmed'

    const newLead = field === 'lead' ? newValue : leadStatus
    const newBooking = field === 'booking' ? newValue : bookingStatus
    const compositeStatus = `${newLead}::${newBooking}`

    try {
      const res = await fetch(getApiUrl(`/api/admin/branch/enquiries/${enquiryId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('branchToken')}`
        },
        body: JSON.stringify({ status: compositeStatus })
      })
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['branch-enquiries', branch] })
      }
    } catch (err) {
      console.error('Status update error:', err)
    }
  }

  return (
    <div className="pt-24 pb-24 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <Logo className="w-10 h-10" textClassName="text-crystal-blue" />
            <div>
              <h1 className="text-3xl font-serif text-crystal-blue">{branchLabel} Branch Portal</h1>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Enquiry Management</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['branch-enquiries', branch] })}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-500 text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-xs uppercase tracking-wider hover:bg-red-100 transition-colors"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Enquiries Table */}
        <div className="bg-white shadow-xl rounded-sm border-t-4 border-crystal-gold overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-serif text-crystal-blue">{branchLabel} Enquiries</h2>
            <span className="text-xs text-gray-400 uppercase tracking-widest">
              {enquiries?.length ?? 0} Total
            </span>
          </div>

          {isLoading ? (
            <div className="p-20 text-center text-crystal-gold font-serif text-xl animate-pulse">Loading...</div>
          ) : enquiries?.length === 0 ? (
            <div className="p-20 text-center text-gray-400 italic font-serif text-xl">No enquiries yet for {branchLabel}.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Client</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Event</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Message</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Lead Status</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Booking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enquiries.map(enq => {
                    const parts = (enq.status === 'pending' ? 'not-called' : enq.status).split('::')
                    const leadStatus = parts[0] || 'not-called'
                    const bookingStatus = parts[1] || 'not-confirmed'

                    return (
                      <tr key={enq.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-5 px-6">
                          <div className="font-semibold text-crystal-dark">{enq.firstName} {enq.lastName}</div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 uppercase">
                            <Mail size={10} /> {enq.email}
                          </div>
                          {enq.phone && (
                            <div className="flex items-center gap-1 text-[10px] text-crystal-blue mt-0.5 font-bold">
                              <Phone size={10} /> {enq.phone}
                            </div>
                          )}
                          <div className="text-[10px] text-gray-400 mt-1">{new Date(enq.createdAt).toLocaleDateString('en-GB')}</div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="text-sm font-medium text-crystal-blue">{enq.eventType}</div>
                          <div className="text-[10px] text-gray-400 mt-1">{enq.date} • {enq.guests} Guests</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{enq.hall}</div>
                        </td>
                        <td className="py-5 px-6 max-w-xs">
                          <div className="text-xs text-gray-600 italic whitespace-pre-wrap break-words">
                            {enq.message ? `"${enq.message}"` : <span className="text-gray-300">No message</span>}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <select
                            value={leadStatus}
                            onChange={(e) => handleStatusChange(enq.id, enq.status, 'lead', e.target.value)}
                            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-full border outline-none cursor-pointer transition-all ${
                              leadStatus === 'not-called' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              leadStatus === 'not-interested' ? 'bg-red-50 text-red-600 border-red-200' :
                              'bg-blue-50 text-blue-600 border-blue-200'
                            }`}
                          >
                            <option value="not-called">Not Called</option>
                            <option value="contacted">Contacted</option>
                            <option value="not-interested">Not Interested</option>
                            <option value="appointment">Appointment Fixed</option>
                            <option value="appointment-done">Appointment Done</option>
                          </select>
                        </td>
                        <td className="py-5 px-6">
                          <select
                            value={bookingStatus}
                            onChange={(e) => handleStatusChange(enq.id, enq.status, 'booking', e.target.value)}
                            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-full border outline-none cursor-pointer transition-all ${
                              bookingStatus === 'confirmed'
                                ? 'bg-green-50 text-green-600 border-green-200'
                                : 'bg-gray-50 text-gray-500 border-gray-200'
                            }`}
                          >
                            <option value="not-confirmed">Not Confirmed</option>
                            <option value="confirmed">Confirmed ✓</option>
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
