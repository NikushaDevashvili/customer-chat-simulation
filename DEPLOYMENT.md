# Customer Chat Deployment Guide

## Prerequisites

1. Vercel account
2. GitHub repository with customer-chat code
3. Published observa-sdk on npm (or update package.json to use local version temporarily)
4. Production observa-api URL
5. API key from observa-app signup
6. OpenAI API key

## Step 1: Update SDK Dependency

The package.json has been updated to use the published SDK. If the SDK is not yet published:

1. Temporarily use local version:
```json
"observa-sdk": "file:../observa-sdk"
```

2. Or publish SDK first (see observa-sdk/DEPLOYMENT.md)

## Step 2: Deploy to Vercel

### Via GitHub Integration (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect Next.js
4. Configure environment variables:
   - `OBSERVA_API_KEY` - JWT API key from observa-app signup
   - `OBSERVA_API_URL` - Production observa-api URL
   - `OPENAI_API_KEY` - Your OpenAI API key
5. Click "Deploy"

## Step 3: Verify Deployment

1. Visit your deployed URL
2. Test the chat functionality
3. Verify traces are being sent to Tinybird

## Environment Variables

- `OBSERVA_API_KEY` - JWT API key from observa-app (required)
- `OBSERVA_API_URL` - Production observa-api URL (required)
- `OPENAI_API_KEY` - OpenAI API key (required)

