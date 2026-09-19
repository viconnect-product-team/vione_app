param (
    [switch]$SkipBuild,
    [switch]$SkipWebBuild,
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
    [switch]$InstallDeps,
    [switch]$EnableHttps = $true,
    [switch]$NoHttps
)

if ($NoHttps) { $EnableHttps = $false }

# =========================================================================
# Kịch bản triển khai độc lập App Hiệp Hội CLB CEO 1983 (Hướng 2 - Standalone Compose)
# Tách biệt hoàn toàn khỏi ViOne: Container riêng, Port 5002/5003 riêng, Compose riêng
# =========================================================================

$SERVER_IP   = "14.225.217.232"
$SERVER_USER = "root"
$REMOTE_PATH = "~/association"

$DEPLOY_DIR = $PSScriptRoot
$ROOT_DIR   = (Resolve-Path "$PSScriptRoot/../..").Path

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

Push-Location $ROOT_DIR
try {
    if (-not $SkipBuild) {
        if ($buildFE) {
            if ($SkipWebBuild) {
                Write-Host "`n[0/5] Bỏ qua Build Frontend (Web) cục bộ (-SkipWebBuild)..." -ForegroundColor Yellow
            } else {
                Write-Host "`n[0/5] Build Frontend Hiệp Hội (Web) cục bộ với Scope = association_app..." -ForegroundColor Cyan
                $env:NODE_OPTIONS = "--max-old-space-size=4096"
                $env:VITE_APP_SCOPE = "association_app"
                $env:VITE_APP_NAME = "CLB Doanh Nhân CEO 1983"
                if ($EnableHttps) {
                    $env:VITE_PUBLIC_APP_URL = "https://14.225.217.232:5444"
                } else {
                    $env:VITE_PUBLIC_APP_URL = "http://14.225.217.232:5002"
                }
                $env:NEST_API_URL = "http://ceo1983-backend:4000"
                
                if ($InstallDeps -or (-not (Test-Path "node_modules"))) {
                    Invoke-CheckedCommand -Description "NPM Install" -Action { npm install }
                } else {
                    Write-Host "  -> Bỏ qua 'npm install' (đã có node_modules). Dùng -InstallDeps nếu muốn tải lại." -ForegroundColor DarkGray
                }

                Invoke-CheckedCommand -Description "Build Web App Hiệp Hội" -Action { npm run build --prefix apps/vione_app_fe }
            }
        }

        Write-Host "`n[1/5] Khởi tạo quy trình Build Docker Images cho App Hiệp Hội CEO 1983..." -ForegroundColor Cyan
        if ($buildBE) {
            Invoke-CheckedCommand -Description "Xây dựng Backend Image (ceo1983-backend)" -Action {
                docker build -t ceo1983-backend:latest -f Dockerfile.backend .
            }
        }
        if ($buildFE) {
            Invoke-CheckedCommand -Description "Xây dựng Frontend Image (ceo1983-frontend)" -Action {
                docker build -t ceo1983-frontend:latest -f "$DEPLOY_DIR/Dockerfile.frontend" .
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
                $nodeCompress = 'const fs = require("fs"); const zlib = require("zlib"); fs.createReadStream(process.argv[1]).pipe(zlib.createGzip({ level: 1 })).pipe(fs.createWriteStream(process.argv[2])).on("finish", () => fs.unlinkSync(process.argv[1]));'
                node -e $nodeCompress $TarPath $outGz
            }
        }

        Write-Host "`n[2/5] Xuất và nén Gzip (.tar.gz) Docker Images cho Hiệp Hội..." -ForegroundColor Cyan
        if ($buildBE) {
            Invoke-CheckedCommand -Description "Xuất & Nén Backend Image (.tar.gz)" -Action {
                docker save -o ceo1983-backend.tar ceo1983-backend:latest
                Compress-ToGzip -TarPath "ceo1983-backend.tar"
            }
        }
        if ($buildFE) {
            Invoke-CheckedCommand -Description "Xuất & Nén Frontend Image (.tar.gz)" -Action {
                docker save -o ceo1983-frontend.tar ceo1983-frontend:latest
                Compress-ToGzip -TarPath "ceo1983-frontend.tar"
            }
        }
    } else {
        Write-Host "`n[1-2/5] BỎ QUA quy trình Build và đóng gói (SkipBuild)..." -ForegroundColor Yellow
    }

    Write-Host "`n[3/5] Khởi tạo thư mục và đồng bộ tệp tin độc lập lên máy chủ hạ tầng ($SERVER_IP)..." -ForegroundColor Cyan

    Invoke-CheckedCommand -Description "Tạo thư mục ~/association trên server" -Action {
        ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p $REMOTE_PATH"
    }

    $filesToUpload = @(
        (Resolve-Path "$DEPLOY_DIR/.env.production").Path,
        (Resolve-Path "$DEPLOY_DIR/docker-compose.yml").Path
    )
    if (-not $SkipBuild) {
        if ($buildBE -and (Test-Path "ceo1983-backend.tar.gz")) { $filesToUpload += (Resolve-Path "ceo1983-backend.tar.gz").Path }
        if ($buildFE -and (Test-Path "ceo1983-frontend.tar.gz")) { $filesToUpload += (Resolve-Path "ceo1983-frontend.tar.gz").Path }
    }

    $scpArgs = $filesToUpload + "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/"
    Invoke-CheckedCommand -Description "Chuyển giao tệp tin qua SCP vào ~/association" -Action {
        scp @scpArgs
    }

    Write-Host "`n[4/5] Kích hoạt Docker Compose riêng cho Hiệp Hội từ xa thông qua SSH..." -ForegroundColor Cyan

    $remoteLoadCmd = ""
    if ($buildBE -and (Test-Path "ceo1983-backend.tar.gz")) {
        $remoteLoadCmd += "docker load -i ceo1983-backend.tar.gz; rm -f ceo1983-backend.tar.gz; "
    }
    if ($buildFE -and (Test-Path "ceo1983-frontend.tar.gz")) {
        $remoteLoadCmd += "docker load -i ceo1983-frontend.tar.gz; rm -f ceo1983-frontend.tar.gz; "
    }

    $REMOTE_CMD = "cd $REMOTE_PATH; mv -f .env.production .env.association 2>/dev/null || true; sed -i 's/\r//g' .env.association docker-compose.yml; docker network create vione-network 2>/dev/null || true; $remoteLoadCmd docker compose -f docker-compose.yml down --remove-orphans; docker rm -f ceo1983-frontend-prod ceo1983-backend-prod 2>/dev/null || true; docker compose -f docker-compose.yml up -d --force-recreate --remove-orphans"

    Invoke-CheckedCommand -Description "Thực thi cấu trúc container độc lập Hiệp Hội" -Action {
        ssh "${SERVER_USER}@${SERVER_IP}" $REMOTE_CMD
    }

    Write-Host "`n[5/5] Dọn dẹp bộ nhớ đệm tạm thời tại máy cục bộ..." -ForegroundColor Cyan
    Remove-Item ceo1983-backend.tar.gz, ceo1983-frontend.tar.gz, ceo1983-backend.tar, ceo1983-frontend.tar -ErrorAction SilentlyContinue

    if ($EnableHttps) {
        Write-Host "`n[BỔ SUNG] Đồng bộ Nginx Reverse Proxy SSL / HTTPS..." -ForegroundColor Magenta
        & "$DEPLOY_DIR/../ssl/deploy-ssl.ps1"
    }

    Write-Host "=================================================================" -ForegroundColor Green
    Write-Host "TRIỂN KHAI ĐỘC LẬP APP HIỆP HỘI CLB CEO 1983 [HUONG 2] THÀNH CÔNG!" -ForegroundColor Green
    if ($EnableHttps) {
        Write-Host "Cổng Frontend Hiệp Hội (HTTPS): https://${SERVER_IP}:5444 (hoặc https://dev-app.14-225-217-232.sslip.io:5444/association)" -ForegroundColor Yellow
        Write-Host "Cổng Frontend Hiệp Hội (Cổng 443): https://${SERVER_IP}/association" -ForegroundColor Yellow
        Write-Host "Cổng Frontend Hiệp Hội (HTTP) : http://${SERVER_IP}:5002" -ForegroundColor DarkGray
    } else {
        Write-Host "Cổng Frontend Hiệp Hội : http://${SERVER_IP}:5002" -ForegroundColor Yellow
    }
    Write-Host "Cổng Backend Hiệp Hội  : http://${SERVER_IP}:5003" -ForegroundColor Yellow
    Write-Host "=================================================================" -ForegroundColor Green
} finally {
    Pop-Location
}
