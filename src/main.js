import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import Interview from './views/Interview.vue'
import Report from './views/Report.vue'
import Records from './views/Records.vue'
import RecordDetail from './views/RecordDetail.vue'
import ResumeBuilder from './views/ResumeBuilder.vue'
import Apply from './views/Apply.vue'
import './style.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/interview', component: Interview },
    { path: '/report', component: Report },
    { path: '/records', component: Records },
    { path: '/records/:id', component: RecordDetail },
    { path: '/resume-builder', component: ResumeBuilder },
    { path: '/apply', component: Apply },
  ],
})

createApp(App).use(router).mount('#app')
