<template>
  <div class="navbar" :class="'nav' + settingsStore.navType">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb v-if="settingsStore.navType == 1" id="breadcrumb-container" class="breadcrumb-container" />
    <top-nav v-if="settingsStore.navType == 2" id="topmenu-container" class="topmenu-container" />
    <template v-if="settingsStore.navType == 3">
      <logo v-show="settingsStore.sidebarLogo" :collapse="false"></logo>
      <top-bar id="topbar-container" class="topbar-container" />
    </template>

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <header-search id="header-search" class="right-menu-item" />

        <el-tooltip content="源码地址" effect="dark" placement="bottom">
          <ruo-yi-git id="ruoyi-git" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="文档地址" effect="dark" placement="bottom">
          <ruo-yi-doc id="ruoyi-doc" class="right-menu-item hover-effect" />
        </el-tooltip>

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="主题模式" effect="dark" placement="bottom">
          <div class="right-menu-item hover-effect theme-switch-wrapper" @click="toggleTheme">
            <svg-icon v-if="settingsStore.isDark" icon-class="sunny" />
            <svg-icon v-else icon-class="moon" />
          </div>
        </el-tooltip>

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="消息通知" effect="dark" placement="bottom">
          <header-notice id="header-notice" class="right-menu-item hover-effect" />
        </el-tooltip>
      </template>

      <el-dropdown @command="handleCommand" class="avatar-container right-menu-item hover-effect" trigger="hover">
        <div class="avatar-wrapper">
          <span class="avatar-ring">
            <img :src="userStore.avatar" class="user-avatar" />
          </span>
          <span class="user-nickname">{{ userStore.nickName }}</span>
          <span class="avatar-arrow">▾</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="star-dropdown">
            <router-link to="/user/profile">
              <el-dropdown-item>
                <span class="dropdown-dot"></span>
                <span>个人中心</span>
              </el-dropdown-item>
            </router-link>
            <el-dropdown-item command="setLayout" v-if="settingsStore.showSettings">
              <span class="dropdown-dot"></span>
              <span>布局设置</span>
            </el-dropdown-item>
            <el-dropdown-item command="lockScreen">
              <span class="dropdown-dot"></span>
              <span>锁定屏幕</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <span class="dropdown-dot danger"></span>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import TopNav from './TopNav/index.vue'
import TopBar from './TopBar/index.vue'
import Logo from './Sidebar/Logo.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import Screenfull from '@/components/Screenfull/index.vue'
import SizeSelect from '@/components/SizeSelect/index.vue'
import HeaderSearch from '@/components/HeaderSearch/index.vue'
import RuoYiGit from '@/components/RuoYi/Git/index.vue'
import RuoYiDoc from '@/components/RuoYi/Doc/index.vue'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useLockStore from '@/store/modules/lock'
import useSettingsStore from '@/store/modules/settings'
import HeaderNotice from './HeaderNotice'

type ViewTransition = {
  ready: Promise<void>
  finished: Promise<void>
}

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const lockStore = useLockStore()
const settingsStore = useSettingsStore()

function toggleSideBar(): void {
  appStore.toggleSideBar()
}

function handleCommand(command: string): void {
  switch (command) {
    case "setLayout":
      setLayout()
      break
    case "lockScreen":
      lockScreen()
      break
    case "logout":
      logout()
      break
    default:
      break
  }
}

function logout(): void {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/index'
    })
  }).catch(() => { })
}

const emits = defineEmits(['setLayout'])
function setLayout(): void {
  emits('setLayout')
}

function lockScreen(): void {
  const currentPath = route.fullPath
  lockStore.lockScreen(currentPath)
  router.push('/lock')
}

async function toggleTheme(event?: MouseEvent): Promise<void> {
  const x = event?.clientX || window.innerWidth / 2
  const y = event?.clientY || window.innerHeight / 2
  const wasDark = settingsStore.isDark
  const startViewTransition = (document as Document & {
    startViewTransition?: (callback: () => void | Promise<void>) => ViewTransition
  }).startViewTransition
  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  if (!startViewTransition || isReducedMotion) {
    settingsStore.toggleTheme()
    return
  }

  try {
    const transition = startViewTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      settingsStore.toggleTheme()
      await nextTick()
    })
    await transition.ready

    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
    document.documentElement.animate(
      {
        clipPath: !wasDark ? [...clipPath].reverse() : clipPath
      }, {
        duration: 650,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
        pseudoElement: !wasDark ? "::view-transition-old(root)" : "::view-transition-new(root)"
      }
    )
    await transition.finished
  } catch (error) {
    console.warn("View transition failed, falling back to immediate toggle:", error)
    settingsStore.toggleTheme()
  }
}
</script>

<style lang='scss' scoped>
$nav-bg: rgba(17, 28, 21, 0.94);
$nav-border: rgba(200, 149, 108, 0.1);
$nav-text: #b8ae98;
$nav-text-hover: #e8dfd0;
$nav-hover-bg: rgba(200, 149, 108, 0.08);
$nav-amber: #c8956c;

.navbar.nav3 {
  .hamburger-container {
    display: none !important;
  }
}

.navbar {
  height: 52px;
  overflow: hidden;
  position: relative;
  background: $nav-bg;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid $nav-border;
  box-shadow: 0 1px 0 rgba(200, 149, 108, 0.05), 0 6px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  box-sizing: border-box;

  .hamburger-container {
    height: 100%;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    -webkit-tap-highlight-color: transparent;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-right: 4px;
    padding: 0 12px;
    color: $nav-text;

    &:hover {
      background: $nav-hover-bg;
      color: $nav-amber;
    }
  }

  .breadcrumb-container {
    flex-shrink: 0;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .topbar-container {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    margin-left: 8px;
  }

  .right-menu {
    height: 100%;
    line-height: 52px;
    display: flex;
    align-items: center;
    margin-left: auto;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 10px;
      height: 100%;
      font-size: 16px;
      color: $nav-text;
      vertical-align: text-bottom;
      transition: color 0.2s, background 0.2s;

      &.hover-effect {
        cursor: pointer;
        position: relative;

        &:hover {
          color: $nav-text-hover;
          background: $nav-hover-bg;
        }

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 1px;
          background: $nav-amber;
          opacity: 0.6;
          transition: width 0.22s, left 0.22s;
        }

        &:hover::after {
          width: 58%;
          left: 21%;
        }
      }

      &.theme-switch-wrapper svg {
        transition: transform 0.2s, color 0.2s;
      }

      &.theme-switch-wrapper:hover svg {
        transform: scale(1.12);
        color: $nav-amber;
      }
    }

    .avatar-container {
      margin-right: 0;
      padding: 0 16px 0 8px;

      .avatar-wrapper {
        display: flex;
        align-items: center;
        gap: 9px;
        cursor: pointer;
      }

      .avatar-ring {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        padding: 1.5px;
        background: conic-gradient(from 0deg, $nav-amber, #8fb89a, $nav-amber);
        flex-shrink: 0;
        transition: box-shadow 0.2s;
      }

      .user-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        display: block;
        border: 1.5px solid rgba(8, 14, 26, 0.88);
      }

      .user-nickname {
        max-width: 110px;
        overflow: hidden;
        color: $nav-text;
        font-size: 13px;
        font-weight: 500;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .avatar-arrow {
        color: rgba(180, 198, 217, 0.48);
        font-size: 11px;
      }

      &:hover {
        .avatar-ring {
          box-shadow: 0 0 14px rgba(200, 149, 108, 0.22);
        }

        .user-nickname,
        .avatar-arrow {
          color: $nav-text-hover;
        }
      }
    }
  }
}

:deep(.star-dropdown) {
  min-width: 148px;
  padding: 6px 0 !important;
  border-radius: 6px !important;

  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #b4c6d9 !important;
    font-size: 13px;
    padding: 9px 16px !important;
    transition: background 0.2s, color 0.2s;

    .dropdown-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(200, 149, 108, 0.55);
      flex: 0 0 auto;

      &.danger {
        background: rgba(245, 108, 108, 0.72);
      }
    }

    &:hover {
      color: #dce4ec !important;
      background: rgba(200, 149, 108, 0.08) !important;

      .dropdown-dot {
        background: #c8956c;
      }
    }
  }

  .el-dropdown-menu__item--divided {
    border-top-color: rgba(200, 149, 108, 0.1) !important;
  }
}

@media (max-width: 768px) {
  .navbar {
    .right-menu .right-menu-item {
      padding: 0 7px;
      font-size: 14px;
    }

    .avatar-container .avatar-wrapper .user-nickname {
      display: none;
    }
  }
}
</style>
