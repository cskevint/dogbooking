import { Metadata } from 'next'
import SignUpForm from '@/components/auth/SignUpForm'

export const metadata: Metadata = {
  title: 'Sign Up - DogBooking',
  description: 'Create your account to start booking or offering pet sitting services',
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our community of pet lovers
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
} 