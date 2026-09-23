const { spawnSync } = require('child_process');

const ps = `
$errors = $null
$tokens = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile("d:\\download\\VICONNECT\\CEO_VIONE_PROJECT\\vione_project\\deploy\\crm\\fast-deploy.ps1", [ref]$tokens, [ref]$errors)
if ($errors.Count -gt 0) {
    Write-Host "ERRORS:"
    $errors | ForEach-Object { Write-Host $_.Message }
} else {
    Write-Host "SYNTAX_OK"
}
`;

const res = spawnSync("powershell", ["-NoProfile", "-Command", ps], { encoding: "utf8" });
console.log(res.stdout);
console.log(res.stderr);
