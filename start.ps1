# ============================================
# Algorithm Demonstration Teaching System
# 算法演示教学系统 - 启动脚本
# ============================================

$ErrorActionPreference = "Stop"

# 颜色输出函数
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
function Write-Error { Write-ColorOutput Red $args }

# 打印标题
Write-Host ""
Write-Info "================================================"
Write-Info "  Algorithm Demonstration Teaching System"
Write-Info "  算法演示教学系统"
Write-Info "================================================"
Write-Host ""

# 检查 Node.js 是否安装
Write-Info "[1/5] 检查 Node.js 环境..."
try {
    $nodeVersion = node --version
    Write-Success "✓ Node.js 已安装: $nodeVersion"
} catch {
    Write-Error "✗ 未检测到 Node.js！"
    Write-Warning "请访问 https://nodejs.org/ 下载并安装 Node.js (推荐 LTS 版本)"
    Read-Host "按任意键退出"
    exit 1
}

# 检查 npm 是否可用
try {
    $npmVersion = npm --version
    Write-Success "✓ npm 已安装: $npmVersion"
} catch {
    Write-Error "✗ npm 不可用！"
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""

# 检查并安装后端依赖
Write-Info "[2/5] 检查后端依赖..."
if (Test-Path "server/node_modules") {
    Write-Success "✓ 后端依赖已存在"
} else {
    Write-Warning "! 后端依赖未安装，开始安装..."
    Push-Location server
    try {
        npm install
        Write-Success "✓ 后端依赖安装完成"
    } catch {
        Write-Error "✗ 后端依赖安装失败: $_"
        Pop-Location
        Read-Host "按任意键退出"
        exit 1
    }
    Pop-Location
}

Write-Host ""

# 检查并安装前端依赖
Write-Info "[3/5] 检查前端依赖..."
if (Test-Path "client/node_modules") {
    Write-Success "✓ 前端依赖已存在"
} else {
    Write-Warning "! 前端依赖未安装，开始安装..."
    Push-Location client
    try {
        npm install
        Write-Success "✓ 前端依赖安装完成"
    } catch {
        Write-Error "✗ 前端依赖安装失败: $_"
        Pop-Location
        Read-Host "按任意键退出"
        exit 1
    }
    Pop-Location
}

Write-Host ""

# 检查端口占用
Write-Info "[4/5] 检查端口占用..."
$backendPort = 3000
$frontendPort = 5173

$backendPortInUse = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue
$frontendPortInUse = Get-NetTCPConnection -LocalPort $frontendPort -ErrorAction SilentlyContinue

if ($backendPortInUse) {
    Write-Warning "! 警告: 端口 $backendPort 已被占用"
    Write-Warning "  后端服务可能无法启动，请检查是否有其他实例在运行"
}

if ($frontendPortInUse) {
    Write-Warning "! 警告: 端口 $frontendPort 已被占用"
    Write-Warning "  前端服务可能无法启动，请检查是否有其他实例在运行"
}

if (-not $backendPortInUse -and -not $frontendPortInUse) {
    Write-Success "✓ 端口检查通过"
}

Write-Host ""

# 启动服务
Write-Info "[5/5] 启动服务..."
Write-Host ""

# 启动后端服务
Write-Success "→ 启动后端服务 (端口: $backendPort)..."
$backendProcess = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$PWD\server'; Write-Host '后端服务启动中...' -ForegroundColor Green; npm run dev"
) -PassThru

Start-Sleep -Seconds 2

# 启动前端服务
Write-Success "→ 启动前端服务 (端口: $frontendPort)..."
$frontendProcess = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$PWD\client'; Write-Host '前端服务启动中...' -ForegroundColor Cyan; npm run dev"
) -PassThru

Write-Host ""
Write-Info "================================================"
Write-Success "✓ 服务启动完成！"
Write-Info "================================================"
Write-Host ""
Write-Host "访问地址:" -ForegroundColor White
Write-Host "  后端 API: " -NoNewline; Write-Host "http://localhost:$backendPort" -ForegroundColor Yellow
Write-Host "  前端界面: " -NoNewline; Write-Host "http://localhost:$frontendPort" -ForegroundColor Yellow
Write-Host ""
Write-Warning "提示: 两个新的 PowerShell 窗口已打开，分别运行前后端服务"
Write-Warning "      关闭这些窗口将停止对应的服务"
Write-Host ""
Write-Host "按任意键关闭此窗口..." -ForegroundColor Gray
Read-Host
