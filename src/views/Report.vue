<template>
  <div>
    <div v-if="loading" class="card loading">AI 正在生成面试报告，请稍候…</div>

    <div v-else-if="loadError" class="card">
      <div class="error-tip">{{ loadError }}</div>
      <button class="btn btn-ghost" @click="$router.push('/')">返回首页</button>
    </div>

    <template v-else-if="report">
      <!-- 总分 -->
      <div class="card score-hero">
        <div class="score-num" :class="scoreClass(report.totalScore)">{{ report.totalScore }}</div>
        <div class="score-meta">
          <div class="score-title">综合面试得分</div>
          <span class="tag" :class="gradeTag">{{ grade }}</span>
          <span class="muted">岗位：{{ job }}</span>
        </div>
      </div>

      <!-- 维度评分 -->
      <div class="card">
        <div class="card-title">评分维度</div>
        <div class="dim-list">
          <div v-for="d in report.dimensions" :key="d.name" class="dim-item">
            <div class="dim-head">
              <span>{{ d.name }}</span>
              <b :class="scoreClass(d.score)">{{ d.score }}</b>
            </div>
            <div class="bar"><i :style="{ width: d.score + '%' }" :class="scoreClass(d.score)"></i></div>
          </div>
        </div>
      </div>

      <!-- 每题回顾 -->
      <div class="card">
        <div class="card-title">每题回顾</div>
        <div v-for="(item, i) in report.perQuestion" :key="i" class="q-item">
          <div class="q-head">
            <span class="q-index">第 {{ i + 1 }} 题</span>
            <b :class="scoreClass(item.score)">{{ item.score }} 分</b>
          </div>
          <p class="q-text">{{ item.q }}</p>
          <p class="muted">{{ item.comment }}</p>
        </div>
      </div>

      <div class="cols">
        <!-- 改进建议 -->
        <div class="card">
          <div class="card-title"><span class="tag">改进建议</span></div>
          <ul class="plain-list">
            <li v-for="(s, i) in report.suggestions" :key="i">{{ s }}</li>
          </ul>
        </div>
        <!-- 复盘要点 -->
        <div class="card">
          <div class="card-title"><span class="tag tag-success">复盘要点</span></div>
          <ul class="plain-list">
            <li v-for="(k, i) in report.keyPoints" :key="i">{{ k }}</li>
          </ul>
        </div>
      </div>

      <!-- 其他岗位 -->
      <div class="card">
        <div class="card-title">还适合投的岗位</div>
        <div class="job-tags">
          <span v-for="(j, i) in report.otherJobs" :key="i" class="tag">{{ j }}</span>
          <span v-if="!report.otherJobs.length" class="muted">暂无建议</span>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-ghost" @click="$router.push('/')">返回首页</button>
        <button class="btn btn-ghost" @click="$router.push('/apply')">去投递</button>
        <button class="btn" :disabled="saved || saving" @click="saveRecord">
          {{ saved ? '已保存' : saving ? '保存中…' : '保存记录' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { appState } from '../store.js'

const loading = ref(true)
const loadError = ref('')
const report = ref(appState.report)
const job = ref(appState.selectedJob)

const grade = computed(() => {
  const s = report.value?.totalScore || 0
  if (s >= 85) return '优秀'
  if (s >= 70) return '良好'
  if (s >= 60) return '及格'
  return '待提升'
})

const gradeTag = computed(() => {
  const s = report.value?.totalScore || 0
  if (s >= 85) return 'tag-success'
  if (s >= 60) return 'tag-warning'
  return ''
})

function scoreClass(score) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'mid'
  return 'low'
}

const saved = ref(false)
const saving = ref(false)

async function saveRecord() {
  if (saved.value || saving.value) return
  saving.value = true
  try {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume: appState.resume,
        job: appState.selectedJob,
        questions: appState.interviewTotal,
        history: appState.interviewHistory,
        report: report.value,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || '保存失败')
    saved.value = true
  } catch (e) {
    alert(e.message || '保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

async function fetchReport() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await fetch('/api/interview/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: appState.interviewHistory, job: appState.selectedJob }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || '报告生成失败')
    report.value = data
    appState.report = data
  } catch (e) {
    loadError.value = e.message || '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!appState.interviewHistory.length) {
    loadError.value = '暂无面试记录，请先完成一场模拟面试'
    loading.value = false
    return
  }
  if (appState.report) {
    loading.value = false
    return
  }
  fetchReport()
})
</script>

<style scoped>
.score-hero {
  display: flex;
  align-items: center;
  gap: 20px;
}
.score-num {
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
}
.score-num.high {
  color: var(--success);
}
.score-num.mid {
  color: var(--warning);
}
.score-num.low {
  color: var(--danger);
}
.score-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.score-title {
  font-size: 16px;
  font-weight: 600;
}
.dim-list {
  display: grid;
  gap: 14px;
}
.dim-head {
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  margin-bottom: 6px;
}
.dim-head b.high {
  color: var(--success);
}
.dim-head b.mid {
  color: var(--warning);
}
.dim-head b.low {
  color: var(--danger);
}
.bar {
  height: 8px;
  border-radius: 4px;
  background: #edeff1;
  overflow: hidden;
}
.bar i {
  display: block;
  height: 100%;
  border-radius: 4px;
}
.bar i.high {
  background: var(--success);
}
.bar i.mid {
  background: var(--warning);
}
.bar i.low {
  background: var(--danger);
}
.q-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.q-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.q-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.q-index {
  font-weight: 600;
}
.q-head b.high {
  color: var(--success);
}
.q-head b.mid {
  color: var(--warning);
}
.q-head b.low {
  color: var(--danger);
}
.q-text {
  font-weight: 500;
  margin-bottom: 4px;
}
.muted {
  color: var(--text-secondary);
  font-size: 13px;
}
.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.cols .card + .card {
  margin-top: 0;
}
.plain-list {
  padding-left: 20px;
  display: grid;
  gap: 8px;
}
.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
@media (max-width: 640px) {
  .cols {
    grid-template-columns: 1fr;
  }
}
</style>
