param (
    [switch]$SkipBuild,
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
    [switch]$InstallDeps
)

# =========================================================================
# Kịch bản triển khai siêu tốc (Ultra Fast Deploy) tối ưu hóa nén Gzip & Caching
# Giảm thời gian SCP upload từ 15 phút xuống ~1-2 phút nhờ nén .tar.gz & tách luồng
# =========================================================================

$SERVER_IP   = "14.225.217.232"
$SERVER_USER = "root"
$REMOTE_PATH = "~"

$ErrorActionPreference = "Stop"

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory = $true)] [string]$Description,
        [Parameter(Mandatory = $true)] [scriptblock]$Action
    )
    & $Action
    if ($LASTEXITCODE -ne 0) {
        throw "Lỗi: Tiến trình [$Description] thất bại với mã lỗi $LASTEXITCODE"
    }
}

$buildFE = -not $BackendOnly
$buildBE = -not $FrontendOnly

if (-not $SkipBuild) {
    if ($buildFE) {
        Write-Host "`n[0/5] Build Frontend (Web) cục bộ..." -ForegroundColor Cyan
        $env:NODE_OPTIONS="--max-old-space-size=8192"
        
        # Chỉ chạy npm install nếu yêu cầu hoặc chưa có node_modules
        if ($InstallDeps -or (-not (Test-Path "node_modules"))) {
            Invoke-CheckedCommand -Description "NPM Install" -Action { npm install }
        } else {
            Write-Host "  -> Bỏ qua 'npm install' (đã có node_modules). Dùng -InstallDeps nếu muốn tải lại." -ForegroundColor DarkGray
        }

        Invoke-CheckedCommand -Description "Build Web App" -Action { npx turbo run build --filter=@vibe/vione_app_fe }
    }

    Write-Host "`n[1/5] Khởi tạo quy trình Build Docker Images..." -ForegroundColor Cyan
    if ($buildBE) {
        Invoke-CheckedCommand -Description "Xây dựng Backend Image (vione_app)" -Action {
            docker build -t vione-backend:latest -f Dockerfile.backend .
        }
    }
    if ($buildFE) {
        Invoke-CheckedCommand -Description "Xây dựng Frontend Image (vione_app)" -Action {
            docker build -t vione-frontend:latest -f Dockerfile.frontend .
        }
    }

function Compress-ToGzip {
    param(
        [Parameter(Mandatory = $true)] [string]$TarPath
    )
    $gzipCmd = Get-Command gzip -ErrorAction SilentlyContinue
    $gzipPath = $null
    if ($gzipCmd) {
        $gzipPath = $gzipCmd.Source
    } else {
        $gitCandidates = @(
            "C:\Program Files\Git\usr\bin\gzip.exe",
            "C:\Program Files (x86)\Git\usr\bin\gzip.exe",
            "$env:LOCALAPPDATA\Programs\Git\usr\bin\gzip.exe"
        )
        foreach ($c in $gitCandidates) {
            if (Test-Path $c) {
                $gzipPath = $c
                break
            }
        }
    }

    if ($gzipPath) {
        & $gzipPath -1 -f $TarPath
    } else {
        $outGz = "$TarPath.gz"
        node -e "const fs = require('fs'); const zlib = require('zlib'); fs.createReadStream(process.argv[1]).pipe(zlib.createGzip({ level: 1 })).pipe(fs.createWriteStream(process.argv[2])).on('finish', () => fs.unlinkSync(process.argv[1]));" $TarPath $outGz
    }
}

Write-Host "`n[2/5] Xuất và nén Gzip (.tar.gz) Docker Images để tối ưu tốc độ truyền tải..." -ForegroundColor Cyan
if ($buildBE) {
    Invoke-CheckedCommand -Description "Xuất & Nén Backend Image (.tar.gz)" -Action {
        docker save -o backend.tar vione-backend:latest
        Compress-ToGzip -TarPath "backend.tar"
    }
}
if ($buildFE) {
    Invoke-CheckedCommand -Description "Xuất & Nén Frontend Image (.tar.gz)" -Action {
        docker save -o frontend.tar vione-frontend:latest
        Compress-ToGzip -TarPath "frontend.tar"
    }
}
} else {
    Write-Host "`n[1-2/5] BỎ QUA quy trình Build và đóng gói (SkipBuild)..." -ForegroundColor Yellow
}

Write-Host "`n[3/5] Đồng bộ và chuyển giao tệp tin lên máy chủ hạ tầng ($SERVER_IP)..." -ForegroundColor Cyan

$filesToUpload = @(".env.production", "docker-compose.clean.yml")
if (-not $SkipBuild) {
    if ($buildBE -and (Test-Path "backend.tar.gz")) { $filesToUpload += "backend.tar.gz" }
    if ($buildFE -and (Test-Path "frontend.tar.gz")) { $filesToUpload += "frontend.tar.gz" }
}

$scpArgs = $filesToUpload + "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/"
Invoke-CheckedCommand -Description "Chuyển giao tệp tin qua SCP" -Action {
    scp @scpArgs
}

Write-Host "`n[4/5] Kích hoạt lệnh giải nén và khởi tạo dịch vụ từ xa thông qua SSH..." -ForegroundColor Cyan

$remoteLoadCmd = ""
if ($buildBE -and (Test-Path "backend.tar.gz")) {
    $remoteLoadCmd += "docker load -i backend.tar.gz; rm -f backend.tar.gz; "
}
if ($buildFE -and (Test-Path "frontend.tar.gz")) {
    $remoteLoadCmd += "docker load -i frontend.tar.gz; rm -f frontend.tar.gz; "
}

$REMOTE_CMD = "cd $REMOTE_PATH; mv docker-compose.clean.yml docker-compose.yml; mv .env.production .env; sed -i 's/\r//g' .env docker-compose.yml; $remoteLoadCmd docker compose down --remove-orphans; docker rm -f app_backend_prod app_frontend_prod vione-backend-prod vione-frontend-prod 2>/dev/null || true; docker compose up -d --force-recreate --remove-orphans"

Invoke-CheckedCommand -Description "Thực thi cấu trúc container từ xa" -Action {
    ssh "${SERVER_USER}@${SERVER_IP}" $REMOTE_CMD
}

Write-Host "`n[5/5] Tiến hành dọn dẹp bộ nhớ đệm tạm thời tại máy cục bộ..." -ForegroundColor Cyan
Remove-Item backend.tar.gz, frontend.tar.gz, backend.tar, frontend.tar -ErrorAction SilentlyContinue

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "TIẾN TRÌNH ĐÓNG GÓI VÀ TRIỂN KHAI SIÊU TỐC HOÀN TẤT!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

