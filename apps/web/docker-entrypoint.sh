#!/bin/sh
set -e

echo "🚀 Kích hoạt tiến trình Entrypoint kiểm soát vòng đời dịch vụ..."

# Dự án uniBussiness Connect dùng Supabase, không cần chạy Prisma migrate hay Seed.
echo "🟢 Môi trường sẵn sàng. Khởi động ứng dụng SSR (Nitro)..."
exec node .output/server/index.mjs
