# ============================================
# Algorithm Demonstration Teaching System
# 算法演示教学系统 - 环境配置脚本
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
Write-Info "  算法演示教学系统 - 环境配置"
Write-Info "================================================"
Write-Host ""

# 检查 Node.js
Write-Info "[1/4] 检查 Node.js 环境..."
try {
    $nodeVersion = node --version
    $nodeMajorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($nodeMajorVersion -lt 18) {
        Write-Warning "! 当前 Node.js 版本: $nodeVersion"
        Write-Warning "! 建议使用 Node.js 18 或更高版本"
        Write-Warning "  请访问 https://nodejs.org/ 更新"
    } else {
        Write-Success "✓ Node.js 版本: $nodeVersion"
    }
} catch {
    Write-Error "✗ 未检测到 Node.js！"
    Write-Host ""
    Write-Warning "请按照以下步骤安装 Node.js:"
    Write-Host "  1. 访问 https://nodejs.org/"
    Write-Host "  2. 下载 LTS (长期支持) 版本"
    Write-Host "  3. 运行安装程序并按照提示完成安装"
    Write-Host "  4. 重新打开 PowerShell 并运行此脚本"
    Write-Host ""
    Read-Host "按任意键退出"
    exit 1
}

# 检查 npm
try {
    $npmVersion = npm --version
    Write-Success "✓ npm 版本: $npmVersion"
} catch {
    Write-Error "✗ npm 不可用！"
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""

# 安装后端依赖
Write-Info "[2/4] 安装后端依赖..."
if (-not (Test-Path "server")) {
    Write-Error "✗ 找不到 server 目录！"
    exit 1
}

Push-Location server
try {
    Write-Host "  正在安装后端依赖，请稍候..." -ForegroundColor Gray
    npm install --loglevel=error
    Write-Success "✓ 后端依赖安装完成"
} catch {
    Write-Error "✗ 后端依赖安装失败: $_"
    Pop-Location
    Read-Host "按任意键退出"
    exit 1
}
Pop-Location

Write-Host ""

# 安装前端依赖
Write-Info "[3/4] 安装前端依赖..."
if (-not (Test-Path "client")) {
    Write-Error "✗ 找不到 client 目录！"
    exit 1
}

Push-Location client
try {
    Write-Host "  正在安装前端依赖，请稍候..." -ForegroundColor Gray
    npm install --loglevel=error
    Write-Success "✓ 前端依赖安装完成"
} catch {
    Write-Error "✗ 前端依赖安装失败: $_"
    Pop-Location
    Read-Host "按任意键退出"
    exit 1
}
Pop-Location

Write-Host ""

# 验证安装
Write-Info "[4/4] 验证安装..."
$allGood = $true

if (-not (Test-Path "server/node_modules")) {
    Write-Error "✗ 后端 node_modules 目录不存在"
    $allGood = $false
}

if (-not (Test-Path "client/node_modules")) {
    Write-Error "✗ 前端 node_modules 目录不存在"
    $allGood = $false
}

if ($allGood) {
    Write-Success "✓ 所有依赖安装成功"
}

Write-Host ""
Write-Info "================================================"
if ($allGood) {
    Write-Success "✓ 环境配置完成！"
    Write-Info "================================================"
    Write-Host ""
    Write-Host "下一步:" -ForegroundColor White
    Write-Host "  运行 " -NoNewline
    Write-Host ".\start.ps1" -ForegroundColor Yellow -NoNewline
    Write-Host " 启动项目"
} else {
    Write-Error "✗ 环境配置失败"
    Write-Info "================================================"
    Write-Host ""
    Write-Warning "请检查错误信息并重试"
}
Write-Host ""
Read-Host "按任意键退出"
