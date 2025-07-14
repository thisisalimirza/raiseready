import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function PaymentSuccess() {
  const router = useRouter()
  const { session_id } = router.query
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session_id) {
      handlePaymentSuccess()
    }
  }, [session_id])

  const handlePaymentSuccess = async () => {
    try {
      const response = await fetch(`/api/payment-success?session_id=${session_id}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Payment verification failed')
      }
    } catch (error) {
      setError('Failed to verify payment')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/landing" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Try Again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase! You now have lifetime access to RaiseReady. 
          Check your email for the magic link to start creating your first raise pack.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/dashboard" 
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium"
          >
            Access Your Dashboard
          </Link>
          
          <div className="bg-blue-50 p-4 rounded-lg text-left">
            <h3 className="font-medium text-blue-900 mb-2">What's next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Create your first raise pack</li>
              <li>• Review your personalized negotiation script</li>
              <li>• Practice with AI role-play</li>
              <li>• Download your negotiation materials</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}