/* ============================================================
   SnookerPK · Profile / Rankings / Store — render
   ============================================================ */

/* shared bottom tab bar */
function tabbar(active){
  const items=[['Home','M3 11l9-8 9 8M5 10v10h14V10'],['Draws','rect'],['Create','plus'],['Ranks','M4 19V5M10 19v-9M16 19V8M22 19H2'],['Profile','user']];
  return items.map(([label],i)=>{
    const on = (active==='ranks'&&label==='Ranks')||(active==='profile'&&label==='Profile');
    const center = label==='Create';
    const svg = {
      Home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
      Draws:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/>',
      Create:'<path d="M12 5v14M5 12h14"/>',
      Ranks:'<path d="M4 19V5M10 19v-9M16 19V8M22 19H2"/>',
      Profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    }[label];
    if(center) return `<a class="flex flex-col items-center gap-0.5 py-1 text-ink-400"><span class="-mt-4 w-11 h-11 rounded-full bg-felt grid place-items-center shadow-e3 ring-4 ring-white text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">${svg}</svg></span><span class="text-[9.5px] font-semibold font-display">Create</span></a>`;
    return `<a class="flex flex-col items-center gap-0.5 py-2 ${on?'text-felt':'text-ink-400'}"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${svg}</svg><span class="text-[9.5px] font-semibold font-display">${label}</span></a>`;
  }).join('');
}

/* form pills */
function formPills(form){
  return `<div class="flex gap-1">${form.map(f=>`<span class="w-5 h-5 rounded-[5px] grid place-items-center text-[10px] font-display font-bold ${f==='W'?'bg-ok-tint text-[#0C6B3C]':'bg-bad-tint text-[#9A2820]'}">${f}</span>`).join('')}</div>`;
}

/* result chip for history */
const RESCHIP = {
  win:'bg-felt text-white', ru:'bg-brass-tint text-brass-700', sf:'bg-ink-100 text-ink-600',
  live:'bg-live-fill text-white', done:'bg-ink-100 text-ink-500',
};

/* ============================================================
   SCREEN 1 — PLAYER PROFILE
   ============================================================ */
function buildProfile(scope){
  const m = scope==='m', P = PROFILE;
  const statCards = P.stats.map(s=>`
    <div class="card ${m?'p-3.5':'p-5'}">
      <div class="seclabel text-ink-400 ${m?'!text-[9px]':''}">${s.k}</div>
      <div class="font-display font-extrabold ${m?'text-2xl':'text-[34px]'} leading-none tabular-nums mt-1.5 ${s.k==='Highest break'?'text-felt':''}">${s.v}</div>
    </div>`).join('');

  const historyRows = P.history.map(h=>`
    <div class="flex items-center gap-3 ${m?'px-4':'px-5'} py-3 border-b border-hairline last:border-0">
      <div class="min-w-0 flex-1"><div class="font-semibold text-[14px] truncate">${h.ev}</div><div class="text-caption text-ink-400">${h.date}</div></div>
      <span class="badge ${RESCHIP[h.state]} ${m?'!text-[9px]':''}">${h.state==='live'?'<span class="dot pulse"></span>':''}${h.res}</span>
    </div>`).join('');

  const upcomingRows = P.upcoming.map(u=>`
    <div class="card ${m?'p-3.5':'p-4'} flex items-center gap-3">
      <div class="${m?'w-10 h-10':'w-12 h-12'} rounded-md bg-gradient-to-br from-felt-400 to-felt-900 felt-grain shrink-0 grid place-items-center"><span class="ball w-4 h-4" style="background:#e86a92"></span></div>
      <div class="min-w-0 flex-1"><div class="font-semibold text-[14px] truncate">${u.ev}</div><div class="text-caption text-ink-400 truncate">${u.venue}</div></div>
      <div class="text-right shrink-0"><div class="text-caption text-ink-500">${u.date}</div><button class="text-[12px] font-semibold text-felt">Details →</button></div>
    </div>`).join('');

  const h2hRows = P.h2h.map(o=>{
    const total=o.w+o.l, pct=Math.round(o.w/total*100), lead=o.w>o.l;
    return `<div class="${m?'px-4':'px-5'} py-3 border-b border-hairline last:border-0">
      <div class="flex items-center gap-2.5 mb-2">
        ${flag(o.cc,18,12)}<span class="font-semibold text-[14px]">${o.n}</span>
        <span class="ml-auto font-display font-bold tabular-nums ${lead?'text-felt':'text-ink-500'}">${o.w}<span class="text-ink-300">–</span>${o.l}</span>
      </div>
      <div class="h-2 rounded-full bg-bad-tint overflow-hidden flex"><span class="h-full bg-felt" style="width:${pct}%"></span></div>
    </div>`;
  }).join('');

  /* felt header */
  const header = `
  <header class="relative overflow-hidden bg-night felt-grain on-felt">
    <div class="absolute inset-0" style="background:radial-gradient(640px 320px at 16% -20%,rgba(11,110,67,.6),transparent 60%)"></div>
    <div class="relative ${m?'px-4 pt-5 pb-5':'px-7 pt-8 pb-7'} flex ${m?'flex-col':'items-end'} gap-${m?'4':'6'}">
      <div class="flex items-end gap-4">
        <div class="${m?'w-20 h-20':'w-28 h-28'} rounded-xl bg-cover bg-center ring-2 ring-brass shrink-0 shadow-e3" style="background-image:url('${P.photo}')"></div>
        <div class="${m?'pb-0':'pb-1'}">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="badge bg-felt text-white ${m?'!text-[9px]':''}">${P.tier}</span>
            <span class="badge bg-brass-tint text-brass-700 ${m?'!text-[9px]':''}">Rank #${P.rank}</span>
          </div>
          <h1 class="font-display font-extrabold uppercase text-white leading-none tracking-tight ${m?'text-[24px]':'text-[38px]'}">${P.n}</h1>
          <div class="flex items-center gap-2 mt-2 text-ink-300 text-[13px]">${flag(P.cc,20,13)}<span>${P.city}, ${P.cc}</span><span class="text-ink-500">·</span><span>Pro since ${P.turnedPro}</span></div>
        </div>
      </div>
      ${m?'':'<div class="ml-auto flex gap-2.5"><button class="btn btn-onfelt">Follow</button><button class="btn btn-brass">Head-to-head</button></div>'}
    </div>
  </header>`;

  /* body */
  if(m){
    return header + `
    <div class="px-4 py-4 space-y-5">
      <p class="text-[13.5px] text-ink-600 leading-relaxed">${P.bio}</p>
      <div class="grid grid-cols-2 gap-3">${statCards}</div>
      <div><div class="seclabel text-felt mb-2.5">Tournament history</div><div class="card overflow-hidden">${historyRows}</div></div>
      <div><div class="seclabel text-felt mb-2.5">Upcoming events</div><div class="space-y-2.5">${upcomingRows}</div></div>
      <div><div class="seclabel text-felt mb-2.5">Head-to-head</div><div class="card overflow-hidden">${h2hRows}</div></div>
    </div>`;
  }
  return header + `
  <div class="px-7 py-7 grid grid-cols-[1.5fr_1fr] gap-7 items-start">
    <div class="space-y-6">
      <div class="card p-6"><div class="seclabel text-felt mb-2">Biography</div><p class="text-[15px] text-ink-700 leading-relaxed">${P.bio}</p></div>
      <div class="grid grid-cols-4 gap-4">${statCards}</div>
      <div>
        <div class="flex items-center justify-between mb-3"><div class="seclabel text-felt">Tournament history</div><a class="text-[13px] font-semibold text-felt">Full record →</a></div>
        <div class="card overflow-hidden">
          <div class="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-2.5 bg-surface2 seclabel text-ink-500 !text-[10px]"><span>Event</span><span class="text-right w-28">Result reached</span><span class="text-right w-20">Date</span></div>
          ${P.history.map(h=>`<div class="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-3 border-b border-hairline last:border-0">
            <span class="font-semibold text-[14px]">${h.ev}</span>
            <span class="w-28 text-right"><span class="badge ${RESCHIP[h.state]}">${h.state==='live'?'<span class="dot pulse"></span>':''}${h.res}</span></span>
            <span class="w-20 text-right text-caption text-ink-500">${h.date}</span></div>`).join('')}
        </div>
      </div>
    </div>
    <div class="space-y-6">
      <div><div class="seclabel text-felt mb-3">Upcoming events</div><div class="space-y-3">${upcomingRows}</div></div>
      <div><div class="seclabel text-felt mb-3">Head-to-head</div><div class="card overflow-hidden">${h2hRows}</div></div>
    </div>
  </div>`;
}

/* ============================================================
   SCREEN 2 — RANKINGS (sortable)
   ============================================================ */
let sortKey='rank', sortDir=1;
function sortData(){
  const d=[...RANKING].sort((a,b)=>{
    let va=a[sortKey], vb=b[sortKey];
    if(sortKey==='n'){ return va.localeCompare(vb)*sortDir; }
    if(sortKey==='form'){ va=a.form.filter(f=>f==='W').length; vb=b.form.filter(f=>f==='W').length; }
    return (va-vb)*sortDir;
  });
  return d;
}
function arrow(key){ return sortKey===key?`<span class="text-felt">${sortDir>0?'▲':'▼'}</span>`:'<span class="text-ink-300">↕</span>'; }

function podium(top3){
  const order=[1,0,2]; // 2nd, 1st, 3rd
  return `<div class="grid grid-cols-3 gap-3 items-end mb-5">${order.map(i=>{
    const p=top3[i], place=i+1, tall=place===1;
    const ring=place===1?'ring-brass':place===2?'ring-ink-300':'ring-[#b08d57]';
    return `<div class="text-center">
      <div class="${tall?'w-16 h-16':'w-12 h-12'} mx-auto rounded-full ${p.tier==='Pro'?'bg-felt':'bg-ink-300'} grid place-items-center font-display font-bold text-white ${tall?'text-lg':'text-sm'} ring-2 ${ring} mb-2">${initials(p.n)}</div>
      <div class="font-display font-bold ${tall?'text-[15px]':'text-[13px]'} flex items-center gap-1 justify-center">${flag(p.cc,16,10)}${p.n}</div>
      <div class="font-display font-extrabold text-felt tabular-nums ${tall?'text-xl':'text-base'}">${p.pts.toLocaleString()}</div>
      <div class="mt-2 rounded-t-md bg-gradient-to-b ${place===1?'from-brass to-brass-700 h-16':place===2?'from-ink-200 to-ink-300 h-11':'from-[#cda06b] to-[#b08d57] h-8'} grid place-items-start justify-center pt-1.5"><span class="font-display font-extrabold ${place===1?'text-white text-2xl':'text-white/90 text-lg'}">${place}</span></div>
    </div>`;
  }).join('')}</div>`;
}

function buildRanks(scope){
  const m=scope==='m';
  const controls = `
    <div class="flex flex-wrap items-center gap-2.5 ${m?'':'mb-1'}">
      <select class="input ${m?'!text-[13px]':''} w-auto"><option>2025–26 Season</option><option>2024–25 Season</option><option>All-time</option></select>
      <select class="input ${m?'!text-[13px]':''} w-auto"><option>All players</option><option>Pro only</option><option>Amateur only</option></select>
      ${m?'':'<div class="relative ml-auto w-64"><svg class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><input class="input pl-9" placeholder="Search players…"></div>'}
    </div>`;

  if(m){
    const data=sortData();
    const top3=RANKING.slice(0,3);
    const rows=data.map(p=>{
      const top=p.rank<=3;
      return `<div class="flex items-center gap-3 px-4 py-3 border-b border-hairline last:border-0 ${top?'bg-brass-tint/30':''}">
        <span class="font-display font-extrabold tabular-nums w-6 text-center ${p.rank===1?'text-brass-700':'text-ink-400'}">${p.rank}</span>
        <span class="w-9 h-9 rounded-full ${p.tier==='Pro'?'bg-felt text-white':'bg-ink-200 text-ink-600'} grid place-items-center font-display font-bold text-xs ${p.rank===1?'ring-2 ring-brass':''}">${initials(p.n)}</span>
        <div class="min-w-0 flex-1"><div class="flex items-center gap-1.5"><span class="font-bold text-[14px] truncate">${p.n}</span><span class="tier ${p.tier==='Pro'?'tier-pro':'tier-am'}">${p.tier}</span></div>
          <div class="flex items-center gap-1.5 text-caption text-ink-400">${flag(p.cc,14,9)}${p.cc} · ${p.played} played</div></div>
        <div class="text-right"><div class="font-display font-bold tabular-nums text-[15px]">${p.pts.toLocaleString()}</div><div class="text-[10px] text-ink-400">pts</div></div>
      </div>`;
    }).join('');
    return `<div class="px-4 py-4 space-y-4">
      <div class="seclabel text-felt">National rankings · 2025–26</div>
      ${controls}
      <div class="card p-4">${podium(top3)}</div>
      <div class="card overflow-hidden"><div class="px-4 py-2.5 bg-surface2 flex items-center justify-between"><span class="seclabel text-ink-500 !text-[10px]">Full table</span><span class="text-caption text-ink-400">${data.length} players</span></div>${rows}</div>
    </div>`;
  }

  /* desktop sortable table */
  return `<div class="px-7 py-7">
    <div class="flex items-end justify-between mb-5"><div><div class="seclabel text-felt mb-1.5">Leaderboard</div><h1 class="font-display font-extrabold uppercase text-[34px] leading-none">National Rankings</h1><p class="text-ink-500 text-[14px] mt-2">Official SnookerPK ranking · 2025–26 season</p></div></div>
    <div class="mb-5">${controls}</div>
    <div class="card overflow-hidden">
      <table class="w-full text-[14px]">
        <thead><tr class="bg-surface2 text-left">
          <th class="px-5 py-3 sortable seclabel text-ink-500 !text-[10px] w-16" onclick="setSort('rank')">Rank ${arrow('rank')}</th>
          <th class="px-5 py-3 sortable seclabel text-ink-500 !text-[10px]" onclick="setSort('n')">Player ${arrow('n')}</th>
          <th class="px-5 py-3 sortable seclabel text-ink-500 !text-[10px] text-right" onclick="setSort('played')">Played ${arrow('played')}</th>
          <th class="px-5 py-3 sortable seclabel text-ink-500 !text-[10px] text-right" onclick="setSort('pts')">Points ${arrow('pts')}</th>
          <th class="px-5 py-3 sortable seclabel text-ink-500 !text-[10px] text-right w-40" onclick="setSort('form')">Recent form ${arrow('form')}</th>
        </tr></thead>
        <tbody id="ranks-tbody"></tbody>
      </table>
    </div>
  </div>`;
}
function renderRanksBody(){
  const tb=document.getElementById('ranks-tbody'); if(!tb) return;
  tb.innerHTML = sortData().map(p=>{
    const top = sortKey==='rank' && sortDir>0 && p.rank<=3;
    return `<tr class="border-b border-hairline last:border-0 hover:bg-surface2 ${top?'bg-brass-tint/30':''}">
      <td class="px-5 py-3"><span class="font-display font-extrabold tabular-nums ${p.rank===1?'text-brass-700':p.rank<=3?'text-felt':'text-ink-500'}">${p.rank}</span></td>
      <td class="px-5 py-3"><div class="flex items-center gap-2.5">
        <span class="w-8 h-8 rounded-full ${p.tier==='Pro'?'bg-felt text-white':'bg-ink-200 text-ink-600'} grid place-items-center font-display font-bold text-xs ${p.rank===1?'ring-1 ring-brass':''}">${initials(p.n)}</span>
        ${flag(p.cc,18,12)}<span class="font-bold">${p.n}</span><span class="tier ${p.tier==='Pro'?'tier-pro':'tier-am'}">${p.tier}</span></div></td>
      <td class="px-5 py-3 text-right tabular-nums text-ink-600">${p.played}</td>
      <td class="px-5 py-3 text-right"><span class="font-display font-bold tabular-nums text-[15px]">${p.pts.toLocaleString()}</span></td>
      <td class="px-5 py-3"><div class="flex justify-end">${formPills(p.form)}</div></td>
    </tr>`;
  }).join('');
}
function setSort(key){
  if(sortKey===key){ sortDir*=-1; } else { sortKey=key; sortDir = key==='rank'?1:-1; }
  // re-render header arrows + body
  document.getElementById('ranks-d').innerHTML = buildRanks('d');
  renderRanksBody();
}

/* ============================================================
   SCREEN 3 — STORE (coming soon)
   ============================================================ */
const PIC = {
  cue:'<path d="M3 21L21 3M6 5l13 13"/>', chalk:'<rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 9h6v6"/>',
  case:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 8h16M9 3v5"/>', balls:'<circle cx="8" cy="12" r="4"/><circle cx="16" cy="9" r="3"/><circle cx="16" cy="16" r="2.5"/>',
  ext:'<path d="M3 12h18M17 8l4 4-4 4"/>', rest:'<path d="M12 3v18M7 6l5-3 5 3M5 21h14"/>',
};
function productCard(p, scope){
  const m=scope==='m';
  return `<div class="card overflow-hidden flex flex-col relative group">
    <div class="aspect-[4/3] bg-gradient-to-br from-surface2 to-ink-100 relative grid place-items-center">
      <svg class="text-ink-300" width="${m?40:52}" height="${m?40:52}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">${PIC[p.ic]}</svg>
      <span class="absolute top-2.5 left-2.5 badge bg-white/90 text-ink-500 !text-[9px] backdrop-blur">Preview</span>
    </div>
    <div class="${m?'p-3':'p-4'} flex flex-col flex-1">
      <div class="seclabel text-ink-400 !text-[9px]">${p.brand}</div>
      <h4 class="text-[13.5px] font-semibold leading-snug mt-1 mb-3 flex-1">${p.n}</h4>
      <div class="flex items-center justify-between">
        <span class="font-display font-extrabold ${m?'text-[16px]':'text-[18px]'}"><span class="text-ink-400 text-[11px]">PKR</span> ${p.price}</span>
        <button class="btn btn-sm btn-ghost" disabled>Add</button>
      </div>
    </div>
  </div>`;
}
function buildStore(scope){
  const m=scope==='m';
  const grid = `<div class="grid ${m?'grid-cols-2 gap-3':'grid-cols-3 gap-5'}">${PRODUCTS.map(p=>productCard(p,scope)).join('')}</div>`;
  const hero = `
  <section class="relative overflow-hidden bg-night felt-grain on-felt">
    <div class="absolute inset-0" style="background:radial-gradient(700px 360px at 80% -20%,rgba(194,161,77,.28),transparent 60%),radial-gradient(500px 300px at 10% 0%,rgba(11,110,67,.5),transparent 60%)"></div>
    <div class="absolute ${m?'right-3 bottom-3':'right-8 bottom-6'} opacity-25"><svg width="${m?120:200}" height="${m?120:200}" viewBox="0 0 24 24" fill="none" stroke="#C2A14D" stroke-width="1"><path d="M3 21L21 3M6 5l13 13"/></svg></div>
    <div class="relative ${m?'px-4 pt-6 pb-7':'px-7 pt-12 pb-11'} max-w-xl">
      <span class="badge bg-brass-tint text-brass-700 mb-4"><span class="dot"></span>Launching soon</span>
      <h1 class="font-display font-extrabold uppercase text-white leading-[0.95] tracking-tight ${m?'text-[30px]':'text-[48px]'}">The SnookerPK Store</h1>
      <p class="text-ink-300 ${m?'text-[14px]':'text-[17px]'} mt-3">Pro cues, chalk, cases and tournament-grade ball sets — from trusted Pakistani retailers, delivered nationwide. Be first in line when we open.</p>
      <div class="flex gap-2.5 mt-6 ${m?'flex-col':''} max-w-md">
        <input class="input !bg-white/10 !border-white/20 !text-white placeholder:!text-ink-400" placeholder="Your email">
        <button class="btn btn-brass whitespace-nowrap">Notify me at launch</button>
      </div>
      <div class="flex items-center gap-2 mt-3 text-ink-400 text-[12px]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5L20 6"/></svg>2,400+ players already on the list</div>
    </div>
  </section>`;

  const previewHead = `<div class="flex items-center justify-between ${m?'mb-3':'mb-5'}"><div><div class="seclabel text-felt mb-1">Sneak peek</div><h2 class="font-display font-bold ${m?'text-lg':'text-2xl'}">What’s coming</h2></div><span class="badge bg-ink-100 text-ink-500 ${m?'!text-[9px]':''}">Prices indicative</span></div>`;

  return hero + `<div class="${m?'px-4 py-5':'px-7 py-8'}">
    ${previewHead}
    <div class="relative">
      ${grid}
      <div class="absolute inset-0 pointer-events-none" style="background:linear-gradient(180deg,transparent 40%,rgba(246,245,240,.55) 100%)"></div>
    </div>
    <div class="text-center mt-6"><span class="badge bg-brass-tint text-brass-700"><span class="dot"></span>Full catalogue at launch</span></div>
  </div>`;
}

/* ============================================================
   INIT
   ============================================================ */
document.getElementById('profile-d').innerHTML = buildProfile('d');
document.getElementById('profile-m').innerHTML = buildProfile('m');
document.getElementById('ranks-d').innerHTML = buildRanks('d'); renderRanksBody();
document.getElementById('ranks-m').innerHTML = buildRanks('m');
document.getElementById('store-d').innerHTML = buildStore('d');
document.getElementById('store-m').innerHTML = buildStore('m');
// tab bars
document.querySelectorAll('[data-tabbar]').forEach(el=>{
  el.innerHTML = tabbar(el.getAttribute('data-tabbar')==='ranks'?'ranks':'profile');
});
