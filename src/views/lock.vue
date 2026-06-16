<template>
  <div class="lock-container" @mousemove="onMouseMove">
    <!-- 深空背景层 -->
    <canvas ref="starCanvas" class="star-layer"></canvas>

    <!-- 星图网格层 -->
    <div class="cartography-layer">
      <svg class="star-chart" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
        <!-- 同心圆轨道 -->
        <circle v-for="r in [120, 200, 280, 360]" :key="r"
          cx="400" cy="400" :r="r"
          fill="none" stroke="var(--轨道色)" stroke-width="0.5"
          stroke-dasharray="4 8" class="orbit-ring" />
        <!-- 十字准线 -->
        <line x1="400" y1="40" x2="400" y2="760" stroke="var(--轨道色)" stroke-width="0.3" />
        <line x1="40" y1="400" x2="760" y2="400" stroke="var(--轨道色)" stroke-width="0.3" />
        <!-- 对角线 -->
        <line x1="118" y1="118" x2="682" y2="682" stroke="var(--轨道色)" stroke-width="0.2" stroke-dasharray="2 6" />
        <line x1="682" y1="118" x2="118" y2="682" stroke="var(--轨道色)" stroke-width="0.2" stroke-dasharray="2 6" />
        <!-- 刻度标记 -->
        <g v-for="i in 24" :key="'tick-' + i"
          :transform="`rotate(${i * 15}, 400, 400)`">
          <line x1="400" y1="42" x2="400" y2="52"
            stroke="var(--刻度色)" stroke-width="0.8" />
          <line v-if="i % 6 === 0" x1="400" y1="36" x2="400" y2="52"
            stroke="var(--刻度色)" stroke-width="1.2" />
        </g>
        <!-- 星座连线 -->
        <polyline :points="constellationPoints" fill="none"
          stroke="var(--星座色)" stroke-width="0.8" stroke-linecap="round" />
        <circle v-for="(star, i) in constellationStars" :key="'cstar-' + i"
          :cx="star[0]" :cy="star[1]" :r="star[2] || 2"
          :fill="i === activeStarIndex ? 'var(--高亮星色)' : 'var(--星点色)'"
          :class="{ 'pulse-star': i === activeStarIndex }" />
      </svg>
    </div>

    <!-- 主内容区 — 不对称布局 -->
    <div class="content-shell">
      <!-- 左侧：时间区块 -->
      <div class="time-block">
        <div class="time-label">LOCAL TIME</div>
        <div class="time-digits">
          <span class="digit-group">{{ timeParts.hours }}</span>
          <span class="time-colon" :class="{ dim: colonDim }">:</span>
          <span class="digit-group">{{ timeParts.minutes }}</span>
        </div>
        <div class="time-seconds">{{ timeParts.seconds }}</div>
        <div class="time-date">{{ currentDate }}</div>
        <div class="time-divider"></div>
        <div class="system-tag">STAR WMS · 锁定状态</div>
      </div>

      <!-- 右侧：解锁区块 -->
      <div class="unlock-block">
        <div class="user-badge">
          <div class="badge-ring">
            <img :src="userStore.avatar" class="badge-avatar" @error="onAvatarError" />
          </div>
          <div class="badge-info">
            <div class="badge-name">{{ userStore.nickName }}</div>
            <div class="badge-role">系统已锁定</div>
          </div>
        </div>

        <!-- 密码输入 — 仪器风格 -->
        <div class="instrument-panel" :class="{ 'panel-error': isShaking }">
          <div class="panel-chrome">
            <div class="chrome-dot"></div>
            <div class="chrome-dot"></div>
            <div class="chrome-label">AUTHENTICATE</div>
          </div>
          <div class="panel-body">
            <div class="input-row">
              <span class="input-prefix">❯</span>
              <input
                ref="passwordInput"
                v-model="password"
                type="password"
                placeholder="输入密码以解锁"
                class="cmd-input"
                @keydown.enter="handleUnlock"
                autocomplete="off"
              />
              <button class="go-btn" @click="handleUnlock" :disabled="loading">
                <svg v-if="!loading" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span v-else class="btn-spinner"></span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="errorMsg" class="error-line">
          <span class="error-marker">✕</span> {{ errorMsg }}
        </div>

        <button class="logout-link" @click="goLogin">
          退出 · 重新登录 →
        </button>
      </div>
    </div>

    <!-- 底部状态条 -->
    <div class="status-strip">
      <span class="status-signal">
        <span class="signal-bar"></span>
        <span class="signal-bar"></span>
        <span class="signal-bar"></span>
        <span class="signal-bar dim"></span>
      </span>
      <span class="status-text">AI 服务在线</span>
      <span class="status-sep">·</span>
      <span class="status-text">IoT 网关已连接</span>
      <span class="status-sep">·</span>
      <span class="status-version">v2.0</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import useLockStore from '@/store/modules/lock'
import { unlockScreen } from '@/api/login'
import defAva from '@/assets/images/profile.jpg'

const router = useRouter()
const userStore = useUserStore()
const lockStore = useLockStore()

const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const isShaking = ref(false)
const timeParts = reactive({ hours: '00', minutes: '00', seconds: '00' })
const currentDate = ref('')
const colonDim = ref(false)
const passwordInput = ref(null)
const starCanvas = ref(null)
const activeStarIndex = ref(-1)

let timer = null
let animId = null
let stars = []

// 星座数据 — 模拟一个抽象的"仓储"星座
const constellationStars = [
  [340, 280, 3], [380, 250, 2], [420, 270, 2.5],
  [450, 310, 2], [430, 360, 3], [380, 380, 2],
  [340, 350, 2.5], [360, 310, 2]
]
const constellationPoints = constellationStars.map(s => s[0] + ',' + s[1]).join(' ')

const onAvatarError = (e) => { e.target.src = defAva }

const onMouseMove = (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 8
  const y = (e.clientY / window.innerHeight - 0.5) * 8
  document.documentElement.style.setProperty('--parallax-x', x + 'px')
  document.documentElement.style.setProperty('--parallax-y', y + 'px')
}

// 时钟
const startClock = () => {
  const pad = n => String(n).padStart(2, '0')
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const update = () => {
    const now = new Date()
    timeParts.hours = pad(now.getHours())
    timeParts.minutes = pad(now.getMinutes())
    timeParts.seconds = pad(now.getSeconds())
    colonDim.value = now.getSeconds() % 2 === 0
    currentDate.value = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${days[now.getDay()]}`
  }
  update()
  timer = setInterval(update, 1000)
}

// 星空画布
const initStarfield = () => {
  const canvas = starCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1

  const resize = () => {
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    generateStars()
  }

  const generateStars = () => {
    const w = window.innerWidth, h = window.innerHeight
    stars = Array.from({ length: Math.floor((w * h) / 1800) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.2,
      baseAlpha: Math.random() * 0.6 + 0.15,
      twinkleSpeed: Math.random() * 0.003 + 0.001,
      twinklePhase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.85 ? (Math.random() > 0.5 ? 30 : 220) : 210
    }))
  }

  const draw = (t) => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    for (const s of stars) {
      const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.twinklePhase) * 0.2
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${s.hue}, 30%, 85%, ${Math.max(0, alpha)})`
      ctx.fill()
      if (s.r > 1.1) {
        ctx.strokeStyle = `hsla(${s.hue}, 40%, 80%, ${alpha * 0.15})`
        ctx.lineWidth = 0.4
        const len = s.r * 4
        ctx.beginPath()
        ctx.moveTo(s.x - len, s.y); ctx.lineTo(s.x + len, s.y)
        ctx.moveTo(s.x, s.y - len); ctx.lineTo(s.x, s.y + len)
        ctx.stroke()
      }
    }
    animId = requestAnimationFrame(draw)
  }

  resize()
  window.addEventListener('resize', resize)
  requestAnimationFrame(draw)
}

// 星座高亮轮播
let starInterval = null
const startConstellationPulse = () => {
  let idx = 0
  starInterval = setInterval(() => {
    activeStarIndex.value = idx
    idx = (idx + 1) % constellationStars.length
  }, 1200)
}

// 解锁
const handleUnlock = async () => {
  if (!password.value) {
    showError('请输入密码')
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await unlockScreen(password.value)
    const lockPath = lockStore.lockPath
    lockStore.unlockScreen()
    router.replace(lockPath)
  } catch (err) {
    showError(err.message || err.toString())
    password.value = ''
    nextTick(() => passwordInput.value?.focus())
  } finally {
    loading.value = false
  }
}

const showError = (msg) => {
  errorMsg.value = msg
  isShaking.value = true
  setTimeout(() => { isShaking.value = false }, 600)
}

const goLogin = () => {
  lockStore.unlockScreen()
  userStore.logOut().then(() => router.push('/login'))
}

onMounted(() => {
  startClock()
  initStarfield()
  startConstellationPulse()
  nextTick(() => passwordInput.value?.focus())
})

onBeforeUnmount(() => {
  clearInterval(timer)
  clearInterval(starInterval)
  cancelAnimationFrame(animId)
})
</script>

<style scoped>
/* ======== CSS 变量 ======== */
.lock-container {
  --深空: #050a14;
  --深蓝: #0a1628;
  --轨道色: rgba(100, 140, 180, 0.1);
  --刻度色: rgba(160, 190, 220, 0.25);
  --星座色: rgba(200, 170, 110, 0.35);
  --星点色: rgba(200, 180, 140, 0.7);
  --高亮星色: #e8c87a;
  --琥珀: #c8a45c;
  --琥珀暗: #8a6e30;
  --冰蓝: #7aaccc;
  --冰蓝暗: #3d6a88;
  --面板底: rgba(8, 16, 30, 0.85);
  --面板边: rgba(100, 140, 180, 0.12);
  --面板高亮: rgba(100, 140, 180, 0.06);
  --文字主: #d8e4ef;
  --文字副: rgba(180, 200, 220, 0.5);
  --文字弱: rgba(140, 165, 190, 0.35);
  --错误色: #cc5a5a;

  --parallax-x: 0px;
  --parallax-y: 0px;

  position: fixed;
  inset: 0;
  background: var(--深空);
  z-index: 9999;
  overflow: hidden;
  font-family: 'DM Sans', 'Noto Sans SC', -apple-system, sans-serif;
  color: var(--文字主);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ======== 星空画布 ======== */
.star-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* ======== 星图层 ======== */
.cartography-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transform: translate(var(--parallax-x), var(--parallax-y));
  transition: transform 0.3s ease-out;
}

.star-chart {
  width: min(90vw, 90vh);
  height: min(90vw, 90vh);
  opacity: 0.5;
}

.orbit-ring {
  animation: orbit-spin 120s linear infinite;
  transform-origin: 400px 400px;
}

.orbit-ring:nth-child(2) { animation-duration: 90s; animation-direction: reverse; }
.orbit-ring:nth-child(3) { animation-duration: 150s; }
.orbit-ring:nth-child(4) { animation-duration: 100s; animation-direction: reverse; }

@keyframes orbit-spin {
  to { transform: rotate(360deg); }
}

.pulse-star {
  animation: star-pulse 1.2s ease-in-out;
  filter: drop-shadow(0 0 6px var(--高亮星色));
}

@keyframes star-pulse {
  0%, 100% { r: 2; opacity: 1; }
  50% { r: 4; opacity: 0.8; }
}

/* ======== 主内容 — 双栏不对称 ======== */
.content-shell {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: clamp(48px, 8vw, 120px);
  padding: 0 clamp(24px, 5vw, 80px);
  width: 100%;
  max-width: 1100px;
  justify-content: center;
}

/* ======== 左侧时间 ======== */
.time-block {
  flex-shrink: 0;
  text-align: right;
  min-width: 240px;
  animation: slide-in-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

.time-label {
  font-size: 10px;
  letter-spacing: 4px;
  color: var(--文字弱);
  margin-bottom: 8px;
  font-weight: 500;
}

.time-digits {
  font-family: 'Cormorant Garamond', 'DM Serif Display', Georgia, serif;
  font-size: clamp(64px, 10vw, 100px);
  font-weight: 300;
  line-height: 1;
  letter-spacing: -2px;
  color: var(--文字主);
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 2px;
}

.digit-group {
  display: inline-block;
  min-width: 1.15em;
  text-align: center;
}

.time-colon {
  font-size: 0.7em;
  color: var(--琥珀);
  transition: opacity 0.4s;
  margin: 0 2px;
}

.time-colon.dim { opacity: 0.25; }

.time-seconds {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 20px;
  font-weight: 300;
  color: var(--琥珀暗);
  letter-spacing: 4px;
  text-align: right;
  margin-top: 4px;
}

.time-date {
  font-size: 13px;
  color: var(--文字副);
  letter-spacing: 1px;
  margin-top: 12px;
  text-align: right;
}

.time-divider {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--琥珀暗));
  margin: 20px 0 20px auto;
}

.system-tag {
  font-size: 10px;
  letter-spacing: 3px;
  color: var(--文字弱);
  text-align: right;
  font-weight: 500;
}

/* ======== 右侧解锁 ======== */
.unlock-block {
  flex-shrink: 0;
  width: 340px;
  animation: slide-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

/* 用户徽章 */
.user-badge {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.badge-ring {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  padding: 2px;
  background: conic-gradient(from 0deg, var(--琥珀), var(--冰蓝), var(--琥珀));
  flex-shrink: 0;
  animation: ring-rotate 8s linear infinite;
}

@keyframes ring-rotate {
  to { background: conic-gradient(from 360deg, var(--琥珀), var(--冰蓝), var(--琥珀)); }
}

.badge-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--深空);
  display: block;
}

.badge-name {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
}

.badge-role {
  font-size: 11px;
  color: var(--文字弱);
  letter-spacing: 2px;
  margin-top: 2px;
}

/* 仪器面板 */
.instrument-panel {
  background: var(--面板底);
  border: 1px solid var(--面板边);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.instrument-panel:focus-within {
  border-color: rgba(200, 164, 92, 0.3);
  box-shadow: 0 0 0 1px rgba(200, 164, 92, 0.08), 0 8px 40px rgba(0, 0, 0, 0.3);
}

.instrument-panel.panel-error {
  animation: shake 0.5s ease;
  border-color: rgba(204, 90, 90, 0.5);
}

.panel-chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--面板边);
}

.chrome-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--琥珀暗);
  opacity: 0.6;
}

.chrome-dot:first-child { background: var(--错误色); opacity: 0.5; }

.chrome-label {
  font-size: 9px;
  letter-spacing: 3px;
  color: var(--文字弱);
  margin-left: auto;
  font-weight: 600;
}

.panel-body {
  padding: 16px 18px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-prefix {
  color: var(--琥珀);
  font-size: 14px;
  font-family: monospace;
  flex-shrink: 0;
  opacity: 0.7;
}

.cmd-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--文字主);
  font-size: 15px;
  font-family: 'DM Mono', 'Fira Code', monospace;
  letter-spacing: 1px;
  padding: 6px 0;
}

.cmd-input::placeholder {
  color: var(--文字弱);
  font-family: 'Noto Sans SC', sans-serif;
  letter-spacing: 2px;
  font-size: 13px;
}

.go-btn {
  width: 38px;
  height: 38px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--琥珀暗), var(--琥珀));
  border: none;
  color: var(--深空);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.go-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(200, 164, 92, 0.3);
}

.go-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(5, 10, 20, 0.3);
  border-top-color: var(--深空);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误信息 */
.error-line {
  margin-top: 14px;
  font-size: 12px;
  color: var(--错误色);
  letter-spacing: 1px;
  animation: fade-up 0.3s ease;
}

.error-marker {
  font-weight: 700;
  margin-right: 4px;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* 退出链接 */
.logout-link {
  display: block;
  margin-top: 28px;
  background: none;
  border: none;
  color: var(--文字弱);
  font-size: 12px;
  letter-spacing: 2px;
  cursor: pointer;
  padding: 0;
  transition: color 0.3s;
  font-family: inherit;
}

.logout-link:hover {
  color: var(--琥珀);
}

/* ======== 底部状态条 ======== */
.status-strip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--文字弱);
  background: linear-gradient(to top, rgba(5, 10, 20, 0.6), transparent);
  animation: fade-in 1s ease 0.6s both;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.status-signal {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
}

.signal-bar {
  width: 3px;
  background: var(--冰蓝暗);
  border-radius: 1px;
}

.signal-bar:nth-child(1) { height: 4px; }
.signal-bar:nth-child(2) { height: 7px; }
.signal-bar:nth-child(3) { height: 10px; }
.signal-bar:nth-child(4) { height: 12px; }
.signal-bar.dim { opacity: 0.3; }

.status-sep {
  opacity: 0.3;
}

.status-version {
  opacity: 0.4;
}

/* ======== 响应式 ======== */
@media (max-width: 768px) {
  .content-shell {
    flex-direction: column;
    gap: 32px;
  }

  .time-block {
    text-align: center;
    min-width: auto;
  }

  .time-digits { justify-content: center; }
  .time-seconds { text-align: center; }
  .time-date { text-align: center; }
  .time-divider { margin: 20px auto; }
  .system-tag { text-align: center; }

  .unlock-block {
    width: 100%;
    max-width: 340px;
  }

  .cartography-layer {
    opacity: 0.3;
  }
}
</style>
