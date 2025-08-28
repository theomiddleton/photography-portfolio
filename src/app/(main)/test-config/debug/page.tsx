import { getEnv } from '~/lib/env-utils'

export default function DebugPage() {
  // Let's check what's actually in process.env
  const envVars = Object.keys(process.env)
    .filter((key) => key.startsWith('NEXT_PUBLIC_'))
    .sort()
    .map((key) => ({
      key,
      value: process.env[key],
      isEmpty: !process.env[key] || process.env[key] === '',
    }))

  // Test the getEnv function directly
  const testResults = [
    {
      name: 'CONFIG_LOCATION',
      envKey: 'NEXT_PUBLIC_CONFIG_LOCATION',
      envValue: process.env.NEXT_PUBLIC_CONFIG_LOCATION,
      getEnvResult: getEnv('NEXT_PUBLIC_CONFIG_LOCATION', 'Default'),
    },
    {
      name: 'SITE_TITLE',
      envKey: 'NEXT_PUBLIC_SITE_TITLE',
      envValue: process.env.NEXT_PUBLIC_SITE_TITLE,
      getEnvResult: getEnv('NEXT_PUBLIC_SITE_TITLE', 'Default Title'),
    },
    {
      name: 'OWNER_NAME',
      envKey: 'NEXT_PUBLIC_OWNER_NAME',
      envValue: process.env.NEXT_PUBLIC_OWNER_NAME,
      getEnvResult: getEnv('NEXT_PUBLIC_OWNER_NAME', 'Default Owner'),
    },
  ]

  return (
    <div className="min-h-screen py-18">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Environment Debug
          </h1>
          <p className="mt-2 text-gray-600">
            Debug information for environment variable loading
          </p>
        </div>

        <div className="space-y-6">
          {/* Test getEnv function */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              getEnv Function Tests
            </h2>
            <div className="space-y-4">
              {testResults.map((test) => (
                <div
                  key={test.name}
                  className="border-l-4 border-blue-500 pl-4"
                >
                  <h3 className="font-medium text-gray-900">{test.name}</h3>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
                    <div>
                      <span className="font-medium text-gray-700">
                        Env Key:
                      </span>
                      <p className="text-gray-900">{test.envKey}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Raw Env Value:
                      </span>
                      <p className="rounded bg-gray-100 px-2 py-1 font-mono text-gray-900">
                        {test.envValue === undefined
                          ? '(undefined)'
                          : test.envValue === ''
                            ? '(empty string)'
                            : `"${test.envValue}"`}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        getEnv Result:
                      </span>
                      <p className="rounded bg-gray-100 px-2 py-1 font-mono text-gray-900">
                        "{test.getEnvResult}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All NEXT_PUBLIC_ environment variables */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              All NEXT_PUBLIC_ Environment Variables ({envVars.length} found)
            </h2>
            <div className="space-y-2">
              {envVars.length === 0 ? (
                <p className="font-medium text-red-600">
                  ❌ No NEXT_PUBLIC_ environment variables found!
                </p>
              ) : (
                envVars.map((env) => (
                  <div
                    key={env.key}
                    className={`flex items-center justify-between border-b pb-2 ${
                      env.isEmpty ? 'text-red-600' : 'text-gray-900'
                    }`}
                  >
                    <span className="font-mono text-sm">{env.key}</span>
                    <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">
                      {env.isEmpty ? '(empty)' : `"${env.value}"`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Node.js environment info */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Node.js Environment Info
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="font-medium text-gray-700">NODE_ENV:</span>
                <p className="font-mono text-gray-900">
                  {process.env.NODE_ENV}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">VERCEL_ENV:</span>
                <p className="font-mono text-gray-900">
                  {process.env.VERCEL_ENV || 'undefined'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Total env vars:
                </span>
                <p className="text-gray-900">
                  {Object.keys(process.env).length}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  NEXT_PUBLIC_ vars:
                </span>
                <p className="text-gray-900">{envVars.length}</p>
              </div>
            </div>
          </div>

          {/* Raw process.env dump (limited to NEXT_PUBLIC_) */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Raw process.env (NEXT_PUBLIC_ only)
            </h2>
            <pre className="max-h-96 overflow-auto rounded bg-gray-100 p-4 text-sm">
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(process.env).filter(([key]) =>
                    key.startsWith('NEXT_PUBLIC_'),
                  ),
                ),
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
