export function NotAuthenticated() {

  return (
    <div className="h-screen flex flex-col pt-6 items-center">
      <h1 className="text-2xl font-semibold">Unauthorized</h1>
      <p className="mt-2">Sorry, But you don&apos;t have the permissions to view this page!</p>
    </div>
  )
}
