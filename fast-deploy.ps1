param (
    [switch]$SkipBuild
)

# =========================================================================
# Kich ban trien khai tu dong hoa thong qua tep tin luu tru dang Tarball
# Phu hop cho moi truong trien khai mang noi bo co lap / Bao mat cao
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
        throw "Loi: Tien trinh [$Description] that bai voi ma loi $LASTEXITCODE"
    }
}

if (-not $SkipBuild) {
    Write-Host "`n[0/6] Build Frontend (Web) cuc bo tren Windows de tranh loi tran RAM (OOM) trong Docker..." -ForegroundColor Cyan
    $env:NODE_OPTIONS="--max-old-space-size=8192"
    Invoke-CheckedCommand -Description "NPM Install" -Action { npm install }
    Invoke-CheckedCommand -Description "Build Web App" -Action { npx turbo run build --filter=@vibe/vione_app_fe }

    Write-Host "`n[1/6] Khoi tao quy trinh Build Docker Images tieu chuan..." -ForegroundColor Cyan
    Invoke-CheckedCommand -Description "Xay dung Backend Image (vione_app)" -Action {
        docker build -t vione-backend:latest -f Dockerfile.backend .
    }
    Invoke-CheckedCommand -Description "Xay dung Frontend Image (vione_app)" -Action {
        docker build -t vione-frontend:latest -f Dockerfile.frontend .
    }

    Write-Host "`n[2/6] Tien hanh nen xuat du lieu he thong dong goi thanh .tar..." -ForegroundColor Cyan
    Invoke-CheckedCommand -Description "Nen luu tru Backend va Frontend" -Action {
        docker save -o backend.tar vione-backend:latest
        docker save -o frontend.tar vione-frontend:latest
    }
} else {
    Write-Host "`n[1-2/6] BO QUA quy trinh Build va dong goi (SkipBuild). Su dung tep .tar co san..." -ForegroundColor Yellow
}

Write-Host "`n[3/6] Dong bo va chuyen giao tep tin len may chu ha tang ($SERVER_IP)..." -ForegroundColor Cyan

if ($SkipBuild) {
    Invoke-CheckedCommand -Description "Chuyen giao config qua SCP (chi config, khong co tar)" -Action {
        scp .env.production docker-compose.clean.yml "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/"
    }

    Write-Host "`n[4/6] Khoi dong lai container voi config moi (khong tai lai image)..." -ForegroundColor Cyan
    $REMOTE_CMD = "cd $REMOTE_PATH; mv docker-compose.clean.yml docker-compose.yml; mv .env.production .env; sed -i 's/\r//g' .env docker-compose.yml; docker compose down --remove-orphans; docker rm -f app_backend_prod app_frontend_prod vione-backend-prod vione-frontend-prod 2>/dev/null || true; docker compose up -d --force-recreate --remove-orphans"
    Invoke-CheckedCommand -Description "Khoi dong lai container tu xa" -Action {
        ssh "${SERVER_USER}@${SERVER_IP}" $REMOTE_CMD
    }
} else {
    Invoke-CheckedCommand -Description "Chuyen giao tep tin qua cong mang bao mat SCP" -Action {
        scp backend.tar frontend.tar .env.production docker-compose.clean.yml "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/"
    }

    Write-Host "`n[4/6] Kich hoat lenh giai nen va khoi tao dich vu tu xa thong qua SSH..." -ForegroundColor Cyan
    $REMOTE_CMD = "cd $REMOTE_PATH; mv docker-compose.clean.yml docker-compose.yml; mv .env.production .env; sed -i 's/\r//g' .env docker-compose.yml; docker load -i backend.tar; docker load -i frontend.tar; docker compose down --remove-orphans; docker rm -f app_backend_prod app_frontend_prod vione-backend-prod vione-frontend-prod 2>/dev/null || true; docker compose up -d --force-recreate --remove-orphans; rm backend.tar frontend.tar"
    Invoke-CheckedCommand -Description "Thuc thi cau truc container tu xa" -Action {
        ssh "${SERVER_USER}@${SERVER_IP}" $REMOTE_CMD
    }
}

Write-Host "`n[5/6] Tien hanh don dep bo nho dem tam thoi tai may cuc bo..." -ForegroundColor Cyan
Remove-Item backend.tar -ErrorAction SilentlyContinue
Remove-Item frontend.tar -ErrorAction SilentlyContinue

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "TIEN TRINH DONG GOI VA TRIEN KHAI SAN PHAM HOAN TAT!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
