# SoulBeast Production Deployment Guide

This guide covers deploying SoulBeast in production mode.

## Quick Start

1. **Setup Environment Variables**
   ```bash
   cp .env.production.example .env
   # Edit .env with your production values
   ```

2. **Install Dependencies**
   ```bash
   bun install
   cd backend && bun install
   cd ../frontend && bun install
   ```

3. **Setup Database**
   ```bash
   # From project root (environment variables are now loaded from root .env)
   cd backend
   bun run db:generate
   bun run db:push
   ```

4. **Start Production Server**
   ```bash
   # From project root
   bun run prod
   # or
   bun start
   ```

## Environment Configuration

### Required Environment Variables

- `BETTER_AUTH_SECRET`: A secure secret key (minimum 32 characters)
- `BETTER_AUTH_URL`: Your backend URL (e.g., `https://api.yourdomain.com`)
- `FRONTEND_URL`: Your frontend URL (e.g., `https://yourdomain.com`)

### Optional Environment Variables

- `PORT`: Backend server port (default: 3001)
- `DATABASE_URL`: Database connection string
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For Google OAuth
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: For GitHub OAuth

## Production Architecture

### Backend (Port 3001)
- Hono.js API server
- Better Auth for authentication
- Prisma with SQLite database
- CORS configured for production origins

### Frontend
- Built with Rsbuild for production
- Static files served from `frontend/dist`
- Proxies API calls to backend

## Deployment Options

### Option 1: Single Server Deployment

1. **Build and start with prod.ts**
   ```bash
   bun run prod
   ```
   This will:
   - Build the frontend for production
   - Start the backend server
   - Serve API on the configured port

2. **Serve frontend static files**
   You'll need a web server (nginx, Apache, or serve through your backend) to serve the built frontend files from `frontend/dist`.

### Option 2: Separate Frontend/Backend Deployment

1. **Backend Deployment**
   ```bash
   cd backend
   bun run start
   ```

2. **Frontend Deployment**
   ```bash
   cd frontend
   bun run build
   # Deploy dist/ folder to your static hosting service
   ```

## Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Serve frontend static files
    location / {
        root /path/to/soulbeast/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001;
    }
}
```

## SSL/HTTPS Setup

For production, always use HTTPS:

1. **Get SSL Certificate** (Let's Encrypt recommended)
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Update Environment Variables**
   ```bash
   BETTER_AUTH_URL="https://yourdomain.com"
   FRONTEND_URL="https://yourdomain.com"
   ```

## Database Considerations

### SQLite (Default)
- Good for small to medium applications
- File-based, easy to backup
- Consider regular backups in production

### PostgreSQL (Recommended for Scale)
1. **Install PostgreSQL**
2. **Update DATABASE_URL**
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/soulbeast"
   ```
3. **Update Prisma schema** (if needed)
4. **Run migrations**
   ```bash
   cd backend
   bun run db:migrate
   ```

## Monitoring and Logging

### Health Checks
- Backend health endpoint: `GET /health`
- Returns: `{"status": "ok", "timestamp": "..."}`

### Logs
- Production logs are output to stdout
- Consider using a log aggregation service
- Monitor for authentication errors and API failures

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong `BETTER_AUTH_SECRET` (32+ characters)
- [ ] Configure proper CORS origins
- [ ] Keep dependencies updated
- [ ] Regular database backups
- [ ] Monitor for security vulnerabilities
- [ ] Use environment variables for secrets
- [ ] Configure proper firewall rules

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check `BETTER_AUTH_URL` matches your domain
   - Verify CORS origins include your frontend URL
   - Ensure cookies are enabled and secure

2. **Frontend not loading**
   - Verify frontend build completed successfully
   - Check static file serving configuration
   - Ensure API proxy is configured correctly

3. **Database connection errors**
   - Verify `DATABASE_URL` is correct
   - Check database permissions
   - Ensure database migrations are up to date

### Debug Mode

To run with debug logging:
```bash
DEBUG=* bun run prod
```

## Performance Optimization

1. **Enable gzip compression** in your web server
2. **Set proper cache headers** for static assets
3. **Use a CDN** for static file delivery
4. **Monitor database performance** and add indexes as needed
5. **Consider Redis** for session storage at scale

## Backup Strategy

1. **Database Backups**
   ```bash
   # SQLite
   cp backend/prod.db backup/prod-$(date +%Y%m%d).db
   
   # PostgreSQL
   pg_dump soulbeast > backup/soulbeast-$(date +%Y%m%d).sql
   ```

2. **Environment Configuration**
   - Keep `.env.production` in secure backup
   - Document all environment variables

3. **Application Code**
   - Use Git tags for releases
   - Maintain deployment documentation

For additional help, refer to the main README.md or create an issue in the repository.