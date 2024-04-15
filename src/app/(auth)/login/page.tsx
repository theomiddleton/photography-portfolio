import { redirect } from 'next/navigation'

export default async function login() {
    redirect('/signin')
}