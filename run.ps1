param(
    [switch]$NoBrowser,
    [switch]$ForceInstall,
    [switch]$CheckOnly,
    [switch]$ReconfigureDb,
    [switch]$SkipDbInit,
    [switch]$ResetDb,
    [switch]$SkipProgressSeed,
    [switch]$NonInteractive
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

$startScript = Join-Path $PSScriptRoot "start.ps1"
if (-not (Test-Path -LiteralPath $startScript)) {
    throw "Missing script: $startScript"
}

& $startScript `
    -NoBrowser:$NoBrowser `
    -ForceInstall:$ForceInstall `
    -CheckOnly:$CheckOnly `
    -ReconfigureDb:$ReconfigureDb `
    -SkipDbInit:$SkipDbInit `
    -ResetDb:$ResetDb `
    -SkipProgressSeed:$SkipProgressSeed `
    -NonInteractive:$NonInteractive
exit $LASTEXITCODE
