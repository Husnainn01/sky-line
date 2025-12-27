#!/bin/bash

# Clean Next.js cache script
echo "Cleaning Next.js cache and build artifacts..."

# Remove Next.js cache and build directories
rm -rf .next
rm -rf node_modules/.cache

echo "Next.js cache cleaned successfully!"
echo "Please run 'npm run dev' to start the development server with a fresh cache."
