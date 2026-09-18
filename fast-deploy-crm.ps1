param (
    [switch]$SkipBuild,
    [switch]$SkipWebBuild,
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
    [switch]$InstallDeps
)

# Triển khai Web CRM Platform & Landing trên Port 5000/5001
& "$PSScriptRoot/deploy/vione/fast-deploy.ps1" @PSBoundParameters
