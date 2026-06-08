import { defineStore } from 'pinia'

const PRESETS = [
  { key:'pure-dark', bg:'#000', card:'#111', ac:'#fff', tx:'#ddd', nm:'纯黑' },
  { key:'pure-white', bg:'#fff', card:'#f8f8f8', ac:'#000', tx:'#222', nm:'纯白' },
  { key:'midnight', bg:'#0a0a14', card:'#16162a', ac:'#6366f1', tx:'#e0e0f0', nm:'午夜蓝' },
  { key:'forest', bg:'#0a1408', card:'#162410', ac:'#22c55e', tx:'#d0e8d0', nm:'森林' },
  { key:'coral', bg:'#140a08', card:'#241610', ac:'#f97316', tx:'#e8d0c8', nm:'珊瑚' },
  { key:'lavender', bg:'#100a18', card:'#1e1428', ac:'#a855f7', tx:'#d8c8f0', nm:'紫雾' },
  { key:'ocean', bg:'#081018', card:'#101e28', ac:'#06b6d4', tx:'#c8e0e8', nm:'海洋' },
  { key:'sunset', bg:'#180808', card:'#281010', ac:'#eab308', tx:'#e8d0a0', nm:'日落' },
]
const DEFAULT = PRESETS[2]

export const useThemeStore = defineStore('theme', {
  state: () => ({
    current: localStorage.getItem('bobi_theme_vue') || DEFAULT.key
  }),
  getters: {
    theme: (s) => PRESETS.find(t => t.key === s.current) || DEFAULT,
    presets: () => PRESETS
  },
  actions: {
    setTheme(key) {
      this.current = key
      localStorage.setItem('bobi_theme_vue', key)
      const t = this.theme
      const root = document.documentElement
      root.style.setProperty('--bg', t.bg)
      root.style.setProperty('--card', t.card)
      root.style.setProperty('--ac', t.ac)
      root.style.setProperty('--tx', t.tx)
      document.body.style.background = t.bg
      document.body.style.color = t.tx
    },
    init() { this.setTheme(this.current) }
  }
})
