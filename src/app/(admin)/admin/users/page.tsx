import { UsersTable } from '~/components/user/users'

export const revalidate = 60
export const dynamicParams = true

export default function Users() {
  return (
    <div className="min-h-screen bg-white text-black space-y-12">
      <UsersTable />
    </div>
  )
}