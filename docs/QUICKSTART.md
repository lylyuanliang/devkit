# Kafka Client - 快速开始指南

本指南将帮助你在 10 分钟内启动并运行 Kafka Client 桌面应用。

---

## 📋 前置要求

### 1. 开发环境

确保你已安装以下软件：

- **Node.js** >= 18.0.0 [下载](https://nodejs.org/)
- **npm** >= 9.0.0（随 Node.js 安装）或 **pnpm** >= 8.0.0
- **Git** [下载](https://git-scm.com/)

检查版本：
```bash
node --version   # v18.0.0 或更高
npm --version    # v9.0.0 或更高
git --version    # 任意版本
```

### 2. Kafka 集群（可选）

为了测试应用，你需要一个运行中的 Kafka 集群。

**快速启动本地 Kafka（使用 Docker）**:
```bash
# 下载并启动 Kafka
docker-compose up -d

# 或使用 Confluent Platform
curl -L https://cnfl.io/cli | sh -s -- -b /usr/local/bin
confluent local kafka start
```

---

## 🚀 快速启动

### 步骤 1: 克隆项目

```bash
git clone https://github.com/yourusername/kafka_client.git
cd kafka_client
```

### 步骤 2: 安装依赖

```bash
npm install
```

这将安装所有必需的依赖包，大约需要 1-2 分钟。

### 步骤 3: 启动开发环境

```bash
npm run dev
```

这个命令会：
1. 启动 Vite 开发服务器（渲染进程）
2. 启动 Electron 应用（主进程）
3. 自动打开应用窗口

第一次启动可能需要几秒钟，请耐心等待。

### 步骤 4: 验证安装

如果你看到应用窗口打开，恭喜！🎉 安装成功。

---

## 🎯 第一次使用

### 1. 创建连接

点击 "**连接管理**" → "**新建连接**"

填写以下信息：
```
连接名称: Local Kafka
Broker 地址: localhost:9092
```

点击 "**测试连接**"，如果显示 ✓ 连接成功，点击 "**保存**"。

### 2. 浏览主题

点击 "**主题管理**"，你将看到 Kafka 集群中的所有主题。

如果是新集群，列表可能为空。

### 3. 创建主题

点击 "**创建主题**"

填写：
```
主题名称: test-topic
分区数: 3
副本因子: 1
```

点击 "**创建**"。

### 4. 发送消息

点击 "**消息生产**"

选择主题: `test-topic`

输入消息内容：
```json
{
  "message": "Hello Kafka!",
  "timestamp": 1234567890
}
```

点击 "**发送**"。

### 5. 消费消息

点击 "**消息消费**"

选择主题: `test-topic`

点击 "**开始消费**"

你应该能看到刚才发送的消息！

---

## 📁 项目结构概览

```
kafka_client/
├── docs/               # 📚 文档目录
│   ├── QUICKSTART.md  # 本文档
│   ├── ARCHITECTURE.md
│   └── ...
├── src/               # 💻 源代码
│   ├── main/         # Electron 主进程
│   ├── renderer/     # React 渲染进程
│   ├── preload/      # Preload 脚本
│   └── common/       # 共享代码
├── package.json      # 依赖配置
└── README.md         # 项目说明
```

---

## 🛠️ 常用命令

### 开发

```bash
# 启动开发环境
npm run dev

# 只启动渲染进程（调试 UI）
npm run dev:renderer

# 代码检查
npm run lint

# 代码格式化
npm run format
```

### 构建

```bash
# 构建应用（不打包）
npm run build

# 打包为可执行文件
npm run package

# 打包 Windows 版本
npm run package:win

# 打包 macOS 版本
npm run package:mac

# 打包 Linux 版本
npm run package:linux
```

### 测试

```bash
# 运行所有测试
npm test

# 监听模式
npm test -- --watch

# 测试覆盖率
npm test -- --coverage
```

---

## 🐛 常见问题

### Q1: 启动时报错 "Electron failed to install correctly"

**解决方法**:
```bash
# 重新安装 Electron
npm install electron --force

# 或清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

### Q2: 无法连接到 Kafka

**检查清单**:
- ✅ Kafka 服务是否正在运行
- ✅ Broker 地址是否正确
- ✅ 端口是否可访问（默认 9092）
- ✅ 防火墙设置

**测试连接**:
```bash
# 使用 kafkacat 测试
kafkacat -b localhost:9092 -L
```

### Q3: npm install 很慢

**解决方法**:
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或使用 pnpm（更快）
npm install -g pnpm
pnpm install
```

### Q4: Windows 上启动报错

**解决方法**:
```bash
# 使用管理员权限运行 PowerShell
# 允许执行脚本
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q5: macOS 上应用无法打开

**解决方法**:
```bash
# 允许未签名的应用
xattr -cr /Applications/KafkaClient.app
```

---

## 📚 下一步

现在你已经成功运行了应用，可以：

1. 📖 阅读 [架构文档](ARCHITECTURE.md) 了解系统设计
2. 💡 查看 [功能文档](FEATURES.md) 了解所有功能
3. 🔧 阅读 [开发指南](DEVELOPMENT.md) 开始贡献代码
4. 🗺️ 查看 [路线图](ROADMAP.md) 了解未来计划

---

## 🎓 学习资源

### Kafka 基础
- [Apache Kafka 官方文档](https://kafka.apache.org/documentation/)
- [Kafka 简明教程](https://kafka.apache.org/quickstart)

### 技术栈
- [Electron 文档](https://www.electronjs.org/docs)
- [React 文档](https://react.dev)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Ant Design 组件库](https://ant.design/components/overview-cn)

### 项目相关
- [KafkaJS 文档](https://kafka.js.org)
- [Zustand 状态管理](https://zustand-demo.pmnd.rs)

---

## 💡 开发技巧

### 1. 调试渲染进程

在应用中按 `Ctrl+Shift+I` (Windows/Linux) 或 `Cmd+Option+I` (macOS) 打开开发者工具。

### 2. 调试主进程

修改启动脚本添加 `--inspect` 标志：
```json
{
  "dev:main": "electron . --inspect=9229"
}
```

然后在 Chrome 中访问 `chrome://inspect`。

### 3. 热重载

修改渲染进程代码时，页面会自动刷新。
修改主进程代码时，需要手动重启应用（或配置 nodemon）。

### 4. VS Code 调试配置

创建 `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Electron: Main",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "args": ["."],
      "outputCapture": "std"
    }
  ]
}
```

---

## 🤝 获取帮助

遇到问题？我们来帮你：

- 💬 [GitHub Discussions](https://github.com/yourusername/kafka_client/discussions) - 提问和讨论
- 🐛 [GitHub Issues](https://github.com/yourusername/kafka_client/issues) - 报告 Bug
- 📧 邮件联系维护者
- 📖 查看[完整文档](../README.md)

---

## ✨ 贡献代码

如果你想为项目做贡献，请阅读 [贡献指南](CONTRIBUTING.md)。

我们欢迎：
- 🐛 Bug 修复
- ✨ 新功能
- 📝 文档改进
- 🧪 测试添加
- 🌍 国际化翻译

---

## 📝 反馈

你的反馈对我们很重要！

- ⭐ 如果喜欢这个项目，请给我们 Star
- 🐦 分享给你的朋友
- 💡 提出改进建议

---

**祝你使用愉快！** 🎉

如果这个快速开始指南有帮助，别忘了给项目一个 Star ⭐
