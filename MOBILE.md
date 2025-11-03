# 移动端使用指南

本应用支持作为 PWA (Progressive Web App) 在移动设备上安装和使用。

## 功能特性

### ✅ 响应式布局
- 自动适配移动设备屏幕尺寸
- 优化的触摸交互体验
- 支持横屏和竖屏模式
- 适配 iOS 安全区域

### ✅ 推送通知
- 接收新消息时显示推送通知
- 点击通知可快速打开应用
- 支持后台通知（需要浏览器支持）

### ✅ PWA 安装
- 可以添加到主屏幕
- 独立窗口运行（无浏览器地址栏）
- 离线缓存支持
- 快速启动

## 安装步骤

### iOS (Safari)
1. 在 Safari 浏览器中打开应用
2. 点击底部的"分享"按钮
3. 向下滚动，选择"添加到主屏幕"
4. 点击"添加"确认

### Android (Chrome)
1. 在 Chrome 浏览器中打开应用
2. 点击右上角的菜单按钮（三个点）
3. 选择"添加到主屏幕"或"安装应用"
4. 点击"安装"确认

## 通知权限

首次使用时，应用会请求通知权限：

1. **允许通知**：接收新消息时会显示推送通知
2. **拒绝通知**：仍可正常使用应用，但不会收到通知提醒

您可以随时在浏览器设置中更改通知权限。

## 移动端优化

### 触摸优化
- 所有按钮和可点击区域符合 iOS 推荐的 44x44 点触摸目标
- 优化的触摸反馈效果
- 防止意外缩放（输入框字体大小 ≥ 16px）

### 键盘适配
- 输入框自动调整大小
- 适配移动端键盘弹出
- 支持安全区域（iPhone 刘海屏等）

### 性能优化
- Service Worker 缓存静态资源
- 快速启动和响应
- 离线基本功能支持

## 浏览器兼容性

### 完全支持
- iOS Safari 11.3+
- Android Chrome 67+
- Android Firefox 68+
- Samsung Internet 8.2+

### 部分支持
- iOS Chrome（受限于 iOS 系统限制）
- iOS Firefox（受限于 iOS 系统限制）

## 故障排除

### 通知不工作
1. 检查浏览器通知权限设置
2. 确保应用已安装为 PWA
3. 检查系统通知设置是否允许浏览器通知

### 无法安装 PWA
1. 确保使用支持的浏览器
2. 确保网站通过 HTTPS 访问（或 localhost）
3. 清除浏览器缓存后重试

### 离线功能不工作
1. 确保 Service Worker 已成功注册
2. 在浏览器开发者工具中检查 Service Worker 状态
3. 清除缓存后重新加载应用

## 图标生成

应用图标位于 `icons/` 目录。如需自定义图标：

1. 打开 `icons/generate-icons.html` 生成占位图标
2. 或使用专业工具创建自定义图标
3. 确保提供所有必需的尺寸（见 `icons/README.md`）

## 技术细节

- **Service Worker**: 提供离线缓存和推送通知支持
- **Web App Manifest**: 定义 PWA 安装配置
- **Notification API**: 处理桌面和移动端通知
- **响应式 CSS**: 使用媒体查询适配不同屏幕尺寸

## 更多信息

- [PWA 文档](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
