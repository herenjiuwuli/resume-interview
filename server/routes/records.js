import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { readJSON, writeJSON } from '../lib/store.js'

const router = Router()
const KEY = 'records'

router.get('/api/records', async (_req, res) => {
  const records = (await readJSON(KEY)) || []
  const list = [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json(list)
})

router.post('/api/records', async (req, res) => {
  const { resume = '', job, questions, history = [], report } = req.body || {}

  if (!job || !report) {
    return res.status(400).json({ error: '缺少岗位或报告数据' })
  }

  const records = (await readJSON(KEY)) || []
  const record = {
    id: randomUUID(),
    resume: String(resume).slice(0, 8000),
    job,
    questions: Number(questions) || 0,
    history,
    report,
    createdAt: new Date().toISOString(),
  }
  records.push(record)
  await writeJSON(KEY, records)

  res.json({ id: record.id })
})

router.get('/api/records/:id', async (req, res) => {
  const records = (await readJSON(KEY)) || []
  const record = records.find((r) => r.id === req.params.id)
  if (!record) {
    return res.status(404).json({ error: '记录不存在' })
  }
  res.json(record)
})

router.delete('/api/records/:id', async (req, res) => {
  const records = (await readJSON(KEY)) || []
  const next = records.filter((r) => r.id !== req.params.id)
  if (next.length === records.length) {
    return res.status(404).json({ error: '记录不存在' })
  }
  await writeJSON(KEY, next)
  res.json({ ok: true })
})

export default router
