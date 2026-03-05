# Algorithm Demonstration Teaching System (算法演示教学系统)

一个现代化的算法演示与教学系统，旨在通过可视化、交互练习和理论讲解帮助学生更好地理解算法。

## 核心功能
- **算法可视化**: 动态演示排序、搜索、图论、树结构等算法的执行过程。
- **交互练习**: 针对不同算法设计的即时练习，验证学习成果。
- **理论讲解**: 深入浅出的复杂度分析与逻辑描述。
- **进度追踪**: 记录学习进度与练习得分（基于 SQLite 持久化）。

## 技术栈
- **前端**: Vue 3, Vite, Tailwind CSS, Lucide icons, Pinia
- **后端**: Node.js, Express, SQLite (better-sqlite3), JWT
- **国际化**: i18n 支持（中/英）

## 快速开始

### 前置要求
- **Node.js**: 18.0 或更高版本 ([下载地址](https://nodejs.org/))
- **npm**: 随 Node.js 自动安装

### 1. 环境配置（首次运行）
在项目根目录运行环境配置脚本，自动检查并安装所有依赖：

```powershell
.\setup.ps1
```

此脚本会：
- ✓ 检查 Node.js 和 npm 版本
- ✓ 自动安装后端依赖
- ✓ 自动安装前端依赖
- ✓ 验证安装结果

### 2. 启动项目
环境配置完成后，使用启动脚本运行项目：

```powershell
.\start.ps1
```

此脚本会：
- ✓ 检查环境和依赖
- ✓ 检查端口占用情况
- ✓ 自动启动后端服务（端口 3000）
- ✓ 自动启动前端服务（端口 5173）

启动成功后，访问：
- **前端界面**: http://localhost:5173
- **后端 API**: http://localhost:3000

### 3. 停止项目
使用停止脚本关闭所有服务：

```powershell
.\stop.ps1
```

### 手动启动（可选）
如果你更喜欢手动控制：

```powershell
# 后端服务
cd server
npm run dev

# 前端服务（新终端）
cd client
npm run dev
```

## 项目结构
- `client/`: 前端 Vue 代码
- `server/`: 后端 Express 接口与 SQLite 数据库
- `shared/`: 前后端共享的类型定义

## 许可证
ISC
