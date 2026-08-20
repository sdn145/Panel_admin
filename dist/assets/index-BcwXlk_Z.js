(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const u of n.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&s(u)}).observe(document,{childList:!0,subtree:!0});function o(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(t){if(t.ep)return;t.ep=!0;const n=o(t);fetch(t.href,n)}})();const b="https://indiana-metal-locator-balanced.trycloudflare.com",a={tab:"dashboard",status:null,menus:[],features:[],loading:!1,message:"",menuForm:{command:"",description:"",text:"",logo:""}};async function i(e,r={}){const o=await fetch(b+e,{...r,headers:{"Content-Type":"application/json",...r.headers||{}}}),s=await o.text();let t;try{t=JSON.parse(s)}catch{throw new Error(s||"Response error")}if(!o.ok)throw new Error(t.error||"API Error");return t}async function m(){try{a.status=await i("/api/status")}catch(e){a.message=e.message}}async function p(){try{a.menus=await i("/api/menus")}catch{a.menus=[]}}async function d(){try{a.features=await i("/api/features")}catch{a.features=[]}}async function f(){const e=document.querySelector("#featureName").value,r=document.querySelector("#featureCommand").value,o=document.querySelector("#featureDescription").value;if(!e||!r){alert("Nama dan command wajib diisi");return}try{await i("/api/features",{method:"POST",body:JSON.stringify({name:e,command:r,description:o})}),await d(),c()}catch(s){alert(s.message)}}async function h(e,r){try{await i("/api/features/"+e,{method:"PUT",body:JSON.stringify({enabled:r})}),await d(),c()}catch(o){alert(o.message)}}async function y(e){if(confirm("Hapus feature ini?"))try{await i("/api/features/"+e,{method:"DELETE"}),await d(),c()}catch(r){alert(r.message)}}async function l(e){await i("/api/mode",{method:"POST",body:JSON.stringify({mode:e})}),await m(),c()}function c(){const e=a.status?.connected;document.querySelector("#app").innerHTML=`

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

<h1>${g()}</h1>

<p>
Kontrol bot WhatsApp dari Panel Piro.
</p>


<span class="status ${e?"on":"off"}">
${e?"● TERHUBUNG":"● TERPUTUS"}
</span>


</header>


${v()}


</main>

</div>

`,S()}function g(){return{dashboard:"Dashboard",bot:"Kontrol Bot",settings:"Pengaturan"}[a.tab]}function v(){return a.tab==="features"?`

<section class="panel">

<h2>⚡ Feature Manager</h2>

<input id="featureName" placeholder="Nama feature">

<input id="featureCommand" placeholder="Command">

<input id="featureDescription" placeholder="Deskripsi">

<button class="primary save" id="addFeature">
Tambah Feature
</button>

<div>

${a.features.length?a.features.map(e=>`

<div class="row">

<div>

<b>${e.name}</b>

<small>
/${e.command} - ${e.description||"Tanpa deskripsi"}
</small>

</div>

<div>

<button
class="ghost"
data-toggle="${e.id}"
data-enabled="${e.enabled}"
>
${e.enabled?"ON":"OFF"}
</button>

<button
class="danger"
data-delete="${e.id}"
>
Hapus
</button>

</div>

</div>

`).join(""):'<div class="empty">Belum ada feature.</div>'}

</div>

</section>

`:a.tab==="dashboard"?`

<section class="panel">

<h2>Dashboard</h2>

<p>Status WhatsApp:
<b>
${a.status?.connected?"ONLINE":"OFFLINE"}
</b>
</p>


<p>
Mode:
<b>
${a.status?.mode||"-"}
</b>
</p>


<p>
Owner:
<b>
${a.status?.owner||"-"}
</b>
</p>


<p>
Admin:
<b>
${a.status?.admin||"-"}
</b>
</p>


</section>

`:a.tab==="bot"?`

<section class="panel">

<h2>🎮 Mode Bot</h2>


<button id="public">
🌐 PUBLIC
</button>


<button id="private">
🔒 PRIVATE
</button>


</section>

`:`

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

${a.menus.map(e=>`

<div>

<b>${e.command}</b>

<br>

${e.description}

</div>

`).join("")}


</div>



</section>

`}function S(){document.querySelector("#addFeature")?.addEventListener("click",f),document.querySelectorAll("[data-toggle]").forEach(e=>{e.onclick=()=>h(e.dataset.toggle,e.dataset.enabled!=="true")}),document.querySelectorAll("[data-delete]").forEach(e=>{e.onclick=()=>y(e.dataset.delete)}),document.querySelectorAll("[data-tab]").forEach(e=>{e.onclick=()=>{a.tab=e.dataset.tab,c()}}),document.querySelector("#public")?.addEventListener("click",()=>{l("public")}),document.querySelector("#private")?.addEventListener("click",()=>{l("private")}),document.querySelector("#createMenu")?.addEventListener("click",()=>{const e=document.querySelector("#creator");e.style.display=e.style.display==="none"?"block":"none"}),document.querySelector("#publish")?.addEventListener("click",async()=>{const e={command:document.querySelector("#command").value,description:document.querySelector("#description").value,text:document.querySelector("#text").value,logo:document.querySelector("#logo").value};try{await i("/api/menus",{method:"POST",body:JSON.stringify(e)}),alert("Menu berhasil dibuat"),await p(),await d(),c()}catch(r){alert(r.message)}})}async function w(){await m(),await p(),c()}w();
