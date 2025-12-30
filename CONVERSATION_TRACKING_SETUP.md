# Conversation Tracking Setup Guide

## Overview

The customer-chat app now supports full conversation tracking with Observa. You can:
1. Configure your Observa API key in the app
2. Chat with the AI
3. View all conversations in the Observa dashboard

## Setup Steps

### 1. Get Your API Key

1. Go to https://observa-app.vercel.app
2. Sign up or login
3. After login, you'll receive an API key (JWT token)
4. Copy this API key

### 2. Configure in Customer Chat

1. Open the customer-chat app
2. Click the **⚙️ Settings** button (top right)
3. Paste your API key
4. Click **Save**

The app will automatically:
- Generate a unique conversation ID
- Generate a session ID
- Generate a user ID
- Start tracking message index

### 3. Start Chatting

1. Type a message in the chat
2. Send it
3. Each message is automatically tracked with:
   - Conversation ID (groups all messages in this conversation)
   - Session ID (browser session)
   - User ID (your user identifier)
   - Message Index (1, 2, 3...)

### 4. View in Observa Dashboard

1. Click the **"View in Observa Dashboard →"** link at the bottom of the chat
2. Or go to: https://observa-app.vercel.app/dashboard/conversations
3. Find your conversation by ID
4. Click **"View →"** to see the full conversation thread

## Features

- **Conversation Tracking**: All messages in a conversation are grouped together
- **Message Indexing**: Messages are numbered (1, 2, 3...) for easy reference
- **Real-time Updates**: New messages appear in the dashboard after analysis completes
- **Full Context**: See query, context, response, and analysis for each message
- **Analytics**: View conversation-level metrics (total messages, tokens, cost, issue rates)

## Testing

1. **Send multiple messages** in the same conversation
2. **Check the dashboard** - you should see:
   - Conversation with correct message count
   - All messages in order
   - Analysis results for each message
3. **Verify analytics** - check that:
   - Total tokens = sum of individual message tokens
   - Message count matches number of messages sent
   - Cost is calculated correctly

## Troubleshooting

### API Key Not Working
- Verify the API key is correct (starts with `eyJ...`)
- Check that you're logged into the correct account
- Try logging out and back in to get a fresh API key

### Conversations Not Appearing
- Wait 30-60 seconds for analysis to complete
- Check that the API key is saved (look for "Observa Connected" indicator)
- Verify the conversation ID is shown at the bottom of the chat

### Messages Not Grouped
- Ensure you're using the same conversation ID
- Check that messageIndex is incrementing (shown at bottom of chat)
- Verify localStorage has the conversation ID saved

## Next Steps

After testing, you can:
1. Deploy customer-chat to production
2. Share the app with users
3. Monitor all conversations in the Observa dashboard
4. Analyze conversation patterns and issues

