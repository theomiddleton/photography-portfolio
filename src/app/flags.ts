import { get } from '@vercel/edge-config';

export async function getFlags() {
  const flags = await get('featureFlags') as Record<string, boolean> | null;
  return {
    altImagePage: flags?.['alt-image-page'] ?? false,
  }
}