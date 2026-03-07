# ============================================
# Algorithm Demonstration Teaching System
# 一键启动及环境配置脚本
# ============================================

$ErrorActionPreference = "Stop"

# 切换到脚本所在目录，防止因执行路径不对导致的问题
Set-Location -Path $PSScriptRoot

function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "================================================"
Write-Info "  Algorithm Demonstration Teaching System"
Write-Info "  算法演示教学系统 - 环境检测与一键启动"
Write-Info "================================================"
Write-Host ""

# 1. 检查 Node.js 环境
Write-Info "[1/5] 检查 Node.js 环境..."
try {
    $nodeVersion = node --version
    Write-Success "✓ 检测到 Node.js 版本: $nodeVersion"
} catch {
    Write-Error "✗ 未检测到 Node.js，请前往 https://nodejs.org/ 下载并安装"
    Read-Host "按 Enter 键退出..."
    exit 1
}

# 2. 检查 npm
Write-Info "[2/5] 检查 npm 环境..."
try {
    $npmVersion = npm --version
    Write-Success "✓ 检测到 npm 版本: $npmVersion"
} catch {
    Write-Error "✗ npm 不可用！"
    Read-Host "按 Enter 键退出..."
    exit 1
}

Write-Host ""

# 3. 安装依赖
Write-Info "[3/5] 检查并安装后端依赖..."
if (Test-Path "server") {
    Push-Location server
    if (Test-Path "node_modules") {
        Write-Success "✓ 后端依赖已存在，跳过安装。(若需重新安装请手动删除 server/node_modules 目录)"
    } else {
        Write-Host "正在安装后端依赖，由于涉及多个相关包，这可能需要一分钟左右，请耐心等待..." -ForegroundColor Gray
        npm install
        Write-Success "✓ 后端依赖安装完成"
    }
    Pop-Location
} else {
    Write-Error "✗ 未找到 server 目录！请确保脚本与 server 目录在同一层级。"
    Read-Host "按 Enter 键退出..."
    exit 1
}

Write-Host ""
Write-Info "[4/5] 检查并安装前端依赖..."
if (Test-Path "client") {
    Push-Location client
    if (Test-Path "node_modules") {
        Write-Success "✓ 前端依赖已存在，跳过安装。(若需重新安装请手动删除 client/node_modules 目录)"
    } else {
        Write-Host "正在安装前端依赖，请稍等..." -ForegroundColor Gray
        npm install
        Write-Success "✓ 前端依赖安装完成"
    }
    Pop-Location
} else {
    Write-Error "✗ 未找到 client 目录！请确保脚本与 client 目录在同一层级。"
    Read-Host "按 Enter 键退出..."
    exit 1
}

Write-Host ""

# 4. 启动服务
Write-Info "[5/5] 启动服务并打开系统网页..."

Write-Host "启动后端服务... (在新窗口运行)" -ForegroundColor Gray
Start-Process powershell -WorkingDirectory "$PSScriptRoot\server" -ArgumentList "-NoExit -Command `"npm run dev`""

Write-Host "启动前端服务... (在新窗口运行)" -ForegroundColor Gray
Start-Process powershell -WorkingDirectory "$PSScriptRoot\client" -ArgumentList "-NoExit -Command `"npm run dev`""

Write-Host "等待服务完成启动 (5秒)..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Info "正在打开浏览器访问前端页面..."
Start-Process "http://localhost:5173"

Write-Host ""
Write-Success "================================================"
Write-Success "✓ 系统启动指令已发出！"
Write-Success "================================================"
Write-Host "前端和后端服务已在独立的 PowerShell 窗口中运行。"
Write-Host "若要停止系统，请直接关闭弹出的对应服务终端窗口即可。"
Write-Host ""
Read-Host "按 Enter 键退出此配置向导脚本..."
