# 功能模块与接口清单

## 功能模块

### 1. 简历分析（首页 `/`）
- 粘贴简历文本 + 设置面试题数（3-8，默认 5）
- AI 输出：4 维度匹配度评分（含点评）、简历亮点、简历短板、预测面试题
- 从 5 个内置岗位中推荐并打分排序，岗位卡片可点击选中
- 选中岗位与简历内容保存在前端共享状态，供后续面试使用

### 2. 模拟面试（`/interview`）
- 基于岗位知识库（`server/data/jobs.json`：JD + 题目池 + 技能点）构造面试官系统提示词
- 面试官人设：该岗位资深面试官，专业友好；基于简历与 JD 提问，支持针对回答追问
- 每答完一题先输出简短点评（具体但温和，给改进方向）再出下一题
- 对话历史全程保留，保证上下文连续性
- 顶部进度条：第 X / N 题；最后一题答完出现「查看报告」按钮

### 3. 面试报告（`/report`）
- 整场对话交由 AI 生成复盘报告（严格 JSON）
- 内容：总分、4 个评分维度（表达清晰度/技术深度/逻辑性/岗位匹配度）、每题回顾（题目+得分+点评）、改进建议、复盘要点、还适合投的岗位
- 报告结果缓存在前端状态，避免重复生成；「保存记录」按钮接入记录存储

### 4. 面试记录（`/records`、`/records/:id`）
- 报告页可保存一条完整记录（简历、岗位、题数、对话历史、报告、时间）
- 列表页按时间倒序：时间、岗位、题数、总分，支持查看/删除（删除有确认）
- 详情页展示完整对话气泡与报告全部区块

### 5. 岗位知识库（`server/data/jobs.json`）
- 内置 5 个岗位模板：前端开发、自动化测试、后端开发、产品运营、数据分析
- 每个模板包含：`name`、`jd`（完整岗位职责与要求）、`questions`（常见面试题池）、`skills`（技能点）

### 6. AI 简历生成（`/resume-builder`）
- 表单填写真实信息：姓名/学校/专业/技能/项目经历要点，勾选目标岗位（可多选）
- AI 基于真实信息生成结构化 Markdown 简历（通用版）+ 每个目标岗位的侧重优化版本
- 铁律：绝不虚构经历、技能、数据，信息不足宁可不写
- 内置极简 Markdown 渲染（标题/粗体/列表），Tab 切换各版本，「复制当前版本」一键复制

### 7. 投递助手（`/apply`）
- 选择岗位 + 可选粘贴真实 JD（素材更贴合）+ 简历内容（自动带入首页/报告页上下文）
- AI 生成：推荐投递方向（公司类型/行业，绝不虚构具体公司名）、打招呼语（约 100 字）、求职信（300-400 字）
- 报告页「去投递」按钮直达；各素材支持一键复制，自行投递，不自动投递

## 接口清单

| 接口 | 方法 | 作用 | 输入 | 输出 |
|---|---|---|---|---|
| `/api/analyze` | POST | 简历分析 + 岗位推荐 | `{ resume, questions }` | `{ matchScores, highlights, weaknesses, predictedQuestions, recommendJobs }` |
| `/api/interview/start` | POST | 开始面试，返回第一题 | `{ resume, job, questions }` | `{ firstQuestion, total, job }` |
| `/api/interview/answer` | POST | 提交回答，返回点评+下一题 | `{ history, answer, resume, job, total }` | `{ comment, nextQuestion, isLast }` |
| `/api/interview/report` | POST | 生成面试报告 | `{ history, job }` | `{ totalScore, dimensions, perQuestion, suggestions, keyPoints, otherJobs }` |
| `/api/records` | POST / GET | 保存记录 / 记录列表（按时间倒序） | 记录对象 / — | `{ id }` / 记录数组 |
| `/api/records/:id` | GET / DELETE | 记录详情 / 删除 | — | 记录对象 / `{ ok: true }` |
| `/api/resume/generate` | POST | AI 生成简历（通用版 + 岗位版） | `{ basicInfo: { name, school, major, skills, projects, targetJobs } }` | `{ resumeText, versions: [{ job, text }] }` |
| `/api/apply/assist` | POST | 投递素材（清单/打招呼语/求职信） | `{ resume, job, jd? }` | `{ applyList: [{ company, reason }], greeting, coverLetter }` |
| `/api/health` | GET | 健康检查 | — | `{ status: "ok" }` |

## 项目结构

```
resume-interview/
├── api/index.js            # Vercel serverless 入口
├── server/
│   ├── dev.js              # 本地开发启动（端口 3000）
│   ├── index.js            # Express 应用工厂
│   ├── routes/             # analyze / interview / records / resume / apply 路由
│   ├── lib/
│   │   ├── ai.js           # DeepSeek 封装（JSON Mode + 围栏兜底解析）
│   │   └── store.js        # JSON 文件存储
│   └── data/jobs.json      # 岗位知识库
├── src/
│   ├── views/              # Home / Interview / Report / Records / RecordDetail / ResumeBuilder / Apply
│   ├── router（main.js）   # hash 路由
│   ├── store.js            # 前端共享状态
│   └── style.css           # 自研简洁样式
├── .env.example            # DEEPSEEK_API_KEY 模板
└── vercel.json             # serverless 配置（maxDuration 60）
```

## 安全约定

- `DEEPSEEK_API_KEY` 只放后端环境变量，不进前端代码、不进 Git
- `.env`、`data/`（运行时记录，含简历原文与对话）均在 `.gitignore` 中排除
