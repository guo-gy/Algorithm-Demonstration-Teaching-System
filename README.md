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

### 1. 安装依赖
在根目录下运行以下命令安装所有依赖：
```powershell
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 2. 运行项目
你可以使用我们提供的启动脚本：
```powershell
./start.ps1
```
或者手动启动：
- **后端**: `cd server && npm run dev` (默认端口 3000)
- **前端**: `cd client && npm run dev` (默认端口 5173)

## 项目结构
- `client/`: 前端 Vue 代码
- `server/`: 后端 Express 接口与 SQLite 数据库
- `shared/`: 前后端共享的类型定义

## 许可证
ISC
