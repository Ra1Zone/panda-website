#!/bin/bash
set -e

DEPLOY_DIR="deploy-package"

echo "=== Creating deployment package ==="

rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy everything except node_modules, .next, .git, .claude, deploy-package
rsync -a \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.claude' \
  --exclude='deploy-package' \
  --exclude='deploy.sh' \
  --exclude='prisma/dev.db' \
  --exclude='prisma/dev.db-journal' \
  ./ "$DEPLOY_DIR/"

# Copy the built .next directory
cp -r .next "$DEPLOY_DIR/.next"

# Copy the production env as .env
cp .env.production "$DEPLOY_DIR/.env"

# Ensure uploads directory exists
mkdir -p "$DEPLOY_DIR/public/uploads"
touch "$DEPLOY_DIR/public/uploads/.gitkeep"

echo ""
echo "=== Deployment package created ==="
du -sh "$DEPLOY_DIR"
echo ""
echo "=== Upload instructions ==="
echo ""
echo "1. Zip the deploy-package folder:"
echo "   cd deploy-package && zip -r ../panda-website.zip . && cd .."
echo ""
echo "2. Upload panda-website.zip to cPanel File Manager"
echo "   Extract it into your Node.js app directory"
echo ""
echo "3. In cPanel > Setup Node.js App:"
echo "   - Node.js version: 18+ (20 preferred)"
echo "   - Application mode: Production"
echo "   - Application root: your app directory"
echo "   - Application startup file: server.js"
echo ""
echo "4. SSH into the server and run:"
echo "   cd /path/to/your/app"
echo "   npm install"
echo "   npx prisma generate"
echo "   npx prisma db push"
echo "   npm run db:seed"
echo ""
echo "5. Restart the app from cPanel"
