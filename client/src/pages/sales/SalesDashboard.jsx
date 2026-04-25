import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getApiUrl } from '../../utils/api'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { 
  Calendar as CalendarIcon, 
  Mail, 
  LogOut,
  User,
  MapPin,
  Clock,
  Info,
  Phone,
  Layout
} from 'lucide-react'
import '../admin/AdminCalendar.css'

export default function SalesDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('calendar')
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
    if (!checkingAuth && !auth?.authenticated) navigate('/sales/login')
  }, [auth, checkingAuth, navigate])

  // Queries
  const { data: enquiries } = useQuery({
    queryKey: ['enquiries'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/admin/enquiries'), { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      })
      return res.json()
    },
    enabled: !!auth?.authenticated
  })

  const { data: bookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/admin/bookings'), { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      })
      return res.json()
    },
    enabled: !!auth?.authenticated
  })

  const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })

  if (checkingAuth || !auth?.authenticated) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-crystal-blue text-xl font-serif">Loading Sales Portal...</div>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif text-crystal-blue">Sales Dashboard</h1>
            <p className="text-gray-500 mt-2 font-light uppercase tracking-widest text-xs">Event Overview & Leads</p>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('adminToken'); navigate('/sales/login') }}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-500 hover:text-red-500 transition-all text-sm uppercase tracking-widest font-medium shadow-sm"
          >
            <LogOut size={16} /> Exit Portal
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
          {[
            { id: 'calendar', label: 'Event Calendar', icon: CalendarIcon },
            { id: 'enquiries', label: 'Recent Enquiries', icon: Mail },
            { id: 'decorations', label: 'Decorations (Coming Soon)', icon: Layout }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-8 py-4 text-sm uppercase tracking-wider font-semibold transition-all border-b-2 ${
                activeTab === tab.id 
                ? 'border-crystal-blue text-crystal-blue bg-white' 
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
          {activeTab === 'calendar' && (
            <div className="crystal-calendar-container bg-white p-8 shadow-xl border-t-4 border-crystal-blue rounded-sm">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={bookings?.map(b => ({
                  id: b.id,
                  title: `${b.eventType} - ${b.branch}`,
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

          {activeTab === 'enquiries' && (
            <div className="bg-white shadow-xl rounded-sm border-t-4 border-crystal-blue overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-serif text-crystal-blue">Customer Leads</h2>
                <span className="text-xs text-gray-400 uppercase tracking-widest">{enquiries?.length || 0} Enquiries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Client</th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Event</th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Branch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enquiries?.map(enq => (
                      <tr key={enq.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-6 px-6">
                          <div className="font-semibold text-crystal-dark">{enq.firstName} {enq.lastName}</div>
                          <div className="text-[10px] text-gray-400 mt-1 uppercase">{enq.email}</div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="text-sm font-medium text-crystal-blue">{enq.eventType}</div>
                          <div className="text-[10px] text-gray-400 mt-1">{enq.date} • {enq.guests} Guests</div>
                        </td>
                        <td className="py-6 px-6 text-xs font-medium uppercase text-gray-500">
                          {enq.branch}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'decorations' && (
            <div className="bg-white p-20 text-center shadow-xl border-t-4 border-crystal-gold rounded-sm italic text-gray-400 font-serif text-2xl">
              Decoration Management System Coming Soon...
            </div>
          )}
        </div>
      </div>

      {/* Calendar Event Details Modal (Read Only) */}
      {selectedEvent && (
        <div className="calendar-detail-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="calendar-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-serif text-crystal-blue">Event Details</h2>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-crystal-blue transition-colors">✕</button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-gray-700">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-crystal-blue font-bold">
                  {selectedEvent.clientName?.[0] || 'E'}
                </div>
                <div>
                  <div className="text-sm font-bold">{selectedEvent.clientName}</div>
                  <div className="text-xs text-gray-500 uppercase">{selectedEvent.eventType}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-1"><MapPin size={12}/> Branch</div>
                  <div className="text-sm font-semibold">{selectedEvent.branch} - {selectedEvent.hall}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-1"><Clock size={12}/> Date</div>
                  <div className="text-sm font-semibold">{selectedEvent.date}</div>
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
              Close Overview
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
