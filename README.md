# AI 简历面试模拟器

> ⚠️ **本项目已归档（2026-09-09）**：功能已全部并入 [job-hunter](https://github.com/herenjiuwuli/job-hunter)（求职全流程助手），本仓库只作历史存档、不再维护。请移步 job-hunter 使用同等能力。

基于 AI 的求职模拟面试工具：粘贴简历 → AI 分析并推荐岗位 → 与 AI 面试官进行多轮模拟面试 → 生成面试复盘报告 → 保存历史记录随时回看。

## 功能列表

1. **简历分析**：粘贴简历文本，AI 输出匹配度评分（4 维度）、亮点、短板、预测面试题，并从 5 个岗位（前端开发、自动化测试、后端开发、产品运营、数据分析）中推荐并打分
2. **模拟面试**：选中岗位后进入对话式模拟面试，AI 面试官基于简历与岗位 JD 提问，每答完一题先给简短点评再出下一题，支持追问，历史上下文全程保留
3. **面试报告**：面试结束后生成复盘报告——总分、4 个评分维度（表达清晰度/技术深度/逻辑性/岗位匹配度）、每题回顾与点评、改进建议、复盘要点、还适合投的岗位
4. **面试记录**：一键保存面试记录，列表按时间倒序展示，可随时回看完整对话与报告、删除记录
5. **AI 简历生成**：填写真实基本信息（姓名/学校/专业/技能/项目经历）+ 勾选目标岗位，AI 基于真实信息生成结构化 Markdown 简历，并为每个目标岗位生成侧重优化版本，支持一键复制（绝不虚构经历和数据）
6. **投递助手**：选择岗位并可粘贴真实 JD，AI 生成推荐投递方向（公司类型/行业，不虚构公司名）、打招呼语、求职信，支持一键复制后自行投递（不自动投递）

## 技术栈

- **前端**：Vue 3 + Vite + Vue Router（hash 模式），自研简洁 CSS（无重型 UI 库）
- **后端**：Node.js + Express，serverless 形式（Vercel Functions）
- **AI**：DeepSeek API（`deepseek-chat`，JSON Mode）
- **存储**：JSON 文件存储（本地 `data/` 目录）

## 本地启动

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量：复制 .env.example 为 .env，填入你的 DeepSeek API Key
#    DEEPSEEK_API_KEY=sk-xxx

# 3. 启动（前后端同时启动，前端 5173 / 后端 3000）
npm run dev
```

打开 http://localhost:5173/ 即可使用。也可分开启动：`npm run dev:fe`（前端）、`npm run dev:be`（后端）。

## 部署说明（Vercel）

1. 将代码推送到 GitHub 仓库，在 Vercel 中导入该仓库
2. 在 Vercel 项目设置中配置环境变量 `DEEPSEEK_API_KEY`
3. Framework Preset 选择 Vite（`vercel.json` 已配置构建命令与 serverless 函数，`maxDuration: 60`）
4. 部署完成后即可访问

> 注意：API Key 只放后端环境变量，绝不写入前端代码或提交到 Git；运行时数据（`data/`，含简历原文与对话）已在 `.gitignore` 中排除。

## 截图

（待补充）

- 简历分析页：docs/screenshots/analyze.png
- 模拟面试页：docs/screenshots/interview.png
- 面试报告页：docs/screenshots/report.png
- 面试记录页：docs/screenshots/records.png
