param (
    [ValidateSet("ceo1983", "association", "vione")]
    [string]$Target = "ceo1983",
    [switch]$SkipBuild,
    [switch]$SkipWebBuild,
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
    [switch]$InstallDeps
)

# =========================================================================
# Kịch bản triển khai nhanh linh hoạt (ViOne Monorepo Fast Deploy)
# - Mặc định triển khai CLB CEO 1983 (Port 5002/5003): .\fast-deploy.ps1
# - Triển khai ViOne Connect (Port 5000/5001): .\fast-deploy.ps1 -Target vione
# - Triển khai riêng Frontend: .\fast-deploy.ps1 -FrontendOnly
# =========================================================================

$targetScript = if ($Target -eq "vione") {
    "$PSScriptRoot/deploy/vione/fast-deploy.ps1"
} else {
    "$PSScriptRoot/deploy/ceo1983/fast-deploy.ps1"
}

$bound = [System.Collections.Generic.Dictionary[string, object]]::new($PSBoundParameters)
[void]$bound.Remove("Target")

& $targetScript @bound

