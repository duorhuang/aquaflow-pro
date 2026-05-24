#!/bin/bash

echo "🚀 AquaFlow Pro: Final Force Deployment Protocol"
echo "------------------------------------------------"

export PATH="/opt/homebrew/bin:$PATH"

# 1. Path Verification
CURRENT_DIR=$(basename "$PWD")
if [ "$CURRENT_DIR" != "aquaflow-pro" ]; then
    if [ -d "aquaflow-pro" ]; then
        cd aquaflow-pro
        echo "✅ Moved into aquaflow-pro directory."
    else
        echo "❌ Error: Could not find 'aquaflow-pro' folder. Please run this from the project root."
        exit 1
    fi
fi

# 2. Process Cleanup (Killing zombie Next/Prisma processes)
echo "🧹 Cleaning up background processes..."
# Killing anything on ports 3000 or similar, and any 'next-router-worker'
pkill -f "next-router-worker" || true
pkill -f "next-build" || true
pkill -f "prisma" || true

# 3. Cache Clearing
echo "🗑️ Wiping build caches (fast rename)..."
mv .next .next-old-$$ 2>/dev/null || true
mv .open-next .open-next-old-$$ 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# 4. Prisma Hardening
echo "💎 Re-generating Prisma Client (Force)..."
export XDG_CACHE_HOME="$PWD/.xdg-cache"
mkdir -p "$XDG_CACHE_HOME"
npx prisma generate

# 5. Build & Deploy
echo "🏗️ Starting Production Build & Cloudflare Deployment..."
export NEXT_PUBLIC_DEPLOY_VERSION="V12-STRATOSPHERE-RECOVERY"

npm run deploy

echo "------------------------------------------------"
echo "✅ Protocol Complete. Please check the URL above."
