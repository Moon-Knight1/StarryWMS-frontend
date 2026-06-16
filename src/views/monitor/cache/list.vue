<template>
  <div class="archival-monitor">
    <!-- Header -->
    <header class="arch-header">
      <div class="arch-header-left">
        <div class="arch-icon-box">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="arch-icon-svg">
            <rect x="3" y="2" width="14" height="16" rx="1" />
            <line x1="7" y1="6" x2="13" y2="6" /><line x1="7" y1="9" x2="13" y2="9" />
            <line x1="7" y1="12" x2="11" y2="12" />
          </svg>
        </div>
        <div>
          <h1 class="arch-title">Cache Index</h1>
          <p class="arch-sub">Redis key&#8209;value browser</p>
        </div>
      </div>
    </header>

    <!-- Three-column layout -->
    <div class="arch-columns">
      <!-- LEFT: Cache Names -->
      <section class="arch-panel">
        <div class="panel-head">
          <span class="panel-title">Namespaces</span>
          <button class="btn-refresh" @click="refreshCacheNames()" title="刷新">
            <el-icon :size="12"><Refresh /></el-icon>
          </button>
        </div>
        <div class="panel-list" v-loading="loading">
          <div
            v-for="(item, idx) in cacheNames"
            :key="idx"
            class="list-item"
            :class="{ active: nowCacheName === item.cacheName }"
            @click="getCacheKeys(item)"
          >
            <span class="item-idx">{{ String(idx + 1).padStart(2, '0') }}</span>
            <span class="item-text" :title="item.cacheName">{{ nameFormatter(item) }}</span>
            <span class="item-remark" v-if="item.remark">{{ item.remark }}</span>
            <button class="btn-del" @click.stop="handleClearCacheName(item)" title="清理">
              <el-icon :size="11"><Delete /></el-icon>
            </button>
          </div>
          <div class="empty" v-if="!loading && cacheNames.length === 0">
            <span>No cache namespaces</span>
          </div>
        </div>
      </section>

      <!-- MIDDLE: Cache Keys -->
      <section class="arch-panel">
        <div class="panel-head">
          <span class="panel-title">Keys</span>
          <button class="btn-refresh" @click="refreshCacheKeys()" title="刷新">
            <el-icon :size="12"><Refresh /></el-icon>
          </button>
        </div>
        <div class="panel-list" v-loading="subLoading">
          <div
            v-for="(key, idx) in cacheKeys"
            :key="idx"
            class="list-item key-item"
            :class="{ active: activeKey === key }"
            @click="handleCacheValue(key)"
          >
            <span class="item-idx">{{ String(idx + 1).padStart(2, '0') }}</span>
            <span class="item-text mono" :title="key">{{ keyFormatter(key) }}</span>
            <button class="btn-del" @click.stop="handleClearCacheKey(key)" title="清理">
              <el-icon :size="11"><Delete /></el-icon>
            </button>
          </div>
          <div class="empty" v-if="!subLoading && cacheKeys.length === 0">
            <span>{{ nowCacheName ? 'No keys' : 'Select a namespace' }}</span>
          </div>
        </div>
      </section>

      <!-- RIGHT: Cache Content -->
      <section class="arch-panel content-panel">
        <div class="panel-head">
          <span class="panel-title">Content</span>
          <button class="btn-purge" @click="handleClearCacheAll()">
            <el-icon :size="11"><Delete /></el-icon> PURGE ALL
          </button>
        </div>
        <div class="panel-body">
          <div class="content-fields" v-if="cacheForm.cacheName">
            <div class="field">
              <label class="field-label">NAMESPACE</label>
              <div class="field-val mono">{{ cacheForm.cacheName }}</div>
            </div>
            <div class="field">
              <label class="field-label">KEY</label>
              <div class="field-val mono">{{ cacheForm.cacheKey }}</div>
            </div>
            <div class="field">
              <label class="field-label">VALUE</label>
              <pre class="field-pre">{{ cacheForm.cacheValue }}</pre>
            </div>
          </div>
          <div class="empty" v-else>
            <span>Select a key to inspect</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup name="CacheList">
import { listCacheName, listCacheKey, getCacheValue, clearCacheName, clearCacheKey, clearCacheAll } from "@/api/monitor/cache"

const { proxy } = getCurrentInstance()

const cacheNames = ref([])
const cacheKeys = ref([])
const cacheForm = ref({})
const loading = ref(true)
const subLoading = ref(false)
const nowCacheName = ref("")
const activeKey = ref("")

function getCacheNames() {
  loading.value = true
  listCacheName().then(response => { cacheNames.value = response.data; loading.value = false })
}

function refreshCacheNames() { getCacheNames(); proxy.$modal.msgSuccess("刷新缓存列表成功") }

function handleClearCacheName(row) {
  clearCacheName(row.cacheName).then(() => {
    proxy.$modal.msgSuccess("清理缓存名称[" + row.cacheName + "]成功")
    getCacheKeys()
  })
}

function getCacheKeys(row) {
  const cacheName = row !== undefined ? row.cacheName : nowCacheName.value
  if (cacheName === "") return
  subLoading.value = true; activeKey.value = ""; cacheForm.value = {}
  listCacheKey(cacheName).then(response => {
    cacheKeys.value = response.data; subLoading.value = false; nowCacheName.value = cacheName
  })
}

function refreshCacheKeys() { getCacheKeys(); proxy.$modal.msgSuccess("刷新键名列表成功") }

function handleClearCacheKey(cacheKey) {
  clearCacheKey(cacheKey).then(() => {
    proxy.$modal.msgSuccess("清理缓存键名[" + cacheKey + "]成功")
    getCacheKeys()
  })
}

function nameFormatter(row) { return row.cacheName.replace(":", "") }
function keyFormatter(cacheKey) { return cacheKey.replace(nowCacheName.value, "") }

function handleCacheValue(cacheKey) {
  activeKey.value = cacheKey
  getCacheValue(nowCacheName.value, cacheKey).then(response => { cacheForm.value = response.data })
}

function handleClearCacheAll() { clearCacheAll().then(() => { proxy.$modal.msgSuccess("清理全部缓存成功") }) }

getCacheNames()
</script>

<style scoped>
.archival-monitor {
  --bg: #0e1318;
  --bg-panel: #141c26;
  --bg-hover: #1a2430;
  --bg-active: #1e2a38;
  --border: rgba(200, 149, 108, 0.08);
  --border-light: rgba(200, 149, 108, 0.05);
  --copper: #c8956c;
  --copper-dim: rgba(200, 149, 108, 0.1);
  --red: #d06050;
  --text: #dce4ec;
  --text-mid: #8a9aaa;
  --text-dim: #556677;
  --font-display: 'Libre Baskerville', 'Noto Serif SC', serif;
  --font-body: 'DM Sans', 'Noto Sans SC', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  padding: 24px 28px;
  min-height: calc(100vh - 84px);
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  position: relative;
}

/* Header */
.arch-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
  position: relative;
}
.arch-header::after {
  content: ''; position: absolute; bottom: -1px; left: 0;
  width: 80px; height: 1px; background: var(--copper); opacity: 0.4;
}

.arch-header-left { display: flex; align-items: center; gap: 12px; }

.arch-icon-box {
  width: 30px; height: 30px;
  display: grid; place-items: center;
  border: 1px solid var(--copper-dim); color: var(--copper);
}
.arch-icon-svg { width: 14px; height: 14px; }

.arch-title {
  font-family: var(--font-display); font-size: 18px;
  font-weight: 700; font-style: italic; margin: 0;
}
.arch-sub { font-size: 11px; color: var(--text-dim); letter-spacing: 0.08em; margin: 2px 0 0; }

/* Columns */
.arch-columns {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 12px; height: calc(100vh - 180px);
}

/* Panel */
.arch-panel {
  background: var(--bg-panel); border: 1px solid var(--border);
  display: flex; flex-direction: column; overflow: hidden;
  position: relative;
}

.panel-head {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 14px; border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.panel-title {
  font-family: var(--font-display); font-size: 13px;
  font-weight: 600; font-style: italic; flex: 1;
}

.btn-refresh, .btn-del {
  background: none; border: 1px solid transparent;
  color: var(--text-dim); cursor: pointer;
  padding: 3px; display: grid; place-items: center;
  transition: all 0.2s;
}
.btn-refresh:hover { color: var(--copper); border-color: var(--copper-dim); }
.btn-del { opacity: 0; transition: opacity 0.2s, color 0.2s; }
.list-item:hover .btn-del { opacity: 1; }
.btn-del:hover { color: var(--red); }

.btn-purge {
  background: none; border: 1px solid var(--border);
  color: var(--text-dim); cursor: pointer;
  padding: 3px 8px; font-family: var(--font-body);
  font-size: 10px; display: flex; align-items: center; gap: 3px;
  transition: all 0.2s; margin-left: auto;
}
.btn-purge:hover { color: var(--red); border-color: rgba(208, 96, 80, 0.3); background: rgba(208, 96, 80, 0.06); }

/* List */
.panel-list {
  flex: 1; overflow-y: auto; padding: 2px 0;
}
.panel-list::-webkit-scrollbar { width: 4px; }
.panel-list::-webkit-scrollbar-thumb { background: rgba(200, 149, 108, 0.15); border-radius: 2px; }

.list-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; cursor: pointer;
  transition: background 0.15s;
  border-left: 2px solid transparent;
}
.list-item:hover { background: var(--bg-hover); }
.list-item.active { background: var(--bg-active); border-left-color: var(--copper); }

.item-idx {
  font-family: var(--font-mono); font-size: 10px;
  color: var(--text-dim); min-width: 16px; flex-shrink: 0;
}
.item-text {
  flex: 1; font-size: 12px; color: var(--text);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.item-text.mono { font-family: var(--font-mono); font-size: 11px; color: var(--text-mid); }
.item-remark {
  font-size: 10px; color: var(--text-dim);
  max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  flex-shrink: 0;
}

/* Content panel */
.content-panel .panel-body { flex: 1; overflow-y: auto; }

.content-fields { padding: 14px; display: flex; flex-direction: column; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 5px; }
.field-label {
  font-size: 9px; letter-spacing: 0.1em;
  color: var(--text-dim); font-family: var(--font-mono);
  font-weight: 500;
}
.field-val {
  font-size: 12px; padding: 7px 10px;
  background: var(--bg); border: 1px solid var(--border-light);
  word-break: break-all;
}
.field-val.mono { font-family: var(--font-mono); font-size: 11px; color: var(--text-mid); }
.field-pre {
  font-family: var(--font-mono); font-size: 11px;
  color: var(--text-mid); padding: 10px;
  background: var(--bg); border: 1px solid var(--border-light);
  margin: 0; white-space: pre-wrap; word-break: break-all;
  max-height: calc(100vh - 420px); overflow-y: auto;
  line-height: 1.6;
}
.field-pre::-webkit-scrollbar { width: 4px; }
.field-pre::-webkit-scrollbar-thumb { background: rgba(200, 149, 108, 0.15); border-radius: 2px; }

.empty {
  display: flex; align-items: center; justify-content: center;
  padding: 40px 14px; font-size: 12px; color: var(--text-dim);
  font-style: italic;
}

/* Responsive */
@media (max-width: 1000px) {
  .arch-columns { grid-template-columns: 1fr; height: auto; }
  .arch-panel { min-height: 280px; }
}
</style>
