import './style.css'

const API = 'https://jews-saturday-compensation-blogs.trycloudflare.com'

const state = {
  tab: 'dashboard',
  status: null,
  menus: [],
  features: [],
  loading: false,
  message: '',
  menuForm: {
    command: '',
    description: '',
    text: '',
    logo: ''
  }
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
    throw new Error(text || 'Response error')
  }

  if (!res.ok) {
    throw new Error(data.error || 'API Error')
  }

  return data
}


async function loadStatus(){

  try{
    state.status = await api('/api/status')
  }catch(err){
    state.message = err.message
  }

}


async function loadMenus(){

  try{
    state.menus = await api('/api/menus')
  }catch(err){
    state.menus = []
  }

}


async function loadFeatures(){

  try{
    state.features = await api('/api/features')
  }catch(err){
    state.features = []
  }

}


async function addFeature(){

  const name = document.querySelector('#featureName').value
  const command = document.querySelector('#featureCommand').value
  const description = document.querySelector('#featureDescription').value

  if(!name || !command){
    alert('Nama dan command wajib diisi')
    return
  }

  try{
    await api('/api/features',{
      method:'POST',
      body:JSON.stringify({
        name,
        command,
        description
      })
    })

    await loadFeatures()
    render()

  }catch(err){
    alert(err.message)
  }

}


async function toggleFeature(id,enabled){

  try{
    await api('/api/features/'+id,{
      method:'PUT',
      body:JSON.stringify({enabled})
    })

    await loadFeatures()
    render()

  }catch(err){
    alert(err.message)
  }

}


async function deleteFeature(id){

  if(!confirm('Hapus feature ini?')) return

  try{
    await api('/api/features/'+id,{
      method:'DELETE'
    })

    await loadFeatures()
    render()

  }catch(err){
    alert(err.message)
  }

}


async function setMode(mode){

  await api('/api/mode',{
    method:'POST',
    body:JSON.stringify({
      mode
    })
  })

  await loadStatus()
  render()

}function render(){

const connected = state.status?.connected

document.querySelector('#app').innerHTML = `

<div class="layout">

<aside>

<div class="brand">
PIRO<span>ADMIN</span>
</div>


<button data-tab="dashboard">
🏠 Dashboard
</button>

<button data-tab="bot">
🤖 Bot
</button>

<button data-tab="settings">
⚙️ Pengaturan
</button>

<button data-tab="features">
⚡ Features
</button>


</aside>


<main>

<header>

<h1>${title()}</h1>

<p>
Kontrol bot WhatsApp dari Panel Piro.
</p>


<span class="status ${connected?'on':'off'}">
${connected?'● TERHUBUNG':'● TERPUTUS'}
</span>


</header>


${body()}


</main>

</div>

`

bind()

}



function title(){

return {
dashboard:'Dashboard',
bot:'Kontrol Bot',
settings:'Pengaturan'
}[state.tab]

}



function body(){


if(state.tab==='features'){

return `

<section class="panel">

<h2>⚡ Feature Manager</h2>

<input id="featureName" placeholder="Nama feature">

<input id="featureCommand" placeholder="Command">

<input id="featureDescription" placeholder="Deskripsi">

<button class="primary save" id="addFeature">
Tambah Feature
</button>

<div>

${
state.features.length
?
state.features.map(f=>`

<div class="row">

<div>

<b>${f.name}</b>

<small>
/${f.command} - ${f.description || 'Tanpa deskripsi'}
</small>

</div>

<div>

<button
class="ghost"
data-toggle="${f.id}"
data-enabled="${f.enabled}"
>
${f.enabled ? 'ON' : 'OFF'}
</button>

<button
class="danger"
data-delete="${f.id}"
>
Hapus
</button>

</div>

</div>

`).join('')
:
'<div class="empty">Belum ada feature.</div>'
}

</div>

</section>

`

}


if(state.tab==='dashboard'){

return `

<section class="panel">

<h2>Dashboard</h2>

<p>Status WhatsApp:
<b>
${state.status?.connected?'ONLINE':'OFFLINE'}
</b>
</p>


<p>
Mode:
<b>
${state.status?.mode || '-'}
</b>
</p>


<p>
Owner:
<b>
${state.status?.owner || '-'}
</b>
</p>


<p>
Admin:
<b>
${state.status?.admin || '-'}
</b>
</p>


</section>

`

}



if(state.tab==='bot'){

return `

<section class="panel">

<h2>🎮 Mode Bot</h2>


<button id="public">
🌐 PUBLIC
</button>


<button id="private">
🔒 PRIVATE
</button>


</section>

`

}



return `

<section class="panel">


<h2>⚙️ Pengaturan Bot</h2>


<h3>📋 Menu Manager</h3>


<button id="createMenu">
➕ Create Menu
</button>



<div id="creator" style="display:none">


<input id="command"
placeholder=".command">


<input id="description"
placeholder="Deskripsi">


<textarea id="text"
placeholder="Isi menu">
</textarea>


<input id="logo"
placeholder="URL logo">


<button id="publish">
🚀 Publish
</button>


</div>



<h3>
Menu Aktif
</h3>


<div>

${
state.menus.map(m=>`

<div>

<b>${m.command}</b>

<br>

${m.description}

</div>

`).join('')
}


</div>



</section>

`

}function bind(){

document
.querySelector('#addFeature')
?.addEventListener('click',addFeature)


document
.querySelectorAll('[data-toggle]')
.forEach(btn=>{

btn.onclick=()=>toggleFeature(
  btn.dataset.toggle,
  btn.dataset.enabled !== 'true'
)

})


document
.querySelectorAll('[data-delete]')
.forEach(btn=>{

btn.onclick=()=>deleteFeature(
  btn.dataset.delete
)

})


document
.querySelectorAll('[data-tab]')
.forEach(btn=>{

btn.onclick=()=>{

state.tab = btn.dataset.tab

render()

}

})



document
.querySelector('#public')
?.addEventListener('click',()=>{

setMode('public')

})



document
.querySelector('#private')
?.addEventListener('click',()=>{

setMode('private')

})




document
.querySelector('#createMenu')
?.addEventListener('click',()=>{

const box =
document.querySelector('#creator')

box.style.display =
box.style.display === 'none'
?'block'
:'none'

})




document
.querySelector('#publish')
?.addEventListener('click',async()=>{


const data={

command:
document.querySelector('#command').value,


description:
document.querySelector('#description').value,


text:
document.querySelector('#text').value,


logo:
document.querySelector('#logo').value

}



try{


await api('/api/menus',{

method:'POST',

body:
JSON.stringify(data)

})


alert('Menu berhasil dibuat')


await loadMenus()
await loadFeatures()

render()


}catch(err){

alert(err.message)

}


})


}




async function start(){

await loadStatus()

await loadMenus()

render()

}


start()
