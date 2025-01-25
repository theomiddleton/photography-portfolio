import { redirect } from 'next/navigation'

export default async function draft() {
  redirect('/admin/blog/')
}