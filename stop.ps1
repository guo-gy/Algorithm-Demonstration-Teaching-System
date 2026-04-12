param(
    [switch]$Force,
    [switch]$KillAllNode
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

function Write-Ok([string]$Message) {
    Write-Host $Message -ForegroundColor Green
}

function Write-Info([string]$Message) {
    Write-Host $Message -ForegroundColor Cyan
}

function Write-WarnMsg([string]$Message) {
    Write-Host $Message -ForegroundColor Yellow
}

function Write-Fail([string]$Message) {
    Write-Host $Message -ForegroundColor Red
}

function Get-EnvValue([string]$EnvPath, [string]$Key, [string]$Default) {
    if (-not (Test-Path -LiteralPath $EnvPath)) {
        return $Default
    }

    foreach ($line in Get-Content -LiteralPath $EnvPath) {
        if ($line -match "^\s*$Key=(.*)$") {
            return $Matches[1].Trim()
        }
    }

    return $Default
}

function Stop-Port([int]$Port, [string]$ProjectPath, [switch]$AllowAnyProcess) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
    }
    catch {
        Write-Info "Port $Port is not listening."
        return
    }

    if (-not $connections) {
        Write-Info "Port $Port is not listening."
        return
    }

    $projectPathNormalized = [System.IO.Path]::GetFullPath($ProjectPath).ToLowerInvariant()
    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$pid" -ErrorAction SilentlyContinue
        if (-not $proc) {
            continue
        }

        $commandLine = [string]$proc.CommandLine
        $ownedByProject = $false
        if (-not [string]::IsNullOrWhiteSpace($commandLine)) {
            $ownedByProject = $commandLine.ToLowerInvariant().Contains($projectPathNormalized)
        }

        if (-not $AllowAnyProcess -and -not $ownedByProject) {
            Write-WarnMsg "Skipping PID $pid on port $Port (not this project)."
            continue
        }

        try {
            Stop-Process -Id $pid -Force
            Write-Ok "Stopped PID $pid on port $Port."
        }
        catch {
            Write-WarnMsg "Failed to stop PID $pid on port ${Port}: $($_.Exception.Message)"
        }
    }
}

Write-Info "========================================"
Write-Info "Algorithm Demonstration Teaching System"
Write-Info "Stop Script"
Write-Info "========================================"
Write-Host ""

try {
    $serverDir = Join-Path $PSScriptRoot "server"
    $clientDir = Join-Path $PSScriptRoot "client"

    $serverEnvPath = Join-Path $serverDir ".env"
    $backendPortText = Get-EnvValue -EnvPath $serverEnvPath -Key "PORT" -Default "3000"
    $backendPort = 3000
    if (-not [int]::TryParse($backendPortText, [ref]$backendPort)) {
        $backendPort = 3000
    }

    $frontendPort = 5173

    Stop-Port -Port $backendPort -ProjectPath $serverDir -AllowAnyProcess:$Force
    Stop-Port -Port $frontendPort -ProjectPath $clientDir -AllowAnyProcess:$Force

    if ($KillAllNode) {
        $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
        if ($nodeProcesses) {
            foreach ($proc in $nodeProcesses) {
                try {
                    Stop-Process -Id $proc.Id -Force
                    Write-Ok "Stopped node process PID $($proc.Id)."
                }
                catch {
                    Write-WarnMsg "Failed to stop node PID $($proc.Id): $($_.Exception.Message)"
                }
            }
        }
        else {
            Write-Info "No node process found."
        }
    }

    Write-Host ""
    Write-Ok "Stop operation finished."
}
catch {
    Write-Fail ("Stop failed: " + $_.Exception.Message)
    exit 1
}
