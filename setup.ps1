param(
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
            if ($LASTEXITCODE -ne 0) {
                throw "npm install failed for $DisplayName"
            }
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

function Load-EnvFile([string]$Path) {
    $map = [ordered]@{}
    $order = New-Object System.Collections.Generic.List[string]

    if (Test-Path -LiteralPath $Path) {
        foreach ($line in Get-Content -LiteralPath $Path) {
            if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
                $key = $Matches[1]
                $value = $Matches[2]
                if (-not $map.Contains($key)) {
                    $order.Add($key) | Out-Null
                }
                $map[$key] = $value
            }
        }
    }

    return [pscustomobject]@{
        Map = $map
        Order = $order
    }
}

function Save-EnvFile([string]$Path, [System.Collections.Specialized.OrderedDictionary]$Map, [System.Collections.Generic.List[string]]$Order) {
    $lines = New-Object System.Collections.Generic.List[string]

    foreach ($key in $Order) {
        if ($Map.Contains($key)) {
            $lines.Add("$key=$($Map[$key])") | Out-Null
        }
    }

    foreach ($key in $Map.Keys) {
        if (-not $Order.Contains($key)) {
            $lines.Add("$key=$($Map[$key])") | Out-Null
        }
    }

    Set-Content -LiteralPath $Path -Value $lines -Encoding UTF8
}

function Set-EnvValue([System.Collections.Specialized.OrderedDictionary]$Map, [System.Collections.Generic.List[string]]$Order, [string]$Key, [string]$Value) {
    if (-not $Map.Contains($Key)) {
        $Order.Add($Key) | Out-Null
    }
    $Map[$Key] = $Value
}

function New-RandomSecret() {
    return ([guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N"))
}

function Needs-UserInput([string]$Current, [string[]]$Placeholders = @()) {
    if ([string]::IsNullOrWhiteSpace($Current)) {
        return $true
    }

    $trimmed = $Current.Trim()
    foreach ($placeholder in $Placeholders) {
        if ($trimmed -eq $placeholder) {
            return $true
        }
    }

    return $false
}

function Resolve-ConfigValue(
    [string]$Key,
    [string]$Label,
    [System.Collections.Specialized.OrderedDictionary]$Map,
    [string]$DefaultValue,
    [string[]]$Placeholders = @(),
    [switch]$AllowEmpty
) {
    $current = ""
    if ($Map.Contains($Key)) {
        $current = [string]$Map[$Key]
    }

    $shouldPrompt = $false
    if ($ReconfigureDb) {
        $shouldPrompt = $true
    }
    elseif (Needs-UserInput -Current $current -Placeholders $Placeholders) {
        $shouldPrompt = $true
    }

    if ($NonInteractive) {
        $shouldPrompt = $false
    }

    if ($shouldPrompt) {
        $hint = if ($DefaultValue -ne "") { " [$DefaultValue]" } else { "" }
        $inputValue = Read-Host "$Label$hint"
        if ([string]::IsNullOrWhiteSpace($inputValue)) {
            if ($DefaultValue -ne "" -or $AllowEmpty) {
                return $DefaultValue
            }
            return ""
        }
        return $inputValue.Trim()
    }

    if (Needs-UserInput -Current $current -Placeholders $Placeholders) {
        if ($DefaultValue -ne "" -or $AllowEmpty) {
            return $DefaultValue
        }
    }

    return $current
}

function Ensure-ServerEnv([string]$ServerDir) {
    $envPath = Join-Path $ServerDir ".env"
    $envExamplePath = Join-Path $ServerDir ".env.example"

    if (-not (Test-Path -LiteralPath $envPath)) {
        if (-not (Test-Path -LiteralPath $envExamplePath)) {
            throw "Missing env template: $envExamplePath"
        }
        Copy-Item -LiteralPath $envExamplePath -Destination $envPath
        Write-Ok "Created server/.env from .env.example"
    }

    $envState = Load-EnvFile -Path $envPath
    $map = $envState.Map
    $order = $envState.Order

    $jwtDefault = if (Needs-UserInput -Current ([string]$map["JWT_SECRET"]) -Placeholders @("your-jwt-secret")) { New-RandomSecret } else { "" }
    $resolved = [ordered]@{
        PORT = Resolve-ConfigValue -Key "PORT" -Label "Backend port" -Map $map -DefaultValue "3000" -Placeholders @("PORT")
        JWT_SECRET = Resolve-ConfigValue -Key "JWT_SECRET" -Label "JWT secret" -Map $map -DefaultValue $jwtDefault -Placeholders @("your-jwt-secret")
        DB_HOST = Resolve-ConfigValue -Key "DB_HOST" -Label "MySQL host" -Map $map -DefaultValue "127.0.0.1" -Placeholders @("your-mysql-host")
        DB_PORT = Resolve-ConfigValue -Key "DB_PORT" -Label "MySQL port" -Map $map -DefaultValue "3306" -Placeholders @("your-mysql-port")
        DB_USER = Resolve-ConfigValue -Key "DB_USER" -Label "MySQL user" -Map $map -DefaultValue "root" -Placeholders @("your-mysql-user")
        DB_PASSWORD = Resolve-ConfigValue -Key "DB_PASSWORD" -Label "MySQL password (can be empty)" -Map $map -DefaultValue "" -Placeholders @("your-mysql-password") -AllowEmpty
        DB_NAME = Resolve-ConfigValue -Key "DB_NAME" -Label "MySQL database name" -Map $map -DefaultValue "algorithm_demo" -Placeholders @("your-mysql-database")
        DB_CONNECTION_LIMIT = Resolve-ConfigValue -Key "DB_CONNECTION_LIMIT" -Label "MySQL connection limit" -Map $map -DefaultValue "10"
        INIT_ADMIN_USERNAME = Resolve-ConfigValue -Key "INIT_ADMIN_USERNAME" -Label "Init admin username" -Map $map -DefaultValue "admin"
        INIT_ADMIN_PASSWORD = Resolve-ConfigValue -Key "INIT_ADMIN_PASSWORD" -Label "Init admin password" -Map $map -DefaultValue "admin123456"
        DEEPSEEK_API_KEY = Resolve-ConfigValue -Key "DEEPSEEK_API_KEY" -Label "DeepSeek API key (optional)" -Map $map -DefaultValue "" -Placeholders @("your-deepseek-api-key") -AllowEmpty
        DEEPSEEK_MODEL = Resolve-ConfigValue -Key "DEEPSEEK_MODEL" -Label "DeepSeek model" -Map $map -DefaultValue "deepseek-chat" -Placeholders @("your-deepseek-model")
    }

    foreach ($key in $resolved.Keys) {
        Set-EnvValue -Map $map -Order $order -Key $key -Value ([string]$resolved[$key])
    }

    Save-EnvFile -Path $envPath -Map $map -Order $order
    Write-Ok "server/.env is ready."
}

function Initialize-Database([string]$ServerDir) {
    if ($SkipDbInit) {
        Write-WarnMsg "Skipping database initialization (-SkipDbInit)."
        return
    }

    $dbInitArgs = New-Object System.Collections.Generic.List[string]
    if ($ResetDb) { $dbInitArgs.Add("--reset") | Out-Null }
    if ($SkipProgressSeed) { $dbInitArgs.Add("--skip-progress") | Out-Null }

    Write-Info "Initializing database schema and seed data..."
    Push-Location $ServerDir
    try {
        if ($dbInitArgs.Count -gt 0) {
            & npm run db:init -- @dbInitArgs
        }
        else {
            & npm run db:init
        }

        if ($LASTEXITCODE -ne 0) {
            throw "Database initialization failed."
        }
    }
    finally {
        Pop-Location
    }

    Write-Ok "Database initialization completed."
}

Write-Info "========================================"
Write-Info "Algorithm Demonstration Teaching System"
Write-Info "Setup Script"
Write-Info "========================================"
Write-Host ""

try {
    $serverDir = Join-Path $PSScriptRoot "server"
    $clientDir = Join-Path $PSScriptRoot "client"

    Write-Info "[1/4] Checking runtime..."
    Require-Command "node"
    Require-Command "npm"
    Write-Ok ("Node.js: " + (& node --version))
    Write-Ok ("npm: " + (& npm --version))
    Write-Host ""

    Write-Info "[2/4] Installing dependencies..."
    Ensure-Dependencies -DirPath $serverDir -DisplayName "Server"
    Ensure-Dependencies -DirPath $clientDir -DisplayName "Client"
    Write-Host ""

    Write-Info "[3/4] Preparing environment..."
    Ensure-ServerEnv -ServerDir $serverDir
    Write-Host ""

    if ($CheckOnly) {
        Write-Ok "Check-only mode complete."
        exit 0
    }

    Write-Info "[4/4] Preparing database..."
    Initialize-Database -ServerDir $serverDir
    Write-Host ""

    Write-Ok "Setup complete."
}
catch {
    Write-Fail ("Setup failed: " + $_.Exception.Message)
    exit 1
}
