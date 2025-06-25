# SoulBeast Backend

Backend API for the SoulBeast card battle game, built with Bun, Hono, Prisma, and Better Auth.

## Features

- **Authentication**: Better Auth with email/password and OAuth providers
- **Database**: SQLite with Prisma ORM
- **API**: RESTful API built with Hono
- **Runtime**: Bun for fast development and production

## Setup

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

3. **Database setup**:
   ```bash
   # Generate Prisma client
   bun run db:generate
   
   # Push schema to database
   bun run db:push
   ```

4. **Start development server**:
   ```bash
   bun run dev
   ```

## Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run start` - Start production server
- `bun run db:generate` - Generate Prisma client
- `bun run db:push` - Push schema changes to database
- `bun run db:migrate` - Create and run migrations
- `bun run db:studio` - Open Prisma Studio

## API Endpoints

### Authentication
- `POST /api/auth/sign-in` - Sign in with email/password
- `POST /api/auth/sign-up` - Sign up with email/password
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session

### User
- `GET /api/user` - Get current user (requires authentication)

### Health
- `GET /health` - Health check endpoint

## Database Schema

The database includes the following models:
- **User**: User accounts with email, name, and image
- **Account**: OAuth provider accounts
- **Session**: User sessions
- **VerificationToken**: Email verification tokens

## Environment Variables

- `DATABASE_URL`: SQLite database file path
- `BETTER_AUTH_SECRET`: Secret key for Better Auth
- `BETTER_AUTH_URL`: Base URL for Better Auth
- `PORT`: Server port (default: 3001)
- OAuth provider credentials (optional)

## Development

The server runs on `http://localhost:3001` by default and includes CORS configuration for frontend development.
