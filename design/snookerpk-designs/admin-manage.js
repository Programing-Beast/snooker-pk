/* ============================================================
   SnookerPK · Admin — Manage Entries & Manage Players
   ============================================================ */
const ICON = {
  dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  tournaments:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/>',
  entries:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',
  players:'<circle cx="9" cy="8" r="3.5"/><path d="M3 21c0-3.5 3-5.5 6-5.5s6 2 6 5.5"/><path d="M17 8a3 3 0 010 6"/>',
  rankings:'<path d="M4 19V5M10 19v-9M16 19V8M22 19H2"/>',
  results:'<path d="M9 17l3-9 3 9M6 21h12"/><circle cx="12" cy="4" r="2"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 00.3 1.8 2 2 0 11-2.8 2.8 1.6 1.6 0 00-2.7.7 1.6 1.6 0 01-3.2 0 1.6 1.6 0 00-2.7-.7 2 2 0 11-2.8-2.8 1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H4a2 2 0 010-4 1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8 2 2 0 112.8-2.8 1.6 1.6 0 002.7-.7A1.6 1.6 0 0114 3.4a2 2 0 014 0 1.6 1.6 0 002.7.7 2 2 0 112.8 2.8 1.6 1.6 0 00-.3 1.8 1.6 1.6 0 001.5 1H25"/>',
};
const NAV = [['dashboard','Dashboard'],['tournaments','Tournaments'],['entries','Entries'],['players','Players'],['rankings','Rankings'],['results','Results'],['settings','Settings']];
function sidebar(active){
  const items=NAV.map(([k,label])=>{
    const badge=k==='entries'?'<span class="ml-auto badge bg-live-fill text-white !text-[9px] !px-1.5" id="nav-pending">18</span>':'';
    return `<div class="navitem ${k===active?'on':''}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" class="shrink-0">${ICON[k]}</svg><span>${label}</span>${badge}</div>`;
  }).join('');
  return `<div class="flex flex-col h-full px-3 py-5" style="min-height:inherit">
    <div class="flex items-center gap-2 px-2 mb-6"><span class="font-display font-extrabold text-white uppercase tracking-tight text-lg">Snooker<span class="text-live">PK</span></span><span class="badge bg-brass/20 text-brass !text-[9px] ml-1">Admin</span></div>
    <nav class="space-y-1">${items}</nav>
    <div class="mt-auto pt-4 border-t border-white/10"><div class="flex items-center gap-2.5 px-1"><div class="w-9 h-9 rounded-full bg-felt grid place-items-center font-display font-bold text-white text-xs ring-2 ring-brass shrink-0">AK</div><div class="leading-tight"><div class="text-white text-[13px] font-semibold">Adnan Karim</div><div class="text-ink-400 text-[11px]">Tournament admin</div></div></div></div>
  </div>`;
}
function topbar(crumb){
  const parts=crumb.split(' / ');
  return `<div class="sticky top-0 z-20 bg-canvas/95 backdrop-blur border-b border-hairline px-7 flex items-center gap-4" style="height:60px">
    <div class="flex items-center gap-2 text-[13.5px] min-w-0">${parts.map((p,i)=>`${i>0?'<span class="text-ink-300">/</span>':''}<span class="${i===parts.length-1?'font-semibold text-ink-900':'text-ink-500'} truncate">${p}</span>`).join('')}</div>
    <div class="ml-auto flex items-center gap-2.5">
      <div class="relative w-56"><svg class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><input class="input !py-2 pl-9 text-[13px]" placeholder="Search…"></div>
      <button class="w-9 h-9 rounded-md grid place-items-center text-ink-500 hover:bg-surface2 relative"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg><span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-live"></span></button>
    </div>
  </div>`;
}
function flag(cc,w=20,h=13){const b={PAK:`<i style="background:#016d31"></i><i style="background:#fff;flex:0 0 ${Math.round(w*0.3)}px"></i>`,ENG:`<i style="background:#fff"></i>`,CHN:`<i style="background:#de2910"></i>`,IND:`<i style="background:#ff9933"></i><i style="background:#fff"></i><i style="background:#138808"></i>`};const col=cc==='IND'?' col':'';return `<span class="fg${col}" style="width:${w}px;height:${h}px">${b[cc]||b.PAK}</span>`;}
function inits(n){return n.split(' ').map(x=>x[0]).join('').replace(/\./g,'').slice(0,2);}

/* ============================================================
   01 — MANAGE ENTRIES
   ============================================================ */
const TN = { name:'Faisalabad Open ’26', open:true, cap:64, base:43 };  // base = already-confirmed players not in this review batch
let REQ = [
  { id:1, n:'B. Sajjad', cc:'PAK', tier:'Am', date:'18 May', status:'pending' },
  { id:2, n:'H. Raza', cc:'PAK', tier:'Am', date:'18 May', status:'pending' },
  { id:3, n:'R. Walker', cc:'ENG', tier:'Am', date:'19 May', status:'pending' },
  { id:4, n:'T. Aslam', cc:'PAK', tier:'Am', date:'20 May', status:'pending' },
  { id:5, n:'Z. Ali', cc:'PAK', tier:'Pro', date:'20 May', status:'pending' },
  { id:6, n:'M. Yousuf', cc:'PAK', tier:'Am', date:'21 May', status:'pending' },
  { id:7, n:'K. Iqbal', cc:'PAK', tier:'Pro', date:'21 May', status:'approved' },
  { id:8, n:'A. Mehmood', cc:'PAK', tier:'Pro', date:'22 May', status:'approved' },
  { id:9, n:'D. Junhui', cc:'CHN', tier:'Pro', date:'22 May', status:'approved' },
  { id:10, n:'F. Khan', cc:'PAK', tier:'Am', date:'23 May', status:'pending' },
  { id:11, n:'W. Ahmed', cc:'PAK', tier:'Am', date:'23 May', status:'rejected' },
  { id:12, n:'S. Mehmood', cc:'PAK', tier:'Am', date:'24 May', status:'rejected' },
];
let entryFilter = 'all';
let _rid = 100;

function counts(){
  const approvedInBatch = REQ.filter(r=>r.status==='approved').length;
  return {
    total: TN.base + REQ.length,
    pending: REQ.filter(r=>r.status==='pending').length,
    approved: TN.base + approvedInBatch,        // total confirmed players
    rejected: REQ.filter(r=>r.status==='rejected').length,
    filled: TN.base + approvedInBatch,
  };
}
function atCapacity(){ const c=counts(); return TN.cap!==null && c.filled>=TN.cap; }

const ECHIP = {
  pending:'bg-warn-tint text-[#9A5B12]', approved:'bg-ok-tint text-[#0C6B3C]', rejected:'bg-bad-tint text-[#9A2820]',
};
function statCard(label, val, sub, tone){
  const tones={felt:'bg-felt-50 text-felt',warn:'bg-warn-tint text-[#9A5B12]',ok:'bg-ok-tint text-[#0C6B3C]',bad:'bg-bad-tint text-[#9A2820]',ink:'bg-ink-100 text-ink-600',live:'bg-live-tint text-live-fill'};
  return `<div class="card p-4">
    <div class="seclabel text-ink-400 !text-[10px]">${label}</div>
    <div class="font-display font-extrabold text-[30px] leading-none tabular-nums mt-2 ${tone==='warn'?'text-warn':''}">${val}</div>
    <div class="text-caption text-ink-500 mt-1.5">${sub}</div>
  </div>`;
}

function buildEntries(){
  const c=counts();
  const capLabel = TN.cap===null ? 'Open' : `${c.filled}/${TN.cap}`;
  const pct = TN.cap===null ? 0 : Math.round(c.filled/TN.cap*100);
  const full = atCapacity();

  const filtered = REQ.filter(r=> entryFilter==='all' || r.status===entryFilter);
  const rows = filtered.map(r=>{
    const approveDisabled = (full || !TN.open) && r.status!=='approved';
    return `<tr id="req-${r.id}" class="border-b border-hairline last:border-0 hover:bg-surface2">
      <td class="px-5 py-3">
        <div class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-full ${r.tier==='Pro'?'bg-felt text-white':'bg-ink-200 text-ink-600'} grid place-items-center font-display font-bold text-xs">${inits(r.n)}</span>
          ${flag(r.cc,18,12)}<span class="font-semibold text-[14px]">${r.n}</span><span class="tier ${r.tier==='Pro'?'tier-pro':'tier-am'}">${r.tier}</span>
        </div>
      </td>
      <td class="px-5 py-3"><span class="badge ${ECHIP[r.status]}"><span class="dot ${r.status==='pending'?'pulse':''}"></span>${r.status[0].toUpperCase()+r.status.slice(1)}</span></td>
      <td class="px-5 py-3 text-caption text-ink-500">${r.date}</td>
      <td class="px-5 py-3">
        ${r.status==='pending' ? `<div class="flex justify-end gap-1.5">
          <button onclick="resolve(${r.id},'approved')" ${approveDisabled?'disabled title="At capacity"':''} class="btn btn-sm ${approveDisabled?'btn-ghost':'bg-ok text-white hover:brightness-95'}">Approve</button>
          <button onclick="resolve(${r.id},'rejected')" class="btn btn-sm bg-white text-bad border border-bad/40 hover:bg-bad-tint">Reject</button>
        </div>` : `<div class="flex justify-end"><button onclick="resolve(${r.id},'pending')" class="btn btn-sm btn-ghost">Undo</button></div>`}
      </td>
    </tr>`;
  }).join('');

  const filterTabs = [['all','All',REQ.length],['pending','Pending',c.pending],['approved','Approved',REQ.filter(r=>r.status==='approved').length],['rejected','Rejected',c.rejected]]
    .map(([k,label,n])=>`<button onclick="setEntryFilter('${k}')" class="px-3.5 py-2 rounded-md text-[13px] font-display font-semibold ${entryFilter===k?'bg-white text-felt shadow-e1':'text-ink-600 hover:text-ink-900'}">${label} <span class="text-ink-400">${n}</span></button>`).join('');

  return `
    <div class="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div>
        <div class="flex items-center gap-2.5"><h1 class="font-display font-extrabold uppercase text-[28px] leading-none">${TN.name}</h1>
          <span class="badge ${TN.open?'bg-ok-tint text-[#0C6B3C]':'bg-ink-100 text-ink-600'}" id="open-badge"><span class="dot"></span>${TN.open?'Entry open':'Entry closed'}</span></div>
        <p class="text-ink-500 text-[14px] mt-1.5">Manage entry requests, capacity and the player list for this event.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2.5 card px-4 py-2.5">
          <span class="text-[13px] font-semibold">Entry</span>
          <div class="switch ${TN.open?'on bg-felt':'bg-ink-300'}" onclick="toggleOpen()"></div>
          <span class="text-[12px] text-ink-500 w-12">${TN.open?'Open':'Closed'}</span>
        </div>
        <button onclick="openAddEntrant()" ${full?'disabled title="At capacity"':''} class="btn btn-primary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>Add player</button>
      </div>
    </div>

    ${full?`<div class="flex items-center gap-2 bg-warn-tint border border-warn/40 text-[#9A5B12] rounded-md px-4 py-2.5 mb-5 text-[13.5px]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z"/></svg><b>At capacity.</b> Approvals are paused. Increase max players or remove an approved entry to continue.</div>`:''}

    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      ${statCard('Total requests', c.total, 'all-time', 'ink')}
      ${statCard('Pending', c.pending, 'awaiting review', 'warn')}
      ${statCard('Approved', c.approved, 'in the draw', 'ok')}
      ${statCard('Rejected', c.rejected, 'declined', 'bad')}
      ${capacityCard(capLabel, pct)}
    </div>

    <div class="card overflow-hidden">
      <div class="px-4 py-3 border-b border-hairline flex items-center gap-2 flex-wrap">
        <div class="inline-flex bg-surface2 rounded-md p-1 gap-1">${filterTabs}</div>
        <span class="ml-auto text-caption text-ink-400">${filtered.length} shown${TN.base?` · +${TN.base} confirmed earlier`:''}</span>
      </div>
      <table class="w-full text-[14px]">
        <thead><tr class="bg-surface2 text-left"><th class="px-5 py-2.5 seclabel text-ink-500 !text-[10px]">Player</th><th class="px-5 py-2.5 seclabel text-ink-500 !text-[10px]">Status</th><th class="px-5 py-2.5 seclabel text-ink-500 !text-[10px]">Requested</th><th class="px-5 py-2.5 seclabel text-ink-500 !text-[10px] text-right">Action</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="4" class="px-5 py-10 text-center text-ink-400 text-[14px]">No ${entryFilter} requests.</td></tr>`}</tbody>
      </table>
    </div>`;
}
function capacityCard(label, pct){
  const full = atCapacity();
  return `<div class="card p-4">
    <div class="flex items-center justify-between"><div class="seclabel text-ink-400 !text-[10px]">Capacity</div>
      <button onclick="editCap()" class="text-[11px] font-semibold text-felt">Change</button></div>
    <div class="font-display font-extrabold text-[30px] leading-none tabular-nums mt-2 ${full?'text-warn':''}">${label}</div>
    ${TN.cap!==null?`<div class="h-1.5 rounded-full bg-ink-200 overflow-hidden mt-2.5"><span class="block h-full rounded-full ${full?'bg-warn':'bg-felt'}" style="width:${pct}%"></span></div>`:'<div class="text-caption text-ink-500 mt-1.5">No limit</div>'}
  </div>`;
}
function renderEntries(){ document.getElementById('entries').innerHTML = buildEntries();
  const np=document.getElementById('nav-pending'); if(np) np.textContent = counts().pending; }
function setEntryFilter(f){ entryFilter=f; renderEntries(); }
function toggleOpen(){ TN.open=!TN.open; renderEntries(); }
function resolve(id, status){ const r=REQ.find(x=>x.id===id); if(!r) return;
  if(status==='approved' && atCapacity()){ return; }
  r.status=status; renderEntries();
}
function editCap(){
  const cur = TN.cap===null ? 'Open' : TN.cap;
  const val = prompt('Set max players (number), or type "Open" for no limit:', cur);
  if(val===null) return;
  if(/^open$/i.test(val.trim())) TN.cap=null;
  else { const n=parseInt(val,10); if(!isNaN(n)&&n>0) TN.cap=n; }
  renderEntries();
}
function openAddEntrant(){
  if(atCapacity()) return;
  openModal({ title:'Add player to draw', note:'Admin-added players are auto-approved and placed directly in the draw.', cta:'Add & approve', onSave:(d)=>{
    REQ.unshift({ id:_rid++, n:d.name, cc:d.country, tier:d.tier, date:'just now', status:'approved' });
    renderEntries();
  }});
}

/* ============================================================
   02 — MANAGE PLAYERS
   ============================================================ */
let PLAYERS = [
  { id:1, n:'Muhammad Asif', cc:'PAK', tier:'Pro', seed:1, city:'Karachi' },
  { id:2, n:'Shahid Khan', cc:'PAK', tier:'Pro', seed:2, city:'Lahore' },
  { id:3, n:'Ding Junhui', cc:'CHN', tier:'Pro', seed:3, city:'Guangzhou' },
  { id:4, n:'Asjad Mehmood', cc:'PAK', tier:'Pro', seed:5, city:'Karachi' },
  { id:5, n:'Babar Sajjad', cc:'PAK', tier:'Am', seed:6, city:'Faisalabad' },
  { id:6, n:'Naseem Hussain', cc:'PAK', tier:'Pro', seed:7, city:'Islamabad' },
  { id:7, n:'Robert Walker', cc:'ENG', tier:'Am', seed:8, city:'Leeds' },
  { id:8, n:'Tariq Aslam', cc:'PAK', tier:'Am', seed:9, city:'Multan' },
  { id:9, n:'Kashif Iqbal', cc:'PAK', tier:'Pro', seed:10, city:'Karachi' },
  { id:10, n:'Zeeshan Ali', cc:'PAK', tier:'Pro', seed:14, city:'Quetta' },
];
let playerSearch=''; let _pid=100;
function buildPlayers(){
  const list = PLAYERS.filter(p=> (p.n+' '+p.city+' '+p.cc).toLowerCase().includes(playerSearch));
  const rows = list.map(p=>`
    <tr class="border-b border-hairline last:border-0 hover:bg-surface2">
      <td class="px-5 py-3"><div class="flex items-center gap-2.5"><span class="w-8 h-8 rounded-full ${p.tier==='Pro'?'bg-felt text-white':'bg-ink-200 text-ink-600'} grid place-items-center font-display font-bold text-xs ${p.seed===1?'ring-1 ring-brass':''}">${inits(p.n)}</span><span class="font-semibold text-[14px]">${p.n}</span></div></td>
      <td class="px-5 py-3"><span class="inline-flex items-center gap-1.5 text-[13px]">${flag(p.cc,18,12)}${p.cc}</span></td>
      <td class="px-5 py-3"><span class="tier ${p.tier==='Pro'?'tier-pro':'tier-am'}">${p.tier}</span></td>
      <td class="px-5 py-3 tabular-nums font-display font-bold ${p.seed<=8?'text-felt':'text-ink-500'}">${p.seed||'—'}</td>
      <td class="px-5 py-3 text-ink-600 text-[13.5px]">${p.city}</td>
      <td class="px-5 py-3 text-right"><button onclick="openEditPlayer(${p.id})" class="btn btn-sm btn-ghost"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>Edit</button></td>
    </tr>`).join('');
  return `
    <div class="flex items-end justify-between gap-4 flex-wrap mb-6">
      <div><h1 class="font-display font-extrabold uppercase text-[28px] leading-none">Players</h1><p class="text-ink-500 text-[14px] mt-1.5">${PLAYERS.length} registered players across the platform.</p></div>
      <div class="flex items-center gap-3">
        <div class="relative w-64"><svg class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><input id="player-search" oninput="searchPlayers(this.value)" class="input pl-9" placeholder="Search players…" value="${playerSearch}"></div>
        <button onclick="openAddPlayer()" class="btn btn-primary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>Add player</button>
      </div>
    </div>
    <div class="card overflow-hidden">
      <table class="w-full text-[14px]">
        <thead><tr class="bg-surface2 text-left">
          <th class="px-5 py-2.5 seclabel text-ink-500 !text-[10px]">Player</th><th class="px-5 py-2.5 seclabel text-ink-500 !text-[10px]">Country</th><th class="px-5 py-2.5 seclabel text-ink-500 !text-[10px]">Tier</th><th class="px-5 py-2.5 seclabel text-ink-500 !text-[10px]">Seed</th><th class="px-5 py-2.5 seclabel text-ink-500 !text-[10px]">City</th><th class="px-5 py-2.5 seclabel text-ink-500 !text-[10px] text-right">Action</th>
        </tr></thead>
        <tbody>${rows || `<tr><td colspan="6" class="px-5 py-10 text-center text-ink-400 text-[14px]">No players match “${playerSearch}”.</td></tr>`}</tbody>
      </table>
    </div>`;
}
function renderPlayers(){ document.getElementById('players').innerHTML = buildPlayers();
  if(_searching){ const s=document.getElementById('player-search'); if(s){ s.focus(); s.setSelectionRange(s.value.length,s.value.length); } } }
let _searching=false;
function searchPlayers(v){ playerSearch=v.toLowerCase().trim(); _searching=true; renderPlayers(); _searching=false; }
function openAddPlayer(){
  openModal({ title:'Add player', cta:'Add player', onSave:(d)=>{ PLAYERS.push({ id:_pid++, n:d.name, cc:d.country, tier:d.tier, seed:d.seed?+d.seed:null, city:d.city }); renderPlayers(); }});
}
function openEditPlayer(id){
  const p=PLAYERS.find(x=>x.id===id); if(!p) return;
  openModal({ title:'Edit player', cta:'Save changes', data:{ name:p.n, country:p.cc, tier:p.tier, seed:p.seed, city:p.city }, onSave:(d)=>{ p.n=d.name; p.cc=d.country; p.tier=d.tier; p.seed=d.seed?+d.seed:null; p.city=d.city; renderPlayers(); }});
}

/* ============================================================
   SHARED MODAL (add/edit player)
   ============================================================ */
let modalState=null;
function openModal({title, note, cta, data={}, onSave}){
  modalState={ onSave };
  const d=Object.assign({name:'',country:'Pakistan',tier:'Pro',seed:'',city:''}, data);
  document.getElementById('modal-root').innerHTML = `
  <div class="fixed inset-0 z-50 flex items-center justify-center p-5 bg-night/70 backdrop-blur-sm" onclick="if(event.target===this)closeModal()">
    <div class="bg-white rounded-lg shadow-e4 w-full max-w-md overflow-hidden pop">
      <div class="px-5 py-4 border-b border-hairline flex items-center justify-between">
        <h3 class="font-display font-bold text-[18px]">${title}</h3>
        <button onclick="closeModal()" class="w-8 h-8 rounded-md grid place-items-center text-ink-400 hover:bg-surface2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
      <div class="p-5 space-y-4">
        ${note?`<div class="flex items-center gap-2 text-[12.5px] text-felt bg-felt-50 rounded-md px-3 py-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>${note}</div>`:''}
        <div><label class="lbl">Full name <span class="text-bad">*</span></label><input id="m-name" class="input" value="${d.name}" placeholder="e.g. Muhammad Asif"><p id="m-name-err" class="hidden text-caption text-bad mt-1.5">Name is required.</p></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="lbl">Country</label><div class="relative"><select id="m-country" class="input appearance-none pr-9">${['Pakistan','England','China','India'].map(c=>{const cc={Pakistan:'PAK',England:'ENG',China:'CHN',India:'IND'}[c];return `<option value="${cc}" ${cc===d.country?'selected':''}>${c}</option>`;}).join('')}</select><svg class="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 1l5 5 5-5"/></svg></div></div>
          <div><label class="lbl">Seed (optional)</label><input id="m-seed" class="input" value="${d.seed||''}" inputmode="numeric" placeholder="—"></div>
        </div>
        <div><label class="lbl">Tier</label>
          <div class="inline-flex bg-surface2 rounded-md p-1 gap-1 w-full" id="m-tier">
            <button type="button" data-tier="Pro" onclick="pickTier('Pro')" class="flex-1 px-3 py-2 rounded-md text-[13px] font-display font-semibold ${d.tier==='Pro'?'bg-felt text-white':'text-ink-600'}">Pro</button>
            <button type="button" data-tier="Am" onclick="pickTier('Am')" class="flex-1 px-3 py-2 rounded-md text-[13px] font-display font-semibold ${d.tier==='Am'?'bg-felt text-white':'text-ink-600'}">Amateur</button>
          </div>
        </div>
        <div><label class="lbl">City</label><input id="m-city" class="input" value="${d.city}" placeholder="City"></div>
      </div>
      <div class="flex gap-2.5 px-5 py-4 bg-surface2 border-t border-hairline justify-end">
        <button onclick="closeModal()" class="btn btn-ghost">Cancel</button>
        <button onclick="saveModal()" class="btn btn-primary">${cta||'Save'}</button>
      </div>
    </div>
  </div>`;
  modalState.tier=d.tier;
  setTimeout(()=>document.getElementById('m-name')?.focus(),30);
}
function pickTier(t){ modalState.tier=t; document.querySelectorAll('#m-tier button').forEach(b=>{const on=b.dataset.tier===t; b.classList.toggle('bg-felt',on); b.classList.toggle('text-white',on); b.classList.toggle('text-ink-600',!on);}); }
function closeModal(){ document.getElementById('modal-root').innerHTML=''; modalState=null; }
function saveModal(){
  const name=document.getElementById('m-name').value.trim();
  if(!name){ document.getElementById('m-name-err').classList.remove('hidden'); document.getElementById('m-name').classList.add('border-bad','ring-2','ring-bad/15'); return; }
  const d={ name, country:document.getElementById('m-country').value, tier:modalState.tier, seed:document.getElementById('m-seed').value.replace(/[^0-9]/g,''), city:document.getElementById('m-city').value.trim() };
  const cb=modalState.onSave; closeModal(); cb&&cb(d);
}

/* ============================================================
   INIT
   ============================================================ */
document.querySelectorAll('[data-sidebar]').forEach(el=>{ el.innerHTML = sidebar(el.getAttribute('data-sidebar')); });
document.querySelectorAll('[data-topbar]').forEach(el=>{ el.outerHTML = topbar(el.getAttribute('data-topbar')); });
renderEntries();
renderPlayers();
