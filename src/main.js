import './style.css'

const API = 'https://jews-saturday-compensation-blogs.trycloudflare.com'

const state = {
  tab: 'dashboard',
  status: null,
  loading: true,
  message: ''
}

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })

  const text = await res.text()

  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(text || `HTTP ${res.status}`)
  }

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`)
  }

  return data
}

async function loadStatus() {
  state.loading = true
  render()

  try {
    state.status = await api('/api/status')
    state.message = ''
  } catch (err) {
    state.status = null
    state.message = 'API tidak dapat dihubungi: ' + err.message
  }

  state.loading = false
  render()
}

async function setMode(mode) {
  try {
    state.message = 'Mengubah mode...'
    render()

    const result = await api('/api/mode', {
      method: 'POST',
      body: JSON.stringify({ mode })
    })

    state.message = `Mode berhasil diubah ke ${result.mode}`
    await loadStatus()
  } catch (err) {
    state.message = 'Gagal mengubah mode: ' + err.message
    render()
  }
}

function render() {
  const connected = state.status?.connected
  const mode = state.status?.mode || '-'

  document.querySelector('#app').innerHTML = `
    <div class="layout">

      <aside>
        <div class="brand">
          PIRO<span>ADMIN</span>
        </div>

        <button
          data-tab="dashboard"
          class="${state.tab === 'dashboard' ? 'active' : ''}">
          🏠 Dashboard
        </button>

        <button
          data-tab="bot"
          class="${state.tab === 'bot' ? 'active' : ''}">
          🤖 Bot
        </button>

        <button
          data-tab="settings"
          class="${state.tab === 'settings' ? 'active' : ''}">
          ⚙️ Pengaturan
        </button>

        <div class="side-note">
          PIRO / PYNI STORE<br>
          WhatsApp Bot Panel
        </div>
      </aside>

      <main>

        <header>
          <div>
            <h1>${title()}</h1>
            <p>Kontrol bot WhatsApp dari Panel Piro.</p>
          </div>

          <span class="status ${connected ? 'on' : 'off'}">
            ${connected ? '● TERHUBUNG' : '● TERPUTUS'}
          </span>
        </header>

        ${body()}

      </main>
    </div>
  `

  bind()
}

function title() {
  return {
    dashboard: 'Dashboard',
    bot: 'Kontrol Bot',
    settings: 'Pengaturan'
  }[state.tab]
}

function body() {
  if (state.tab === 'dashboard') {
    return `
      <section class="cards">

        <div class="card">
          <b>${state.status?.connected ? 'ONLINE' : 'OFFLINE'}</b>
          <span>Status WhatsApp</span>
        </div>

        <div class="card">
          <b>${state.status?.mode || '-'}</b>
          <span>Mode Bot</span>
        </div>

        <div class="card">
          <b>10.0.0</b>
          <span>Versi Bot</span>
        </div>

      </section>

      <section class="panel">
        <h2>Informasi Bot</h2>

        <div class="info">
          <p>👑 Owner:
            <b>${esc(state.status?.owner || '-')}</b>
          </p>

          <p>🛡️ Admin:
            <b>${esc(state.status?.admin || '-')}</b>
          </p>

          <p>📡 API:
            <b>Online</b>
          </p>

          <p>🌐 Mode:
            <b>${esc(state.status?.mode || '-')}</b>
          </p>
        </div>

        ${
          state.message
            ? `<div class="message">${esc(state.message)}</div>`
            : ''
        }

      </section>
    `
  }

  if (state.tab === 'bot') {
    return `
      <section class="panel">

        <h2>🎮 Kontrol Mode Bot</h2>

        <p class="desc">
          Pilih mode yang ingin digunakan bot WhatsApp.
        </p>

        <div class="mode-box">

          <div class="current">
            Mode sekarang:
            <strong>${esc(modeText())}</strong>
          </div>

          <div class="buttons">

            <button
              class="mode public"
              id="public">
              🌐 MODE PUBLIC
            </button>

            <button
              class="mode private"
              id="private">
              🔒 MODE PRIVATE
            </button>

          </div>

        </div>

        ${
          state.message
            ? `<div class="message">${esc(state.message)}</div>`
            : ''
        }

      </section>
    `
  }

    return `
    <section class="panel">

      <h2>⚙️ Pengaturan Bot</h2>

      <p class="desc">
        Kelola konfigurasi utama Bot Piro.
      </p>

      <div class="settings-grid">

        <div class="setting-card">
          <div>
            <h3>🌐 Mode Bot</h3>
            <p>
              Tentukan apakah bot menerima pesan secara public
              atau private.
            </p>
          </div>

          <div class="setting-value">
            <strong>
              ${esc(modeText())}
            </strong>
          </div>

          <div class="buttons">

            <button
              class="mode public"
              id="settingsPublic">
              🌐 PUBLIC
            </button>

            <button
              class="mode private"
              id="settingsPrivate">
              🔒 PRIVATE
            </button>

          </div>
        </div>

        <div class="setting-card">
          <div>
            <h3>📡 Status API</h3>
            <p>
              Status koneksi antara Panel Piro dan Bot WhatsApp.
            </p>
          </div>

          <div class="setting-value">
            <strong>
              ${state.status?.connected ? '🟢 ONLINE' : '🔴 OFFLINE'}
            </strong>
          </div>
        </div>

        <div class="setting-card">
          <div>
            <h3>🤖 Versi Bot</h3>
            <p>
              Versi sistem Bot Piro yang sedang berjalan.
            </p>
          </div>

          <div class="setting-value">
            <strong>10.0.0</strong>
          </div>
        </div>

        <div class="setting-card">
          <div>
            <h3>🔌 Backend API</h3>
            <p>
              Endpoint yang digunakan Panel Piro.
            </p>
          </div>

          <code>${esc(API)}</code>
        </div>

      </div>

      ${
        state.message
          ? `<div class="message">${esc(state.message)}</div>`
          : ''
      }

      <p class="warning">
        ⚠️ API menggunakan Cloudflare Quick Tunnel.
        URL dapat berubah jika tunnel dihentikan.
      </p>

    </section>
  `
}

function modeText() {
  if (!state.status) return '-'
  return state.status.mode === 'public'
    ? 'PUBLIC'
    : 'PRIVATE'
}

function esc(value = '') {
  return String(value).replace(
    /[&<>"']/g,
    char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char])
  )
}

function bind() {
  document
    .querySelectorAll('[data-tab]')
    .forEach(button => {
      button.onclick = () => {
        state.tab = button.dataset.tab
        render()
      }
    })

  document
    .querySelector('#public')
    ?.addEventListener('click', () => {
      setMode('public')
    })

  document
    .querySelector('#private')
    ?.addEventListener('click', () => {
      setMode('private')
    })
}

render()
loadStatus()
