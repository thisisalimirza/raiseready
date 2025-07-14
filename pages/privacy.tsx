import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { User } from '@/types'

interface Props {
  user: User | null
  loading: boolean
}

export default function Privacy({ user, loading }: Props) {
  const router = useRouter()

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <button onClick={() => router.push('/')} className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">R</span>
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">RaiseReady</span>
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <a href="/signin" className="text-blue-600 hover:text-blue-700 font-medium">Sign In</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-6">
            <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-xl font-medium text-gray-900">Personal Information</h3>
              <p>We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email address (for account creation and communication)</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Job details and career information you provide for negotiation packs</li>
                <li>Communications with our support team</li>
              </ul>
              
              <h3 className="text-xl font-medium text-gray-900">Usage Information</h3>
              <p>We automatically collect certain information about your use of our service:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Log data (IP address, browser type, pages visited)</li>
                <li>Usage patterns and feature interactions</li>
                <li>Device information</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process payments and transactions</li>
                <li>Generate personalized salary negotiation content</li>
                <li>Communicate with you about your account and our services</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
            <div className="space-y-4 text-gray-700">
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> We may share information with trusted third parties who help us operate our service (payment processing, analytics, etc.)</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> Information may be transferred in connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <div className="space-y-4 text-gray-700">
              <p>We implement appropriate technical and organizational security measures to protect your personal information, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication systems</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and employee training</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
            <div className="space-y-4 text-gray-700">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access, update, or delete your personal information</li>
                <li>Opt out of marketing communications</li>
                <li>Request data portability</li>
                <li>Withdraw consent where applicable</li>
              </ul>
              <p>To exercise these rights, please contact us at the information provided below.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Analytics</h2>
            <div className="space-y-4 text-gray-700">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Improve our services and user experience</li>
              </ul>
              <p>You can control cookie settings through your browser preferences.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Children's Privacy</h2>
            <div className="space-y-4 text-gray-700">
              <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to This Policy</h2>
            <div className="space-y-4 text-gray-700">
              <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Effective Date" above.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
            <div className="space-y-4 text-gray-700">
              <p>If you have any questions about this privacy policy, please contact us at:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> privacy@raiseready.com</p>
                <p><strong>Address:</strong> [Your Business Address]</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}