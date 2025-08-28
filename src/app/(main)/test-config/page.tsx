'use client'

import { useSiteConfig } from '~/hooks/use-site-config'

export default function TestConfigPage() {
  const siteConfig = useSiteConfig()
  
  return (
    <div className="min-h-screen py-18">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Site Configuration Test
          </h1>
          <p className="mt-2 text-gray-600">
            This page displays all current site configuration values for testing
            purposes.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <span className="font-medium text-gray-700">Config Location:</span>
            <p className="text-gray-900">{siteConfig.configLocation}</p>
          </div>
          {/* Basic Site Info */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Basic Site Information
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="font-medium text-gray-700">Title:</span>
                <p className="text-gray-900">{siteConfig.title}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Description:</span>
                <p className="text-gray-900">{siteConfig.description}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Store Name:</span>
                <p className="text-gray-900">{siteConfig.storeName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Owner Name:</span>
                <p className="text-gray-900">{siteConfig.ownerName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Site URL:</span>
                <p className="text-gray-900">{siteConfig.url}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Alt URL:</span>
                <p className="text-gray-900">{siteConfig.altUrl}</p>
              </div>
            </div>
          </div>

          {/* Bucket URLs */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Bucket URLs
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="font-medium text-gray-700">Image Bucket:</span>
                <p className="break-all text-gray-900">
                  {siteConfig.imageBucketUrl}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Blog Bucket:</span>
                <p className="break-all text-gray-900">
                  {siteConfig.blogBucketUrl}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">About Bucket:</span>
                <p className="break-all text-gray-900">
                  {siteConfig.aboutBucketUrl}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Custom Bucket:
                </span>
                <p className="break-all text-gray-900">
                  {siteConfig.customBucketUrl}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Stream Bucket:
                </span>
                <p className="break-all text-gray-900">
                  {siteConfig.streamBucketUrl}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Files Bucket:</span>
                <p className="break-all text-gray-900">
                  {siteConfig.filesBucketUrl}
                </p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Social Links
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="font-medium text-gray-700">GitHub:</span>
                <p className="text-gray-900">
                  {siteConfig.links.github || 'Not set'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Website:</span>
                <p className="text-gray-900">{siteConfig.links.website}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Instagram:</span>
                <p className="text-gray-900">
                  {siteConfig.links.instagram || 'Not set'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Twitter:</span>
                <p className="text-gray-900">
                  {siteConfig.links.twitter || 'Not set'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Facebook:</span>
                <p className="text-gray-900">
                  {siteConfig.links.facebook || 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* SEO Configuration */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              SEO Configuration
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <span className="font-medium text-gray-700">Job Title:</span>
                  <p className="text-gray-900">{siteConfig.seo.jobTitle}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Profession:</span>
                  <p className="text-gray-900">{siteConfig.seo.profession}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-gray-700">Location:</h3>
                <div className="grid grid-cols-1 gap-4 pl-4 md:grid-cols-3">
                  <div>
                    <span className="text-sm text-gray-600">Locality:</span>
                    <p className="text-gray-900">
                      {siteConfig.seo.location.locality || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Region:</span>
                    <p className="text-gray-900">
                      {siteConfig.seo.location.region || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Country:</span>
                    <p className="text-gray-900">
                      {siteConfig.seo.location.country}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-gray-700">OpenGraph:</h3>
                <div className="grid grid-cols-1 gap-4 pl-4 md:grid-cols-2">
                  <div>
                    <span className="text-sm text-gray-600">Site Name:</span>
                    <p className="text-gray-900">
                      {siteConfig.seo.openGraph.siteName}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Locale:</span>
                    <p className="text-gray-900">
                      {siteConfig.seo.openGraph.locale}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-600">Image URL:</span>
                    <p className="break-all text-gray-900">
                      {siteConfig.seo.openGraph.images[0].url}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Image Alt:</span>
                    <p className="text-gray-900">
                      {siteConfig.seo.openGraph.images[0].alt}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-gray-700">Twitter:</h3>
                <div className="grid grid-cols-1 gap-4 pl-4 md:grid-cols-2">
                  <div>
                    <span className="text-sm text-gray-600">Site:</span>
                    <p className="text-gray-900">
                      {siteConfig.seo.twitter.site || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Creator:</span>
                    <p className="text-gray-900">
                      {siteConfig.seo.twitter.creator || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-gray-700">Meta:</h3>
                <div className="grid grid-cols-1 gap-4 pl-4 md:grid-cols-2">
                  <div>
                    <span className="text-sm text-gray-600">Author:</span>
                    <p className="text-gray-900">
                      {siteConfig.seo.meta.author}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Theme Color:</span>
                    <p className="text-gray-900">
                      {siteConfig.seo.meta.themeColor}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Email Configuration
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="font-medium text-gray-700">Order Email:</span>
                <p className="text-gray-900">{siteConfig.emails.order}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Support Email:
                </span>
                <p className="text-gray-900">{siteConfig.emails.support}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Reply To:</span>
                <p className="text-gray-900">{siteConfig.emails.replyTo}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">No Reply:</span>
                <p className="text-gray-900">{siteConfig.emails.noReply}</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Features
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="font-medium text-gray-700">AI Enabled:</span>
                <p className="text-gray-900">
                  {siteConfig.features.aiEnabled ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Store Enabled:
                </span>
                <p className="text-gray-900">
                  {siteConfig.features.storeEnabled ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Reviews Enabled:
                </span>
                <p className="text-gray-900">
                  {siteConfig.features.store.reviewsEnabled ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Show Tax Separately:
                </span>
                <p className="text-gray-900">
                  {siteConfig.features.store.showTax ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Rate Limiting
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <span className="font-medium text-gray-700">Upload:</span>
                <p className="text-gray-900">
                  {siteConfig.rateLimiting.limits.upload}/min
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Image Processing:
                </span>
                <p className="text-gray-900">
                  {siteConfig.rateLimiting.limits.imageProcessing}/min
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  AI Generation:
                </span>
                <p className="text-gray-900">
                  {siteConfig.rateLimiting.limits.aiGeneration}/min
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Password Attempts:
                </span>
                <p className="text-gray-900">
                  {siteConfig.rateLimiting.limits.passwordAttempt}/min
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">
                  {siteConfig.rateLimiting.limits.email}/min
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Webhook:</span>
                <p className="text-gray-900">
                  {siteConfig.rateLimiting.limits.webhook}/min
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Checkout:</span>
                <p className="text-gray-900">
                  {siteConfig.rateLimiting.limits.checkout}/min
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Revalidate:</span>
                <p className="text-gray-900">
                  {siteConfig.rateLimiting.limits.revalidate}/min
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Admin Multiplier:
                </span>
                <p className="text-gray-900">
                  {siteConfig.rateLimiting.adminMultiplier}x
                </p>
              </div>
            </div>
          </div>

          {/* Raw JSON Output */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Raw Configuration (JSON)
            </h2>
            <pre className="max-h-96 overflow-auto rounded bg-gray-100 p-4 text-sm">
              {JSON.stringify(siteConfig, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
