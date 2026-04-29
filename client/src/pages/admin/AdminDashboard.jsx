import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getApiUrl } from '../../utils/api'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { 
  Calendar as CalendarIcon, 
  ClipboardList, 
  CheckCircle, 
  Plus, 
  Mail, 
  Trash2, 
  LogOut,
  LayoutDashboard,
  User,
  Phone as PhoneIcon,
  MapPin,
  Clock,
  CircleDollarSign,
  Info,
  Banknote,
  CreditCard,
  Edit
} from 'lucide-react'
import './AdminCalendar.css'

const BRANCH_HALLS = {
  'Hayes': ['Grand Ballroom', 'Diamond Suite'],
  'Slough': ['Upstairs Hall 1', 'Downstairs Hall'],
  'Wembley': ['Upstairs Wings Hall', 'Aqua 1', 'Aqua 2', 'Sports Lounge']
}

export default function AdminDashboard() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('enquiries')
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, data: null, type: 'enquiry' })
  const [bookingModal, setBookingModal] = useState({ isOpen: false, data: null, selectedBranch: 'Hayes' })
  const [selectedEvent, setSelectedEvent] = useState(null)


  // Auth Check
  const { data: auth, isLoading: checkingAuth } = useQuery({
    queryKey: ['checkAuth'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/admin/me'), { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      })
      if (!res.ok) throw new Error('Not authenticated')
      return res.json()
    },
    retry: false
  })

  useEffect(() => {
    if (!checkingAuth && !auth?.authenticated) navigate('/admin/login')
  }, [auth, checkingAuth, navigate])

  // Queries
  const { data: enquiries, isLoading: loadingEnquiries } = useQuery({
    queryKey: ['enquiries'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/admin/enquiries'), { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      })
      return res.json()
    },
    enabled: !!auth?.authenticated
  })

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/admin/bookings'), { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      })
      return res.json()
    },
    enabled: !!auth?.authenticated
  })

  const [bookingFilter, setBookingFilter] = useState('all')

  // Helper for month formatting
  const getMonthYear = (dateStr) => {
    if (!dateStr) return 'Unknown'
    const date = new Date(dateStr)
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  // Get unique months from bookings
  const availableMonths = bookings ? Array.from(new Set(bookings.map(b => getMonthYear(b.date))))
    .sort((a, b) => new Date(a) - new Date(b)) : []

  const filteredBookings = bookings?.filter(b => 
    bookingFilter === 'all' || getMonthYear(b.date) === bookingFilter
  )

  const monthlyOutstanding = filteredBookings?.reduce((sum, b) => 
    sum + ((b.totalAmount || 0) - b.paidAmount), 0
  ) || 0
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const res = await fetch(getApiUrl('/api/admin/bookings'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(bookingData)
      })
      if (!res.ok) throw new Error('Failed to create booking')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setBookingModal({ isOpen: false, data: null, selectedBranch: 'Hayes' })
    }
  })

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await fetch(getApiUrl(`/api/admin/bookings/${id}`), {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(data)
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setPaymentModal({ isOpen: false, data: null, type: 'booking' })
    }
  })

  const deleteBookingMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(getApiUrl(`/api/admin/bookings/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] })
  })

  const addPaymentMutation = useMutation({
    mutationFn: async ({ bookingId, ...paymentData }) => {
      const res = await fetch(getApiUrl(`/api/admin/bookings/${bookingId}/payments`), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(paymentData)
      })
      if (!res.ok) throw new Error('Failed to add payment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setPaymentModal({ isOpen: false, data: null, type: 'booking' })
    }
  })

  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentId) => {
      const res = await fetch(getApiUrl(`/api/admin/payments/${paymentId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      })
      if (!res.ok) throw new Error('Failed to delete payment')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setPaymentModal({ isOpen: false, data: null, type: 'booking' })
    }
  })

  const updateEnquiryStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(getApiUrl(`/api/admin/enquiries/${id}/status`), {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status })
      })
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enquiries'] })
  })

  const deleteEnquiryMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(getApiUrl(`/api/admin/enquiries/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      })
      if (!res.ok) throw new Error('Failed to delete enquiry')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enquiries'] }),
    onError: (error) => alert(`Error: ${error.message}`)
  })

  const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })

  const handleConvertToBooking = (enq) => {
    createBookingMutation.mutate({
      clientName: `${enq.firstName} ${enq.lastName}`,
      email: enq.email,
      phone: enq.phone,
      date: enq.date,
      branch: enq.branch,
      hall: enq.hall,
      eventType: enq.eventType,
      totalAmount: enq.totalAmount,
      paidAmount: enq.paidAmount,
      paymentMethod: 'Bank',
      notes: `Converted from enquiry: ${enq.message || ''}`
    })
    updateEnquiryStatusMutation.mutate({ id: enq.id, status: 'reviewed' })
  }

  if (checkingAuth || !auth?.authenticated) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-crystal-gold text-xl font-serif">Authenticating...</div>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif text-crystal-blue">Management Dashboard</h1>
            <p className="text-gray-500 mt-2 font-light">Welcome back, {auth.user.email}</p>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin/login') }}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 transition-all text-sm uppercase tracking-widest font-medium shadow-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
          {[
            { id: 'enquiries', label: 'Enquiries', icon: Mail },
            { id: 'bookings', label: 'Confirmed Bookings', icon: CheckCircle },
            { id: 'calendar', label: 'Event Calendar', icon: CalendarIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-8 py-4 text-sm uppercase tracking-wider font-semibold transition-all border-b-2 ${
                activeTab === tab.id 
                ? 'border-crystal-gold text-crystal-blue bg-white' 
                : 'border-transparent text-gray-400 hover:text-crystal-blue'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'enquiries' && (
            <div className="bg-white shadow-xl rounded-sm border-t-4 border-crystal-gold overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-serif text-crystal-blue">Recent Leads</h2>
                <span className="text-xs text-gray-400 uppercase tracking-widest">{enquiries?.length || 0} Enquiries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Client</th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Event</th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enquiries?.map(enq => (
                      <tr key={enq.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-6 px-6">
                          <div className="font-semibold text-crystal-dark">{enq.firstName} {enq.lastName}</div>
                          <div className="text-xs text-gray-500 mt-1 flex flex-col gap-1">
                            <span className="flex items-center gap-1"><Mail size={12}/> {enq.email}</span>
                            <span className="flex items-center gap-1"><PhoneIcon size={12}/> {enq.phone}</span>
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="text-sm font-medium text-crystal-blue">{enq.eventType}</div>
                          <div className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">
                            {enq.branch} • {enq.date} • {enq.guests} Guests
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            enq.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {enq.status}
                          </span>
                        </td>
                        <td className="py-6 px-6 flex gap-2">
                          <button 
                            onClick={() => handleConvertToBooking(enq)}
                            className="flex items-center gap-2 px-4 py-2 bg-crystal-blue text-white text-[10px] uppercase tracking-widest font-bold hover:bg-crystal-dark transition-all"
                          >
                            <CheckCircle size={12} /> Confirm
                          </button>
                          {auth?.user?.role === 'admin' && (
                            <button 
                              onClick={() => { if(window.confirm('Delete this enquiry?')) deleteEnquiryMutation.mutate(enq.id) }}
                              className="p-2 text-red-400 hover:bg-red-50 rounded transition-colors"
                              title="Delete Enquiry"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded shadow-sm border border-gray-100">
                  <label className="text-[10px] font-bold uppercase text-gray-400">View Month:</label>
                  <select 
                    value={bookingFilter}
                    onChange={(e) => setBookingFilter(e.target.value)}
                    className="text-sm font-semibold text-crystal-blue outline-none bg-transparent"
                  >
                    <option value="all">All Months</option>
                    {availableMonths.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <div className="text-[10px] font-bold uppercase text-gray-400">Monthly Outstanding</div>
                    <div className="text-xl font-bold text-red-600">{formatter.format(monthlyOutstanding)}</div>
                  </div>
                  {auth?.user?.role === 'admin' && (
                    <button 
                      onClick={() => setBookingModal({ isOpen: true, data: null, selectedBranch: 'Hayes' })}
                      className="flex items-center gap-2 px-6 py-3 bg-crystal-gold text-white text-xs uppercase tracking-widest font-bold hover:bg-crystal-dark transition-all shadow-md"
                    >
                      <Plus size={16} /> Add Manual Booking
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-white shadow-xl rounded-sm border-t-4 border-crystal-blue overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-serif text-crystal-blue">
                    {bookingFilter === 'all' ? 'All Confirmed Events' : `Events in ${bookingFilter}`}
                  </h2>
                  <span className="text-xs text-gray-400 uppercase tracking-widest">{filteredBookings?.length || 0} Bookings</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Client</th>
                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Outstanding Balance</th>
                        <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredBookings?.map(booking => (
                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-6 px-6 font-medium text-crystal-blue whitespace-nowrap">{booking.date}</td>
                          <td className="py-6 px-6">
                            <div className="font-semibold text-crystal-dark">{booking.clientName}</div>
                            <div className="text-[10px] text-gray-400 uppercase mt-1 flex items-center gap-1">
                              <PhoneIcon size={10} /> {booking.phone || 'No Phone'}
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase mt-1">{booking.eventType} at {booking.branch} ({booking.hall})</div>
                          </td>
                          <td className="py-6 px-6 text-right">
                            <div className="text-sm font-bold text-red-600">
                              {formatter.format((booking.totalAmount || 0) - booking.paidAmount)}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1 uppercase">
                              Total: {formatter.format(booking.totalAmount || 0)}
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            <div className="flex justify-end gap-2">
                            {auth?.user?.role === 'admin' && (
                              <>
                                <button 
                                  onClick={() => setPaymentModal({ isOpen: true, data: booking, type: 'booking' })}
                                  className="p-2 text-crystal-gold hover:bg-gold-50 rounded transition-colors"
                                  title="Manage Payments"
                                >
                                  <CircleDollarSign size={18} />
                                </button>
                                <button 
                                  onClick={() => setBookingModal({ isOpen: true, data: booking, selectedBranch: booking.branch })}
                                  className="p-2 text-crystal-blue hover:bg-blue-50 rounded transition-colors"
                                  title="Edit Booking"
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={() => { if(window.confirm('Delete this booking?')) deleteBookingMutation.mutate(booking.id) }}
                                  className="p-2 text-red-400 hover:bg-red-50 rounded transition-colors"
                                  title="Delete Booking"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="crystal-calendar-container animate-in zoom-in-95 duration-500">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={bookings?.map(b => ({
                  id: b.id,
                  title: `${b.clientName} - ${b.eventType}`,
                  date: b.date,
                  extendedProps: b,
                  className: 'booking-event'
                }))}
                eventClick={(info) => setSelectedEvent(info.event.extendedProps)}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek'
                }}
                height="auto"
              />
            </div>
          )}
        </div>
      </div>

      {/* Manual Booking Modal */}
      {bookingModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-sm border-t-4 border-crystal-gold p-8">
            <h2 className="text-3xl font-serif text-crystal-blue mb-8">{bookingModal.data ? 'Edit Booking' : 'Manual Booking Entry'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData);
              if (bookingModal.data) {
                updateBookingMutation.mutate({ id: bookingModal.data.id, ...data });
              } else {
                createBookingMutation.mutate(data);
              }
              setBookingModal({ isOpen: false, data: null, selectedBranch: 'Hayes' });
            }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Client Full Name</label>
                  <input name="clientName" defaultValue={bookingModal.data?.clientName} required className="w-full border-b-2 border-gray-100 focus:border-crystal-gold py-2 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Event Date</label>
                  <input name="date" type="date" defaultValue={bookingModal.data?.date} required className="w-full border-b-2 border-gray-100 focus:border-crystal-gold py-2 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Customer Phone</label>
                  <input name="phone" defaultValue={bookingModal.data?.phone} placeholder="e.g. 07123456789" className="w-full border-b-2 border-gray-100 focus:border-crystal-gold py-2 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Event Type</label>
                  <input name="eventType" defaultValue={bookingModal.data?.eventType} required placeholder="e.g. Wedding, Birthday" className="w-full border-b-2 border-gray-100 focus:border-crystal-gold py-2 outline-none transition-colors" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Branch</label>
                  <select 
                    name="branch" 
                    value={bookingModal.selectedBranch}
                    onChange={(e) => setBookingModal({ ...bookingModal, selectedBranch: e.target.value })}
                    className="w-full border-b-2 border-gray-100 focus:border-crystal-gold py-2 outline-none"
                  >
                    <option value="Hayes">Hayes</option>
                    <option value="Slough">Slough</option>
                    <option value="Wembley">Wembley</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Hall</label>
                  <select name="hall" defaultValue={bookingModal.data?.hall} className="w-full border-b-2 border-gray-100 focus:border-crystal-gold py-2 outline-none">
                    {(BRANCH_HALLS[bookingModal.selectedBranch] || BRANCH_HALLS['Hayes']).map(hall => (
                      <option key={hall} value={hall}>{hall}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Payment Method</label>
                  <select name="paymentMethod" defaultValue={bookingModal.data?.paymentMethod} className="w-full border-b-2 border-gray-100 focus:border-crystal-gold py-2 outline-none">
                    <option value="Bank">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Total Amount (£)</label>
                  <input name="totalAmount" type="number" step="0.01" defaultValue={bookingModal.data?.totalAmount} className="w-full border-b-2 border-gray-100 focus:border-crystal-gold py-2 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Booking Notes</label>
                  <textarea name="notes" defaultValue={bookingModal.data?.notes} className="w-full border border-gray-100 p-2 text-xs h-20 outline-none focus:border-crystal-gold" placeholder="Add any specific details here..."></textarea>
                </div>
              </div>
              <div className="md:col-span-2 pt-8 flex gap-4">
                <button type="button" onClick={() => setBookingModal({ isOpen: false, data: null, selectedBranch: 'Hayes' })} className="w-full py-4 border border-gray-200 text-gray-400 uppercase tracking-widest font-bold text-xs hover:bg-gray-50">Cancel</button>
                <button type="submit" className="w-full py-4 bg-crystal-gold text-white uppercase tracking-widest font-bold text-xs hover:bg-crystal-dark shadow-lg">Save Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment/Details Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl shadow-2xl rounded-sm border-t-4 border-crystal-gold p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-serif text-crystal-blue mb-1">Payment History & Entry</h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{paymentModal.data.clientName || `${paymentModal.data.firstName} ${paymentModal.data.lastName}`}</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-400 uppercase">Outstanding</div>
                <div className="text-2xl font-bold text-red-600">{formatter.format((paymentModal.data.totalAmount || 0) - paymentModal.data.paidAmount)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* History Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">Previous Payments</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {paymentModal.data.payments?.length > 0 ? (
                    paymentModal.data.payments.map((p, idx) => (
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-bold text-crystal-blue">{formatter.format(p.amount)}</div>
                            <div className="text-gray-400 mt-0.5">{new Date(p.date).toLocaleDateString()} • {p.method}</div>
                            {p.notes && <div className="text-gray-500 italic mt-1 font-serif">"{p.notes}"</div>}
                          </div>
                          <button 
                            onClick={() => { if(window.confirm('Delete this payment?')) deletePaymentMutation.mutate(p.id) }}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                            title="Delete Payment"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400 italic">No payments recorded yet.</div>
                  )}
                </div>
              </div>

              {/* Add New Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">Add New Payment</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  addPaymentMutation.mutate({
                    bookingId: paymentModal.data.id,
                    amount: formData.get('amount'),
                    method: formData.get('method'),
                    date: formData.get('date'),
                    notes: formData.get('notes')
                  });
                }} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Amount (£)</label>
                    <input name="amount" type="number" step="0.01" required className="w-full border-b border-gray-200 py-1.5 outline-none focus:border-crystal-gold text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Payment Method</label>
                    <select name="method" className="w-full border-b border-gray-200 py-1.5 outline-none focus:border-crystal-gold text-sm">
                      <option value="Bank (Hayes)">Bank Transfer (Hayes)</option>
                      <option value="Bank (Wembley)">Bank Transfer (Wembley)</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Payment Date</label>
                    <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border-b border-gray-200 py-1.5 outline-none focus:border-crystal-gold text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Notes</label>
                    <textarea name="notes" placeholder="e.g. Paid via BTG / Ref: Wedding" className="w-full border border-gray-100 p-2 text-xs outline-none focus:border-crystal-gold h-20 resize-none"></textarea>
                  </div>
                  <button type="submit" disabled={addPaymentMutation.isLoading} className="w-full py-3 bg-crystal-gold text-white uppercase tracking-widest font-bold text-xs hover:bg-crystal-dark shadow-md disabled:opacity-50 transition-all">
                    {addPaymentMutation.isLoading ? 'Recording...' : 'Record Payment'}
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 uppercase">Total Agreed:</span>
                <span className="font-bold text-crystal-blue">{formatter.format(paymentModal.data.totalAmount || 0)}</span>
              </div>
              <button type="button" onClick={() => setPaymentModal({ isOpen: false, data: null, type: 'booking' })} className="px-8 py-2 border border-gray-200 text-gray-400 uppercase tracking-widest font-bold text-[10px] hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Event Details Modal */}
      {selectedEvent && (
        <div className="calendar-detail-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="calendar-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-serif text-crystal-blue">Event Details</h2>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={24}/></button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-gray-700">
                <div className="w-10 h-10 bg-gold-50 rounded-full flex items-center justify-center text-crystal-gold"><User size={20}/></div>
                <div>
                  <div className="text-sm font-bold">{selectedEvent.clientName}</div>
                  <div className="text-xs text-gray-500 uppercase">{selectedEvent.eventType}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-1"><MapPin size={12}/> Branch & Hall</div>
                  <div className="text-sm font-semibold">{selectedEvent.branch} - {selectedEvent.hall}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-1"><Clock size={12}/> Date</div>
                  <div className="text-sm font-semibold">{selectedEvent.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-1"><PhoneIcon size={12}/> Contact</div>
                  <div className="text-sm font-semibold">{selectedEvent.phone || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-1"><Banknote size={12}/> Payment Method</div>
                  <div className="text-sm font-semibold">{selectedEvent.paymentMethod || 'Bank'}</div>
                </div>
              </div>


              <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Payment Progress</span>
                  <span className="text-xs font-bold text-crystal-gold">{Math.round((selectedEvent.paidAmount / (selectedEvent.totalAmount || 1)) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-crystal-gold transition-all duration-1000" style={{ width: `${(selectedEvent.paidAmount / (selectedEvent.totalAmount || 1)) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-3">
                  <div className="text-[10px] text-gray-400 uppercase">Paid: <span className="text-gray-700 font-bold">{formatter.format(selectedEvent.paidAmount)}</span></div>
                  <div className="text-[10px] text-gray-400 uppercase">Total: <span className="text-gray-700 font-bold">{formatter.format(selectedEvent.totalAmount || 0)}</span></div>
                </div>
              </div>

              {selectedEvent.notes && (
                <div className="bg-blue-50 p-4 rounded border-l-4 border-crystal-blue">
                  <div className="flex items-center gap-2 text-xs font-bold text-crystal-blue uppercase mb-1"><Info size={12}/> Admin Notes</div>
                  <div className="text-xs text-gray-600 leading-relaxed italic">"{selectedEvent.notes}"</div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedEvent(null)}
              className="w-full mt-8 py-4 bg-crystal-blue text-white uppercase tracking-widest font-bold text-xs hover:bg-crystal-dark"
            >
              Back to Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
