import { type Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '~/lib/auth/auth'
import { register } from '~/lib/auth/userActions'
import { SignupForm } from '~/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Sign Up | Portfolio',
  description: 'Create a new account.',
}

export default async function SignupPage() {
  // Check if user is already logged in
  const session = await getSession()
  if (session) {
    redirect('/')
  }

  return <SignupForm register={register} />
}
