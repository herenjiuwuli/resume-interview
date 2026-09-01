---
type: spec
tags: [项目/ai简历面试模拟器, 类型/trae指令]
---

# AI 简历面试模拟器 · 给 Trae 的分阶段开发指令

> 用法：按阶段把对应 Prompt 复制给 Trae，每阶段验收通过再进下一阶段。不要一次全丢。
> 方案依据：[[方案]]

## 全局约束（每阶段都要遵守）

1. 技术栈：Vue 3 + Vite（前端，不用 TS）+ Node/Express（后端，serverless 形式）+ DeepSeek API
2. 代码目录：`D:\Projects\resume-interview`
3. 可参考/复用 `D:\Projects\ai-hot-topic` 的：ai.js（DeepSeek 封装）、store.js（JSON 存储）、serverless 部署结构
4. 安全：DEEPSEEK_API_KEY 只放后端环境变量，绝不进前端代码或 Git；.env 要 gitignore
5. 前端路由用 hash 模式；自研简洁 CSS，不引重型 UI 库
6. 后端返回 JSON 格式，前端 fetch 请求
7. 界面中文；面试场景偏正式、专业但友好
8. 严格按本指令做，不自由发挥加需求

---

## 阶段 1：项目骨架 + 简历分析 + 岗位推荐

**Prompt（复制给 Trae）**：

```
在 D:\Projects\resume-interview 从零搭建一个「AI 简历面试模拟器」项目骨架。

技术栈：Vue3 + Vite 前端，Node/Express 后端（参考 D:\Projects\ai-hot-topic 的结构：server/dev.js 本地启动、api/index.js serverless 导出、server/lib/ai.js 调 DeepSeek、server/lib/store.js 存 JSON）。

第一版要实现两个功能：

1. 简历分析接口 POST /api/analyze
   输入：{ resume: "简历文本", questions: 5 }
   输出：{ matchScores: [...], highlights: [...], weaknesses: [...], predictedQuestions: [...], recommendJobs: [...] }
   - 调用 DeepSeek 分析简历，prompt 要求返回严格 JSON
   - matchScores：总体匹配度评分
   - recommendJobs：岗位推荐列表 [{ name: "前端开发", score: 85, reason: "..." }]，从这些岗位里推荐：前端开发、自动化测试、后端开发、产品运营、数据分析

2. 岗位知识库 server/data/jobs.json
   内置 5 个岗位模板：前端开发、自动化测试、后端开发、产品运营、数据分析
   每个模板：{ name, jd: "岗位职责与要求（一段完整 JD 文本）", questions: ["常见面试题1", ...], skills: ["技能点", ...] }

3. 前端简历页（首页 /）
   简历文本框 + 题数设置（3-8，默认5）+ 「开始分析」按钮
   点击后调 /api/analyze，展示：匹配度、亮点、短板、预测问题、岗位推荐卡片列表
   岗位推荐卡片可点击选中（高亮）
   UI 简洁大方，中文。

验收标准：
- npm run dev 能启动，后端 3000 端口
- 粘贴简历 → 返回分析结果 + 岗位推荐列表
- 选中岗位后状态保存（前端变量即可，进入面试页用）
```

**验收**：粘贴简历 → 返回分析结果 + 岗位推荐列表（有 score/reason）

---

## 阶段 2：模拟面试对话（多轮 + 逐题点评）

**Prompt（复制给 Trae）**：

```
在阶段 1 基础上加「模拟面试」功能。

1. 接口 POST /api/interview/start
   输入：{ resume, job: "选中的岗位名", questions: 5 }
   行为：读取 jobs.json 里该岗位的 JD 和题目池，构造系统提示词（面试官人设：该岗位资深面试官，风格专业友好；基于简历和 JD 提问；每答完先简短点评再出下一题），返回第一题。

2. 接口 POST /api/interview/answer
   输入：{ history: [ {role:"user"/"assistant", content}... ], answer: "用户回答" }
   行为：把完整对话历史 + 用户回答发给 DeepSeek，返回 { comment: "对本题的简短点评", nextQuestion: "下一题", isLast: false }；最后一题时 isLast: true，nextQuestion 为空。
   - 历史里保留面试官身份提示，保证连续性和追问能力
   - 点评约束：具体但温和，给出改进方向，不打击

3. 前端面试页 /interview
   对话界面：AI 问题气泡 / 用户回答输入框 / 发送按钮
   每轮：用户发回答 → 显示 AI 点评 + 下一题
   顶部进度条：第 X / N 题
   最后一题答完 → 「查看报告」按钮
```

**验收**：能连续问答 5 题，每题先点评再出下一题；历史上下文不丢

---

## 阶段 3：面试报告

**Prompt（复制给 Trae）**：

```
在阶段 2 基础上加「面试报告」功能。

1. 接口 POST /api/interview/report
   输入：{ history, job }
   行为：把整场对话发给 DeepSeek，生成报告（严格 JSON）：
   { totalScore: 0-100, dimensions: [{ name: "表达清晰度", score: 80 }, { name: "技术深度", score: 70 }, { name: "逻辑性", score: 85 }, { name: "岗位匹配度", score: 75 }], perQuestion: [{ q: "...", score: 80, comment: "..." }], suggestions: ["改进建议1", ...], keyPoints: ["复盘要点", ...], otherJobs: ["还适合投的岗位", ...] }

2. 前端报告页 /report
   展示：总分大数字 + 雷达图或条形图（评分维度）+ 每题回顾 + 改进建议 + 复盘要点 + 其他岗位建议
   「保存记录」按钮
   UI 简洁大方，报告感强（求职场景）
```

**验收**：结束面试 → 生成完整报告，包含评分维度、每题回顾、建议

---

## 阶段 4：记录保存 + 记录页

**Prompt（复制给 Trae）**：

```
在阶段 3 基础上加「面试记录」功能。

1. 接口（复用 store.js JSON 存储）：
   - POST /api/records：保存一条记录 { resume, job, questions, history, report, createdAt }
   - GET /api/records：返回记录列表（按时间倒序）
   - DELETE /api/records/:id：删除
   - GET /api/records/:id：查看单条详情

2. 前端记录页 /records
   列表：时间、岗位、题数、总分、操作（查看/删除）
   查看：进入详情页展示完整对话 + 报告

3. 面试结束时自动弹「保存记录」确认（或报告页手动点）
```

**验收**：面试记录可保存、列表可见、可回看、可删除

---

## 阶段 5：生成简历（AI 简历助手）

**Prompt（复制给 Trae）**：

```
在阶段 4 基础上加「AI 生成简历」功能。

1. 接口 POST /api/resume/generate
   输入：{ basicInfo: { name, school, major, skills, projects, targetJobs: ["前端开发", "自动化测试"] } }
   行为：调用 DeepSeek，把 basicInfo 组织成结构化简历，返回 { resumeText: "markdown 格式简历文本", versions: [{ job: "前端开发", text: "针对该岗位优化版" }] }
   严格约束：只基于输入的真实信息组织排版，绝不虚构经历/技能/数据（这是用户的底线）。

2. 前端页面 /resume-builder
   表单：姓名、学校、专业、技能（逗号分隔）、项目经历要点（文本框）、目标岗位（多选）
   「生成简历」按钮 → 展示 markdown 简历 + 多岗位版本 Tab
   「复制」按钮（复制当前版本文本）
   简洁中文 UI
```

**验收**：填基本信息 → 生成结构化简历 + 多岗位版本，可复制

---

## 阶段 6：投递助手（半自动）

**Prompt（复制给 Trae）**：

```
在阶段 5 基础上加「投递助手」功能。

1. 接口 POST /api/apply/assist
   输入：{ resume, job: "岗位名", jd?: "用户粘贴的真实 JD（可选）" }
   行为：
   - 输出 A：投递清单 [{ company: "推荐投递的岗位/公司", reason: "匹配理由" }]（基于岗位知识库+简历生成，AI 生成）
   - 输出 B：打招呼语（投递时的自我介绍，针对该岗位定制）+ 求职信（可选完整版）
   返回 { applyList: [...], greeting: "...", coverLetter: "..." }

2. 前端：面试页/报告页增加「去投递」入口，或独立页面 /apply
   展示：投递清单卡片 + 打招呼语（带复制按钮）+ 求职信（带复制按钮）

3. 明确不做：不做自动登录招聘网站、不做自动点击投递（合规与封号风险）；只生成素材，用户手动复制投递。
```

**验收**：选岗位 → 生成投递清单 + 打招呼语 + 求职信，可复制

---

## 阶段 7：部署 + 收尾

**Prompt（复制给 Trae）**：

```
1. 检查并完善：.env.example（DEEPSEEK_API_KEY）、.gitignore（忽略 .env/data）、vercel.json（maxDuration 60）
2. 构建测试：npm run build 通过
3. 写 README：项目介绍、功能列表、技术栈、本地启动方式、部署说明、截图占位
4. 写 FEATURES.md 或更新文档：说明 5 个功能模块和接口清单
5. 不要部署（用户手动部署），不要 push（用户手动 push）
```

**验收**：本地构建通过，README 完整

---

## 阶段 8：功能增强（6 项，按顺序做）

### 8.1 面试追问模式

**Prompt（复制给 Trae）**：

```
在现有模拟面试上加「追问」机制，让面试更贴近真实。

1. 后端 interview.js：
   - start 接口新增参数 difficulty（easy/medium/hard，默认 medium）
   - buildSystemPrompt 根据难度调整提问深度：easy 偏基础、medium 常规、hard 问题更有挑战且允许追问
   - answer 接口返回新增两个字段：
     - followUp: true/false（本轮是否在追问中）
     - 追问逻辑：当 AI 返回的内容是「追问」时（prompt 里约定：点评后可输出追问问题，追问标记为 isFollowUp），前端据此显示「追问」标签
   - 控制规则：同一道题最多追问 1 次（前端记录，追问过就不再加 followUp）；追问不计入总题数
   - prompt 补充：「候选人回答后，在 medium/hard 难度下，对回答中值得深挖的点可以追问一次（追问标记 isFollowUp: true），追问后等待候选人再次回答再进入下一题；easy 难度不追问」

2. 前端 Interview.vue：
   - 显示「追问」标签（区分普通题目）
   - 追问后再次回答 → 正常点评 + 下一题
   - 难度从 Home 页传入并展示
```

**验收**：medium/hard 难度下，AI 回答后可追问一次再下一题；easy 不追问；题数正确

### 8.2 每题即时评分

**Prompt（复制给 Trae）**：

```
在 8.1 基础上加「每题即时评分」。

1. 后端 interview.js answer 接口：返回新增 score 字段（0-100 整数，AI 点评时顺便给出）
   prompt 补充：「输出 JSON 增加 score: 0-100，表示对候选人本题回答的评分」

2. 前端 Interview.vue：
   点评旁显示本题分数（颜色分级：>=85 绿、60-84 蓝、<60 橙）
   「本题已得分」展示
```

**验收**：每题答完显示分数 + 颜色

### 8.3 刷新恢复面试

**Prompt（复制给 Trae）**：

```
在 8.2 基础上加「面试进度本地保存」。

1. 前端 Interview.vue：
   - 面试进行中把 { resume, job, difficulty, total, history } 存入 localStorage（key: interview_progress）
   - 每次回答/收到问题后更新
   - 进入页面时检测 localStorage 有进度 → 提示「检测到未完成面试，是否继续？」→ 恢复
   - 正常完成面试（生成报告）或用户主动放弃 → 清除 localStorage
```

**验收**：面试中途刷新页面 → 恢复进度继续

### 8.4 记录页统计

**Prompt（复制给 Trae）**：

```
在 8.3 基础上给记录页加统计。

1. 前端 Records.vue（后端 records 接口已有数据，不需要改后端）：
   - 顶部统计卡片：总场次、平均总分、最高分、最近一次分数
   - 各维度平均分横向条（表达清晰度/技术深度/逻辑性/岗位匹配度）
   - 最近 10 场总分趋势（简单折线/柱状，自绘 div 或 Chart.js 均可）
   - 无记录时显示空状态提示
```

**验收**：记录页有统计卡片 + 维度平均 + 趋势图

### 8.5 面试难度分级

**Prompt（复制给 Trae）**：

```
在 8.1 基础上完善难度分级前端。

1. Home.vue：开始分析前加「面试难度」选择（简单/中等/困难，默认中等）
2. 难度传入 analyze 结果后的面试启动（/api/interview/start 的 difficulty 参数）
3. 面试页展示当前难度标签
4. 难度含义：
   - 简单：基础问题为主，不追问，点评更鼓励
   - 中等：常规问题，可追问一次（默认）
   - 困难：深挖细节、追问多、问题更有挑战
```

**验收**：三种难度可选，面试行为不同

### 8.6 回答参考要点

**Prompt（复制给 Trae）**：

```
在 8.5 基础上加「参考要点」功能。

1. 后端 interview.js answer 接口：返回新增 referencePoints: ["要点1", "要点2", "要点3"]（AI 点评时顺便给出「这道题好的回答应该包含什么」）
   prompt 补充：「输出 JSON 增加 referencePoints: 3 条左右本题的参考答案要点（好的回答应包含的角度/内容）」

2. 前端 Interview.vue：
   点评下方加「查看参考要点」折叠按钮，点击展开显示 referencePoints
   提示文案：「答完再看，先自己想想」
```

**验收**：每题答完可展开看参考要点

---

## 附：接口清单（开发完核对）

| 接口 | 方法 | 作用 |
|---|---|---|
| /api/analyze | POST | 简历分析 + 岗位推荐 |
| /api/interview/start | POST | 开始面试，返回第一题 |
| /api/interview/answer | POST | 提交回答，返回点评+下一题 |
| /api/interview/report | POST | 生成面试报告 |
| /api/records | POST/GET | 保存/列表 |
| /api/records/:id | GET/DELETE | 详情/删除 |
| /api/resume/generate | POST | AI 生成简历（多岗位版本） |
| /api/apply/assist | POST | 投递助手（清单+打招呼语+求职信） |

## 相关
- 方案：[[方案]]
- 复用参考：D:\Projects\ai-hot-topic
