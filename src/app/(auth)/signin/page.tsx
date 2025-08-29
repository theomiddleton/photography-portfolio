import { type Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '~/lib/auth/auth'
import { login } from '~/lib/auth/userActions'
import { SigninForm } from '~/components/auth/SigninForm'

export const metadata: Metadata = {
  title: 'Sign In | Portfolio',
  description: 'Sign in to your account.',
}

export default async function SigninPage() {
  // Check if user is already logged in
  const session = await getSession()
  if (session) {
    redirect('/')
  }

  return <SigninForm login={login} />
}
