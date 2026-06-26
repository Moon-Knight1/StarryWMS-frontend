# CLAUDE.md

本文件为 Claude Code 在此仓库中工作时提供指导。

## 命令

```bash
npm run dev          # 开发服务器（端口 80），/dev-api → http://localhost:8080
npm run build:prod   # 生产构建
npm run build:stage  # 预发布构建
```

无 lint/测试脚本。用 `sass-embedded`，不是 `sass`。

## 三条不能违反的规则

### 1. 不要手动 import Vue/Pinia/Router API

`unplugin-auto-import` 已全局注入 `ref`、`computed`、`watch`、`defineStore`、`useRouter`、`useRoute` 等。在 `.vue` 文件里手动 `import { ref } from 'vue'` 会导致重复声明报错。

### 2. 路由是后端驱动的，不要在前端硬编码菜单

登录后 `permission.ts` 守卫调 `getRouters()` 从后端拉菜单树，`generateRoutes()` 通过 `import.meta.glob` 懒加载匹配组件。新增页面只要放在 `views/` 下对应路径就能被 glob 匹配到，无需手动注册路由。

### 3. Token 命名必须用 `Admin-Token`

Cookie key 是 `Admin-Token`，存的是 Bearer token。免 token 的接口（login、captcha、register）在 API 函数里设置 `headers: { isToken: false }`。

## 开发新页面时的文件布局

```
src/
  api/<domain>/<entity>.ts       # API 函数，用 @/utils/request 发请求
  types/api/<domain>/<entity>.ts # TS 类型：实体接口 + 查询参数接口
  views/<domain>/<entity>/index.vue  # CRUD 列表页
  views/<domain>/<entity>/view.vue   # 详情页（可选）
```

**处理 API 响应时注意**：`@/utils/request` 的响应拦截器已经把 `res.data` 解包了，所以 API 函数返回的是 `res.data`，不是 `res.data.data`。后端返回的结构是 `{ code, msg, data }`，拦截器 401 时弹重新登录框，500/601 时弹错误消息。

## 权限控制（两套并行体系）

- `roles`：角色字符串，如 `"admin"` 拥有全部权限
- `permissions`：权限字符串，格式 `系统:模块:动作`，如 `"system:user:edit"`，`"*:*:*"` 通配所有

模板里用 `v-hasPermi="['system:user:add']"` 或 `v-hasRole="['admin']"` 控制元素显隐。
组合判断用 `v-hasPermi-and`、`v-hasRole-or` 等变体。

## 可直接使用的全局组件

`DictTag`、`Pagination`、`FileUpload`、`ImageUpload`、`ImagePreview`、`RightToolbar`、`Editor`、`svg-icon`

这些在 `main.ts` 已全局注册，直接在模板里用，不需要 import。

## 状态管理

Pinia store 在 `src/store/modules/`。常用的：
- `useUserStore` — token、用户信息、roles、permissions
- `usePermissionStore` — 动态路由、菜单
- `useDictStore` — 字典缓存

## 路径与样式

- 路径别名 `@` → `src/`
- 深色侧边栏默认开启，主题色用 CSS 变量 `--current-color`，不要硬编码颜色值
- Element Plus 已配置中文 locale，自带组件默认中文
