import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { User } from '@/types'

interface Props {
  user: User | null
  loading: boolean
}

export default function Terms({ user, loading }: Props) {
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

      {/* Terms of Service Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <p className="text-gray-600 mb-6">
            <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>By accessing and using RaiseReady ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our service.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <div className="space-y-4 text-gray-700">
              <p>RaiseReady is a salary negotiation toolkit that provides:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personalized salary negotiation scripts and strategies</li>
                <li>Market salary research and data</li>
                <li>AI-powered role-play practice sessions</li>
                <li>Downloadable negotiation materials</li>
              </ul>
              <p>The service is provided on a paid subscription basis with lifetime access after payment.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <div className="space-y-4 text-gray-700">
              <p>To use our service, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create an account with accurate information</li>
                <li>Be at least 18 years old</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
              <p>You are responsible for all activities that occur under your account.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payment Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>Our service requires a one-time payment of $39 for lifetime access. By making payment, you agree that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All payments are processed securely through Stripe</li>
                <li>Payments are non-refundable except as required by law</li>
                <li>We may offer refunds at our discretion within 30 days of purchase</li>
                <li>You will not dispute legitimate charges</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
            <div className="space-y-4 text-gray-700">
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Share your account credentials with others</li>
                <li>Attempt to reverse engineer or copy our software</li>
                <li>Interfere with or disrupt the service</li>
                <li>Use the service to harm others or engage in harassment</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <div className="space-y-4 text-gray-700">
              <p>The RaiseReady service and its content are protected by copyright, trademark, and other intellectual property laws. You acknowledge that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We own all rights to the service and its content</li>
                <li>You receive only a limited license to use the service</li>
                <li>You may not reproduce, distribute, or create derivative works</li>
                <li>Your use of the service does not grant you any ownership rights</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disclaimer of Warranties</h2>
            <div className="space-y-4 text-gray-700">
              <p>Our service is provided "as is" without warranties of any kind. We do not guarantee:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>That the service will be uninterrupted or error-free</li>
                <li>That defects will be corrected</li>
                <li>That the service will meet your specific needs</li>
                <li>Any specific results from using our negotiation advice</li>
              </ul>
              <p><strong>Important:</strong> Our service provides educational content and tools. Success in salary negotiations depends on many factors beyond our control.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-700">
              <p>To the fullest extent permitted by law, RaiseReady shall not be liable for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, data, or other intangible losses</li>
                <li>Damages resulting from your use of the service</li>
                <li>Any damages exceeding the amount you paid for the service</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
            <div className="space-y-4 text-gray-700">
              <p>We may terminate or suspend your account at any time for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violation of these terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Extended periods of inactivity</li>
                <li>Any other reason at our discretion</li>
              </ul>
              <p>Upon termination, your right to use the service ceases immediately.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>We reserve the right to modify these terms at any time. We will notify users of significant changes by:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Posting the updated terms on our website</li>
                <li>Sending email notifications to registered users</li>
                <li>Updating the "Effective Date" above</li>
              </ul>
              <p>Continued use of the service after changes constitutes acceptance of the new terms.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
            <div className="space-y-4 text-gray-700">
              <p>These terms shall be governed by and construed in accordance with the laws of [Your State/Country], without regard to its conflict of law provisions.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>If you have questions about these Terms of Service, please contact us at:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> legal@raiseready.com</p>
                <p><strong>Address:</strong> [Your Business Address]</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}