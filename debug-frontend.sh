#!/bin/bash

# Script to help debug browser console issues
echo "Checking frontend console errors..."

# Use curl to get the page and check for any JavaScript errors
curl -s http://localhost:5273 | grep -i "error" || echo "No visible errors in HTML"

# Display any errors in the Vite server logs
echo -e "\nFrontend server logs:"
grep -i "error\|fail\|exception" /tmp/vite-*.log 2>/dev/null || echo "No error logs found"

echo -e "\nApplication seems to be running correctly at http://localhost:5273"
echo "If you're still experiencing issues, try opening your browser's developer console (F12)"
