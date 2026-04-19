import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Logo from '../../components/common/Logo'

export default function AdminLogin() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [loginError, setLoginError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    setLoginError('')
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (response.ok) {
        navigate('/admin/dashboard')
      } else {
        const errorData = await response.json()
        setLoginError(errorData.message || 'Login failed')
      }
    } catch (error) {
      setLoginError('An error occurred. Please try again.')
    }
  }

  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen flex items-center justify-center bg-crystal-light">
      <div className="w-full max-w-md bg-white p-8 shadow-2xl border-t-4 border-crystal-gold">
        <div className="flex justify-center mb-6">
          <Logo className="w-16 h-16" textClassName="text-crystal-blue" />
        </div>
        <h1 className="text-3xl font-serif text-crystal-blue mb-6 text-center italic">Admin Portal</h1>
        
        {loginError && (
          <div className="bg-red-50 text-red-600 p-3 mb-6 text-sm border border-red-200">
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm text-crystal-dark mb-2">Email Address</label>
            <input 
              type="email"
              {...register('email', { required: 'Email is required' })} 
              className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-crystal-gold"
            />
            {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
          </div>
          <div>
            <label className="block text-sm text-crystal-dark mb-2">Password</label>
            <input 
              type="password"
              {...register('password', { required: 'Password is required' })} 
              className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-crystal-gold"
            />
            {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>}
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-crystal-dark text-white py-3 font-medium uppercase tracking-wide hover:bg-crystal-gold transition-colors duration-300 disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
