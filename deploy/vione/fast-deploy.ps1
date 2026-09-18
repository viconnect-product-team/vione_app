param (
    [switch]$SkipBuild,
    [switch]$SkipWebBuild,
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
    [switch]$InstallDeps
)

# =========================================================================
# Kịch bản triển khai độc lập ViOne Connect CLB CEO 1983 (Hướng 2 - Standalone Compose)
# Tách biệt hoàn toàn khỏi ViOne: Container riêng, Port 5000/5001 riêng, Compose riêng
# =========================================================================

$SERVER_IP   = "14.225.217.232"
$SERVER_USER = "root"
$REMOTE_PATH = "~"

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
                Write-Host "`n[0/5] Build Frontend ViOne Connect (Web) cục bộ với Scope = vione_app..." -ForegroundColor Cyan
                $env:NODE_OPTIONS = "--max-old-space-size=8192"
                $env:VITE_APP_SCOPE = "vione_app"
                $env:VITE_APP_NAME = "ViOne Connect"
                $env:VITE_PUBLIC_APP_URL = "http://14.225.217.232:5000"
                $env:NEST_API_URL = "http://vione-backend:4000"
                
                if ($InstallDeps -or (-not (Test-Path "node_modules"))) {
                    Invoke-CheckedCommand -Description "NPM Install" -Action { npm install }
                } else {
                    Write-Host "  -> Bỏ qua 'npm install' (đã có node_modules). Dùng -InstallDeps nếu muốn tải lại." -ForegroundColor DarkGray
                }

                Invoke-CheckedCommand -Description "Build Web ViOne Connect" -Action { npm run build --prefix apps/vione_app_fe }
            }
        }

        Write-Host "`n[1/5] Khởi tạo quy trình Build Docker Images cho ViOne Connect CEO 1983..." -ForegroundColor Cyan
        if ($buildBE) {
            Invoke-CheckedCommand -Description "Xây dựng Backend Image (vione-backend)" -Action {
                docker build -t vione-backend:latest -f Dockerfile.backend .
            }
        }
        if ($buildFE) {
            Invoke-CheckedCommand -Description "Xây dựng Frontend Image (vione-frontend)" -Action {
                docker build -t vione-frontend:latest -f "$DEPLOY_DIR/Dockerfile.frontend" .
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

        Write-Host "`n[2/5] Xuất và nén Gzip (.tar.gz) Docker Images cho ViOne Connect..." -ForegroundColor Cyan
        if ($buildBE) {
            Invoke-CheckedCommand -Description "Xuất & Nén Backend Image (.tar.gz)" -Action {
                docker save -o vione-backend.tar vione-backend:latest
                Compress-ToGzip -TarPath "vione-backend.tar"
            }
        }
        if ($buildFE) {
            Invoke-CheckedCommand -Description "Xuất & Nén Frontend Image (.tar.gz)" -Action {
                docker save -o vione-frontend.tar vione-frontend:latest
                Compress-ToGzip -TarPath "vione-frontend.tar"
            }
        }
    } else {
        Write-Host "`n[1-2/5] BỎ QUA quy trình Build và đóng gói (SkipBuild)..." -ForegroundColor Yellow
    }

    Write-Host "`n[3/5] Khởi tạo thư mục và đồng bộ tệp tin độc lập lên máy chủ hạ tầng ($SERVER_IP)..." -ForegroundColor Cyan

    Invoke-CheckedCommand -Description "Tạo thư mục ~ trên server" -Action {
        ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p $REMOTE_PATH"
    }

    # Đảm bảo có tệp tin .env cục bộ
    Copy-Item "$DEPLOY_DIR/.env.production" "$DEPLOY_DIR/.env" -Force -ErrorAction SilentlyContinue

    $filesToUpload = @(
        (Resolve-Path "$DEPLOY_DIR/.env.production").Path,
        (Resolve-Path "$DEPLOY_DIR/.env").Path,
        (Resolve-Path "$DEPLOY_DIR/docker-compose.yml").Path
    )
    if (-not $SkipBuild) {
        if ($buildBE -and (Test-Path "vione-backend.tar.gz")) { $filesToUpload += (Resolve-Path "vione-backend.tar.gz").Path }
        if ($buildFE -and (Test-Path "vione-frontend.tar.gz")) { $filesToUpload += (Resolve-Path "vione-frontend.tar.gz").Path }
    }

    $scpArgs = $filesToUpload + "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/"
    Invoke-CheckedCommand -Description "Chuyển giao tệp tin qua SCP vào ~" -Action {
        scp @scpArgs
    }

    Write-Host "`n[4/5] Kích hoạt Docker Compose riêng cho ViOne Connect từ xa thông qua SSH..." -ForegroundColor Cyan

    $remoteLoadCmd = ""
    if ($buildBE -and (Test-Path "vione-backend.tar.gz")) {
        $remoteLoadCmd += "docker load -i vione-backend.tar.gz; rm -f vione-backend.tar.gz; "
    }
    if ($buildFE -and (Test-Path "vione-frontend.tar.gz")) {
        $remoteLoadCmd += "docker load -i vione-frontend.tar.gz; rm -f vione-frontend.tar.gz; "
    }

    $REMOTE_CMD = "cd $REMOTE_PATH; cp -f .env.production .env 2>/dev/null || true; touch .env; sed -i 's/\r//g' .env docker-compose.yml; $remoteLoadCmd docker compose -f docker-compose.yml down --remove-orphans; docker rm -f vione-frontend-prod vione-backend-prod 2>/dev/null || true; docker compose -f docker-compose.yml up -d --force-recreate --remove-orphans"

    Invoke-CheckedCommand -Description "Thực thi cấu trúc container độc lập ViOne Connect" -Action {
        ssh "${SERVER_USER}@${SERVER_IP}" $REMOTE_CMD
    }

    Write-Host "`n[5/5] Dọn dẹp bộ nhớ đệm tạm thời tại máy cục bộ..." -ForegroundColor Cyan
    Remove-Item vione-backend.tar.gz, vione-frontend.tar.gz, vione-backend.tar, vione-frontend.tar -ErrorAction SilentlyContinue

    Write-Host "=================================================================" -ForegroundColor Green
    Write-Host "TRIỂN KHAI WEB CRM PLATFORM VÀ LANDING [PORT 5000] THÀNH CÔNG!" -ForegroundColor Green
    Write-Host "Cổng Frontend Web CRM / Landing : http://${SERVER_IP}:5000 (Đăng nhập: /auth)" -ForegroundColor Yellow
    Write-Host "Cổng Backend API                : http://${SERVER_IP}:5001" -ForegroundColor Yellow
    Write-Host "=================================================================" -ForegroundColor Green
} finally {
    Pop-Location
}
