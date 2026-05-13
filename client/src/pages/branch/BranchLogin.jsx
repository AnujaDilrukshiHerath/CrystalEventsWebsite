import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { getApiUrl } from '../../utils/api'
import Logo from '../../components/common/Logo'

export default function BranchLogin() {
  const { branch } = useParams() // 'slough' or 'wembley'
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [loginError, setLoginError] = useState('')
  const navigate = useNavigate()

  const branchLabel = branch ? branch.charAt(0).toUpperCase() + branch.slice(1) : 'Branch'

  const onSubmit = async (data) => {
    setLoginError('')
    try {
      const response = await fetch(getApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        const expectedRole = `branch-${branch}`
        if (result.role !== expectedRole) {
          setLoginError(`Access denied. ${branchLabel} branch account required.`)
          return
        }
        localStorage.setItem('branchToken', result.token)
        localStorage.setItem('branchRole', result.role)
        navigate(`/branch/${branch}/dashboard`)
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
        <h1 className="text-3xl font-serif text-crystal-blue mb-2 text-center">{branchLabel} Portal</h1>
        <p className="text-center text-gray-500 mb-8 text-sm uppercase tracking-widest font-light">Branch Login</p>

        {loginError && (
          <div className="bg-red-50 text-red-600 p-3 mb-6 text-sm border border-red-200">
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold">Email</label>
            <input
              type="email"
              placeholder={`${branch}@crystalevents.co.uk`}
              {...register('email', { required: 'Email is required' })}
              className="w-full border-b-2 border-gray-100 focus:border-crystal-gold py-3 outline-none transition-colors"
            />
            {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
              className="w-full border-b-2 border-gray-100 focus:border-crystal-gold py-3 outline-none transition-colors"
            />
            {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-crystal-gold text-crystal-dark py-4 font-bold uppercase tracking-widest text-xs hover:bg-crystal-blue hover:text-white transition-all duration-300 disabled:opacity-50 shadow-lg"
          >
            {isSubmitting ? 'Verifying...' : `Access ${branchLabel} Portal`}
          </button>
        </form>
      </div>
    </div>
  )
}
