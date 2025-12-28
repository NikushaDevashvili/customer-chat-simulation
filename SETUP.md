# Simple Setup Guide for Customers

## Quick Start (2 Steps!)

### 1. Install the SDK

```bash
npm install observa-sdk
```

### 2. Initialize in your code (one-time setup)

```typescript
import { init } from "observa-sdk";

const observa = init({
  apiKey: "your-observa-api-key", // Get this from Observa dashboard
  tenantId: "your-tenant-id",
  projectId: "your-project-id",
  // That's it! SDK handles everything else automatically
});
```

## That's it! 🎉

The SDK will:

- ✅ Send data to Observa's Tinybird instance automatically
- ✅ Work in dev mode (beautiful logs)
- ✅ Send to Observa's backend in production mode
- ✅ **No Tinybird configuration needed** - SDK handles it all!

## Optional: Local Development Override

**Only for Observa team internal testing:**
If you need to test against a local Tinybird instance, add to `.env.local`:

```bash
TB_HOST=http://localhost:7181
TB_TOKEN=your-local-token
```

**Customers don't need this** - SDK uses Observa's production instance by default.

## Usage Example

```typescript
const response = await observa.track(
  {
    query: userQuery,
    context: context,
    model: "gpt-4o-mini",
  },
  async () => {
    // Your AI call here
    return await streamText({ ... });
  }
);
```

No Tinybird code needed - it just works! 🎉
