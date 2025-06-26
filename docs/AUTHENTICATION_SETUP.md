# Authentication Setup Guide

This guide explains how to set up better-auth social login for the SoulBeast application.

## Overview

The authentication system uses [better-auth](https://www.better-auth.com/) with support for:
- Email/Password authentication
- Google OAuth social login
- Session management
- Secure token handling

## Backend Configuration

### 1. Environment Variables

Copy the backend `.env.example` to `.env` and configure the following variables:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# Better Auth
BETTER_AUTH_SECRET="your-super-secret-key-here-min-32-chars"
BETTER_AUTH_URL="http://localhost:3001"

# Google OAuth (required for social login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server
PORT=3001
```

### 2. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen:
   - Application name: "SoulBeast"
   - Authorized domains: `localhost` (for development)
6. Create OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Authorized JavaScript origins: `http://localhost:5173` (frontend URL)
   - Authorized redirect URIs: `http://localhost:3001/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env` file

### 3. Database Setup

The backend uses Prisma with SQLite. The database schema should already include the necessary tables for better-auth.

If you need to reset the database:

```bash
cd backend
bun run prisma db push
```

## Frontend Configuration

The frontend is already configured to work with the backend. The auth client is set up in `/frontend/src/lib/auth.ts` and points to `http://localhost:3001`.

## File Structure

```
frontend/src/
├── components/
│   ├── Auth.tsx              # Main authentication component
│   ├── AuthCallback.tsx      # OAuth callback handler
│   └── Router.tsx            # Simple routing for auth callbacks
├── lib/
│   └── auth.ts              # Better-auth client configuration
└── index.tsx                # Updated to use Router
```

## Features

### Auth Component (`/components/Auth.tsx`)

- **Email/Password Authentication**: Sign up and sign in with email
- **Google OAuth**: One-click social login
- **Form Validation**: Client-side validation with error handling
- **Responsive Design**: Mobile-allyly interface with Tailwind CSS
- **Smooth Animations**: Motion animations for better UX
- **Loading States**: Visual feedback during authentication

### Key Features:

1. **Dual Authentication Methods**:
   - Traditional email/password
   - Google OAuth social login

2. **Session Management**:
   - Automatic session detection
   - Persistent login state
   - Secure sign out

3. **User Experience**:
   - Toggle between sign in/sign up
   - Clear error messages
   - Loading indicators
   - Smooth transitions

4. **Security**:
   - CSRF protection
   - Secure session handling
   - Environment-based configuration

## Usage

### Starting the Application

1. **Start the backend**:
   ```bash
   cd backend
   bun run dev
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   bun run dev
   ```

3. **Access the application**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`

### Authentication Flow

1. **First Visit**: Users see the authentication screen
2. **Sign Up/Sign In**: Users can create an account or sign in
3. **Google OAuth**: Click "Continue with Google" for social login
4. **Session Persistence**: Users remain logged in across browser sessions
5. **Game Access**: Authenticated users can access the full game

## API Endpoints

The backend exposes these authentication endpoints:

- `POST /api/auth/sign-in` - Email/password sign in
- `POST /api/auth/sign-up` - Email/password sign up
- `GET /api/auth/sign-in/google` - Google OAuth initiation
- `GET /api/auth/callback/google` - Google OAuth callback
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session

## Troubleshooting

### Common Issues

1. **Google OAuth not working**:
   - Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
   - Verify redirect URIs in Google Cloud Console
   - Ensure the OAuth consent screen is configured

2. **CORS errors**:
   - Backend CORS is configured for `localhost:5173` and `localhost:3001`
   - Check that frontend and backend URLs match the configuration

3. **Session not persisting**:
   - Check that `BETTER_AUTH_SECRET` is set and at least 32 characters
   - Verify that cookies are enabled in the browser

4. **Database errors**:
   - Run `bun run prisma db push` to ensure database schema is up to date
   - Check that `DATABASE_URL` points to the correct SQLite file

### Development Tips

1. **Testing OAuth locally**:
   - Use `localhost` (not `127.0.0.1`) for consistency
   - Add both frontend and backend URLs to Google OAuth configuration

2. **Environment Variables**:
   - Never commit real OAuth credentials to version control
   - Use different OAuth apps for development and production

3. **Session Management**:
   - Sessions expire after 7 days by default
   - Session updates occur every 24 hours

## Security Considerations

1. **Environment Variables**: Keep OAuth credentials secure and never expose them in client-side code
2. **HTTPS in Production**: Always use HTTPS in production environments
3. **Secret Rotation**: Regularly rotate the `BETTER_AUTH_SECRET`
4. **OAuth Scopes**: Only request necessary OAuth scopes from providers
5. **Session Security**: Sessions are httpOnly and secure in production

## Next Steps

1. **Additional Providers**: Add more OAuth providers (GitHub, Discord, etc.)
2. **User Profiles**: Extend user data with game-specific information
3. **Role-Based Access**: Implement user roles and permissions
4. **Email Verification**: Add email verification for new accounts
5. **Password Reset**: Implement password reset functionality

The authentication system is now ready for development and can be extended with additional features as needed.