import './style.css'

const state = {
  api: localStorage.getItem('wa_api') || '',
  tab: 'dashboard',
  menus: JSON.parse(localStorage.getItem('wa_menus') || '[]'),
  commands: JSON.parse(localStorage.getItem('wa_commands') || '[]'),
  media: JSON.parse(localStorage.getItem('wa_media') || '[]')
}

const save = () => {
  localStorage.setItem('wa_api', state.api)
  localStorage.setItem('wa_menus', JSON.stringify(state.menus))
  localStorage.setItem('wa_commands', JSON.stringify(state.commands))
  localStorage.setItem('wa_media', JSON.stringify(state.media))
}

async function api(path, options={}) {
  if (!state.api) throw new Error('API URL belum diset.')
  const res = await fetch(state.api.replace(/\/$/,'') + path, {
    ...options,
    headers: {'Content-Type':'application/json', ...(options.headers||{})}
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json().catch(()=>({ok:true}))
}

function render() {
  document.querySelector('#app').innerHTML = `
  <div class="layout">
    <aside>
      <div class="brand">WA<span>ADMIN</span></div>
      <button data-tab="dashboard" class="${state.tab==='dashboard'?'active':''}">⌂ Dashboard</button>
      <button data-tab="menus" class="${state.tab==='menus'?'active':''}">☷ Menu</button>
      <button data-tab="commands" class="${state.tab==='commands'?'active':''}">⌘ Commands</button>
      <button data-tab="media" class="${state.tab==='media'?'active':''}">▧ Foto / Media</button>
      <button data-tab="settings" class="${state.tab==='settings'?'active':''}">⚙ Pengaturan</button>
      <div class="side-note">Frontend GitHub Pages<br>Backend bot tetap di server/VPS.</div>
    </aside>
    <main>
      <header><div><h1>${title()}</h1><p>Kontrol bot WhatsApp dari satu panel.</p></div><span class="status ${state.api?'on':''}">${state.api?'API tersambung':'API belum diset'}</span></header>
      ${body()}
    </main>
  </div>`
  bind()
}

function title() {
  return ({dashboard:'Dashboard',menus:'Menu Bot',commands:'Command',media:'Foto / Media',settings:'Pengaturan'})[state.tab]
}

function body() {
  if (state.tab==='dashboard') return `
    <section class="cards">
      <div class="card"><b>${state.menus.length}</b><span>Menu</span></div>
      <div class="card"><b>${state.commands.length}</b><span>Command</span></div>
      <div class="card"><b>${state.media.length}</b><span>Media</span></div>
    </section>
    <section class="panel"><h2>Arsitektur</h2><p>GitHub Pages hanya menjadi panel admin. Tombol di panel memanggil API bot Anda. Ini lebih aman daripada menaruh token WhatsApp di frontend.</p><div class="code">GitHub Pages → REST API → Bot WhatsApp → WhatsApp</div></section>`
  if (state.tab==='menus') return `
    <section class="toolbar"><button class="primary" id="newMenu">+ Create Menu Baru</button></section>
    <section class="panel">${state.menus.length?state.menus.map((x,i)=>row(x,i,'menu')).join(''):'<div class="empty">Belum ada menu.</div>'}</section>`
  if (state.tab==='commands') return `
    <section class="toolbar"><button class="primary" id="newCommand">+ Command Baru</button></section>
    <section class="panel">${state.commands.length?state.commands.map((x,i)=>row(x,i,'command')).join(''):'<div class="empty">Belum ada command.</div>'}</section>`
  if (state.tab==='media') return `
    <section class="toolbar"><button class="primary" id="newMedia">+ Foto / Media Baru</button></section>
    <section class="panel">${state.media.length?state.media.map((x,i)=>row(x,i,'media')).join(''):'<div class="empty">Belum ada media.</div>'}</section>`
  return `
    <section class="panel">
      <h2>Bot API</h2><p>Masukkan URL REST API backend bot Anda. Contoh: https://domain-api-anda.com/api</p>
      <input id="api" value="${esc(state.api)}" placeholder="https://example.com/api">
      <button class="primary save" id="saveApi">Simpan</button>
      <hr>
      <h2>Endpoint yang disiapkan frontend</h2>
      <div class="endpoint">GET /menus<br>POST /menus<br>PUT /menus/:id<br>DELETE /menus/:id<br><br>GET /commands<br>POST /commands<br>PUT /commands/:id<br>DELETE /commands/:id<br><br>GET /media<br>POST /media<br>PUT /media/:id<br>DELETE /media/:id</div>
    </section>`
}

function row(x,i,type) {
  const label = type==='menu' ? x.name : type==='command' ? x.command : x.name
  const detail = type==='command' ? x.reply : type==='media' ? x.url : x.description
  return `<div class="row"><div><b>${esc(label||'-')}</b><small>${esc(detail||'')}</small></div>
  <div><button class="ghost edit" data-type="${type}" data-i="${i}">Edit</button><button class="danger del" data-type="${type}" data-i="${i}">Hapus</button></div></div>`
}

function esc(v='') { return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) }

function modal(type, index=null) {
  const arr = state[type==='menu'?'menus':type==='command'?'commands':'media']
  const x = index===null ? {} : arr[index]
  const fields = type==='menu'
    ? `<label>Nama menu<input id="f1" value="${esc(x.name)}"></label><label>Deskripsi<input id="f2" value="${esc(x.description)}"></label><label>Trigger<input id="f3" value="${esc(x.trigger)}"></label>`
    : type==='command'
    ? `<label>Command<input id="f1" value="${esc(x.command)}" placeholder="/menu"></label><label>Reply<input id="f2" value="${esc(x.reply)}"></label>`
    : `<label>Nama media<input id="f1" value="${esc(x.name)}"></label><label>URL / path media<input id="f2" value="${esc(x.url)}"></label><label>Caption<input id="f3" value="${esc(x.caption)}"></label>`
  document.body.insertAdjacentHTML('beforeend', `<div class="modal"><div class="dialog"><h2>${index===null?'Tambah':'Edit'} ${type}</h2>${fields}<div class="actions"><button class="ghost close">Batal</button><button class="primary ok">Simpan</button></div></div></div>`)
  document.querySelector('.close').onclick=()=>document.querySelector('.modal').remove()
  document.querySelector('.ok').onclick=async()=>{
    const item = type==='menu'
      ? {name:f1.value,description:f2.value,trigger:f3.value}
      : type==='command'
      ? {command:f1.value,reply:f2.value}
      : {name:f1.value,url:f2.value,caption:f3.value}
    if(index===null) arr.push({...item,id:crypto.randomUUID()}); else arr[index]={...arr[index],...item}
    save()
    try { await api('/'+(type==='menu'?'menus':type==='command'?'commands':'media'), {method:index===null?'POST':'PUT',body:JSON.stringify(item)}) } catch(e) { /* local-first */ }
    document.querySelector('.modal').remove(); render()
  }
}

function bind() {
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;render()})
  document.querySelector('#newMenu')?.addEventListener('click',()=>modal('menu'))
  document.querySelector('#newCommand')?.addEventListener('click',()=>modal('command'))
  document.querySelector('#newMedia')?.addEventListener('click',()=>modal('media'))
  document.querySelectorAll('.edit').forEach(b=>b.onclick=()=>modal(b.dataset.type,+b.dataset.i))
  document.querySelectorAll('.del').forEach(b=>b.onclick=async()=>{
    const map={menu:'menus',command:'commands',media:'media'}, arr=state[map[b.dataset.type]]
    if(confirm('Hapus item ini?')) {
      const item=arr.splice(+b.dataset.i,1)[0]; save()
      try { await api('/'+map[b.dataset.type]+'/'+item.id,{method:'DELETE'}) } catch(e) {}
      render()
    }
  })
  document.querySelector('#saveApi')?.addEventListener('click',()=>{state.api=document.querySelector('#api').value.trim();save();render()})
}
render()
