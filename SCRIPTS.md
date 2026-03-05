# 算法演示教学系统 - 脚本使用指南

## 📋 可用脚本

### 1. `setup.ps1` - 环境配置脚本
**用途**: 首次使用时配置开发环境

**功能**:
- 检查 Node.js 和 npm 版本
- 自动安装后端依赖
- 自动安装前端依赖
- 验证安装结果

**使用方法**:
```powershell
.\setup.ps1
```

**适用场景**:
- 首次克隆项目后
- 删除 node_modules 后重新安装
- 更新依赖包后

---

### 2. `start.ps1` - 项目启动脚本
**用途**: 一键启动前后端服务

**功能**:
- 检查 Node.js 环境
- 检查依赖是否已安装（未安装则自动安装）
- 检查端口占用情况
- 启动后端服务（端口 3000）
- 启动前端服务（端口 5173）

**使用方法**:
```powershell
.\start.ps1
```

**注意事项**:
- 会打开两个新的 PowerShell 窗口分别运行前后端
- 关闭窗口即可停止对应服务
- 如果端口被占用会给出警告

---

### 3. `stop.ps1` - 项目停止脚本
**用途**: 停止所有运行中的服务

**功能**:
- 自动查找占用 3000 和 5173 端口的进程
- 停止后端和前端服务
- 可选择停止所有 Node.js 进程

**使用方法**:
```powershell
.\stop.ps1
```

**适用场景**:
- 需要完全停止项目
- 端口被占用需要释放
- 服务异常需要重启

---

## 🚀 典型工作流程

### 首次使用
```powershell
# 1. 配置环境
.\setup.ps1

# 2. 启动项目
.\start.ps1

# 3. 在浏览器访问 http://localhost:5173
```

### 日常开发
```powershell
# 启动项目
.\start.ps1

# 开发完成后停止
.\stop.ps1
```

### 依赖更新后
```powershell
# 重新安装依赖
.\setup.ps1

# 启动项目
.\start.ps1
```

---

## ⚠️ 常见问题

### Q: 提示 "无法加载文件，因为在此系统上禁止运行脚本"
**A**: 需要修改 PowerShell 执行策略
```powershell
# 以管理员身份运行 PowerShell，然后执行：
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q: 端口被占用怎么办？
**A**: 运行停止脚本释放端口
```powershell
.\stop.ps1
```

### Q: 依赖安装失败
**A**: 
1. 检查网络连接
2. 尝试使用国内镜像源：
```powershell
npm config set registry https://registry.npmmirror.com
```
3. 重新运行 `.\setup.ps1`

### Q: Node.js 版本过低
**A**: 访问 https://nodejs.org/ 下载并安装 LTS 版本（推荐 18.x 或更高）

---

## 📝 手动操作（可选）

如果你更喜欢手动控制每个步骤：

```powershell
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install

# 启动后端（新终端）
cd server
npm run dev

# 启动前端（新终端）
cd client
npm run dev
```

---

## 🔧 脚本特性

- ✅ 自动化环境检查
- ✅ 智能依赖安装
- ✅ 端口冲突检测
- ✅ 彩色输出提示
- ✅ 错误处理和提示
- ✅ 进程管理
