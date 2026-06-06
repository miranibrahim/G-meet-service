import { google, Auth } from "googleapis"

let _client: Auth.OAuth2Client | null = null

export function getGoogleOAuthClient() {
  if (_client) return _client

  const clientId     = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  const redirectUri  = process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/auth/callback"

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing Google OAuth env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN"
    )
  }

  const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  client.setCredentials({ refresh_token: refreshToken })

  client.on("tokens", (tokens) => {
    if (tokens.refresh_token) {
      console.warn("⚠️  New refresh token issued — update GOOGLE_REFRESH_TOKEN in .env:")
      console.warn("  ", tokens.refresh_token)
    }
  })

  _client = client
  return _client
}
