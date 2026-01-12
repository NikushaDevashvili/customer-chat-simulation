# Get Started with Tracing

This guide walks you through ingesting your first trace. If you're looking to understand what tracing is and why it matters, check out the [Observability Overview](https://langfuse.com/docs/observability/overview) first.

## Get API keys

1. Create an account or set up your observability service
2. Create new API credentials in the project settings
3. Copy your API key

## Ingest your first trace

This project uses the **Vercel AI SDK**. The integration automatically records your model calls.

### Step 1: Install dependencies

The project already includes the necessary dependencies. If you need to install them:

```bash
npm install
```

### Step 2: Set environment variables

Create a `.env.local` file in the root directory and add your credentials:

```env
# Observability API credentials
OBSERVA_API_KEY=your-api-key-here
OBSERVA_API_URL=https://your-api-url.com
OBSERVA_ENV=prod

# OpenAI API key (required for chat functionality)
OPENAI_API_KEY=your-openai-key-here
```

### Step 3: Run the application

Start the development server:

```bash
npm run dev
```

The app will start on **http://localhost:3002**

### Step 4: Test the chat

1. Open **http://localhost:3002** in your browser
2. Send a test message, for example:
   - "What is your refund policy?"
   - "Tell me about pricing"
   - "What is FlightOps?"
3. Wait for the AI response

## See your trace

After running your application and sending a message, visit your observability dashboard to view the trace you just created.

Each trace includes:
- The user's query
- The retrieved context (RAG simulation)
- The AI model response
- Metadata about the conversation

## Not seeing what you expected?

### I have setup tracing, but I do not see any traces in the dashboard

1. **Check your API key**: Verify that `OBSERVA_API_KEY` is correctly set in `.env.local`
2. **Check the API URL**: Ensure `OBSERVA_API_URL` points to the correct endpoint
3. **Check the console**: Look for error messages in your terminal or browser console
4. **Verify the service is running**: Make sure your observability backend is accessible

### Why are the input and output of a trace empty?

- Ensure the chat is actually sending messages (check network tab in browser dev tools)
- Verify that the API route is being called correctly
- Check that the OpenAI API key is valid and has sufficient credits

## Next steps

Now that you've ingested your first trace, you can start adding more functionality:

- **Group traces into sessions** for multi-turn conversations
- **Split traces into environments** for different stages (dev, staging, prod)
- **Add metadata** to your traces so you can filter them in the future
- **Track costs and tokens** for each conversation

## How it works

The current implementation:

1. **Receives messages** from the chat interface via the `/api/chat` route
2. **Retrieves context** using a simulated RAG system (keyword matching)
3. **Calls the AI model** using Vercel AI SDK's `streamText` function
4. **Streams the response** back to the client

The tracing integration captures all of this automatically without requiring changes to your business logic.
