// Backward compatibility - re-export from authSession
// This file maintains compatibility while we transition to the new structure
export {
  getSession,
  updateSession,
  createGalleryPasswordCookie,
  verifyGalleryPasswordCookie,
  invalidateUserSessions,
} from './authSession'
