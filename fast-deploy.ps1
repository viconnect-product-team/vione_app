param (
    [ValidateSet("all", "both", "ceo1983", "association", "crm", "vione")]
    [string]$Target = "ceo1983",
    [switch]$SkipBuild,
    [switch]$SkipWebBuild,
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
    [switch]$InstallDeps
)

# =========================================================================
# Kịch bản triển khai nhanh linh hoạt (ViOne Monorepo Fast Deploy)
# - Triển khai CẢ HAI (App Hiệp Hội + CRM Landing): .\fast-deploy.ps1 -Target all
# - Triển khai App Hiệp Hội (Port 5002/5003):       .\fast-deploy.ps1 (hoặc .\fast-deploy-association.ps1)
# - Triển khai Web CRM và Landing (Port 5000/5001): .\fast-deploy.ps1 -Target crm (hoặc .\fast-deploy-crm.ps1)
# - Triển khai riêng Frontend:                     .\fast-deploy.ps1 -FrontendOnly
# =========================================================================

$bound = [System.Collections.Generic.Dictionary[string, object]]::new($PSBoundParameters)
[void]$bound.Remove("Target")

if ($Target -in @("all", "both")) {
    Write-Host '=================================================================' -ForegroundColor Magenta
    Write-Host '[BƯỚC 1/2] BẮT ĐẦU TRIỂN KHAI APP HIỆP HỘI CLB CEO 1983 (PORT 5002/5003)...' -ForegroundColor Magenta
    Write-Host '=================================================================' -ForegroundColor Magenta
    & "$PSScriptRoot/deploy/ceo1983/fast-deploy.ps1" @bound

    Write-Host "`n=================================================================" -ForegroundColor Magenta
    Write-Host '[BƯỚC 2/2] BẮT ĐẦU TRIỂN KHAI WEB CRM PLATFORM VÀ LANDING (PORT 5000/5001)...' -ForegroundColor Magenta
    Write-Host '=================================================================' -ForegroundColor Magenta
    & "$PSScriptRoot/deploy/vione/fast-deploy.ps1" @bound

    Write-Host "`n=================================================================" -ForegroundColor Green
    Write-Host 'HOÀN TẤT TRIỂN KHAI TOÀN DIỆN CẢ 2 PHÂN HỆ LÊN DEV SERVER THÀNH CÔNG!' -ForegroundColor Green
    Write-Host '1. Web CRM Platform và Landing: http://14.225.217.232:5000 (Đăng nhập: http://14.225.217.232:5000/auth)' -ForegroundColor Yellow
    Write-Host '2. App Hiệp Hội CLB CEO 1983  : http://14.225.217.232:5002 (Truy cập:  http://14.225.217.232:5002/association)' -ForegroundColor Yellow
    Write-Host '=================================================================' -ForegroundColor Green
} elseif ($Target -in @("crm", "vione")) {
    & "$PSScriptRoot/deploy/vione/fast-deploy.ps1" @bound
} else {
    & "$PSScriptRoot/deploy/ceo1983/fast-deploy.ps1" @bound
}
