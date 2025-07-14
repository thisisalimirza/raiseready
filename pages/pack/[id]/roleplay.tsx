import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { User, Pack, RolePlaySession } from '@/types'
import Chat from '@/components/Chat'

interface Props {
  user: User | null
  loading: boolean
}

export default function RolePlay({ user, loading }: Props) {
  const router = useRouter()
  const { id } = router.query
  const [pack, setPack] = useState<Pack | null>(null)
  const [session, setSession] = useState<RolePlaySession | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')

  // Use useEffect for redirects to avoid hooks order issues
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to signin
        router.push('/signin')
      } else if (user.payment_status !== 'paid') {
        // Authenticated but not paid, redirect to landing
        router.push('/landing')
      }
    }
  }, [user, loading, router])

  useEffect(() => {
    console.log('Effect running - router.isReady:', router.isReady, 'id:', id, 'user:', !!user, 'pack:', !!pack)
    if (router.isReady && id && user && pack === null) {
      console.log('Calling fetchPackAndSession')
      fetchPackAndSession()
    }
  }, [router.isReady, id, user, pack])

  const fetchPackAndSession = async () => {
    console.log('fetchPackAndSession started')
    try {
      // Simple direct database query with proper auth
      console.log('Querying pack with id:', id)
      const { data: packData, error: packError } = await supabase
        .from('packs')
        .select('*')
        .eq('id', id)
        .single()

      console.log('Pack query result:', packData, packError)

      if (packError || !packData) {
        throw new Error('Pack not found')
      }

      // Verify this pack belongs to the current user
      if (packData.user_id !== user?.id) {
        throw new Error('Access denied')
      }

      console.log('Setting pack data')
      setPack(packData)

      // Create a temporary session
      console.log('Creating session')
      setSession({
        id: 'temp',
        pack_id: id as string,
        messages: [],
        confidence_score: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      console.log('fetchPackAndSession completed successfully')
    } catch (error) {
      console.error('fetchPackAndSession error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      console.log('Setting loadingData to false')
      setLoadingData(false)
    }
  }

  const handleConfidenceChange = async (score: number) => {
    if (!session) return

    try {
      const { error } = await supabase
        .from('roleplay_sessions')
        .update({
          confidence_score: score,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id)

      if (error) {
        console.error('Error updating confidence score:', error)
      }
    } catch (error) {
      console.error('Error updating confidence score:', error)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading role-play session...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!pack || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Pack or session not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Role-Play Session</h1>
              <p className="text-gray-600">
                {pack.job_title} • {pack.city_or_remote} • Target: ${pack.target_salary?.toLocaleString() || 'TBD'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <div className="h-96 lg:h-[600px]">
                <Chat
                  packId={pack.id}
                  onConfidenceChange={handleConfidenceChange}
                  initialMessages={session.messages}
                />
              </div>
            </div>

            {/* Sidebar with Pack Info */}
            <div className="space-y-6">
              {/* Pack Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Pack Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-medium">${pack.current_salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Market Avg:</span>
                    <span className="font-medium">${pack.market_data.average.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Market Range:</span>
                    <span className="font-medium">
                      ${pack.market_data.p25.toLocaleString()} - ${pack.market_data.p75.toLocaleString()}
                    </span>
                  </div>
                  {pack.target_salary && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Your Target:</span>
                      <span className="font-medium text-green-600">${pack.target_salary.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Achievements */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Achievements</h3>
                <ul className="space-y-2 text-sm">
                  {pack.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-gray-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Negotiation Tips</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Start with your value proposition</li>
                  <li>• Reference market data confidently</li>
                  <li>• Be specific about achievements</li>
                  <li>• Stay professional and collaborative</li>
                  <li>• Have fallback options ready</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}