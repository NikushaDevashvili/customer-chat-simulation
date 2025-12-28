# Testing the Full Onboarding Flow

This guide will help you test the complete end-to-end flow with customer-chat.

## Prerequisites

1. **observa-api** backend running on `http://localhost:3000`
2. **observa-app** frontend running on `http://localhost:3001` (optional, for signup UI)
3. **Tinybird** datasource configured and accessible

## Step 1: Start Required Services

### Start observa-api Backend

```bash
cd /Users/nickdevashvili/observa-api
npm run dev
```

Verify it's running:
```bash
curl http://localhost:3000/health
```

### Start observa-app Frontend (Optional)

```bash
cd /Users/nickdevashvili/observa-app
npm run dev
```

This will run on `http://localhost:3001`

## Step 2: Sign Up and Get API Key

### Option A: Via Frontend (Recommended)

1. Open http://localhost:3001 in your browser
2. Fill out the signup form:
   - Email: `test@customer-chat.com`
   - Company Name: `Customer Chat Test`
   - Plan: `free`
3. Click "Sign Up"
4. Copy the API key from the success page

### Option B: Via API Directly

```bash
curl -X POST http://localhost:3000/api/v1/onboarding/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@customer-chat.com",
    "companyName": "Customer Chat Test",
    "plan": "free"
  }'
```

Copy the `apiKey` from the response (it's a JWT token starting with `eyJ`).

## Step 3: Configure customer-chat

Edit `/Users/nickdevashvili/customer-chat/.env.local` and add your API key:

```env
OBSERVA_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Paste your API key here
OBSERVA_API_URL=http://localhost:3000
OBSERVA_ENV=dev
OBSERVA_MODE=development

# Don't forget your OpenAI key!
OPENAI_API_KEY=your-openai-key-here
```

## Step 4: Start customer-chat

```bash
cd /Users/nickdevashvili/customer-chat
npm run dev
```

The app will start on `http://localhost:3002`

## Step 5: Test the Flow

1. Open http://localhost:3002 in your browser
2. Send a test message, e.g., "What is your refund policy?"
3. Wait for the AI response

## Step 6: Verify Traces

### Check observa-api Logs

You should see in the observa-api console:
```
POST /api/v1/traces/ingest
JWT validation successful
Forwarding to Tinybird...
```

### Check Tinybird UI

1. Go to your Tinybird workspace
2. Navigate to the `traces` datasource
3. Query for recent traces:
   ```sql
   SELECT * FROM traces
   ORDER BY timestamp DESC
   LIMIT 10
   ```
4. Verify:
   - Trace has correct `tenant_id` (from your signup)
   - Trace has correct `project_id`
   - All trace fields are populated
   - Query and response are captured

## Troubleshooting

### Traces Not Appearing

1. **Check observa-api is running:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Validate your API key:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/validate \
     -H "Content-Type: application/json" \
     -d '{"token":"YOUR_API_KEY"}'
   ```
   Should return: `{"valid":true,"tenantId":"...","projectId":"..."}`

3. **Check customer-chat logs:**
   Look for any errors in the Next.js console

4. **Check observa-api logs:**
   Look for error messages about JWT validation or Tinybird forwarding

### JWT Validation Fails

- Ensure `JWT_SECRET` in observa-api `.env` matches the one used to sign tokens
- Check API key hasn't expired (default: 90 days)
- Verify API key format (should start with `eyJ`)

### SDK Not Sending Traces

- Verify `OBSERVA_API_KEY` is set in `.env.local`
- Verify `OBSERVA_API_URL` points to `http://localhost:3000`
- Check that observa-api backend is accessible from customer-chat

## Success Criteria

✅ Signup completed via observa-app  
✅ API key received (JWT format)  
✅ customer-chat configured with API key  
✅ Chat message sent successfully  
✅ Trace appears in observa-api logs  
✅ Trace stored in Tinybird with correct tenant_id  
✅ All trace fields populated correctly  

## Next Steps

Once everything is working:
- Test with multiple tenants (sign up multiple accounts)
- Verify tenant isolation (each tenant only sees their own traces)
- Test token revocation endpoint
- Monitor trace ingestion performance

