import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

const { isAuthenticated } = getKindeServerSession()
const isUserAuthenticated = await isAuthenticated()

console.log("Authenticated?", isUserAuthenticated)

export default function Dashboard() {
  if (isUserAuthenticated) {
    // User is authenticated
    return (
      <div className='flex items-center justify-center'>
        <p>You are authenticated</p>
      </div>
    )
  } else {
    return (
      <div className='flex items-center justify-center'>
        <p>You are <b>not</b> authenticated</p>
      </div>
    )
  }
}
