<template>
  <div ref="loginContainer" class="login-container" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
    <!-- 深空星空画布 -->
    <canvas ref="starCanvas" class="star-layer"></canvas>
    <div class="gravity-cursor" aria-hidden="true"></div>

    <!-- 星图网格 -->
    <div class="cartography-layer">
      <svg class="star-chart" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
        <circle v-for="r in [140, 220, 300, 380]" :key="r"
          cx="400" cy="400" :r="r"
          fill="none" stroke="var(--轨道色)" stroke-width="0.5"
          stroke-dasharray="4 8" class="orbit-ring" />
        <line x1="400" y1="20" x2="400" y2="780" stroke="var(--轨道色)" stroke-width="0.3" />
        <line x1="20" y1="400" x2="780" y2="400" stroke="var(--轨道色)" stroke-width="0.3" />
        <line x1="108" y1="108" x2="692" y2="692" stroke="var(--轨道色)" stroke-width="0.2" stroke-dasharray="2 6" />
        <line x1="692" y1="108" x2="108" y2="692" stroke="var(--轨道色)" stroke-width="0.2" stroke-dasharray="2 6" />
        <g v-for="i in 24" :key="'tick-' + i"
          :transform="`rotate(${i * 15}, 400, 400)`">
          <line x1="400" y1="22" x2="400" y2="32"
            stroke="var(--刻度色)" stroke-width="0.8" />
          <line v-if="i % 6 === 0" x1="400" y1="16" x2="400" y2="32"
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

    <!-- 主内容区 — 双栏不对称 -->
    <div class="content-shell">
      <!-- 左侧：品牌区域 -->
      <div class="brand-block">
        <div class="brand-icon">
          <svg viewBox="0 0 48 48" fill="none" class="brand-svg">
            <circle cx="24" cy="24" r="20" stroke="var(--琥珀)" stroke-width="0.8" stroke-dasharray="3 5" class="brand-orbit" />
            <circle cx="24" cy="24" r="12" stroke="var(--冰蓝)" stroke-width="0.6" stroke-dasharray="2 4" class="brand-orbit-inner" />
            <path d="M24 6L25.5 18L24 20L22.5 18Z" fill="var(--琥珀)" opacity="0.8" />
            <path d="M24 42L25.5 30L24 28L22.5 30Z" fill="var(--琥珀)" opacity="0.8" />
            <path d="M6 24L18 22.5L20 24L18 25.5Z" fill="var(--琥珀)" opacity="0.8" />
            <path d="M42 24L30 22.5L28 24L30 25.5Z" fill="var(--琥珀)" opacity="0.8" />
            <circle cx="24" cy="24" r="4" fill="var(--琥珀)" opacity="0.9" />
            <circle cx="24" cy="24" r="2" fill="#fff" opacity="0.7" />
          </svg>
        </div>
        <h1 class="brand-name">星辰WMS</h1>
        <div class="brand-sub">STAR WAREHOUSE MANAGEMENT</div>
        <div class="brand-divider"></div>
        <p class="brand-desc">AI 驱动的智能仓储管理平台</p>
        <div class="brand-tags">
          <span class="tag">AI 大模型</span>
          <span class="tag">物联网</span>
          <span class="tag">智能调度</span>
        </div>
      </div>

      <!-- 右侧：登录表单 -->
      <div class="login-block">
        <div class="login-panel">
          <div class="panel-chrome">
            <div class="chrome-dot red"></div>
            <div class="chrome-dot yellow"></div>
            <div class="chrome-dot green"></div>
            <div class="chrome-label">SYSTEM ACCESS</div>
          </div>

          <div class="panel-body">
            <div class="panel-title">身份验证</div>
            <div class="panel-subtitle">请输入您的账号和密码</div>

            <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form" @submit.prevent>
              <!-- 账号 -->
              <div class="field-group">
                <label class="field-label">账号</label>
                <div class="input-shell" :class="{ 'is-focus': focusUser }">
                  <span class="input-icon">◈</span>
                  <el-input
                    v-model="loginForm.username"
                    type="text"
                    auto-complete="off"
                    placeholder="请输入账号"
                    @focus="focusUser = true"
                    @blur="focusUser = false"
                  />
                </div>
              </div>

              <!-- 密码 -->
              <div class="field-group">
                <label class="field-label">密码</label>
                <div class="input-shell" :class="{ 'is-focus': focusPass }">
                  <span class="input-icon">◈</span>
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    auto-complete="off"
                    placeholder="请输入密码"
                    @keyup.enter="handleLogin"
                    @focus="focusPass = true"
                    @blur="focusPass = false"
                  />
                </div>
              </div>

              <!-- 验证码 -->
              <div class="field-group" v-if="captchaEnabled">
                <label class="field-label">验证码</label>
                <div class="captcha-row">
                  <div class="input-shell captcha-input" :class="{ 'is-focus': focusCode }">
                  <svg class="input-icon" viewBox="0 0 16 16" width="12" height="12" fill="none">
                    <path d="M8 1L9.78 5.47L14.5 5.5L10.8 8.3L12 13L8 10.2L4 13L5.2 8.3L1.5 5.5L6.22 5.47Z" fill="currentColor" opacity="0.6"/>
                  </svg>
                    <el-input
                      v-model="loginForm.code"
                      auto-complete="off"
                      placeholder="请输入验证码"
                      @keyup.enter="handleLogin"
                      @focus="focusCode = true"
                      @blur="focusCode = false"
                    />
                  </div>
                  <div class="captcha-img" @click="getCode">
                    <img :src="codeUrl" alt="验证码" />
                    <div class="captcha-overlay">↻</div>
                  </div>
                </div>
              </div>

              <!-- 记住密码 -->
              <div class="options-row">
                <label class="remember-label">
                  <input type="checkbox" v-model="loginForm.rememberMe" class="custom-check" />
                  <span class="check-box"></span>
                  <span class="check-text">记住密码</span>
                </label>
              </div>

              <!-- 登录按钮 -->
              <button class="login-btn" @click.prevent="handleLogin" :disabled="loading">
                <span v-if="!loading" class="btn-text">登 录</span>
                <span v-else class="btn-loading">
                  <span class="spinner"></span>
                  验证中...
                </span>
              </button>
            </el-form>

            <!-- 注册链接 -->
            <div class="form-footer" v-if="register">
              <router-link to="/register" class="register-link">没有账号？立即注册 →</router-link>
            </div>
          </div>
        </div>
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
      <span class="status-text">安全连接</span>
      <span class="status-sep">·</span>
      <span class="status-text">{{ footerContent }}</span>
      <span class="status-sep">·</span>
      <span class="status-version">v2.0</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login"
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'
import { gsap } from "gsap"

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginForm = ref({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
  uuid: ""
})

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
const captchaEnabled = ref(true)
const register = ref(true)
const redirect = ref(undefined)
const focusUser = ref(false)
const focusPass = ref(false)
const focusCode = ref(false)
const loginContainer = ref(null)
const starCanvas = ref(null)
const activeStarIndex = ref(-1)

let animId = null
let stars = []
let gsapCtx = null
let glowXTo = null
let glowYTo = null
let glowAlphaTo = null
let chartXTo = null
let chartYTo = null
let panelXTo = null
let panelYTo = null
let panelRotateXTo = null
let panelRotateYTo = null
let brandXTo = null
let brandYTo = null

// 星座数据
const constellationStars = [
  [340, 280, 3], [380, 250, 2], [420, 270, 2.5],
  [450, 310, 2], [430, 360, 3], [380, 380, 2],
  [340, 350, 2.5], [360, 310, 2]
]
const constellationPoints = constellationStars.map(s => s[0] + ',' + s[1]).join(' ')

watch(route, (newRoute) => {
  redirect.value = newRoute.query && newRoute.query.redirect
}, { immediate: true })

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function setupGsapMotion() {
  const root = loginContainer.value
  if (!root || prefersReducedMotion()) {
    return
  }

  const noop = () => {}
  const quickTo = (target, prop, vars) => target ? gsap.quickTo(target, prop, vars) : noop
  const glow = root.querySelector(".gravity-cursor")
  const chart = root.querySelector(".cartography-layer")
  const panel = root.querySelector(".login-panel")
  const brand = root.querySelector(".brand-block")

  gsapCtx = gsap.context(() => {
    gsap.set(glow, { xPercent: -50, yPercent: -50, autoAlpha: 0 })
    gsap.set(panel, {
      transformPerspective: 900,
      transformOrigin: "50% 50%",
      willChange: "transform"
    })
    gsap.set([chart, brand], { willChange: "transform" })

    glowXTo = quickTo(glow, "x", { duration: 0.45, ease: "power3.out" })
    glowYTo = quickTo(glow, "y", { duration: 0.45, ease: "power3.out" })
    glowAlphaTo = quickTo(glow, "autoAlpha", { duration: 0.18, ease: "power2.out" })
    chartXTo = quickTo(chart, "x", { duration: 0.75, ease: "power3.out" })
    chartYTo = quickTo(chart, "y", { duration: 0.75, ease: "power3.out" })
    panelXTo = quickTo(panel, "x", { duration: 0.55, ease: "power3.out" })
    panelYTo = quickTo(panel, "y", { duration: 0.55, ease: "power3.out" })
    panelRotateXTo = quickTo(panel, "rotationX", { duration: 0.55, ease: "power3.out" })
    panelRotateYTo = quickTo(panel, "rotationY", { duration: 0.55, ease: "power3.out" })
    brandXTo = quickTo(brand, "x", { duration: 0.65, ease: "power3.out" })
    brandYTo = quickTo(brand, "y", { duration: 0.65, ease: "power3.out" })

  }, root)
}

const onMouseMove = (e) => {
  const root = loginContainer.value
  if (!root || prefersReducedMotion() || !glowXTo) {
    return
  }

  const rect = root.getBoundingClientRect()
  const localX = e.clientX - rect.left
  const localY = e.clientY - rect.top
  const x = localX / rect.width - 0.5
  const y = localY / rect.height - 0.5

  glowXTo(localX)
  glowYTo(localY)
  glowAlphaTo(1)
  chartXTo(x * 30)
  chartYTo(y * 30)
  brandXTo(x * -14)
  brandYTo(y * -10)
  panelXTo(x * 10)
  panelYTo(y * 8)
  panelRotateXTo(y * -5)
  panelRotateYTo(x * 7)
}

const onMouseLeave = () => {
  glowAlphaTo?.(0)
  chartXTo?.(0)
  chartYTo?.(0)
  brandXTo?.(0)
  brandYTo?.(0)
  panelXTo?.(0)
  panelYTo?.(0)
  panelRotateXTo?.(0)
  panelRotateYTo?.(0)
}

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 })
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
      } else {
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("rememberMe")
      }
      userStore.login(loginForm.value).then(() => {
        const query = route.query
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQueryParams })
      }).catch(() => {
        loading.value = false
        if (captchaEnabled.value) {
          getCode()
        }
      })
    }
  })
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      loginForm.value.uuid = res.uuid
    }
  })
}

function getCookie() {
  const username = Cookies.get("username")
  const password = Cookies.get("password")
  const rememberMe = Cookies.get("rememberMe")
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
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

onMounted(() => {
  getCode()
  getCookie()
  initStarfield()
  startConstellationPulse()
  nextTick(setupGsapMotion)
})

onBeforeUnmount(() => {
  clearInterval(starInterval)
  cancelAnimationFrame(animId)
  gsapCtx?.revert()
})
</script>

<style lang="scss" scoped>
/* ======== CSS 变量 ======== */
.login-container {
  --深空: #050a14;
  --轨道色: rgba(100, 140, 180, 0.1);
  --刻度色: rgba(160, 190, 220, 0.25);
  --星座色: rgba(200, 170, 110, 0.35);
  --星点色: rgba(200, 180, 140, 0.7);
  --高亮星色: #e8c87a;
  --琥珀: #c8a45c;
  --琥珀暗: #9a7a3a;
  --冰蓝: #7aaccc;
  --冰蓝暗: #3d6a88;
  --面板底: rgba(8, 16, 30, 0.85);
  --面板边: rgba(100, 140, 180, 0.12);
  --文字主: #d8e4ef;
  --文字副: rgba(180, 200, 220, 0.65);
  --文字弱: rgba(140, 165, 190, 0.55);
  --错误色: #cc5a5a;

  --parallax-x: 0px;
  --parallax-y: 0px;

  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 22% 55%, rgba(200, 164, 92, 0.045) 0%, transparent 55%),
    radial-gradient(ellipse at 78% 45%, rgba(122, 172, 204, 0.045) 0%, transparent 55%),
    var(--深空);
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

.gravity-cursor {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  width: 320px;
  height: 320px;
  pointer-events: none;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(200, 164, 92, 0.2) 0%, rgba(122, 172, 204, 0.11) 34%, transparent 68%);
  filter: blur(8px);
  mix-blend-mode: screen;
  will-change: transform, opacity;
}

.cartography-layer,
.brand-block,
.login-panel {
  will-change: transform;
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
  opacity: 0.4;
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

/* ======== 主内容 ======== */
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

/* ======== 左侧品牌 ======== */
.brand-block {
  flex-shrink: 0;
  max-width: 380px;
  animation: slide-in-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

.brand-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 24px;
}

.brand-svg {
  width: 100%;
  height: 100%;
}

.brand-orbit {
  animation: orbit-spin 20s linear infinite;
  transform-origin: 24px 24px;
}

.brand-orbit-inner {
  animation: orbit-spin 14s linear infinite reverse;
  transform-origin: 24px 24px;
}

.brand-name {
  font-family: 'Cormorant Garamond', 'DM Serif Display', Georgia, serif;
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 300;
  letter-spacing: 4px;
  line-height: 1.1;
  margin: 0 0 8px;
  background: linear-gradient(135deg, var(--琥珀) 0%, #e8d5a0 50%, var(--冰蓝) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-sub {
  font-size: 10px;
  letter-spacing: 5px;
  color: var(--文字弱);
  font-weight: 500;
}

.brand-divider {
  width: 50px;
  height: 1px;
  background: linear-gradient(90deg, var(--琥珀暗), transparent);
  margin: 28px 0;
}

.brand-desc {
  font-size: 15px;
  color: var(--文字副);
  line-height: 1.8;
  letter-spacing: 1px;
  margin: 0 0 24px;
}

.brand-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tag {
  font-size: 10px;
  letter-spacing: 2px;
  padding: 5px 12px;
  border: 1px solid var(--面板边);
  border-radius: 4px;
  color: var(--文字弱);
  background: rgba(255, 255, 255, 0.02);
}

/* ======== 右侧登录面板 ======== */
.login-block {
  flex-shrink: 0;
  width: 380px;
  animation: slide-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

.login-panel {
  background: var(--面板底);
  border: 1px solid var(--面板边);
  border-radius: 10px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.panel-chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--面板边);
}

.chrome-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  opacity: 0.5;

  &.red { background: #cc5a5a; }
  &.yellow { background: var(--琥珀); }
  &.green { background: #5a9e6f; }
}

.chrome-label {
  font-size: 9px;
  letter-spacing: 3px;
  color: var(--文字弱);
  margin-left: auto;
  font-weight: 600;
}

.panel-body {
  padding: 32px 28px 28px;
}

.panel-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 2px;
  margin-bottom: 6px;
  color: var(--文字主);
}

.panel-subtitle {
  font-size: 12px;
  color: var(--文字弱);
  letter-spacing: 1px;
  margin-bottom: 28px;
}

/* ======== 表单样式 ======== */
.login-form {
  width: 100%;
}

.field-group {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--文字副);
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
}

.input-shell {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--面板边);
  border-radius: 6px;
  padding: 0 14px;
  transition: border-color 0.3s, box-shadow 0.3s;

  &.is-focus {
    border-color: rgba(200, 164, 92, 0.3);
    box-shadow: 0 0 0 1px rgba(200, 164, 92, 0.06);
  }

  .input-icon {
    color: var(--琥珀);
    margin-right: 10px;
    flex-shrink: 0;
    width: 14px;
    height: 14px;
  }

  :deep(.el-input__wrapper) {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0;
    border: none;
  }

  :deep(.el-input__inner) {
    color: var(--文字主) !important;
    font-family: 'DM Sans', 'Noto Sans SC', sans-serif;
    font-size: 14px;
    letter-spacing: 1px;

    &::placeholder {
      color: var(--文字弱) !important;
      font-family: 'Noto Sans SC', sans-serif;
      letter-spacing: 2px;
      font-size: 12px;
    }
  }
}

.captcha-row {
  display: flex;
  gap: 12px;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  width: 120px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 1px solid var(--面板边);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .captcha-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: var(--琥珀);
    background: rgba(5, 10, 20, 0.6);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover .captcha-overlay {
    opacity: 1;
  }
}

/* 记住密码 */
.options-row {
  margin-bottom: 24px;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
  color: var(--文字副);
  letter-spacing: 1px;
  padding: 12px 0;
  -webkit-tap-highlight-color: transparent;
}

.custom-check {
  display: none;
}

.check-box {
  width: 14px;
  height: 14px;
  border: 1px solid var(--面板边);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  &::after {
    content: '✓';
    font-size: 10px;
    color: var(--琥珀);
    opacity: 0;
    transform: scale(0);
    transition: all 0.2s;
  }
}

.custom-check:checked + .check-box {
  border-color: var(--琥珀暗);
  background: rgba(200, 164, 92, 0.1);

  &::after {
    opacity: 1;
    transform: scale(1);
  }
}

.check-text {
  user-select: none;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 46px;
  border: 1px solid rgba(200, 164, 92, 0.3);
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(200, 164, 92, 0.12), rgba(200, 164, 92, 0.06));
  color: var(--琥珀);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  letter-spacing: 6px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--琥珀), #e8d5a0);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover:not(:disabled) {
    border-color: var(--琥珀);
    box-shadow: 0 4px 28px rgba(200, 164, 92, 0.25);
    transform: translateY(-1px);

    &::before { opacity: 0.2; }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-text, .btn-loading {
  position: relative;
  z-index: 1;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(200, 164, 92, 0.3);
  border-top-color: var(--琥珀);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 注册链接 */
.form-footer {
  margin-top: 20px;
  text-align: center;
}

.register-link {
  font-size: 12px;
  color: var(--文字弱);
  text-decoration: none;
  letter-spacing: 1px;
  transition: color 0.3s;

  &:hover {
    color: var(--琥珀);
  }
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

  &:nth-child(1) { height: 4px; }
  &:nth-child(2) { height: 7px; }
  &:nth-child(3) { height: 10px; }
  &:nth-child(4) { height: 12px; }
  &.dim { opacity: 0.3; }
}

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

  .brand-block {
    text-align: center;
    max-width: 100%;
  }

  .brand-divider {
    margin: 24px auto;
  }

  .brand-tags {
    justify-content: center;
  }

  .login-block {
    width: 100%;
    max-width: 380px;
  }

  .cartography-layer {
    opacity: 0.25;
  }
}
</style>
