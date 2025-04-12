# 云雾AI聊天助手

这是一个使用云雾AI API的前后端分离聊天应用，前端部署在Cloudflare Pages，后端部署在Cloudflare Workers。

## 项目结构

- `index.html` - 前端页面，包含UI界面和与后端API交互的JavaScript代码
- `worker.js` - 后端代码，将部署到Cloudflare Workers，处理前端请求并与云雾AI API通信

## 部署指南

本项目采用手动部署方式，不使用命令行工具，完全通过浏览器操作完成。

### 第一步：上传代码到GitHub

1. 创建GitHub账号（如果已有账号则跳过此步骤）
2. 创建新仓库
3. 上传项目文件

### 第二步：部署后端 (Cloudflare Workers)

1. 创建Cloudflare账号
2. 设置和部署Worker

### 第三步：部署前端 (Cloudflare Pages)

1. 配置Pages项目
2. 链接GitHub仓库
3. 部署

### 第四步：配置和测试

1. 更新前端API地址
2. 测试应用

## 安全注意事项

- 在生产环境中，请勿将API密钥直接硬编码在代码中
- 考虑使用Cloudflare Workers的环境变量或KV存储来保存敏感信息 