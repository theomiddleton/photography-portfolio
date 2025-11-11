import {
  getVideoBySlug,
  checkVideoAccess,
  incrementVideoViews,
  logVideoAccess,
} from '~/server/services/video-service'
import { VideoPasswordForm } from '~/components/video/video-password-form'
import { VideoPageClient } from '~/components/video/video-page-client'
import { notFound } from 'next/navigation'
import { headers, cookies } from 'next/headers'
import { getSession } from '~/lib/auth/auth'
import type { Metadata } from 'next'
import { VIDEO_ACCESS_COOKIE_PREFIX } from '~/lib/video-access'

export const revalidate = 0

interface VideoPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}

export async function generateMetadata(
  props: VideoPageProps,
): Promise<Metadata> {
  const params = await props.params
  const video = await getVideoBySlug(params.slug)

  if (!video) {
    return {
      title: 'Video Not Found',
    }
  }

  const videoTitle = video.seoTitle || video.title
  const videoDescription =
    video.seoDescription || video.description || `Watch ${video.title}`
  const thumbnailUrl = video.thumbnailUrl

  return {
    title: videoTitle,
    description: videoDescription,
    openGraph: {
      title: videoTitle,
      description: videoDescription,
      type: 'video.other',
      ...(thumbnailUrl && {
        images: [
          {
            url: thumbnailUrl,
            alt: videoTitle,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: videoTitle,
      description: videoDescription,
      ...(thumbnailUrl && {
        images: [thumbnailUrl],
      }),
    },
  }
}

export default async function VideoPage(props: VideoPageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const video = await getVideoBySlug(params.slug)

  if (!video) {
    notFound()
  }

  // Check access
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(
    `${VIDEO_ACCESS_COOKIE_PREFIX}${params.slug}`,
  )?.value

  const effectiveToken = searchParams.token ?? cookieToken

  const accessResult = await checkVideoAccess(
    params.slug,
    undefined,
    effectiveToken,
  )

  if (!accessResult.canAccess) {
    // Show password form for private videos
    if (accessResult.requiresPassword) {
      return (
        <div className="container max-w-2xl py-12">
          <VideoPasswordForm slug={params.slug} />
        </div>
      )
    }
    notFound()
  }

  // Log view and increment counter
  const headersList = await headers()
  const ipAddress =
    headersList.get('x-forwarded-for') ||
    headersList.get('x-real-ip') ||
    headersList.get('cf-connecting-ip') ||
    'unknown'
  const userAgent = headersList.get('user-agent') || undefined

  await Promise.all([
    incrementVideoViews(video.id),
    logVideoAccess(video.id, 'view', ipAddress, userAgent),
  ])

  // Get session for comment permissions
  const session = await getSession()

  return (
    <VideoPageClient
      videoId={video.id}
      slug={video.slug}
      hlsUrl={video.hlsUrl}
      thumbnailUrl={video.thumbnailUrl ?? undefined}
      title={video.title}
      description={video.description}
      views={video.views}
      createdAt={video.createdAt.toISOString()}
      duration={video.duration}
      tags={video.tags}
      visibility={video.visibility}
      resolution={video.resolution}
      fps={video.fps}
      allowEmbed={video.visibility !== 'private'}
      commentsEnabled={video.commentsEnabled}
      allowAnonymousComments={video.allowAnonymousComments}
      requireApproval={video.requireApproval}
      commentsLocked={video.commentsLocked}
      isAdmin={session?.role === 'admin'}
      currentUserId={session?.id ?? null}
    />
  )
}
