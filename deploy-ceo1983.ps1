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

# Thiet lap ma hoa UTF-8 cho console de khong bi loi font tieng Viet tren PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 > $null

# =========================================================================
# LENH DOC LAP: TRIEN KHAI APP HIEP HOI CLB DOANH NHAN CEO 1983 (PORT 5444)
# =========================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ">>> BAT DAU TRIEN KHAI DOC LAP: APP HIEP HOI CLB CEO 1983 <<<" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$bound = [System.Collections.Generic.Dictionary[string, object]]::new($PSBoundParameters)
[void]$bound.Remove("NoHttps")
$bound["EnableHttps"] = $EnableHttps

# 1. Goi truc tiep bo deploy cua CEO 1983 (da bao gom Nginx SSL Reverse Proxy khi bat EnableHttps)
& "$PSScriptRoot/deploy/ceo1983/fast-deploy.ps1" @bound

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host "TRIEN KHAI APP HIEP HOI CLB CEO 1983 THANH CONG!" -ForegroundColor Green
Write-Host "1. App Hiep Hoi (HTTPS)               : https://14.225.217.232:5444" -ForegroundColor Yellow
Write-Host "2. Ten Mien Ho Tro PWA Mobile iOS/App : https://dev-app.14-225-217-232.sslip.io:5444/association" -ForegroundColor Yellow
Write-Host "(Luu y: He thong chay che do bao mat 100% HTTPS)" -ForegroundColor DarkGray
Write-Host "=================================================================" -ForegroundColor Green
