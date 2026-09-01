<template>
  <div class="page">
    <header class="topbar">
      <router-link to="/" class="logo">AI 简历面试模拟器</router-link>
      <nav class="nav">
        <router-link to="/">首页</router-link>
        <router-link to="/resume-builder">写简历</router-link>
        <router-link to="/apply">投递助手</router-link>
        <router-link to="/records">面试记录</router-link>
      </nav>
    </header>
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.logo {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
}
.nav {
  margin-left: auto;
  display: flex;
  gap: 20px;
}
.nav a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
}
.nav a.router-link-active {
  color: var(--primary);
  font-weight: 500;
}
</style>
