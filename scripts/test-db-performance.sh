#!/bin/bash

echo "Testing Database Performance..."

# Test health endpoint
echo "\nTesting health endpoint..."
curl -s http://localhost:3000/health | jq '.'

# Test database performance
echo "\nTesting database performance..."
curl -s http://localhost:3000/test/db-test | jq '.'

# Run load test
echo "\nRunning load test..."
ab -n 100 -c 10 http://localhost:3000/test/db-test

echo "\nTest completed. Check the logs for detailed performance metrics." 