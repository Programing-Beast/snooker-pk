/* ============================================================
   SnookerPK · Admin — shell, dashboard, tournament wizard
   ============================================================ */
const ICON = {
  dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  tournaments:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/>',
  entries:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',
  players:'<circle cx="9" cy="8" r="3.5"/><path d="M3 21c0-3.5 3-5.5 6-5.5s6 2 6 5.5"/><path d="M17 8a3 3 0 010 6"/>',
  rankings:'<path d="M4 19V5M10 19v-9M16 19V8M22 19H2"/>',
  results:'<path d="M9 17l3-9 3 9M6 21h12"/><circle cx="12" cy="4" r="2"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7.7 1.6 1.6 0 01-3.2 0 1.6 1.6 0 00-2.7-.7l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 004.6 15a1.6 1.6 0 01-1.4-1.6V13a1.6 1.6 0 011.6-1.6 1.6 1.6 0 001.4-2.4l-.1-.1A2 2 0 117.5 6.1l.1.1a1.6 1.6 0 002.7-.7V5.4a1.6 1.6 0 013.2 0 1.6 1.6 0 002.7.7l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8 1.6 1.6 0 001.4.9h.2a1.6 1.6 0 010 3.2h-.2a1.6 1.6 0 00-1.4.9z"/>',
};
const NAV = [
  ['dashboard','Dashboard'],['tournaments','Tournaments'],['entries','Entries'],['players','Players'],['rankings','Rankings'],['results','Results'],['settings','Settings'],
];

/* ---------- sidebar ---------- */
function sidebar(active, compact){
  const items = NAV.map(([k,label])=>{
    const badge = (k==='entries' && !compact) ? '<span class="ml-auto badge bg-live-fill text-white !text-[9px] !px-1.5">18</span>' : (k==='entries'&&compact?'<span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-live"></span>':'');
    return `<div class="navitem ${k===active?'on':''} ${compact?'!px-0 justify-center relative':''}" title="${label}">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" class="shrink-0">${ICON[k]}</svg>
      ${compact?'':`<span>${label}</span>`}${badge}</div>`;
  }).join('');
  return `<div class="flex flex-col h-full ${compact?'px-2 py-4':'px-3 py-5'}" style="min-height:inherit">
    <div class="flex items-center gap-2 ${compact?'justify-center':'px-2'} mb-6">
      <span class="font-display font-extrabold text-white uppercase tracking-tight ${compact?'text-[13px]':'text-lg'}">${compact?'PK':'Snooker<span class="text-live">PK</span>'}</span>
      ${compact?'':'<span class="badge bg-brass/20 text-brass !text-[9px] ml-1">Admin</span>'}
    </div>
    <nav class="space-y-1">${items}</nav>
    <div class="mt-auto pt-4 ${compact?'':'border-t border-white/10'}">
      <div class="flex items-center gap-2.5 ${compact?'justify-center':'px-1'}">
        <div class="w-9 h-9 rounded-full bg-felt grid place-items-center font-display font-bold text-white text-xs ring-2 ring-brass shrink-0">AK</div>
        ${compact?'':'<div class="leading-tight"><div class="text-white text-[13px] font-semibold">Adnan Karim</div><div class="text-ink-400 text-[11px]">Tournament admin</div></div>'}
      </div>
    </div>
  </div>`;
}

/* ---------- topbar ---------- */
function topbar(crumb, compact){
  const parts = crumb.split(' / ');
  return `<div class="sticky top-0 z-20 bg-canvas/95 backdrop-blur border-b border-hairline px-${compact?'5':'7'} h-15 flex items-center gap-4" style="height:60px">
    <div class="flex items-center gap-2 text-[13.5px] min-w-0">
      ${parts.map((p,i)=>`${i>0?'<span class="text-ink-300">/</span>':''}<span class="${i===parts.length-1?'font-semibold text-ink-900':'text-ink-500'} truncate">${p}</span>`).join('')}
    </div>
    <div class="ml-auto flex items-center gap-2.5">
      ${compact?'':'<div class="relative w-56"><svg class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><input class="input !py-2 pl-9 text-[13px]" placeholder="Search…"></div>'}
      <button class="w-9 h-9 rounded-md grid place-items-center text-ink-500 hover:bg-surface2 relative"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg><span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-live"></span></button>
      <button class="btn btn-primary btn-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>${compact?'New':'New tournament'}</button>
    </div>
  </div>`;
}

/* ============================================================
   01 — DASHBOARD
   ============================================================ */
const STATS = [
  { k:'Active tournaments', v:'3', sub:'2 live · 1 upcoming', ic:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/>', tone:'felt' },
  { k:'Total players', v:'1,284', sub:'▲ 36 this month', ic:'<circle cx="9" cy="8" r="3.5"/><path d="M3 21c0-3.5 3-5.5 6-5.5s6 2 6 5.5"/><path d="M17 8a3 3 0 010 6"/>', tone:'ink' },
  { k:'Pending entries', v:'18', sub:'Needs review', ic:'<path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/>', tone:'warn' },
  { k:'Live matches', v:'2', sub:'On 2 tables now', ic:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>', tone:'live' },
];
const ACTIVITY = [
  { who:'AK', act:'approved an entry', obj:'S. Khan → Lahore Masters ’26', t:'2m ago', tone:'ok' },
  { who:'BS', act:'requested entry', obj:'B. Sajjad → Faisalabad Open ’26', t:'18m ago', tone:'warn' },
  { who:'AK', act:'generated the draw', obj:'Karachi National Open ’26 · 16 players', t:'1h ago', tone:'felt' },
  { who:'RF', act:'recorded a result', obj:'M. Asif 5–2 R. Walker · QF', t:'2h ago', tone:'ink' },
  { who:'AK', act:'published', obj:'Faisalabad Open ’26', t:'Yesterday', tone:'brass' },
];
const PENDING = [
  { id:0, n:'B. Sajjad', cc:'PAK', tier:'Am', ev:'Faisalabad Open ’26', when:'18m ago' },
  { id:1, n:'H. Raza', cc:'PAK', tier:'Am', ev:'Faisalabad Open ’26', when:'1h ago' },
  { id:2, n:'R. Walker', cc:'ENG', tier:'Am', ev:'Lahore Masters ’26', when:'3h ago' },
];
function flag(cc,w=18,h=12){const b={PAK:`<i style="background:#016d31"></i><i style="background:#fff;flex:0 0 ${Math.round(w*0.3)}px"></i>`,ENG:`<i style="background:#fff"></i>`};return `<span class="fg" style="width:${w}px;height:${h}px;border-radius:3px;overflow:hidden;display:inline-flex;box-shadow:0 0 0 1px rgba(0,0,0,.12)">${b[cc]||b.PAK}</span>`;}
const STONE = { felt:'bg-felt-50 text-felt', ink:'bg-ink-100 text-ink-600', warn:'bg-warn-tint text-[#9A5B12]', live:'bg-live-tint text-live-fill', ok:'bg-ok-tint text-[#0C6B3C]', brass:'bg-brass-tint text-brass-700' };

function buildDash(){
  const stats = STATS.map(s=>`
    <div class="card p-5">
      <div class="flex items-start justify-between">
        <div class="seclabel text-ink-400">${s.k}</div>
        <span class="w-9 h-9 rounded-md grid place-items-center ${STONE[s.tone]}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">${s.ic}</svg></span>
      </div>
      <div class="font-display font-extrabold text-[38px] leading-none tabular-nums mt-3">${s.v}</div>
      <div class="text-caption ${s.tone==='warn'?'text-warn':s.tone==='ink'?'text-ok':'text-ink-500'} mt-2">${s.sub}</div>
    </div>`).join('');

  const feed = ACTIVITY.map(a=>`
    <div class="flex items-center gap-3 px-5 py-3.5 border-b border-hairline last:border-0">
      <span class="w-9 h-9 rounded-full ${STONE[a.tone]} grid place-items-center font-display font-bold text-xs shrink-0">${a.who}</span>
      <div class="min-w-0 flex-1 text-[13.5px]"><span class="text-ink-500">${a.act}</span> <span class="font-semibold text-ink-900">${a.obj}</span></div>
      <span class="text-caption text-ink-400 shrink-0">${a.t}</span>
    </div>`).join('');

  const actions = [
    ['Create tournament','M12 5v14M5 12h14','primary'],
    ['Generate draw','M3 4h18M3 4v16M9 4v16M3 12h6','outline'],
    ['Review entries','M9 11l3 3L22 4','outline'],
    ['Publish results','M9 17l3-9 3 9M6 21h12','outline'],
  ].map(([l,p,v])=>`<button class="btn btn-${v} w-full justify-start gap-2.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${p}</svg>${l}${l==='Review entries'?'<span class="ml-auto badge bg-live-fill text-white !text-[9px]">18</span>':''}</button>`).join('');

  const pendingRows = PENDING.map(p=>`
    <div id="pend-${p.id}" class="flex items-center gap-3 px-4 py-3 border-b border-hairline last:border-0">
      <span class="w-8 h-8 rounded-full bg-ink-200 grid place-items-center font-display font-bold text-ink-600 text-xs shrink-0">${p.n.split(' ').map(x=>x[0]).join('').replace(/\./g,'')}</span>
      <div class="min-w-0 flex-1"><div class="flex items-center gap-1.5"><span class="font-semibold text-[13.5px]">${p.n}</span>${flag(p.cc,15,10)}<span class="text-[9px] font-display font-bold uppercase px-1 py-0.5 rounded ${p.tier==='Pro'?'text-felt bg-felt-50':'text-ink-500 bg-ink-100'}">${p.tier}</span></div><div class="text-caption text-ink-400 truncate">${p.ev} · ${p.when}</div></div>
      <div class="flex gap-1.5 shrink-0">
        <button onclick="resolveEntry(${p.id},'ok')" class="w-8 h-8 rounded-md bg-ok-tint text-ok grid place-items-center hover:brightness-95" title="Approve"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12l5 5L20 6"/></svg></button>
        <button onclick="resolveEntry(${p.id},'no')" class="w-8 h-8 rounded-md bg-bad-tint text-bad grid place-items-center hover:brightness-95" title="Reject"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
    </div>`).join('');

  return `
    <div class="flex items-end justify-between mb-6">
      <div><h1 class="font-display font-extrabold uppercase text-[30px] leading-none">Dashboard</h1><p class="text-ink-500 text-[14px] mt-1.5">Tue 3 Jun 2026 · 2 tournaments live now</p></div>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">${stats}</div>
    <div class="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
      <div class="card overflow-hidden">
        <div class="px-5 py-3.5 border-b border-hairline flex items-center justify-between"><span class="seclabel text-felt">Recent activity</span><a class="text-[12.5px] font-semibold text-felt">View all →</a></div>
        ${feed}
      </div>
      <div class="space-y-6">
        <div><div class="seclabel text-felt mb-3">Quick actions</div><div class="grid gap-2.5">${actions}</div></div>
        <div class="card overflow-hidden">
          <div class="px-4 py-3 border-b border-hairline flex items-center justify-between"><span class="seclabel text-felt">Pending entries</span><span id="pend-count" class="badge bg-warn-tint text-[#9A5B12] !text-[9px]">18 total</span></div>
          <div id="pend-list">${pendingRows}</div>
          <div class="px-4 py-3 bg-surface2 text-center"><a class="text-[12.5px] font-semibold text-felt">Open entry queue →</a></div>
        </div>
      </div>
    </div>`;
}
let pendLeft = 18;
function resolveEntry(id, verdict){
  const row=document.getElementById('pend-'+id); if(!row) return;
  row.style.transition='opacity .25s, transform .25s'; row.style.opacity='0'; row.style.transform='translateX(12px)';
  setTimeout(()=>{
    row.outerHTML = `<div class="flex items-center gap-2.5 px-4 py-3 border-b border-hairline last:border-0 text-[13px] ${verdict==='ok'?'text-ok':'text-bad'}"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">${verdict==='ok'?'<path d="M5 12l5 5L20 6"/>':'<path d="M6 6l12 12M18 6L6 18"/>'}</svg><span class="font-semibold">Entry ${verdict==='ok'?'approved':'rejected'}</span></div>`;
    pendLeft--; const c=document.getElementById('pend-count'); if(c) c.textContent = pendLeft+' total';
  },250);
}

/* ============================================================
   02 — CREATE / EDIT TOURNAMENT WIZARD
   ============================================================ */
const STEPS = ['Basics','Rounds','Prizes','Contacts'];
function defaults(){
  return {
    step:1,
    name:'Karachi Autumn Classic', type:'Knockout · single elimination',
    venue:'Karachi Club', city:'Karachi', country:'Pakistan',
    start:'2026-09-12T10:00', end:'2026-09-16T19:00',
    org:'Cue Masters Pakistan', presentedBy:'Sui Southern Sports',
    rounds:[{name:'Round 1',bo:7},{name:'Quarter-finals',bo:9},{name:'Semi-finals',bo:11},{name:'Final',bo:11}],
    prizes:[{pos:'Winner',amt:200000},{pos:'Runner-up',amt:100000},{pos:'Semi-finalists',amt:50000},{pos:'Quarter-finalists',amt:20000}],
    contacts:[{role:'Tournament office',detail:'events@cuemasters.pk'},{role:'Referee desk',detail:'+92 21 555 0142'}],
    errors:{},
  };
}
const W = { d: defaults(), t: Object.assign(defaults(), { step:1, venue:'', errors:{ venue:true } }) };

function fmtDate(s){ if(!s) return '—'; const d=new Date(s); return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}); }
function prizeTotal(scope){ return W[scope].prizes.reduce((a,p)=>a+(+p.amt||0),0); }
function framesToWin(bo){ return Math.ceil(bo/2); }

/* ---- stepper ---- */
function stepper(scope){
  const s=W[scope].step;
  return `<div class="flex items-center gap-1 mb-6 overflow-x-auto">
    ${STEPS.map((label,i)=>{
      const n=i+1, done=s>n||s>4, cur=s===n;
      return `<div class="flex items-center gap-1 shrink-0">
        <button onclick="gotoStep('${scope}',${n})" class="flex items-center gap-2 px-3 py-2 rounded-md ${cur?'bg-felt text-white':done?'text-felt':'text-ink-400'} transition">
          <span class="w-6 h-6 rounded-full grid place-items-center font-display font-bold text-[12px] ${cur?'bg-white/20':done?'bg-felt-50':'bg-ink-100'}">${done&&!cur?'✓':n}</span>
          <span class="font-display font-semibold text-[13px] hidden sm:block">${label}</span>
        </button>
        ${n<4?`<span class="w-5 h-px bg-ink-300 shrink-0"></span>`:''}
      </div>`;
    }).join('')}
  </div>`;
}

/* ---- field helper ---- */
function field(scope, key, label, opts={}){
  const v=W[scope][key]||''; const err=W[scope].errors[key];
  const type=opts.type||'text';
  const input = opts.select
    ? `<div class="relative"><select onchange="setField('${scope}','${key}',this.value)" class="input appearance-none pr-9 ${err?'input-err':''}">${opts.select.map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select><svg class="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 1l5 5 5-5"/></svg></div>`
    : `<input type="${type}" value="${v}" oninput="setField('${scope}','${key}',this.value)" class="input ${err?'input-err':''}" placeholder="${opts.ph||''}">`;
  return `<div><label class="lbl">${label}${opts.req?' <span class="text-bad">*</span>':''}</label>${input}${err?`<p class="text-caption text-bad mt-1.5">${label} is required.</p>`:''}</div>`;
}

/* ---- step bodies ---- */
function stepBody(scope){
  const st=W[scope].step, w=W[scope];
  if(st===1){
    return `<div class="space-y-4">
      ${field(scope,'name','Tournament name',{req:1,ph:'e.g. Karachi Autumn Classic'})}
      <div class="grid sm:grid-cols-2 gap-4">
        ${field(scope,'type','Format',{select:['Knockout · single elimination','Round robin','Knockout + qualifiers']})}
        ${field(scope,'venue','Venue',{req:1})}
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        ${field(scope,'city','City',{req:1})}
        ${field(scope,'country','Country',{select:['Pakistan','England','China','India']})}
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        ${field(scope,'start','Start date & time',{type:'datetime-local',req:1})}
        ${field(scope,'end','End date & time',{type:'datetime-local',req:1})}
      </div>
      <div><label class="lbl">Cover photo</label>
        <label class="flex items-center gap-3 border border-dashed border-ink-300 rounded-md px-4 py-3.5 cursor-pointer hover:border-felt hover:bg-felt-50/50 transition">
          <span class="w-10 h-10 rounded-md bg-gradient-to-br from-felt-400 to-felt-900 felt-grain grid place-items-center text-white shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/></svg></span>
          <span><span class="block text-[13.5px] font-semibold text-ink-800">Upload cover image</span><span class="block text-caption text-ink-400">1600×600 recommended · JPG/PNG</span></span>
          <input type="file" class="hidden">
        </label>
      </div>
      <div class="grid sm:grid-cols-2 gap-4 pt-2 border-t border-hairline">
        ${field(scope,'org','Organized by',{req:1,ph:'Organizer name'})}
        ${field(scope,'presentedBy','Presented by (optional)',{ph:'Sponsor / presenter'})}
      </div>
    </div>`;
  }
  if(st===2){
    const rows=w.rounds.map((r,i)=>`
      <div class="flex items-center gap-3 px-4 py-3 border-b border-hairline last:border-0">
        <span class="w-6 text-center font-display font-bold text-ink-400">${i+1}</span>
        <input value="${r.name}" oninput="setRow('${scope}','rounds',${i},'name',this.value)" class="input !py-2 flex-1">
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-caption text-ink-400">Best of</span>
          <select onchange="setRow('${scope}','rounds',${i},'bo',+this.value)" class="input !py-2 !w-20 appearance-none text-center">${[5,7,9,11,13,17,19,35].map(n=>`<option ${n===r.bo?'selected':''}>${n}</option>`).join('')}</select>
          <span class="text-caption text-ink-500 w-24">→ first to <b class="text-ink-800">${framesToWin(r.bo)}</b></span>
        </div>
        <button onclick="delRow('${scope}','rounds',${i})" class="w-8 h-8 rounded-md text-ink-400 hover:bg-bad-tint hover:text-bad grid place-items-center shrink-0"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>`).join('');
    return `<div>
      <p class="text-[13.5px] text-ink-500 mb-4">Add each round from first to final. “Best of N” sets frames-to-win automatically.</p>
      <div class="card overflow-hidden mb-3">
        <div class="px-4 py-2.5 bg-surface2 seclabel text-ink-500 !text-[10px] flex"><span class="w-6"></span><span class="flex-1">Round name</span><span>Format</span></div>
        ${rows}
      </div>
      <button onclick="addRow('${scope}','rounds')" class="btn btn-ghost btn-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>Add round</button>
    </div>`;
  }
  if(st===3){
    const rows=w.prizes.map((p,i)=>`
      <div class="flex items-center gap-3 px-4 py-3 border-b border-hairline last:border-0">
        <input value="${p.pos}" oninput="setRow('${scope}','prizes',${i},'pos',this.value)" class="input !py-2 flex-1" placeholder="Position">
        <div class="flex items-center gap-1.5 shrink-0"><span class="text-caption text-ink-400 font-display font-semibold">PKR</span>
          <input value="${p.amt}" oninput="setRow('${scope}','prizes',${i},'amt',this.value.replace(/[^0-9]/g,''))" class="input !py-2 !w-32 text-right tabular-nums" inputmode="numeric"></div>
        <button onclick="delRow('${scope}','prizes',${i})" class="w-8 h-8 rounded-md text-ink-400 hover:bg-bad-tint hover:text-bad grid place-items-center shrink-0"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>`).join('');
    return `<div>
      <p class="text-[13.5px] text-ink-500 mb-4">Add a payout row per finishing position. The total updates live.</p>
      <div class="card overflow-hidden mb-3">${rows}
        <div class="flex items-center justify-between px-4 py-3 bg-night text-white"><span class="seclabel text-ink-300">Total prize pool</span><span data-ptotal class="font-display font-extrabold text-brass text-lg tabular-nums">PKR ${prizeTotal(scope).toLocaleString()}</span></div>
      </div>
      <button onclick="addRow('${scope}','prizes')" class="btn btn-ghost btn-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>Add prize</button>
    </div>`;
  }
  if(st===4){
    const rows=w.contacts.map((c,i)=>`
      <div class="flex items-center gap-3 px-4 py-3 border-b border-hairline last:border-0">
        <input value="${c.role}" oninput="setRow('${scope}','contacts',${i},'role',this.value)" class="input !py-2 w-44 shrink-0" placeholder="Role">
        <input value="${c.detail}" oninput="setRow('${scope}','contacts',${i},'detail',this.value)" class="input !py-2 flex-1" placeholder="Email or phone">
        <button onclick="delRow('${scope}','contacts',${i})" class="w-8 h-8 rounded-md text-ink-400 hover:bg-bad-tint hover:text-bad grid place-items-center shrink-0"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>`).join('');
    return `<div>
      <p class="text-[13.5px] text-ink-500 mb-4">Public contacts shown on the tournament’s Info tab.</p>
      <div class="card overflow-hidden mb-3">${rows}</div>
      <button onclick="addRow('${scope}','contacts')" class="btn btn-ghost btn-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>Add contact</button>
    </div>`;
  }
  if(st===5){ // review
    return `<div class="space-y-4">
      <div class="flex items-center gap-2 text-ok bg-ok-tint border border-ok/30 rounded-md px-4 py-3 text-[13.5px]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l5 5L20 6"/></svg><b>All steps complete.</b> Review before publishing.</div>
      ${reviewBlock('Basics',1,scope,`<div class="grid grid-cols-2 gap-y-1.5 text-[13.5px]"><span class="text-ink-500">Name</span><span class="font-semibold">${w.name}</span><span class="text-ink-500">Format</span><span>${w.type}</span><span class="text-ink-500">Venue</span><span>${w.venue}, ${w.city} · ${w.country}</span><span class="text-ink-500">Dates</span><span>${fmtDate(w.start)} – ${fmtDate(w.end)} 2026</span><span class="text-ink-500">Organized by</span><span>${w.org}</span><span class="text-ink-500">Presented by</span><span>${w.presentedBy||'—'}</span></div>`)}
      ${reviewBlock('Rounds',2,scope,`<div class="space-y-1.5 text-[13.5px]">${w.rounds.map(r=>`<div class="flex justify-between"><span>${r.name}</span><span class="text-ink-500">Best of ${r.bo} · first to ${framesToWin(r.bo)}</span></div>`).join('')}</div>`)}
      ${reviewBlock('Prizes',3,scope,`<div class="space-y-1.5 text-[13.5px]">${w.prizes.map(p=>`<div class="flex justify-between"><span>${p.pos}</span><span class="font-display font-semibold tabular-nums">PKR ${(+p.amt).toLocaleString()}</span></div>`).join('')}<div class="flex justify-between pt-2 border-t border-hairline font-bold"><span>Total</span><span class="text-felt tabular-nums">PKR ${prizeTotal(scope).toLocaleString()}</span></div></div>`)}
      ${reviewBlock('Contacts',4,scope,`<div class="space-y-1.5 text-[13.5px]">${w.contacts.map(c=>`<div class="flex justify-between"><span>${c.role}</span><span class="text-ink-500">${c.detail}</span></div>`).join('')}</div>`)}
    </div>`;
  }
  if(st===6){ // published
    return `<div class="text-center py-12">
      <div class="w-16 h-16 rounded-full bg-ok-tint grid place-items-center mx-auto mb-4 text-ok pop"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l5 5L20 6"/></svg></div>
      <h2 class="font-display font-extrabold uppercase text-2xl">Tournament published</h2>
      <p class="text-ink-500 text-[14px] mt-2 max-w-sm mx-auto"><b>${w.name}</b> is now live on SnookerPK. Entries are open — players can request a place.</p>
      <div class="flex gap-3 justify-center mt-6"><button class="btn btn-primary">View tournament</button><button onclick="resetWizard('${scope}')" class="btn btn-ghost">Create another</button></div>
    </div>`;
  }
}
function reviewBlock(title,step,scope,body){
  return `<div class="card p-5"><div class="flex items-center justify-between mb-3"><div class="seclabel text-felt">${title}</div><button onclick="gotoStep('${scope}',${step})" class="text-[12.5px] font-semibold text-felt">Edit</button></div>${body}</div>`;
}

/* ---- live summary panel ---- */
function summaryPanel(scope){
  const w=W[scope];
  return `<div class="card overflow-hidden sticky top-[76px]">
    <div class="relative h-24 bg-gradient-to-br from-felt-400 to-felt-900 felt-grain flex items-end p-4">
      <div class="absolute top-3 right-3 flex gap-1.5"><span class="ball w-3 h-3" style="background:#c0392b"></span><span class="ball w-3 h-3" style="background:#f2c200"></span><span class="ball w-3 h-3" style="background:#161616"></span></div>
      <span class="font-display font-extrabold text-white text-[12px] tracking-[0.12em] uppercase">${w.name||'Untitled tournament'}</span>
    </div>
    <div class="p-4">
      <div class="seclabel text-ink-400 !text-[9px] mb-1">Live preview</div>
      <h3 class="font-display font-bold text-[17px] leading-tight">${w.name||'Untitled tournament'}</h3>
      <div class="text-caption text-ink-500 mt-1.5 space-y-0.5">
        <div>◷ ${fmtDate(w.start)} – ${fmtDate(w.end)} 2026</div>
        <div>⌂ ${w.venue||'—'}${w.city?', '+w.city:''} · ${w.country}</div>
      </div>
      <div class="grid grid-cols-2 gap-2 mt-3">
        <div class="rounded-md bg-surface2 px-3 py-2"><div class="seclabel text-ink-400 !text-[9px]">Rounds</div><div class="font-display font-bold tabular-nums">${w.rounds.length}</div></div>
        <div class="rounded-md bg-surface2 px-3 py-2"><div class="seclabel text-ink-400 !text-[9px]">Prize pool</div><div class="font-display font-bold tabular-nums text-felt">${prizeTotal(scope).toLocaleString()}</div></div>
      </div>
      <div class="flex items-center gap-2.5 pt-3 mt-3 border-t border-hairline">
        <span class="w-7 h-7 rounded-md bg-surface2 border border-hairline grid place-items-center font-display font-bold text-[11px] text-felt">${(w.org||'?').split(' ').map(x=>x[0]).slice(0,2).join('')}</span>
        <div class="leading-tight min-w-0"><div class="seclabel text-ink-400 !text-[9px]">Organized by</div><div class="text-[12px] font-semibold text-ink-800 truncate">${w.org||'—'}</div>${w.presentedBy?`<div class="text-[10px] text-ink-400 truncate">Presented by ${w.presentedBy}</div>`:''}</div>
      </div>
    </div>
  </div>`;
}

/* ---- wizard frame ---- */
function renderWizard(scope){
  const st=W[scope].step, compact = scope==='t';
  const showSummary = st<=5;
  const navBtns = st===6 ? '' : `<div class="flex items-center gap-3 mt-6 pt-5 border-t border-hairline">
      ${st>1?`<button onclick="prevStep('${scope}')" class="btn btn-ghost">Back</button>`:''}
      <div class="ml-auto flex items-center gap-3">
        ${st<=4?`<span class="text-caption text-ink-400">Step ${st} of 4</span>`:''}
        ${st<4?`<button onclick="nextStep('${scope}')" class="btn btn-primary">Continue</button>`:''}
        ${st===4?`<button onclick="nextStep('${scope}')" class="btn btn-primary">Review</button>`:''}
        ${st===5?`<button onclick="publish('${scope}')" class="btn btn-brass">Publish tournament</button>`:''}
      </div>
    </div>`;
  const head = st===6?'' : `<div class="flex items-end justify-between mb-5">
      <div><h1 class="font-display font-extrabold uppercase text-[26px] leading-none">${st===5?'Review & publish':'Create tournament'}</h1>${st<=4?`<p class="text-ink-500 text-[13px] mt-1.5">${['Basic details','Round configuration','Prize breakdown','Tournament contacts'][st-1]}</p>`:''}</div>
    </div>`;

  const body = `<div>${head}${st<=4?stepper(scope):''}<div class="${st===6?'':'card p-6'}">${stepBody(scope)}</div>${navBtns}</div>`;

  if(!showSummary){ return body; }
  return `<div class="grid ${compact?'grid-cols-1':'lg:grid-cols-[1fr_320px]'} gap-6 items-start">
    ${body}
    <div class="${compact?'order-first':''}">${summaryPanel(scope)}</div>
  </div>`;
}

/* ---- wizard interactions ---- */
function refreshSummary(scope){
  // light update: re-render only summary to avoid losing input focus
  const host=document.getElementById('wizard-'+scope);
  const sumWrap = host.querySelector('[data-sumwrap]');
  if(sumWrap) sumWrap.innerHTML = summaryPanel(scope);
}
function setField(scope,key,val){
  W[scope][key]=val; if(W[scope].errors[key] && val.trim()){ W[scope].errors[key]=false; }
  // update summary in place
  const host=document.getElementById('wizard-'+scope);
  const sum=host.querySelector('[data-sum]'); if(sum) sum.outerHTML = `<div data-sum>${summaryPanel(scope)}</div>`;
}
function syncSummary(scope){
  const host=document.getElementById('wizard-'+scope); const sum=host&&host.querySelector('[data-sum]');
  if(sum) sum.outerHTML=`<div data-sum>${summaryPanel(scope)}</div>`;
}
function setRow(scope,coll,i,key,val){
  W[scope][coll][i][key]=val;
  // text fields that don't change layout: update state (+ summary) only, keep focus
  if(coll==='rounds' && key==='bo'){ rerender(scope); return; }     // select → safe to re-render (frames-to-win)
  if(coll==='prizes' && key==='amt'){                               // live total + summary, keep input focus
    const tot=document.querySelector('#wizard-'+scope+' [data-ptotal]'); if(tot) tot.textContent='PKR '+prizeTotal(scope).toLocaleString();
    syncSummary(scope); return;
  }
  if(coll==='rounds' && key==='name'){ syncSummary(scope); return; } // summary count unaffected, just store
  // prizes 'pos', contacts fields → store only
}
function addRow(scope,coll){
  const blank = coll==='rounds'?{name:'New round',bo:7}:coll==='prizes'?{pos:'',amt:0}:{role:'',detail:''};
  W[scope][coll].push(blank); rerender(scope);
}
function delRow(scope,coll,i){ W[scope][coll].splice(i,1); rerender(scope); }
function validateStep(scope){
  const w=W[scope]; if(w.step!==1) return true;
  const req=['name','venue','city','start','end']; let ok=true; w.errors={};
  req.forEach(k=>{ if(!(''+ (w[k]||'')).trim()){ w.errors[k]=true; ok=false; } });
  return ok;
}
function nextStep(scope){ if(!validateStep(scope)){ rerender(scope); return; } if(W[scope].step<5) W[scope].step++; rerender(scope); }
function prevStep(scope){ if(W[scope].step>1) W[scope].step--; rerender(scope); }
function gotoStep(scope,n){ if(n>W[scope].step && !validateStep(scope)){ rerender(scope); return;} W[scope].step=n; rerender(scope); }
function publish(scope){ W[scope].step=6; rerender(scope); }
function resetWizard(scope){ W[scope]=defaults(); rerender(scope); }
function rerender(scope){
  const host=document.getElementById('wizard-'+scope);
  // wrap summary so setField can target it
  host.innerHTML = renderWizard(scope).replace(summaryPanel(scope), `<div data-sum>${summaryPanel(scope)}</div>`);
  // mark prize total cell for live updates
}

/* ============================================================
   INIT
   ============================================================ */
document.querySelectorAll('[data-sidebar]').forEach(el=>{
  el.innerHTML = sidebar(el.getAttribute('data-sidebar'), el.hasAttribute('data-compact'));
});
document.querySelectorAll('[data-topbar]').forEach(el=>{
  el.outerHTML = topbar(el.getAttribute('data-topbar'), el.hasAttribute('data-compact'));
});
document.getElementById('dash').innerHTML = buildDash();
rerender('d');
rerender('t');
