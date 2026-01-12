# Quick Test Guide

Follow these steps to test the complete onboarding flow.

## Step 1: Add Your API Key

Edit `/Users/nickdevashvili/customer-chat/.env.local` and add your JWT API key:

```env
OBSERVA_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Paste your API key here
OBSERVA_API_URL=http://localhost:3000
OBSERVA_ENV=dev
OBSERVA_MODE=development

# Don't forget your OpenAI key!
OPENAI_API_KEY=your-openai-key-here
```

**Important**: Make sure you have your OpenAI API key set, otherwise the chat won't work!

## Step 2: Verify Services Are Running

### Check observa-api (Port 3000)

```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

If not running, start it:

```bash
cd /Users/nickdevashvili/observa-api
npm run dev
```

## Step 3: Start customer-chat

```bash
cd /Users/nickdevashvili/customer-chat
npm run dev
```

The app will start on **http://localhost:3002**

## Step 4: Test the Chat

1. Open **http://localhost:3002** in your browser
2. Send a test message, e.g.:

   - "What is your refund policy?"
   - "Tell me about pricing"
   - "What is FlightOps?"

3. Wait for the AI response

## Step 5: Verify Traces Are Being Sent

### Check observa-api Console

You should see logs like:

```
POST /api/v1/traces/ingest
JWT validation successful
Forwarding to Tinybird...
```

### Check customer-chat Console

You should see:

```
📊 [OBSERVA] Tracking query with Observa SDK...
✅ [OBSERVA] Tracking complete - data should be sent to Tinybird
```

### Verify in Tinybird UI

1. Go to your Tinybird workspace
2. Navigate to the `traces` datasource
3. Run a query:
   ```sql
   SELECT * FROM traces
   ORDER BY timestamp DESC
   LIMIT 5
   ```
4. You should see your trace with:
   - Correct `tenant_id` (from your signup)
   - Correct `project_id`
   - Your query text
   - AI response
   - All metadata fields

## Troubleshooting

### "Invalid or expired JWT token"

- Check your API key is correctly pasted in `.env.local`
- Make sure there are no extra spaces or quotes
- Verify the API key starts with `eyJ`

### "No traces appearing"

1. Check observa-api is running: `curl http://localhost:3000/health`
2. Check observa-api logs for errors
3. Verify `OBSERVA_API_URL=http://localhost:3000` in `.env.local`

### "OpenAI API error"

- Make sure `OPENAI_API_KEY` is set in `.env.local`
- Check your OpenAI account has credits

### Chat not responding

- Check browser console for errors
- Verify customer-chat is running on port 3002
- Check that observa-api is accessible

## Success Indicators

✅ Chat responds with AI-generated answers  
✅ observa-api logs show trace ingestion  
✅ Trace appears in Tinybird with correct tenant_id  
✅ All trace fields are populated





