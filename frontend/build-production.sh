#!/bin/bash

# Script để build frontend với production backend URL
# Chạy sau khi backend đã deploy xong

# 1. Set backend URL (THAY ĐỔI URL này sau khi có từ Render)
export VITE_API_URL="https://graph-visualizer-api.onrender.com"

# 2. Build frontend
echo "Building frontend with API URL: $VITE_API_URL"
cd /Users/nina/Desktop/Thường_document/CTRR_FINAL/frontend
npm run build

# 3. Thông báo
echo ""
echo "✅ Build complete!"
echo "📁 Output folder: dist/"
echo ""
echo "📌 NEXT STEPS:"
echo "1. Copy URL từ Render dashboard"
echo "2. Update VITE_API_URL trong script này"
echo "3. Chạy lại script: ./build-production.sh"
echo "4. Deploy folder dist/ lên GitHub Pages"
