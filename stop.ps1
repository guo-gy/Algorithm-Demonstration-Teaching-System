# ============================================
# Algorithm Demonstration Teaching System
# 算法演示教学系统 - 停止脚本
# ============================================

$ErrorActionPreference = "SilentlyContinue"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Info { Write-ColorOutput Cyan $args }
function Write-Warning { Write-ColorOutput Yellow $args }

Write-Host ""
Write-Info "================================================"
Write-Info "  停止算法演示教学系统"
Write-Info "================================================"
Write-Host ""

# 查找并停止占用端口的进程
$backendPort = 3000
$frontendPort = 5173
$stopped = $false

Write-Info "正在查找运行中的服务..."

# 停止后端服务
$backendConnections = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue
if ($backendConnections) {
    foreach ($conn in $backendConnections) {
        $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Warning "→ 停止后端服务 (PID: $($process.Id), 端口: $backendPort)..."
            Stop-Process -Id $process.Id -Force
            $stopped = $true
        }
    }
}

# 停止前端服务
$frontendConnections = Get-NetTCPConnection -LocalPort $frontendPort -ErrorAction SilentlyContinue
if ($frontendConnections) {
    foreach ($conn in $frontendConnections) {
        $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Warning "→ 停止前端服务 (PID: $($process.Id), 端口: $frontendPort)..."
            Stop-Process -Id $process.Id -Force
            $stopped = $true
        }
    }
}

# 额外查找 node 进程（可能在其他端口）
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Warning "发现 $($nodeProcesses.Count) 个 Node.js 进程"
    $choice = Read-Host "是否停止所有 Node.js 进程? (y/N)"
    if ($choice -eq 'y' -or $choice -eq 'Y') {
        foreach ($proc in $nodeProcesses) {
            Write-Warning "→ 停止 Node.js 进程 (PID: $($proc.Id))..."
            Stop-Process -Id $proc.Id -Force
            $stopped = $true
        }
    }
}

Write-Host ""
if ($stopped) {
    Write-Success "✓ 服务已停止"
} else {
    Write-Info "未发现运行中的服务"
}
Write-Host ""
Read-Host "按任意键退出"
