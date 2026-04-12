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

function Get-LaunchShell {
    $ps = Get-Command powershell -ErrorAction SilentlyContinue
    if ($ps) {
        return $ps.Source
    }

    $pwsh = Get-Command pwsh -ErrorAction SilentlyContinue
    if ($pwsh) {
        return $pwsh.Source
    }

    throw "Cannot find PowerShell executable."
}

function Get-PortOwnerInfo([int]$Port) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
    }
    catch {
        return $null
    }

    if (-not $connections) {
        return $null
    }

    $procId = $connections[0].OwningProcess
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$procId" -ErrorAction SilentlyContinue
    if (-not $proc) {
        return [pscustomobject]@{
            Port        = $Port
            ProcessId   = $procId
            Name        = "Unknown"
            CommandLine = ""
        }
    }

    return [pscustomobject]@{
        Port        = $Port
        ProcessId   = $procId
        Name        = [string]$proc.Name
        CommandLine = [string]$proc.CommandLine
    }
}

function Test-ProcessOwnedByPath([pscustomobject]$Owner, [string]$ExpectedPath) {
    if (-not $Owner) {
        return $false
    }

    if ([string]::IsNullOrWhiteSpace($Owner.CommandLine)) {
        return $false
    }

    $normalizedPath = [System.IO.Path]::GetFullPath($ExpectedPath).ToLowerInvariant()
    return $Owner.CommandLine.ToLowerInvariant().Contains($normalizedPath)
}

function Format-PortOwner([pscustomobject]$Owner) {
    if (-not $Owner) {
        return "No process found."
    }

    $cmd = if ([string]::IsNullOrWhiteSpace($Owner.CommandLine)) { "(empty command line)" } else { $Owner.CommandLine }
    return "PID=$($Owner.ProcessId), Name=$($Owner.Name), Command=$cmd"
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

Write-Info "========================================"
Write-Info "Algorithm Demonstration Teaching System"
Write-Info "Start Script"
Write-Info "========================================"
Write-Host ""

try {
    $setupScript = Join-Path $PSScriptRoot "setup.ps1"
    if (-not (Test-Path -LiteralPath $setupScript)) {
        throw "Missing setup script: $setupScript"
    }

    Write-Info "[1/3] Running setup..."
    & $setupScript `
        -ForceInstall:$ForceInstall `
        -CheckOnly:$CheckOnly `
        -ReconfigureDb:$ReconfigureDb `
        -SkipDbInit:$SkipDbInit `
        -ResetDb:$ResetDb `
        -SkipProgressSeed:$SkipProgressSeed `
        -NonInteractive:$NonInteractive
    if ($LASTEXITCODE -ne 0) {
        throw "Setup failed."
    }
    Write-Host ""

    if ($CheckOnly) {
        Write-Ok "Check-only mode complete."
        exit 0
    }

    Write-Info "[2/3] Starting services..."
    $serverDir = Join-Path $PSScriptRoot "server"
    $clientDir = Join-Path $PSScriptRoot "client"
    $shellExe = Get-LaunchShell

    $serverEnvPath = Join-Path $serverDir ".env"
    $backendPortText = Get-EnvValue -EnvPath $serverEnvPath -Key "PORT" -Default "3000"
    $backendPort = 3000
    if (-not [int]::TryParse($backendPortText, [ref]$backendPort)) {
        $backendPort = 3000
    }
    $frontendPort = 5173

    $backendOwner = Get-PortOwnerInfo -Port $backendPort
    if ($backendOwner) {
        if (Test-ProcessOwnedByPath -Owner $backendOwner -ExpectedPath $serverDir) {
            Write-Ok "Backend already running on port $backendPort (this project)."
        }
        else {
            throw "Port $backendPort is occupied by another process. $(Format-PortOwner -Owner $backendOwner)"
        }
    }
    else {
        Start-Process -FilePath $shellExe -ArgumentList @(
            "-NoExit",
            "-ExecutionPolicy", "Bypass",
            "-Command", "cd `"$serverDir`"; npm run dev"
        ) | Out-Null
        Write-Ok "Backend start command sent."
    }

    $frontendOwner = Get-PortOwnerInfo -Port $frontendPort
    if ($frontendOwner) {
        if (Test-ProcessOwnedByPath -Owner $frontendOwner -ExpectedPath $clientDir) {
            Write-Ok "Frontend already running on port $frontendPort (this project)."
        }
        else {
            throw "Port $frontendPort is occupied by another process. $(Format-PortOwner -Owner $frontendOwner)"
        }
    }
    else {
        Start-Process -FilePath $shellExe -ArgumentList @(
            "-NoExit",
            "-ExecutionPolicy", "Bypass",
            "-Command", "cd `"$clientDir`"; npm run dev"
        ) | Out-Null
        Write-Ok "Frontend start command sent."
    }

    Start-Sleep -Seconds 2
    Write-Host ""

    Write-Info "[3/3] Finalizing..."
    if (-not $NoBrowser) {
        Start-Process "http://localhost:$frontendPort" | Out-Null
        Write-Ok "Browser opened: http://localhost:$frontendPort"
    }
    else {
        Write-WarnMsg "Skipped opening browser (-NoBrowser)."
    }

    Write-Host ""
    Write-Ok "Done. Services should now be running in new PowerShell windows."
    Write-Info "Backend:  http://localhost:$backendPort"
    Write-Info "Frontend: http://localhost:$frontendPort"
}
catch {
    Write-Fail ("Start failed: " + $_.Exception.Message)
    exit 1
}
