# VeriDegree DApp - Deployment & Production Guide

This guide covers running the app locally, building for production, and deploying to live environments.

## Local Development

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- MetaMask browser extension
- Sepolia testnet ETH

### Local Setup

```bash
# 1. Extract project
unzip VeriDegreeDAppmain.zip
cd VeriDegreeDAppmain

# 2. Install dependencies
pnpm install

# 3. Create .env.local
cp .env.local.example .env.local

# 4. Edit .env.local with credentials
# PINATA_JWT=your_jwt_token
# PINATA_API_KEY=your_api_key
# NEXT_PUBLIC_PINATA_GATEWAY=your_gateway

# 5. Run dev server
pnpm dev
```

Visit: **http://localhost:3000**

### Development Environment

```bash
# Start with hot reload
pnpm dev

# Run linter
pnpm lint

# Check types
npx tsc --noEmit
```

## Building for Production

### Build Process

```bash
# Create optimized production build
pnpm build

# Test production build locally
pnpm start
```

The build process:
1. Compiles TypeScript
2. Optimizes React components
3. Bundles assets
4. Creates `.next/` directory

### Build Output

```
.next/
├── server/        # Backend code
├── static/        # Static assets
├── public/        # Public files
└── data/          # Prerendered pages
```

### Environment Variables for Production

Create `.env.production.local`:

```
PINATA_JWT=your_production_jwt_token
PINATA_API_KEY=your_production_api_key
NEXT_PUBLIC_PINATA_GATEWAY=your_gateway_domain
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the creator of Next.js and offers seamless integration.

#### Setup

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/veridegree.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   - In Vercel dashboard: Settings → Environment Variables
   - Add all variables from `.env.local`:
     ```
     PINATA_JWT
     PINATA_API_KEY
     NEXT_PUBLIC_PINATA_GATEWAY
     NEXT_PUBLIC_PINATA_GATEWAY_TOKEN (optional)
     ```

4. **Deploy**
   - Click "Deploy"
   - Vercel automatically builds and deploys
   - Get live URL

#### Automatic Deployments

- Every push to `main` branch deploys automatically
- Preview deployments for pull requests
- Rollback any deployment in seconds

### Option 2: Traditional Node.js Server

For self-hosted environments (AWS, DigitalOcean, etc.).

#### Build

```bash
# Build the app
pnpm build

# Dependencies needed in production
pnpm install --prod
```

#### Deploy

1. **Copy files to server**
   ```bash
   scp -r .next package.json pnpm-lock.yaml user@server:/app/
   ```

2. **Install on server**
   ```bash
   cd /app
   pnpm install --prod
   ```

3. **Set environment variables**
   ```bash
   export PINATA_JWT=your_token
   export PINATA_API_KEY=your_key
   export NEXT_PUBLIC_PINATA_GATEWAY=your_gateway
   ```

4. **Start production server**
   ```bash
   pnpm start
   ```

5. **Use process manager** (PM2)
   ```bash
   pm2 start "pnpm start" --name veridegree
   pm2 save
   ```

### Option 3: Docker

For containerized deployments.

#### Create Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --prod

# Copy app
COPY .next ./.next
COPY public ./public

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

#### Build & Run

```bash
# Build image
docker build -t veridegree:latest .

# Run container
docker run -p 3000:3000 \
  -e PINATA_JWT=your_token \
  -e PINATA_API_KEY=your_key \
  -e NEXT_PUBLIC_PINATA_GATEWAY=your_gateway \
  veridegree:latest
```

### Option 4: AWS (EC2 + S3)

#### Setup EC2 Instance

1. Create Ubuntu EC2 instance
2. Install Node.js and pnpm
3. Clone repository
4. Configure environment variables
5. Build and run with PM2

#### S3 for Static Assets

```bash
# Upload static files to S3
aws s3 sync .next/static/ s3://your-bucket/static/
```

## Performance Optimization

### Image Optimization

```typescript
// Use Next.js Image component
import Image from "next/image"

<Image
  src="/certificate.png"
  alt="Certificate"
  width={800}
  height={600}
  priority
/>
```

### API Caching

Pinata results are cached automatically. Browser caching headers are set by the API routes.

### Bundle Analysis

```bash
npm install --save-dev @next/bundle-analyzer

# See bundle sizes
ANALYZE=true pnpm build
```

## Monitoring & Logging

### Application Logs

Production logs from Vercel dashboard:
- Vercel → Project Settings → Logs
- Real-time view of deployment and function logs

### Error Tracking

Recommended services:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - Full monitoring

### Health Checks

```bash
# Check app is running
curl http://localhost:3000

# Check API routes
curl -X POST http://localhost:3000/api/pinata/upload-json \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Scaling Considerations

### Database (if added)

For storing certificate metadata locally:
- PostgreSQL
- MongoDB
- Firebase

### Caching Layer

For high traffic:
- Redis for session caching
- CloudFlare for CDN

### Rate Limiting

```typescript
// middleware.ts
import { rateLimit } from './lib/rate-limit'

export async function middleware(request) {
  const response = rateLimit(request)
  if (!response.ok) {
    return new Response('Too Many Requests', { status: 429 })
  }
  return response
}
```

## Security Checklist

Before going to production:

- [ ] Remove `ignoreBuildErrors` from next.config.mjs
- [ ] Set `strict: true` in tsconfig.json
- [ ] Enable HTTPS (auto with Vercel)
- [ ] Set secure environment variables
- [ ] Add rate limiting to API routes
- [ ] Validate all user inputs
- [ ] Use CORS headers properly
- [ ] Disable debug logs
- [ ] Set security headers

### Security Headers

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}
```

## Backup & Recovery

### Environment Variable Backup

Keep a secure backup of:
```
PINATA_JWT
PINATA_API_KEY
```

Use a password manager or secure vault.

### Database Backup

If using a database:
```bash
# PostgreSQL
pg_dump -U user dbname > backup.sql

# MongoDB
mongodump --db dbname --out backup/
```

## Updating & Maintenance

### Update Dependencies

```bash
# Check for updates
pnpm outdated

# Update all packages
pnpm up

# Update Next.js specifically
pnpm up next react react-dom
```

### Rollback Deployment

**With Vercel:**
- Dashboard → Deployments
- Select previous deployment
- Click "Promote to Production"

**With PM2:**
```bash
git revert HEAD
pnpm build
pm2 restart veridegree
```

## Monitoring Checklist

**Daily:**
- [ ] Check error logs
- [ ] Verify Pinata uploads working
- [ ] Test certificate issuance
- [ ] Monitor gas prices

**Weekly:**
- [ ] Review analytics
- [ ] Check dependency updates
- [ ] Test verification flow
- [ ] Review smart contract events

**Monthly:**
- [ ] Security audit
- [ ] Performance review
- [ ] Backup verification
- [ ] Plan upgrades

## Production Roadmap

1. **Phase 1 (Current)**
   - Basic certificate issuance
   - Sepolia testnet
   - Single chain

2. **Phase 2**
   - Multiple blockchains
   - Advanced certificate features
   - Admin dashboard

3. **Phase 3**
   - Mainnet deployment
   - Real fees
   - Full compliance

## Troubleshooting Production Issues

### High Gas Fees
- Use Sepolia testnet for testing
- Optimize contract calls
- Batch operations when possible

### IPFS Slow
- Use dedicated Pinata gateway
- Add gateway token for faster access
- Implement retry logic

### Deployment Fails
- Check environment variables
- Review build logs
- Test locally first
- Check Node version compatibility

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Pinata Docs:** https://docs.pinata.cloud/
- **ethers.js Docs:** https://docs.ethers.org/

---

**Ready to deploy?** Follow the setup for your chosen platform above.
