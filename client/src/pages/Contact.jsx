import { useForm } from 'react-hook-form'
import { getApiUrl } from '../utils/api'

export default function Contact() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm()

  const onSubmit = async (data) => {
    try {
      const response = await fetch(getApiUrl('/api/enquiries'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (response.ok) {
        alert('Enquiry submitted successfully!')
        reset()
      } else {
        alert('Failed to submit enquiry.')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred.')
    }
  }

  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-serif text-crystal-blue mb-8 text-center">Contact Us</h1>
      <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16">
        Get in touch to book a viewing or enquire about our venues.
      </p>
      
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-crystal-dark mb-2">Name *</label>
              <input 
                {...register('name', { required: true })} 
                className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-crystal-gold"
              />
            </div>
            <div>
              <label className="block text-sm text-crystal-dark mb-2">Email *</label>
              <input 
                type="email"
                {...register('email', { required: true })} 
                className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-crystal-gold"
              />
            </div>
            <div>
              <label className="block text-sm text-crystal-dark mb-2">Phone</label>
              <input 
                {...register('phone')} 
                className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-crystal-gold"
              />
            </div>
            <div>
              <label className="block text-sm text-crystal-dark mb-2">Event Type *</label>
              <select 
                {...register('eventType', { required: true })} 
                className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-crystal-gold"
              >
                <option value="">Select Event Type</option>
                <option value="Hindu Wedding">Hindu Wedding</option>
                <option value="Saree Ceremony">Saree Ceremony</option>
                <option value="Reception">Reception</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-crystal-dark mb-2">Preferred Branch *</label>
              <select 
                {...register('preferredBranch', { required: true })} 
                className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-crystal-gold"
              >
                <option value="">Select Branch</option>
                <option value="Hayes">Hayes</option>
                <option value="Slough">Slough</option>
                <option value="Wembley">Wembley</option>
                <option value="Any">Any</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-crystal-dark mb-2">Estimated Guest Count</label>
              <input 
                type="number"
                {...register('estimatedGuestCount')} 
                className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-crystal-gold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-crystal-dark mb-2">Event Date</label>
              <input 
                type="date"
                {...register('eventDate')} 
                className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-crystal-gold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-crystal-dark mb-2">Message</label>
              <input 
                {...register('message')} 
                rows={4}
                className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-crystal-gold"
              ></input>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-crystal-gold text-crystal-dark py-3 font-medium uppercase tracking-wide hover:bg-crystal-blue hover:text-white transition-colors duration-300 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
          </button>
        </form>
      </div>
    </div>
  )
}
