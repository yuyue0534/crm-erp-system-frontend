# CRM+ERP 前端系统

基于 React.js + Tailwind CSS v3 的 CRM+ERP 管理系统前端。

## 功能模块

- **用户认证** — 注册、登录、JWT 鉴权
- **仪表盘** — 业务数据概览、快捷操作
- **客户管理 (CRM)** — 增删查改、搜索、详情查看
- **产品管理 (ERP)** — 增删查改、SKU/分类/价格管理
- **库存管理 (ERP)** — 库存记录、低库存预警
- **订单管理 (ERP)** — 创建订单（多商品明细）、状态流转、删除

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | React 18 (JavaScript) |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS 3 |
| 路由 | React Router 6 |
| HTTP | Axios |
| 图标 | Lucide React |
| 通知 | React Hot Toast |

## 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量（可选）
cp .env.example .env

# 3. 启动开发服务器
npm run dev
```

浏览器访问 `http://localhost:3000`

> 开发模式下，API 请求会自动代理到 `http://localhost:8080`，请确保后端服务已启动。

## 生产构建

```bash
npm run build
```

构建产物位于 `dist/` 目录，可部署到任意静态托管平台。

## 项目结构

```
src/
├── api/            # Axios 实例和所有 API 方法
├── components/     # 通用 UI 组件
│   ├── Layout.jsx        # 主布局（侧边栏 + 顶栏）
│   ├── Modal.jsx         # 弹窗
│   ├── ConfirmDialog.jsx # 确认对话框
│   ├── PageHeader.jsx    # 页面标题栏
│   ├── StatCard.jsx      # 统计卡片
│   ├── EmptyState.jsx    # 空状态占位
│   └── Spinner.jsx       # 加载指示器
├── contexts/       # React Context
│   └── AuthContext.jsx   # 认证状态管理
├── pages/          # 页面组件
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Customers.jsx
│   ├── Products.jsx
│   ├── Inventory.jsx
│   └── Orders.jsx
├── App.jsx         # 路由定义
├── main.jsx        # 应用入口
└── index.css       # 全局样式 + Tailwind
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE` | 后端 API 地址 | 空（使用 Vite proxy） |
