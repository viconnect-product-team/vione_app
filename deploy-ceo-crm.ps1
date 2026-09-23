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

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 > $null

Write-Host "=================================================================" -ForegroundColor Magenta
Write-Host ">>> TRIEN KHAI DOC LAP: CRM QUAN TRI HIEP HOI CLB CEO 1983 <<<" -ForegroundColor Magenta
Write-Host "=================================================================" -ForegroundColor Magenta

$bound = [System.Collections.Generic.Dictionary[string, object]]::new($PSBoundParameters)
[void]$bound.Remove("NoHttps")
$bound["EnableHttps"] = $EnableHttps

& "$PSScriptRoot/deploy/crm/fast-deploy.ps1" @bound

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host "TRIEN KHAI CRM HIEP HOI CEO 1983 THANH CONG!" -ForegroundColor Green
Write-Host "1. Web CRM Hiệp Hội (HTTPS)     : https://14.225.217.232:5443" -ForegroundColor Yellow
Write-Host "2. Landing CEO 1983 V1 (HTTPS)  : https://14.225.217.232:5443/landing/ceo/v1" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Green
