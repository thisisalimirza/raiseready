import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { loadStripe } from '@stripe/stripe-js'
import { signOut } from '@/lib/auth'
import { User } from '@/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Props {
  user: User | null
  loading: boolean
}

export default function Landing({ user, loading }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [message, setMessage] = useState('')

  // Redirect authenticated users with payment to dashboard
  useEffect(() => {
    if (user && !loading && user.payment_status === 'paid') {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleGetStarted = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSigningUp(true)
    setMessage('')

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const { sessionId } = await response.json()

      if (response.ok && sessionId) {
        // Redirect to Stripe checkout
        const stripe = await stripePromise
        const { error } = await stripe!.redirectToCheckout({
          sessionId: sessionId,
        })

        if (error) {
          setMessage(error.message || 'Payment failed')
        }
      } else {
        setMessage('Failed to create checkout session')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSigningUp(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleGoToApp = () => {
    router.push('/dashboard')
  }

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">RaiseReady</span>
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button
                    onClick={handleGoToApp}
                    className="bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-md hover:bg-blue-700 font-medium transition-colors duration-200 text-sm sm:text-base"
                  >
                    {user.email}
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                  <span className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-0">Already have an account?</span>
                  <a href="/signin" className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base whitespace-nowrap">Sign In</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <div className="pt-10 mx-auto max-w-7xl px-4 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-8 xl:pt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Negotiate Your</span>
                  <span className="block text-blue-600 xl:inline">Dream Salary</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Get personalized negotiation scripts, market data, and AI-powered practice sessions. 
                  Join thousands who've successfully increased their salaries.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a href="#pricing" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                      Get Started Today
                    </a>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a href="#features" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10">
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-br from-blue-50 to-blue-100 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Average salary increase</p>
              <p className="text-3xl font-bold text-blue-600">$15,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Trusted by professionals</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Join thousands who've successfully negotiated raises
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">$15K</div>
              <div className="text-sm text-gray-600 mt-1">Average raise increase</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">89%</div>
              <div className="text-sm text-gray-600 mt-1">Success rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">5K+</div>
              <div className="text-sm text-gray-600 mt-1">Happy customers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              What our customers say
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "RaiseReady helped me negotiate a $20k raise! The AI practice sessions made me feel confident going into the conversation."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Sarah Chen</p>
                  <p className="text-sm text-gray-500">Software Engineer</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The market research feature was incredible. I had no idea I was being underpaid by $15k. Now I'm at market rate!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Michael Rodriguez</p>
                  <p className="text-sm text-gray-500">Product Manager</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Best $39 I've ever spent! The personalized scripts made the conversation so much easier. Got a 25% raise!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Alex Thompson</p>
                  <p className="text-sm text-gray-500">Data Scientist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to negotiate successfully
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Market Research</h3>
                <p className="text-base text-gray-500">
                  Get real salary data for your role and location. Know exactly what you're worth in today's market.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Custom Scripts</h3>
                <p className="text-base text-gray-500">
                  Personalized negotiation scripts based on your achievements and target salary that actually work.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI Role-Play</h3>
                <p className="text-base text-gray-500">
                  Practice with AI-powered manager simulations. Build confidence before the real conversation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Simple, One-Time Pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Get everything you need for successful salary negotiation
            </p>
          </div>

          <div className="mt-16 flex justify-center">
            <div className="relative max-w-lg w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25"></div>
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="px-8 py-10">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white mb-4">
                      🔥 Early Bird Special - 50% Off!
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">RaiseReady Complete</h3>
                    <div className="mt-4 flex items-center justify-center">
                      <span className="text-5xl font-bold text-gray-900">$39</span>
                      <span className="ml-3 text-xl text-gray-500">
                        <span className="line-through">$79</span>
                      </span>
                    </div>
                    <p className="mt-2 text-base text-gray-500">One-time payment • Lifetime access</p>
                  </div>

                  <ul className="mt-8 space-y-4">
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-base text-gray-700">Unlimited raise packs</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-base text-gray-700">Market salary research</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-base text-gray-700">Custom negotiation scripts</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-base text-gray-700">AI-powered role-play practice</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-base text-gray-700">Downloadable negotiation kit</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-base text-gray-700">Lifetime access</span>
                    </li>
                  </ul>

                  <form onSubmit={handleGetStarted} className="mt-8">
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter your email to get started
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your@email.com"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSigningUp}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transform hover:scale-[1.02] transition-all duration-200"
                    >
                      {isSigningUp ? 'Processing...' : 'Get Started Now - $39'}
                    </button>
                  </form>

                  {message && (
                    <div className="mt-4 p-3 text-center text-sm bg-blue-50 text-blue-700 rounded-lg">
                      {message}
                    </div>
                  )}

                  <div className="mt-6 text-center">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Secure payment powered by Stripe</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900">How quickly can I see results?</h3>
                <p className="mt-2 text-base text-gray-600">
                  Most users create their first raise pack within 10 minutes and have their negotiation ready within an hour. Many see results within weeks of using our scripts.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Is this a subscription or one-time payment?</h3>
                <p className="mt-2 text-base text-gray-600">
                  It's a one-time payment of $39 (50% off the regular $79 price). You get lifetime access to all features with no recurring fees.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">What if I'm not satisfied?</h3>
                <p className="mt-2 text-base text-gray-600">
                  We're confident you'll love RaiseReady. If you're not completely satisfied, contact us within 30 days for a full refund.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Can I use this for multiple job negotiations?</h3>
                <p className="mt-2 text-base text-gray-600">
                  Absolutely! Create unlimited raise packs for different roles, companies, or career changes. Your lifetime access covers everything.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="ml-2 text-xl font-bold text-white">RaiseReady</span>
              </div>
              <p className="text-gray-300 text-base">
                Your personalized salary negotiation toolkit. Get market data, custom scripts, and AI-powered practice sessions to negotiate your dream salary.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#features" className="text-base text-gray-300 hover:text-white">Features</a></li>
                    <li><a href="#pricing" className="text-base text-gray-300 hover:text-white">Pricing</a></li>
                    <li><a href="/signin" className="text-base text-gray-300 hover:text-white">Sign In</a></li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Help Center</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Contact Us</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Status</a></li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">About</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Blog</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Careers</a></li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="/privacy" className="text-base text-gray-300 hover:text-white">Privacy Policy</a></li>
                    <li><a href="/terms" className="text-base text-gray-300 hover:text-white">Terms of Service</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Cookie Policy</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; {new Date().getFullYear()} RaiseReady. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}