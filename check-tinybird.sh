#!/bin/bash
# Quick script to check if data is in Tinybird

echo "🔍 Checking Tinybird for recent traces..."
echo ""
echo "Query: SELECT timestamp, trace_id, query FROM traces WHERE tenant_id='demo' AND project_id='airlines-chat' ORDER BY timestamp DESC LIMIT 5"
echo ""

tb sql "SELECT timestamp, trace_id, query, LEFT(response, 100) as response_preview FROM traces WHERE tenant_id='demo' AND project_id='airlines-chat' ORDER BY timestamp DESC LIMIT 5"

echo ""
echo "---"
echo "💡 If you see 'No rows', the SDK is in development mode (only logs, doesn't send to Tinybird)"
echo "💡 To actually send data, set OBSERVA_MODE=production in .env.local"

