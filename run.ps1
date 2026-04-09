param(
    [switch]$NoBrowser,
    [switch]$ForceInstall,
    [switch]$CheckOnly
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

function Require-Command([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Missing command: $Name"
    }
}

function Ensure-Dependencies([string]$DirPath, [string]$DisplayName) {
    if (-not (Test-Path -LiteralPath $DirPath)) {
        throw "Missing directory: $DirPath"
    }

    $modulesPath = Join-Path $DirPath "node_modules"
    if ($ForceInstall -or -not (Test-Path -LiteralPath $modulesPath)) {
        Write-Info "Installing $DisplayName dependencies..."
        Push-Location $DirPath
        try {
            & npm install
        }
        finally {
            Pop-Location
        }
        Write-Ok "$DisplayName dependencies installed."
    }
    else {
        Write-Ok "$DisplayName dependencies already present."
    }
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

Write-Info "========================================"
Write-Info "Algorithm Demonstration Teaching System"
Write-Info "One-click startup script"
Write-Info "========================================"
Write-Host ""

try {
    Write-Info "[1/4] Checking runtime..."
    Require-Command "node"
    Require-Command "npm"
    Write-Ok ("Node.js: " + (& node --version))
    Write-Ok ("npm: " + (& npm --version))
    Write-Host ""

    Write-Info "[2/4] Checking dependencies..."
    $serverDir = Join-Path $PSScriptRoot "server"
    $clientDir = Join-Path $PSScriptRoot "client"
    Ensure-Dependencies -DirPath $serverDir -DisplayName "Server"
    Ensure-Dependencies -DirPath $clientDir -DisplayName "Client"
    Write-Host ""

    if ($CheckOnly) {
        Write-Ok "Check-only mode complete."
        exit 0
    }

    Write-Info "[3/4] Starting services..."
    $shellExe = Get-LaunchShell

    $backendOwner = Get-PortOwnerInfo -Port 3000
    if ($backendOwner) {
        if (Test-ProcessOwnedByPath -Owner $backendOwner -ExpectedPath $serverDir) {
            Write-Ok "Backend already running on port 3000 (this project)."
        }
        else {
            throw "Port 3000 is occupied by another process. $(Format-PortOwner -Owner $backendOwner)"
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

    $frontendOwner = Get-PortOwnerInfo -Port 5173
    if ($frontendOwner) {
        if (Test-ProcessOwnedByPath -Owner $frontendOwner -ExpectedPath $clientDir) {
            Write-Ok "Frontend already running on port 5173 (this project)."
        }
        else {
            throw "Port 5173 is occupied by another process. $(Format-PortOwner -Owner $frontendOwner)"
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

    Write-Info "[4/4] Finalizing..."
    if (-not $NoBrowser) {
        Start-Process "http://localhost:5173" | Out-Null
        Write-Ok "Browser opened: http://localhost:5173"
    }
    else {
        Write-Info "Skipped opening browser (-NoBrowser)."
    }

    Write-Host ""
    Write-Ok "Done. Services should now be running in new PowerShell windows."
    Write-Info "Backend:  http://localhost:3000"
    Write-Info "Frontend: http://localhost:5173"
}
catch {
    Write-Fail ("Startup failed: " + $_.Exception.Message)
    exit 1
}
