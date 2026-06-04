/* ============================================================
   SnookerPK · Tournament Detail — render + behaviour
   ============================================================ */
const T = TOURNAMENT;
const STBADGE = {
  live:    '<span class="badge bg-live-fill text-white"><span class="dot pulse"></span>Live</span>',
  upcoming:'<span class="badge bg-brass-tint text-brass-700"><span class="dot"></span>Upcoming</span>',
  done:    '<span class="badge bg-ink-100 text-ink-600"><span class="dot"></span>Completed</span>',
};

/* ---------- COVER BANNER (shared, scope d|m) ---------- */
function buildCover(scope) {
  const mobile = scope === 'm';
  const balls = ['#c0392b','#f2c200','#1e7a3d','#e86a92','#161616'].map(c=>`<span class="ball ${mobile?'w-4 h-4':'w-6 h-6'}" style="background:${c}"></span>`).join('');
  return `
  <header class="relative overflow-hidden bg-night felt-grain on-felt">
    <div class="absolute inset-0" style="background:radial-gradient(700px 360px at 18% -20%,rgba(11,110,67,.6),transparent 60%)"></div>
    <div class="absolute ${mobile?'right-3 top-3':'right-7 top-6'} flex ${mobile?'gap-1.5':'gap-2.5'} opacity-90">${balls}</div>
    <div class="relative ${mobile?'px-4 pt-5 pb-5':'px-7 pt-9 pb-8'}">
      <div class="flex items-center gap-2.5 mb-3">
        ${STBADGE.live}
        <span class="seclabel text-ink-300 ${mobile?'!text-[9px]':''}">${T.format}</span>
      </div>
      <h1 class="font-display font-extrabold uppercase text-white leading-[0.95] tracking-tight ${mobile?'text-[26px]':'text-[44px]'}">${T.name}<span class="text-brass"> ’${T.edition.slice(2)}</span></h1>
      <div class="flex flex-wrap items-center ${mobile?'gap-x-3 gap-y-1 mt-3 text-[12px]':'gap-x-5 gap-y-2 mt-4 text-[14px]'} text-ink-300">
        <span class="flex items-center gap-1.5"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>${T.dates}</span>
        <span class="flex items-center gap-1.5"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>${T.venue}, ${T.city} · ${T.cc}</span>
        <span class="flex items-center gap-1.5"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>${T.drawSize}-player draw</span>
      </div>
      <div class="flex flex-wrap items-center ${mobile?'gap-3 mt-4':'gap-5 mt-6'}">
        <div class="flex items-center gap-2.5">
          <span class="${mobile?'w-9 h-9':'w-11 h-11'} rounded-lg bg-white/10 border border-white/15 grid place-items-center font-display font-bold ${mobile?'text-[13px]':'text-base'} text-brass">${T.orgInit}</span>
          <div class="leading-tight">
            <div class="seclabel text-ink-400 ${mobile?'!text-[9px]':'!text-[10px]'}">Organized by</div>
            <div class="${mobile?'text-[13px]':'text-[15px]'} font-semibold text-white">${T.org}</div>
            <div class="text-[11px] text-ink-400">Presented by ${T.presentedBy}</div>
          </div>
        </div>
        <div class="${mobile?'':'ml-auto'} flex items-center gap-4">
          <div class="text-right">
            <div class="seclabel text-ink-400 ${mobile?'!text-[9px]':''}">Prize pool</div>
            <div class="font-display font-extrabold text-brass ${mobile?'text-xl':'text-2xl'} tabular-nums">PKR ${T.prizePool}</div>
          </div>
          ${mobile?'':'<button class="btn btn-brass">Follow</button>'}
        </div>
      </div>
    </div>
  </header>`;
}

/* ---------- TABS ---------- */
const TABS = [['draw','Draw'],['overview','Overview'],['players','Players'],['prizes','Prizes'],['info','Info']];
const tabState = { d: 'draw', m: 'draw' };

function buildTabs(scope) {
  const mobile = scope === 'm';
  return `<div class="flex ${mobile?'overflow-x-auto':'gap-1'} ${mobile?'px-2':''}" role="tablist">
    ${TABS.map(([k,label])=>`
      <button data-tab="${k}" onclick="setTab('${scope}','${k}')"
        class="tabbtn-${scope} whitespace-nowrap font-display font-semibold ${mobile?'text-[13px] px-3.5 py-3':'text-[14px] px-4 py-4'} border-b-2 transition
        ${k==='draw'?'border-felt text-felt':'border-transparent text-ink-500 hover:text-ink-800'}">
        ${label}${k==='draw'?' <span class="badge bg-live-fill text-white !text-[9px] !px-1.5 !py-0.5 ml-1"><span class="dot pulse"></span>Live</span>':''}
      </button>`).join('')}
  </div>`;
}

/* ---------- MATCH ROW (the reused component) ---------- */
function pside(pl, { right=false, win=false, lose=false, mobile=false } = {}) {
  if (!pl || pl.n === 'TBD') {
    return `<div class="flex items-center gap-2 ${right?'justify-end text-right':''} min-w-0">
      <span class="${mobile?'text-[13px]':'text-[14.5px]'} text-ink-300 italic truncate">To be confirmed</span></div>`;
  }
  const seed = `<span class="text-[11px] font-display font-semibold text-ink-400 tabular-nums ${right?'order-last':''}">${pl.seed}</span>`;
  const fg = flag(pl.cc, mobile?18:22, mobile?12:15);
  const tier = (!mobile && pl.tier) ? `<span class="tier ${pl.tier==='Pro'?'tier-pro':'tier-am'}">${pl.tier}</span>` : '';
  const name = `<span class="${mobile?'text-[13px]':'text-[14.5px]'} ${win?'font-bold text-ink-900':lose?'text-ink-500':'text-ink-800'} truncate">${pl.n}</span>`;
  if (right) {
    return `<div class="flex items-center gap-2 justify-end text-right min-w-0">${tier}${name}${fg}${seed}</div>`;
  }
  return `<div class="flex items-center gap-2 min-w-0">${seed}${fg}${name}${tier}</div>`;
}

let _mid = 0;
function renderMatch(m, scope, bestOf) {
  const mobile = scope === 'm';
  const id = `fr-${scope}-${_mid++}`;
  const px = mobile ? 'px-3.5' : 'px-5';
  const posCell = `<span class="font-display font-semibold text-ink-300 tabular-nums ${mobile?'text-[11px] w-4':'text-[12px] w-5'} text-center shrink-0">${m.pos}</span>`;

  // ---- BYE ----
  if (m.st === 'bye') {
    return `<div class="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2.5 ${px} py-3 border-b border-hairline">
      ${posCell}${pside(m.a,{win:true,mobile})}
      <span class="badge bg-ink-100 text-ink-500 tracking-[0.1em]">Bye</span>
      <div class="text-right text-[13px] text-ink-300 italic">advances</div></div>`;
  }
  // ---- WALKOVER ----
  if (m.st === 'wo') {
    return `<div class="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2.5 ${px} py-3 border-b border-hairline">
      ${posCell}${pside(m.a,{win:true,mobile})}
      <div class="flex flex-col items-center leading-tight"><span class="font-display font-bold text-[14px] text-ink-700">w/o</span><span class="text-[9px] text-ink-400 uppercase tracking-wide">walkover</span></div>
      <div class="flex items-center gap-2 justify-end text-right min-w-0"><span class="${mobile?'text-[13px]':'text-[14.5px]'} text-ink-400 line-through truncate">${m.b.n}</span>${flag(m.b.cc,mobile?18:22,mobile?12:15)}</div></div>`;
  }
  // ---- SCHEDULED ----
  if (m.st === 'sched') {
    return `<div class="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2.5 ${px} py-3 border-b border-hairline">
      ${posCell}${pside(m.a,{mobile})}
      <div class="text-center leading-tight"><div class="font-display font-semibold ${mobile?'text-[12px]':'text-[13px]'} text-ink-500 tabular-nums whitespace-nowrap">${m.when}</div>${m.table?`<div class="text-[10px] text-ink-400">${m.table}</div>`:''}</div>
      ${pside(m.b,{right:true,mobile})}</div>`;
  }
  // ---- DONE / LIVE (expandable) ----
  const aWin = m.sa > m.sb, bWin = m.sb > m.sa;
  const live = m.st === 'live';
  const scoreCenter = `<div class="flex flex-col items-center">
      <div class="font-display font-bold ${mobile?'text-[18px]':'text-[20px]'} tabular-nums flex items-center gap-2 leading-none">
        <span class="${aWin?'text-ink-900':'text-ink-400'}">${m.sa}</span><span class="text-ink-300 font-medium">–</span><span class="${bWin?'text-ink-900':'text-ink-400'}">${m.sb}</span>
      </div>
      ${live?`<span class="text-[9.5px] font-semibold text-live-fill uppercase tracking-wide mt-1 whitespace-nowrap">● Frame ${m.live.frame}</span>`:`<svg class="mt-1 text-ink-300 chev-${id}" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>`}
    </div>`;
  const rowBg = live ? 'bg-gradient-to-r from-live-tint to-transparent' : 'hover:bg-surface2';
  const head = `<div class="matchrow grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2.5 ${px} py-3 border-b border-hairline ${rowBg}" onclick="toggleFrames('${id}')">
      ${posCell}${pside(m.a,{win:aWin,lose:bWin,mobile})}${scoreCenter}${pside(m.b,{right:true,win:bWin,lose:aWin,mobile})}</div>`;

  // frames panel
  const cells = (m.frames||[]).map((f,i)=>{
    const aw=f[0]>f[1];
    return `<div class="rounded bg-white border border-hairline py-1.5 text-center text-[11.5px] font-mono leading-tight">
      <div class="${aw?'font-bold text-ink-900':'text-ink-400'}">${f[0]}</div>
      <div class="${!aw?'font-bold text-ink-900':'text-ink-400'}">${f[1]}</div></div>`;
  }).join('');
  const liveCell = live ? `<div class="rounded bg-live-tint border border-live/30 py-1.5 text-center text-[11px] font-mono text-live-fill leading-tight"><div class="font-bold">${m.live.score.split('–')[0]}</div><div>${m.live.score.split('–')[1]}</div></div>` : '';
  const colN = (m.frames?.length||0) + (live?1:0);
  const panel = `<div id="${id}" class="frames-panel bg-surface2 ${px} py-3 border-b border-hairline">
      <div class="flex items-center justify-between mb-2">
        <span class="seclabel text-ink-500 !text-[9.5px]">Frame scores${live?` · live ${m.live.table}`:' · final'}</span>
        <span class="text-[10px] text-ink-400 font-mono">${m.a.n.split(' ').pop()} / ${m.b.n.split(' ').pop()}</span>
      </div>
      <div class="grid gap-1.5" style="grid-template-columns:repeat(${Math.min(colN, mobile?6:11)},minmax(0,1fr))">${cells}${liveCell}</div>
    </div>`;
  return head + panel;
}

/* ---------- DRAW TAB ---------- */
function buildDraw(scope) {
  const mobile = scope === 'm';
  const ordered = [...ROUNDS].reverse(); // Final first
  const roundBlock = (r) => `
    <section data-round="${r.key}" id="round-${scope}-${r.key}" class="card overflow-hidden mb-5">
      <div class="px-5 py-3 bg-night flex items-center gap-3">
        <span class="font-display font-bold text-white uppercase tracking-[0.1em] ${mobile?'text-[13px]':'text-[14px]'}">${r.name}</span>
        <span class="seclabel text-ink-400 !text-[10px]">${r.sub} · Best of ${r.bestOf}</span>
        <span class="ml-auto text-[11px] text-ink-500 font-medium">${r.matches.length} match${r.matches.length>1?'es':''}</span>
      </div>
      <div>${r.matches.map(m=>renderMatch(m, scope, r.bestOf)).join('')}</div>
    </section>`;

  if (mobile) {
    // round chip selector, show one round at a time (default qf — the live round)
    const chips = ordered.map(r=>`<button onclick="selectRound('m','${r.key}')" class="roundchip-m whitespace-nowrap px-3 py-1.5 rounded-full text-[12px] font-display font-semibold ${r.key==='qf'?'bg-felt text-white':'bg-surface2 text-ink-600 border border-hairline'}">${r.name}${r.key==='qf'?' <span class="w-1.5 h-1.5 rounded-full bg-white inline-block ml-0.5 align-middle pulse"></span>':''}</button>`).join('');
    return `<div class="-mt-1">
      <div class="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">${chips}</div>
      ${ordered.map(roundBlock).join('')}
    </div>`;
  }

  // desktop: left sticky jump-nav + stacked rounds
  const nav = ordered.map(r=>`<a href="#round-d-${r.key}" onclick="jumpRound(event,'${r.key}')" class="block px-3 py-2 rounded-md text-[13px] font-display font-semibold text-ink-600 hover:bg-surface2 hover:text-felt">${r.name} <span class="text-ink-400 font-normal">· ${r.matches.length}</span></a>`).join('');
  return `<div class="grid grid-cols-[180px_1fr] gap-7 items-start">
    <aside class="sticky top-32"><div class="seclabel text-ink-400 mb-2 px-3">Rounds</div>${nav}
      <div class="mt-4 px-3 py-3 rounded-md bg-night text-white"><div class="seclabel text-ink-400 !text-[9px] mb-1">Now playing</div><div class="text-[13px] font-semibold">QF · Mehmood v Trump</div><div class="text-[11px] text-brass mt-0.5 font-display font-semibold">4–3 · Frame 8</div></div>
    </aside>
    <div>${ordered.map(roundBlock).join('')}</div>
  </div>`;
}

/* ---------- OVERVIEW TAB ---------- */
function buildOverview(scope) {
  const cols = scope==='m' ? '' : 'grid lg:grid-cols-[1.4fr_1fr] gap-6';
  return `<div class="${cols}">
    <div class="space-y-5">
      <div class="card p-5">
        <div class="seclabel text-felt mb-2">About</div>
        <p class="text-[14.5px] text-ink-700 leading-relaxed">The ${T.name} returns to ${T.venue} for its ${T.edition} edition — a ${T.drawSize}-player single-elimination knockout bringing together Pakistan’s leading professionals and the country’s sharpest amateurs alongside invited internationals. Play runs ${T.dates} across two match tables, with the Final on the Show Table.</p>
      </div>
      <div class="grid grid-cols-2 ${scope==='m'?'gap-3':'gap-4'}">
        <div class="card p-4"><div class="seclabel text-ink-400">Format</div><div class="font-display font-bold text-[16px] mt-1.5">Knockout</div><div class="text-caption text-ink-500">Single elimination</div></div>
        <div class="card p-4"><div class="seclabel text-ink-400">Draw size</div><div class="font-display font-bold text-[16px] mt-1.5 tabular-nums">${T.drawSize} players</div><div class="text-caption text-ink-500">8 seeded</div></div>
        <div class="card p-4"><div class="seclabel text-ink-400">Final</div><div class="font-display font-bold text-[16px] mt-1.5">Best of 11</div><div class="text-caption text-ink-500">18 Jun · 19:00</div></div>
        <div class="card p-4"><div class="seclabel text-ink-400">Highest break</div><div class="font-display font-bold text-[16px] mt-1.5 tabular-nums text-felt">141</div><div class="text-caption text-ink-500">M. Asif · QF</div></div>
      </div>
    </div>
    <div class="space-y-5 ${scope==='m'?'mt-5':''}">
      <div class="rounded-lg overflow-hidden bg-night felt-grain border border-hairline-d p-5 on-felt">
        <div class="seclabel text-ink-400 mb-1">Prize pool</div>
        <div class="font-display font-extrabold text-brass text-3xl tabular-nums">PKR ${T.prizePool}</div>
        <div class="text-ink-300 text-[13px] mt-1">Winner takes PKR 200,000 + the National Open trophy.</div>
      </div>
      <div class="card overflow-hidden">
        <div class="px-4 py-3 bg-night flex items-center justify-between"><span class="seclabel text-ink-300 !text-[10px]">Featured · live</span><span class="badge bg-live-fill text-white !text-[10px]"><span class="dot pulse"></span>Live</span></div>
        <div class="p-4 space-y-2.5">
          <div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="text-[11px] text-ink-400">5</span>${flag('PAK',20,13)}<span class="font-bold text-[14.5px]">A. Mehmood</span></div><span class="font-display font-bold text-xl tabular-nums">4</span></div>
          <div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="text-[11px] text-ink-400">4</span>${flag('ENG',20,13)}<span class="text-ink-500 text-[14.5px]">J. Trump</span></div><span class="font-display font-bold text-xl tabular-nums text-ink-400">3</span></div>
          <div class="text-caption text-ink-400 pt-1 border-t border-hairline">Frame 8 · 62–17 · Table 1</div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------- PLAYERS TAB ---------- */
function buildPlayers(scope) {
  const grid = scope==='m' ? 'space-y-2.5' : 'grid sm:grid-cols-2 gap-3';
  const rows = ENTRANTS.map(p=>`
    <div class="card px-4 py-3 flex items-center gap-3">
      <span class="font-display font-bold text-ink-400 tabular-nums w-6 text-center text-[13px]">${p.seed}</span>
      <span class="w-9 h-9 rounded-full ${p.tier==='Pro'?'bg-felt text-white':'bg-ink-200 text-ink-600'} grid place-items-center font-display font-bold text-xs ${p.seed===1?'ring-2 ring-brass':''}">${p.n.split(' ').map(x=>x[0]).join('').replace('.','').slice(0,2)}</span>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2"><span class="font-bold text-[14px] truncate">${p.n}</span><span class="tier ${p.tier==='Pro'?'tier-pro':'tier-am'}">${p.tier}</span></div>
        <div class="flex items-center gap-1.5 text-caption text-ink-400">${flag(p.cc,16,10)}${p.cc} · ${p.city}</div>
      </div>
      <span class="seclabel text-ink-300 !text-[9px]">Seed</span>
    </div>`).join('');
  return `<div><div class="flex items-center justify-between mb-4"><div class="seclabel text-felt">${ENTRANTS.length} entrants · seeded</div><span class="text-caption text-ink-400">8 seeds · 8 unseeded</span></div><div class="${grid}">${rows}</div></div>`;
}

/* ---------- PRIZES TAB ---------- */
function buildPrizes(scope) {
  const rows = PRIZES.map(p=>`
    <div class="flex items-center gap-3 px-5 py-3.5 border-b border-hairline ${p.hl?'bg-brass-tint/40':''}">
      <span class="${p.hl?'text-brass-700':'text-ink-400'} font-display font-bold">${p.hl?'🏆':''}</span>
      <span class="font-semibold text-[14.5px] ${p.hl?'text-brass-700':'text-ink-800'}">${p.pos}</span>
      ${p.each?`<span class="text-caption text-ink-400">${p.each}</span>`:''}
      ${p.note?`<span class="badge bg-ink-100 text-ink-500 !text-[9px]">${p.note}</span>`:''}
      <span class="ml-auto font-display font-extrabold tabular-nums ${p.hl?'text-brass-700 text-lg':'text-ink-900'}">PKR ${p.amt}</span>
    </div>`).join('');
  return `<div class="max-w-2xl">
    <div class="rounded-lg overflow-hidden bg-night felt-grain border border-hairline-d p-5 mb-5 on-felt flex items-center justify-between">
      <div><div class="seclabel text-ink-400 mb-1">Total prize pool</div><div class="font-display font-extrabold text-brass text-3xl tabular-nums">PKR ${T.prizePool}</div></div>
      <div class="ball w-10 h-10" style="background:#161616"></div>
    </div>
    <div class="card overflow-hidden"><div class="px-5 py-3 bg-surface2 seclabel text-ink-500">Breakdown by position</div>${rows}</div>
  </div>`;
}

/* ---------- INFO TAB ---------- */
function buildInfo(scope) {
  const cols = scope==='m' ? 'space-y-4' : 'grid md:grid-cols-2 gap-5';
  return `<div class="${cols}">
    <div class="card p-5">
      <div class="seclabel text-felt mb-3">Venue</div>
      <div class="font-display font-bold text-[17px]">${T.venue}</div>
      <p class="text-[13.5px] text-ink-600 mt-1">Club Road, Civil Lines, ${T.city} · ${T.cc}</p>
      <div class="mt-3 rounded-md overflow-hidden h-28 bg-gradient-to-br from-felt-400 to-felt-900 relative felt-grain grid place-items-center">
        <span class="text-white/70 text-[12px] font-display tracking-wide">MAP</span>
      </div>
    </div>
    <div class="space-y-4">
      <div class="card p-5">
        <div class="seclabel text-felt mb-3">Contacts</div>
        <div class="space-y-2.5 text-[13.5px]">
          <div class="flex items-center gap-2.5"><span class="w-8 h-8 rounded-md bg-surface2 grid place-items-center text-felt">✉</span><div><div class="font-semibold">Tournament office</div><div class="text-ink-500">events@cuemasters.pk</div></div></div>
          <div class="flex items-center gap-2.5"><span class="w-8 h-8 rounded-md bg-surface2 grid place-items-center text-felt">☎</span><div><div class="font-semibold">Referee desk</div><div class="text-ink-500">+92 21 555 0142</div></div></div>
        </div>
      </div>
      <div class="card p-5">
        <div class="seclabel text-felt mb-2">Qualifiers</div>
        <p class="text-[13.5px] text-ink-600 leading-relaxed">Eight seeds were determined by the SnookerPK national ranking. The remaining eight places were filled through regional qualifiers held across Karachi, Lahore and Islamabad in May 2026.</p>
      </div>
    </div>
  </div>`;
}

const BUILDERS = { draw: buildDraw, overview: buildOverview, players: buildPlayers, prizes: buildPrizes, info: buildInfo };

/* ---------- TAB / INTERACTION WIRING ---------- */
function renderPanel(scope) {
  document.getElementById('panel-'+scope).innerHTML = BUILDERS[tabState[scope]](scope);
}
function setTab(scope, key) {
  tabState[scope] = key;
  document.querySelectorAll('.tabbtn-'+scope).forEach(b=>{
    const on = b.dataset.tab === key;
    b.classList.toggle('border-felt', on); b.classList.toggle('text-felt', on);
    b.classList.toggle('border-transparent', !on); b.classList.toggle('text-ink-500', !on);
  });
  renderPanel(scope);
}
function toggleFrames(id){
  const el = document.getElementById(id);
  if(el) el.classList.toggle('open');
  const chev = document.querySelector('.chev-'+id);
  if(chev) chev.style.transform = el.classList.contains('open') ? 'rotate(180deg)' : '';
}
function selectRound(scope, key){
  document.querySelectorAll('#panel-'+scope+' [data-round]').forEach(s=>{
    s.style.display = s.dataset.round===key ? '' : 'none';
  });
  document.querySelectorAll('.roundchip-'+scope).forEach(c=>{
    const on = c.getAttribute('onclick').includes("'"+key+"'");
    c.classList.toggle('bg-felt', on); c.classList.toggle('text-white', on);
    c.classList.toggle('bg-surface2', !on); c.classList.toggle('text-ink-600', !on);
    c.classList.toggle('border', !on); c.classList.toggle('border-hairline', !on);
  });
}
function jumpRound(e, key){
  e.preventDefault();
  const el = document.getElementById('round-d-'+key);
  const box = el.closest('.scrollbox');
  if(box && el) box.scrollTo({ top: el.offsetTop - 150, behavior:'smooth' });
}

/* ---------- INIT ---------- */
['d','m'].forEach(scope=>{
  document.getElementById('cover-'+scope).innerHTML = buildCover(scope);
  document.getElementById('tabs-'+scope).innerHTML = buildTabs(scope);
  renderPanel(scope);
});
// mobile draw defaults to QF (live round)
selectRound('m','qf');
