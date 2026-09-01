import { reactive } from 'vue'

// 全局共享状态：简历分析结果 + 选中的岗位（阶段1 用前端变量保存）
export const appState = reactive({
  resume: '',
  questionCount: 5,
  difficulty: 'medium',
  analysis: null,
  selectedJob: '',
  // 阶段2/3：面试对话与报告
  interviewHistory: [],
  interviewTotal: 5,
  report: null,
})

export function selectJob(name) {
  appState.selectedJob = name
}
