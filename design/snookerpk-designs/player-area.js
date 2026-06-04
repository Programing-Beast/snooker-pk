/* ============================================================
   SnookerPK · Player Area — data, render, interactions
   ============================================================ */
function flag(cc, w = 22, h = 15) {
  const bands = {
    PAK:`<i style="background:#016d31"></i><i style="background:#fff;flex:0 0 ${Math.round(w*0.3)}px"></i>`,
    ENG:`<i style="background:#fff"></i>`, CHN:`<i style="background:#de2910"></i>`,
  };
  return `<span class="fg" style="width:${w}px;height:${h}px">${bands[cc]||bands.PAK}</span>`;
}
const ME = { n:'M. Asif', full:'Muhammad Asif', cc:'PAK', tier:'Pro', rank:1, photo:'https://i.pravatar.cc/96?img=12' };

/* ---------- logged-in top nav ---------- */
function nav(active){
  const items=[['Tournaments','tournaments'],['Rankings','rankings'],['Players','players']];
  return `<div class="bg-night px-7 h-16 flex items-center gap-6 sticky top-0 z-30">
    <span class="font-display font-extrabold text-white uppercase tracking-tight text-lg">Snooker<span class="text-live">PK</span></span>
    <nav class="hidden md:flex gap-1 ml-2">
      ${items.map(([l,k])=>`<a class="px-3 py-2 rounded-md text-[13px] font-medium ${k===active?'text-white bg-white/10':'text-ink-300 hover:text-white hover:bg-white/5'}">${l}</a>`).join('')}
    </nav>
    <div class="ml-auto flex items-center gap-3">
      <button class="w-9 h-9 rounded-md grid place-items-center text-ink-300 hover:text-white hover:bg-white/10 relative"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg><span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-live"></span></button>
      <div class="flex items-center gap-2 pl-2">
        <div class="w-9 h-9 rounded-full bg-cover ring-2 ring-brass" style="background-image:url('${ME.photo}')"></div>
        <div class="hidden lg:block leading-tight"><div class="text-white text-[13px] font-semibold">${ME.n}</div><div class="text-ink-400 text-[11px]">Rank #${ME.rank}</div></div>
      </div>
    </div>
  </div>`;
}
['dash','edit','entry'].forEach(s=>{
  const el=document.getElementById('nav-'+s+'-d'); if(el) el.innerHTML = nav(s==='entry'?'tournaments':'players');
});

/* ---------- shared bottom tab bar (Profile active) ---------- */
function tabbar(){
  const items=[['Home','M3 11l9-8 9 8M5 10v10h14V10'],['Draws','d'],['Create','c'],['Ranks','M4 19V5M10 19v-9M16 19V8M22 19H2'],['Profile','p']];
  const svg={Home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',Draws:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/>',Create:'<path d="M12 5v14M5 12h14"/>',Ranks:'<path d="M4 19V5M10 19v-9M16 19V8M22 19H2"/>',Profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'};
  return items.map(([l])=>{
    if(l==='Create') return `<a class="flex flex-col items-center gap-0.5 py-1 text-ink-400"><span class="-mt-4 w-11 h-11 rounded-full bg-felt grid place-items-center shadow-e3 ring-4 ring-white text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">${svg[l]}</svg></span><span class="text-[9.5px] font-semibold font-display">Create</span></a>`;
    const on=l==='Profile';
    return `<a class="flex flex-col items-center gap-0.5 py-2 ${on?'text-felt':'text-ink-400'}"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${svg[l]}</svg><span class="text-[9.5px] font-semibold font-display">${l}</span></a>`;
  }).join('');
}

/* ============================================================
   01 — DASHBOARD
   ============================================================ */
const UPCOMING = [
  { ev:'Karachi National Open ’26', round:'Semi-final', vs:{n:'TBD',cc:null}, when:'17 Jun · 14:00', table:'Table 1', soon:true },
  { ev:'Karachi Pro-Am ’26', round:'Round 1', vs:{n:'A. Mehmood',cc:'PAK'}, when:'14 Jun · 20:00', table:'Clifton', soon:false },
];
const RECENT = [
  { ev:'Karachi National Open ’26', round:'Quarter-final', vs:{n:'R. Walker',cc:'ENG'}, sa:5, sb:2, won:true },
  { ev:'Karachi National Open ’26', round:'Round 1', vs:{n:'W. Ahmed',cc:'PAK'}, sa:4, sb:1, won:true },
  { ev:'Peshawar Cup ’26', round:'Final', vs:{n:'S. Khan',cc:'PAK'}, sa:6, sb:3, won:true, title:true },
];
const SEEDINGS = [
  { ev:'Karachi National Open ’26', seed:1, state:'In progress', chip:'live' },
  { ev:'Lahore Masters ’26', seed:1, state:'Entry approved', chip:'ok' },
  { ev:'Islamabad Invitational ’26', seed:2, state:'Pending', chip:'warn' },
];
const REQUESTS = [
  { ev:'Lahore Masters ’26', date:'Requested 28 May', status:'Approved', chip:'approved' },
  { ev:'Islamabad Invitational ’26', date:'Requested 1 Jun', status:'Pending', chip:'pending' },
  { ev:'Multan Open Qualifier ’26', date:'Requested 18 May', status:'Rejected', chip:'rejected', reason:'Event reached capacity' },
];
const REQCHIP = {
  approved:'bg-ok-tint text-[#0C6B3C]', pending:'bg-warn-tint text-[#9A5B12]', rejected:'bg-bad-tint text-[#9A2820]',
};
const SEEDCHIP = { live:'bg-live-fill text-white', ok:'bg-ok-tint text-[#0C6B3C]', warn:'bg-warn-tint text-[#9A5B12]' };

function matchLine(mt, scope){
  const m=scope==='m';
  const you = `<div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-cover ring-1 ring-brass shrink-0" style="background-image:url('${ME.photo}')"></div><span class="font-bold text-[14px]">${ME.n}</span><span class="tier tier-pro">You</span></div>`;
  const opp = mt.vs.n==='TBD'
    ? `<span class="text-[14px] text-ink-300 italic">TBD</span>`
    : `<div class="flex items-center gap-2">${flag(mt.vs.cc,18,12)}<span class="text-[14px] text-ink-700">${mt.vs.n}</span></div>`;
  return { you, opp };
}
function upcomingCard(mt, scope){
  const { you, opp } = matchLine(mt, scope);
  return `<div class="card p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="min-w-0"><div class="seclabel text-ink-400 !text-[10px] truncate">${mt.ev}</div><div class="font-display font-bold text-[15px]">${mt.round}</div></div>
      ${mt.soon?'<span class="badge bg-live-fill text-white"><span class="dot pulse"></span>Up next</span>':'<span class="badge bg-brass-tint text-brass-700"><span class="dot"></span>Scheduled</span>'}
    </div>
    <div class="flex items-center gap-2 mb-1">${you}<span class="ml-auto text-ink-300 font-display font-bold text-sm">vs</span></div>
    <div class="flex items-center gap-2 mb-3 pl-9">${opp}</div>
    <div class="flex items-center justify-between pt-3 border-t border-hairline text-caption text-ink-500">
      <span>◷ ${mt.when} · ${mt.table}</span>
      <button class="text-[12px] font-semibold text-felt">View draw →</button>
    </div>
  </div>`;
}
function recentRow(mt){
  return `<div class="flex items-center gap-3 px-4 py-3 border-b border-hairline last:border-0">
    <span class="w-9 h-9 rounded-full grid place-items-center font-display font-bold text-xs ${mt.won?'bg-ok-tint text-[#0C6B3C]':'bg-bad-tint text-[#9A2820]'}">${mt.won?'W':'L'}</span>
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-1.5"><span class="text-[14px] font-semibold">vs ${mt.vs.n}</span>${flag(mt.vs.cc,16,10)}${mt.title?'<span class="badge bg-brass-tint text-brass-700 !text-[9px]">🏆 Title</span>':''}</div>
      <div class="text-caption text-ink-400">${mt.ev} · ${mt.round}</div>
    </div>
    <div class="font-display font-bold tabular-nums text-[16px] ${mt.won?'text-felt':'text-ink-500'}">${mt.sa}<span class="text-ink-300 font-medium">–</span>${mt.sb}</div>
  </div>`;
}
function seedRow(s){
  return `<div class="flex items-center gap-3 px-4 py-3 border-b border-hairline last:border-0">
    <span class="w-9 h-9 rounded-md bg-night grid place-items-center font-display font-extrabold text-white text-sm">${s.seed}</span>
    <div class="min-w-0 flex-1"><div class="text-[14px] font-semibold truncate">${s.ev}</div><div class="text-caption text-ink-400">Seed ${s.seed}</div></div>
    <span class="badge ${SEEDCHIP[s.chip]} !text-[10px]">${s.chip==='live'?'<span class="dot pulse"></span>':''}${s.state}</span>
  </div>`;
}
function requestRow(r){
  return `<div class="px-4 py-3 border-b border-hairline last:border-0">
    <div class="flex items-center gap-3">
      <div class="min-w-0 flex-1"><div class="text-[14px] font-semibold truncate">${r.ev}</div><div class="text-caption text-ink-400">${r.date}</div></div>
      <span class="badge ${REQCHIP[r.chip]}"><span class="dot ${r.chip==='pending'?'pulse':''}"></span>${r.status}</span>
    </div>
    ${r.reason?`<div class="text-caption text-bad mt-1.5 pl-0">${r.reason}</div>`:''}
  </div>`;
}

function buildDash(scope){
  const m=scope==='m';
  const greet = `
  <header class="relative overflow-hidden bg-night felt-grain on-felt">
    <div class="absolute inset-0" style="background:radial-gradient(600px 300px at 14% -30%,rgba(11,110,67,.6),transparent 60%)"></div>
    <div class="relative ${m?'px-4 py-5':'px-7 py-7'} flex items-center gap-4">
      <div class="${m?'w-14 h-14':'w-16 h-16'} rounded-xl bg-cover ring-2 ring-brass shrink-0" style="background-image:url('${ME.photo}')"></div>
      <div>
        <div class="seclabel text-ink-400 ${m?'!text-[9px]':''}">Welcome back</div>
        <h1 class="font-display font-extrabold uppercase text-white leading-none tracking-tight ${m?'text-[24px]':'text-[32px]'}">${ME.full.split(' ')[0]} ${ME.full.split(' ')[1]||''}</h1>
        <div class="flex items-center gap-2 mt-2 text-[12.5px] text-ink-300">${flag(ME.cc,18,12)}<span class="badge bg-felt text-white !text-[9px]">${ME.tier}</span><span class="badge bg-brass-tint text-brass-700 !text-[9px]">Rank #${ME.rank}</span></div>
      </div>
      ${m?'':'<div class="ml-auto flex gap-2.5"><button class="btn btn-onfelt">Edit profile</button><button class="btn btn-brass">Find tournaments</button></div>'}
    </div>
  </header>`;

  const upc = `<div><div class="flex items-center justify-between mb-3"><div class="seclabel text-felt">My upcoming matches</div><span class="text-caption text-ink-400">${UPCOMING.length}</span></div><div class="${m?'space-y-3':'grid grid-cols-2 gap-4'}">${UPCOMING.map(u=>upcomingCard(u,scope)).join('')}</div></div>`;
  const seed = `<div><div class="seclabel text-felt mb-3">My current seedings</div><div class="card overflow-hidden">${SEEDINGS.map(seedRow).join('')}</div></div>`;
  const rec = `<div><div class="seclabel text-felt mb-3">Recent results</div><div class="card overflow-hidden">${RECENT.map(recentRow).join('')}</div></div>`;
  const req = `<div><div class="flex items-center justify-between mb-3"><div class="seclabel text-felt">My entry requests</div><a class="text-[12px] font-semibold text-felt">All →</a></div><div class="card overflow-hidden">${REQUESTS.map(requestRow).join('')}</div></div>`;

  if(m){
    return greet + `<div class="px-4 py-4 space-y-5">${upc}${seed}${rec}${req}</div>`;
  }
  return greet + `<div class="px-7 py-7 grid grid-cols-[1.4fr_1fr] gap-7 items-start">
    <div class="space-y-6">${upc}${rec}</div>
    <div class="space-y-6">${seed}${req}</div>
  </div>`;
}

/* ============================================================
   02 — EDIT PROFILE
   ============================================================ */
function buildEdit(scope){
  const m=scope==='m';
  const photo = `
  <div class="flex items-center gap-4 ${m?'':'mb-2'}">
    <div class="${m?'w-16 h-16':'w-20 h-20'} rounded-xl bg-cover ring-2 ring-hairline shrink-0" style="background-image:url('${ME.photo}')"></div>
    <div>
      <label class="btn btn-outline btn-sm cursor-pointer">Change photo<input type="file" class="hidden"></label>
      <div class="text-caption text-ink-400 mt-1.5">JPG or PNG · up to 5MB</div>
    </div>
  </div>`;
  const fields = `
    <div class="grid ${m?'grid-cols-1':'grid-cols-2'} gap-4">
      <div><label class="lbl">Full name</label><input class="input" value="Muhammad Asif"></div>
      <div><label class="lbl">Country</label>
        <div class="relative"><select class="input appearance-none pr-9"><option>Pakistan</option><option>England</option><option>China</option></select>
        <svg class="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 1l5 5 5-5"/></svg></div>
      </div>
      <div><label class="lbl">Phone</label><input class="input" value="+92 300 1234567"></div>
      <div><label class="lbl">City</label><input class="input" value="Karachi"></div>
      <div class="${m?'':'col-span-2'}"><label class="lbl">Address</label><input class="input" value="Club Road, Civil Lines, Karachi"></div>
      <div class="${m?'':'col-span-2'}"><label class="lbl">Bio</label><textarea class="input" rows="3">Two-time IBSF World Champion and Pakistan’s #1 ranked player.</textarea></div>
    </div>`;
  const toast = `<div id="save-toast-${scope}" class="hidden toast-in mb-5 flex items-center gap-3 rounded-md bg-ok-tint border border-ok/30 px-4 py-3">
      <span class="w-7 h-7 rounded-full bg-ok grid place-items-center text-white shrink-0"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12l5 5L20 6"/></svg></span>
      <div class="text-[13.5px]"><b class="text-[#0C6B3C]">Profile updated.</b> <span class="text-ink-600">Your changes are now live on your public profile.</span></div>
    </div>`;
  const actions = `<div class="flex items-center gap-3 ${m?'sticky bottom-[60px] bg-white/95 backdrop-blur -mx-4 px-4 py-3 border-t border-hairline':'pt-2'}">
      <button id="save-btn-${scope}" onclick="saveProfile('${scope}')" class="btn btn-primary ${m?'flex-1':''}">Save changes</button>
      <button onclick="resetSave('${scope}')" class="btn btn-ghost ${m?'flex-1':''}">Cancel</button>
      ${m?'':'<span class="text-caption text-ink-400 ml-2">Last saved 2 days ago</span>'}
    </div>`;

  if(m){
    return `<div class="px-4 py-4">
      ${toast}
      <div class="space-y-5">${photo}${fields}</div>
      <div class="h-3"></div>${actions}
    </div>`;
  }
  return `<div class="px-7 py-7 max-w-3xl">
    <div class="mb-5"><div class="seclabel text-felt mb-1.5">Account</div><h1 class="font-display font-extrabold uppercase text-[30px] leading-none">Edit profile</h1></div>
    ${toast}
    <div class="card p-6 space-y-6">${photo}<div class="border-t border-hairline"></div>${fields}<div class="border-t border-hairline"></div>${actions}</div>
  </div>`;
}
function saveProfile(scope){
  const t=document.getElementById('save-toast-'+scope); const b=document.getElementById('save-btn-'+scope);
  t.classList.remove('hidden'); t.classList.remove('toast-in'); void t.offsetWidth; t.classList.add('toast-in');
  b.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12l5 5L20 6"/></svg> Saved';
  b.classList.remove('btn-primary'); b.classList.add('bg-ok','text-white');
  const sb=t.closest('.phone-screen'); (sb||t).scrollTo?.({top:0,behavior:'smooth'});
}
function resetSave(scope){
  const t=document.getElementById('save-toast-'+scope); const b=document.getElementById('save-btn-'+scope);
  t.classList.add('hidden');
  b.innerHTML='Save changes'; b.classList.add('btn-primary'); b.classList.remove('bg-ok','text-white');
}

/* ============================================================
   03 — ENTRY STATES
   ============================================================ */
const ENTRY = [
  { id:0, name:'Faisalabad Open ’26', org:'Cue Masters Pakistan', oi:'CM', dates:'1–5 Aug 2026', venue:'Lyallpur Hall, Faisalabad', state:'open', filled:48, cap:64 },
  { id:1, name:'Lahore Masters ’26', org:'Punjab Snooker Assoc.', oi:'PS', dates:'2–6 Jul 2026', venue:'Royal Cue Lounge, Lahore', state:'pending', reqDate:'Requested 1 Jun' },
  { id:2, name:'Islamabad Invitational ’26', org:'Capital Cue Co.', oi:'CC', dates:'18–22 Jul 2026', venue:'Capital Club, Islamabad', state:'approved', seed:2 },
  { id:3, name:'Karachi National Open ’26', org:'Cue Masters Pakistan', oi:'CM', dates:'12–18 Jun 2026', venue:'Karachi Club, Karachi', state:'closed', reason:'Entries closed · draw generated' },
];
const STATE_LABEL = { open:'Entry open', pending:'Pending approval', approved:'Approved', closed:'Entry closed' };

function entryFooter(t){
  switch(t.state){
    case 'open': {
      const pct = t.cap ? Math.round(t.filled/t.cap*100) : 0;
      const cap = t.cap ? `${t.filled}/${t.cap}` : 'Open';
      return `<div class="pt-3.5 border-t border-hairline">
        <div class="flex items-center justify-between mb-1.5"><span class="seclabel text-ink-400 !text-[10px]">Capacity</span><span class="font-display font-bold text-[13px] tabular-nums">${cap}</span></div>
        <div class="h-1.5 rounded-full bg-ink-200 overflow-hidden mb-3.5"><span class="block h-full rounded-full bg-felt" style="width:${pct}%"></span></div>
        <button onclick="requestEntry(${t.id})" class="btn btn-primary w-full">Request Entry</button>
      </div>`;
    }
    case 'pending':
      return `<div class="pt-3.5 border-t border-hairline">
        <div class="flex items-center gap-2 mb-2"><span class="badge bg-warn-tint text-[#9A5B12]"><span class="dot pulse"></span>Pending approval</span><span class="text-caption text-ink-400 ml-auto">${t.reqDate}</span></div>
        <button class="btn btn-ghost w-full" disabled>Awaiting organizer</button>
        <div class="text-caption text-ink-400 mt-2 text-center">You’ll be notified when reviewed.</div>
      </div>`;
    case 'approved':
      return `<div class="pt-3.5 border-t border-hairline">
        <div class="flex items-center gap-2.5 rounded-md bg-ok-tint border border-ok/30 px-3 py-2.5">
          <span class="w-7 h-7 rounded-full bg-ok grid place-items-center text-white shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12l5 5L20 6"/></svg></span>
          <div class="leading-tight"><div class="font-display font-bold text-[#0C6B3C] text-[14px]">You’re in</div><div class="text-caption text-ink-600">Seeded <b>#${t.seed}</b> in the draw</div></div>
        </div>
        <button class="btn btn-outline w-full mt-3">View draw</button>
      </div>`;
    case 'closed':
      return `<div class="pt-3.5 border-t border-hairline">
        <button class="btn btn-ghost w-full" disabled>Entry closed</button>
        <div class="flex items-center gap-1.5 text-caption text-ink-400 mt-2 justify-center"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>${t.reason}</div>
      </div>`;
  }
}
const STATE_BADGE = {
  open:'<span class="badge bg-felt text-white">Open</span>',
  pending:'<span class="badge bg-warn-tint text-[#9A5B12]"><span class="dot pulse"></span>Pending</span>',
  approved:'<span class="badge bg-ok-tint text-[#0C6B3C]"><span class="dot"></span>Approved</span>',
  closed:'<span class="badge bg-ink-100 text-ink-500"><span class="dot"></span>Closed</span>',
};
function entryCard(t, scope){
  const stateNum = ['a','b','c','d'][t.id];
  return `<div class="card overflow-hidden flex flex-col" id="entry-card-${scope}-${t.id}">
    <div class="px-3 py-2 bg-night flex items-center justify-between">
      <span class="seclabel text-ink-300 !text-[10px]">(${stateNum}) ${STATE_LABEL[t.state]}</span>
      ${STATE_BADGE[t.state]}
    </div>
    <div class="relative h-20 bg-gradient-to-br from-felt-400 to-felt-900 felt-grain flex items-end p-3">
      <span class="font-display font-extrabold text-white text-[11px] tracking-[0.14em] uppercase">${t.name}</span>
      <div class="absolute top-3 right-3 flex gap-1.5"><span class="ball w-3 h-3" style="background:#c0392b"></span><span class="ball w-3 h-3" style="background:#f2c200"></span><span class="ball w-3 h-3" style="background:#161616"></span></div>
    </div>
    <div class="p-4 flex flex-col flex-1">
      <h3 class="font-display font-bold text-[16px] leading-tight">${t.name}</h3>
      <div class="text-caption text-ink-500 mt-1.5 space-y-0.5">
        <div>◷ ${t.dates}</div><div>⌂ ${t.venue}</div>
      </div>
      <div class="flex items-center gap-2 mt-3 mb-1">
        <span class="w-7 h-7 rounded-md bg-surface2 border border-hairline grid place-items-center font-display font-bold text-[11px] text-felt">${t.oi}</span>
        <div class="leading-tight"><div class="seclabel text-ink-400 !text-[9px]">Organized by</div><div class="text-[12px] font-semibold text-ink-800">${t.org}</div></div>
      </div>
      <div class="mt-auto pt-2" id="entry-foot-${scope}-${t.id}">${entryFooter(t)}</div>
    </div>
  </div>`;
}
function requestEntry(id){
  const t = ENTRY.find(x=>x.id===id);
  t.state='pending'; t.reqDate='Requested just now';
  ['d','m'].forEach(scope=>{
    const card=document.getElementById('entry-card-'+scope+'-'+id);
    if(card) card.outerHTML = entryCard(t, scope);
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.getElementById('dash-d').innerHTML = buildDash('d');
document.getElementById('dash-m').innerHTML = buildDash('m');
document.getElementById('edit-d').innerHTML = buildEdit('d');
document.getElementById('edit-m').innerHTML = buildEdit('m');
document.getElementById('entry-d').innerHTML = ENTRY.map(t=>entryCard(t,'d')).join('');
document.getElementById('entry-m').innerHTML = ENTRY.map(t=>entryCard(t,'m')).join('');
document.querySelectorAll('[data-tabbar]').forEach(el=>{ el.innerHTML = tabbar(); });
