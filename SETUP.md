# Setup Guide

This guide provides detailed setup instructions for the customer chat application.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- OpenAI API key
- Observability service API key (optional, for tracing)

## Installation

1. **Clone or navigate to the project directory**

```bash
cd customer-chat
```

2. **Install dependencies**

```bash
npm install
```

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your-openai-api-key-here

# Observability API (optional)
OBSERVA_API_KEY=your-observa-api-key-here
OBSERVA_API_URL=https://your-api-url.com
OBSERVA_ENV=prod
```

### Get Your API Keys

1. **OpenAI API Key**: 
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Navigate to API Keys section
   - Create a new secret key

2. **Observability API Key** (if using tracing):
   - Sign up for your observability service
   - Navigate to project settings
   - Create new API credentials

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on **http://localhost:3002**

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
customer-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # Chat API endpoint
│   ├── page.tsx              # Main chat interface
│   └── layout.tsx            # App layout
├── .env.local                # Environment variables (create this)
└── package.json             # Dependencies
```

## How It Works

1. **Frontend**: React-based chat interface (`app/page.tsx`)
2. **API Route**: Handles chat requests (`app/api/chat/route.ts`)
3. **RAG Simulation**: Simple keyword-based context retrieval
4. **AI Integration**: Uses Vercel AI SDK with OpenAI

## Troubleshooting

### Chat not responding

- Check that `OPENAI_API_KEY` is set correctly
- Verify your OpenAI account has credits/billing enabled
- Check browser console for errors

### Build errors

- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 18+)
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## Next Steps

- See [GET_STARTED.md](./GET_STARTED.md) for tracing setup
- Check [README.md](./README.md) for general project information
