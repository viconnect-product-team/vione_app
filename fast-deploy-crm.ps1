param (
    [switch]$SkipBuild,
    [switch]$SkipWebBuild,
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
    [switch]$InstallDeps
)

# Wrapper tiện ích gọi trực tiếp kịch bản triển khai riêng trong deploy/ceo1983/
& "$PSScriptRoot/deploy/crm/fast-deploy.ps1" @PSBoundParameters
