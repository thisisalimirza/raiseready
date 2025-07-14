import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

interface Props {
  user: User | null
  loading: boolean
}

export default function NewPack({ user, loading }: Props) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    jobTitle: '',
    cityOrRemote: '',
    currentSalary: '',
    targetSalary: '',
    achievements: ['', '', '']
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Use useEffect for redirects to avoid hooks order issues
  useEffect(() => {
    if (!user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAchievementChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.map((achievement, i) => 
        i === index ? value : achievement
      )
    }))
  }

  const addAchievement = () => {
    if (formData.achievements.length < 5) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, '']
      }))
    }
  }

  const removeAchievement = (index: number) => {
    if (formData.achievements.length > 3) {
      setFormData(prev => ({
        ...prev,
        achievements: prev.achievements.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Filter out empty achievements
      const achievements = formData.achievements.filter(a => a.trim())
      
      if (achievements.length < 3) {
        throw new Error('Please provide at least 3 achievements')
      }

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('You must be logged in to create a pack')
      }

      const payload = {
        job_title: formData.jobTitle,
        city_or_remote: formData.cityOrRemote,
        current_salary: parseInt(formData.currentSalary),
        target_salary: formData.targetSalary ? parseInt(formData.targetSalary) : null,
        achievements
      }

      const response = await fetch('/api/pack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create pack')
      }

      const { pack } = await response.json()
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Raise Pack</h1>
          <p className="mt-2 text-gray-600">
            Tell us about your role and achievements to get personalized negotiation materials
          </p>
        </div>

        <div className="bg-white rounded-lg shadow px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="jobTitle"
                required
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Software Engineer, Product Manager"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="cityOrRemote" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="cityOrRemote"
                required
                value={formData.cityOrRemote}
                onChange={(e) => handleInputChange('cityOrRemote', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., San Francisco, New York, Remote"
              />
            </div>

            {/* Current Salary */}
            <div>
              <label htmlFor="currentSalary" className="block text-sm font-medium text-gray-700 mb-2">
                Current Salary (USD) *
              </label>
              <input
                type="number"
                id="currentSalary"
                required
                value={formData.currentSalary}
                onChange={(e) => handleInputChange('currentSalary', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 95000"
              />
            </div>

            {/* Target Salary */}
            <div>
              <label htmlFor="targetSalary" className="block text-sm font-medium text-gray-700 mb-2">
                Target Salary (USD) <span className="text-gray-500">- Optional</span>
              </label>
              <input
                type="number"
                id="targetSalary"
                value={formData.targetSalary}
                onChange={(e) => handleInputChange('targetSalary', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 120000"
              />
            </div>

            {/* Achievements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Achievements *
              </label>
              <p className="text-sm text-gray-500 mb-3">
                List 3-5 specific accomplishments that demonstrate your value
              </p>
              
              {formData.achievements.map((achievement, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <textarea
                    value={achievement}
                    onChange={(e) => handleAchievementChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder={`Achievement ${index + 1}${index < 3 ? ' (required)' : ''}`}
                    required={index < 3}
                  />
                  {formData.achievements.length > 3 && (
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {formData.achievements.length < 5 && (
                <button
                  type="button"
                  onClick={addAchievement}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add another achievement
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Your Pack...' : 'Create Raise Pack'}
              </button>
            </div>
          </form>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}