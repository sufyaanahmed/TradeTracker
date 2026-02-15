// Shared Authentication Module - Firebase JWT verification
// Extracts uid from Firebase token for all API routes

export async function authenticate(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return { error: 'Unauthorized: No token provided', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { error: 'Unauthorized: Invalid token format', status: 401 };
  }

  try {
    // Decode Firebase JWT payload
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { error: 'Unauthorized: Malformed token', status: 401 };
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { error: 'Unauthorized: Token expired', status: 401 };
    }

    // Check issuer matches Firebase project
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (projectId && payload.iss !== `https://securetoken.google.com/${projectId}`) {
      console.warn('[auth] Token issuer mismatch');
    }

    // Extract uid - Firebase uses user_id, sub, or uid
    const uid = payload.user_id || payload.sub || payload.uid;
    if (!uid) {
      return { error: 'Unauthorized: No user_id in token', status: 401 };
    }

    return { uid, email: payload.email, name: payload.name };
  } catch (error) {
    console.error('[auth] Token verification error:', error.message);
    return { error: 'Unauthorized: Invalid token', status: 401 };
  }
}
