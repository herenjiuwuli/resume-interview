import express from 'express'
import analyzeRouter from './routes/analyze.js'
import interviewRouter from './routes/interview.js'
import recordsRouter from './routes/records.js'
import resumeRouter from './routes/resume.js'
import applyRouter from './routes/apply.js'

export function createApp() {
  const app = express()

  app.use(express.json({ limit: '1mb' }))
  app.use(analyzeRouter)
  app.use(interviewRouter)
  app.use(recordsRouter)
  app.use(resumeRouter)
  app.use(applyRouter)

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  return app
}
