/* ============================================================
   SnookerPK · Admin — Draw Generator & Live Reveal
   Draw mode is chosen PER ROUND at generation time.
   ============================================================ */
const ICON = {
  dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  tournaments:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v16"/>',
  entries:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',
  draw:'<path d="M3 6h7v12H3zM14 9h7v6h-7z"/><path d="M10 12h4"/>',
  players:'<circle cx="9" cy="8" r="3.5"/><path d="M3 21c0-3.5 3-5.5 6-5.5s6 2 6 5.5"/><path d="M17 8a3 3 0 010 6"/>',
  rankings:'<path d="M4 19V5M10 19v-9M16 19V8M22 19H2"/>',
  results:'<path d="M9 17l3-9 3 9M6 21h12"/><circle cx="12" cy="4" r="2"/>',
};
const NAV=[['dashboard','Dashboard'],['tournaments','Tournaments'],['entries','Entries'],['draw','Draw'],['players','Players'],['rankings','Rankings'],['results','Results']];
function sidebar(active){
  const items=NAV.map(([k,label])=>`<div class="navitem ${k===active?'on':''}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" class="shrink-0">${ICON[k]}</svg><span>${label}</span></div>`).join('');
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
    <div class="ml-auto"><button class="w-9 h-9 rounded-md grid place-items-center text-ink-500 hover:bg-surface2 relative"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg><span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-live"></span></button></div>
  </div>`;
}
function flag(cc,w=20,h=13){const b={PAK:`<i style="background:#016d31"></i><i style="background:#fff;flex:0 0 ${Math.round(w*0.3)}px"></i>`,ENG:`<i style="background:#fff"></i>`,CHN:`<i style="background:#de2910"></i>`};return `<span class="fg" style="width:${w}px;height:${h}px">${b[cc]||b.PAK}</span>`;}
function inits(n){return n.split(' ').map(x=>x[0]).join('').replace(/\./g,'').slice(0,2);}
function nextPow2(n){let p=1;while(p<n)p*=2;return p;}
function framesToWin(bo){return Math.ceil(bo/2);}

/* roster (seed order) */
const ROSTER=[
  {n:'M. Asif',cc:'PAK',tier:'Pro',seed:1},{n:'S. Khan',cc:'PAK',tier:'Pro',seed:2},
  {n:'D. Junhui',cc:'CHN',tier:'Pro',seed:3},{n:'J. Trump',cc:'ENG',tier:'Pro',seed:4},
  {n:'A. Mehmood',cc:'PAK',tier:'Pro',seed:5},{n:'B. Sajjad',cc:'PAK',tier:'Am',seed:6},
  {n:'N. Hussain',cc:'PAK',tier:'Pro',seed:7},{n:'R. Walker',cc:'ENG',tier:'Am',seed:8},
  {n:'T. Aslam',cc:'PAK',tier:'Am',seed:9},{n:'K. Iqbal',cc:'PAK',tier:'Pro',seed:10},
  {n:'M. Yousuf',cc:'PAK',tier:'Am',seed:11},{n:'F. Khan',cc:'PAK',tier:'Am',seed:12},
  {n:'H. Raza',cc:'PAK',tier:'Am',seed:13},{n:'Z. Ali',cc:'PAK',tier:'Pro',seed:14},
  {n:'W. Ahmed',cc:'PAK',tier:'Am',seed:15},{n:'S. Mehmood',cc:'PAK',tier:'Am',seed:16},
];

/* ============================================================
   01 — GENERATE DRAW
   ============================================================ */
const GROUNDS=[
  {key:'r1',name:'Round 1',pool:12,src:'12 approved entrants',defBo:7},
  {key:'qf',name:'Quarter-finals',pool:8,src:'winners of Round 1',defBo:9},
  {key:'sf',name:'Semi-finals',pool:4,src:'winners of Quarter-finals',defBo:11},
  {key:'final',name:'Final',pool:2,src:'winners of Semi-finals',defBo:11},
];
const G = { round:'r1', mode:'fixed', bo:7, byeMode:'seeds', generated:null };

function poolMeta(){
  const r=GROUNDS.find(x=>x.key===G.round);
  const byes = nextPow2(r.pool)-r.pool;
  const matches = (r.pool-byes)/2;
  return { r, byes, matches };
}
function playerChip(p,big){
  return `<span class="inline-flex items-center gap-1.5 ${big?'text-[14px]':'text-[12.5px]'}"><span class="${big?'w-7 h-7':'w-6 h-6'} rounded-full ${p.tier==='Pro'?'bg-felt text-white':'bg-ink-200 text-ink-600'} grid place-items-center font-display font-bold text-[10px] ${p.seed===1?'ring-1 ring-brass':''}">${inits(p.n)}</span>${flag(p.cc,16,10)}<span class="font-semibold">${p.n}</span><span class="text-[10px] text-ink-400 tabular-nums">${p.seed}</span></span>`;
}

function buildGenerate(){
  const {r,byes,matches}=poolMeta();
  const modeCard=(key,title,desc,icon)=>`
    <button onclick="setMode('${key}')" class="text-left p-4 rounded-lg border-2 transition ${G.mode===key?'border-felt bg-felt-50':'border-hairline bg-white hover:border-ink-300'}">
      <div class="flex items-center gap-2.5 mb-2">
        <span class="w-9 h-9 rounded-md grid place-items-center ${G.mode===key?'bg-felt text-white':'bg-surface2 text-ink-500'}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">${icon}</svg></span>
        <span class="font-display font-bold text-[15px]">${title}</span>
        <span class="ml-auto w-5 h-5 rounded-full border-2 ${G.mode===key?'border-felt bg-felt':'border-ink-300'} grid place-items-center">${G.mode===key?'<span class="w-2 h-2 rounded-full bg-white"></span>':''}</span>
      </div>
      <p class="text-[12.5px] text-ink-500 leading-snug">${desc}</p>
    </button>`;

  const roundChips=GROUNDS.map(g=>`<button onclick="setRound('${g.key}')" class="px-3.5 py-2 rounded-md text-[13px] font-display font-semibold ${G.round===g.key?'bg-felt text-white':'bg-surface2 text-ink-600 hover:text-ink-900'}">${g.name}</button>`).join('');

  const output = G.generated ? renderGenerated() : `
    <div class="card border-dashed grid place-items-center text-center py-14">
      <div class="w-14 h-14 rounded-full bg-surface2 grid place-items-center mb-3 text-ink-300"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h7v12H3zM14 9h7v6h-7z"/><path d="M10 12h4"/></svg></div>
      <div class="font-display font-bold text-ink-700">No matches generated yet</div>
      <p class="text-ink-400 text-[13px] mt-1">Configure the round above, then ${G.mode==='fixed'?'generate the pairing.':'launch the live reveal.'}</p>
    </div>`;

  return `
    <div class="flex items-end justify-between gap-4 flex-wrap mb-6">
      <div><h1 class="font-display font-extrabold uppercase text-[28px] leading-none">Generate draw</h1>
      <p class="text-ink-500 text-[14px] mt-1.5">Choose the draw mode <b>per round</b> at generation time. ${r.key==='r1'?'Round 1 pairs the approved entrants.':'Later rounds pair the winners of the previous round.'}</p></div>
      <span class="badge bg-felt-50 text-felt">Karachi National Open ’26 · 16-draw</span>
    </div>

    <div class="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <div class="space-y-5">
        <!-- round selector -->
        <div class="card p-5">
          <div class="seclabel text-felt mb-3">1 · Round</div>
          <div class="flex flex-wrap gap-2 mb-3">${roundChips}</div>
          <div class="flex items-center gap-2 rounded-md bg-surface2 px-3.5 py-2.5 text-[13px]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-felt"><path d="M12 2v6m0 0l3-3m-3 3L9 5"/><circle cx="12" cy="15" r="6"/></svg>
            <span class="text-ink-600">Pool for this round:</span><b class="text-ink-900">${r.src}</b><span class="ml-auto font-display font-bold text-felt tabular-nums">${r.pool} players</span>
          </div>
        </div>

        <!-- mode -->
        <div class="card p-5">
          <div class="seclabel text-felt mb-3">2 · Draw mode <span class="text-ink-400 font-sans normal-case tracking-normal">· per round</span></div>
          <div class="grid sm:grid-cols-2 gap-3">
            ${modeCard('fixed','Fixed pairing','Pair the whole pool at once using seeds. Instant, deterministic bracket.','<path d="M3 6h7v4H3zM3 14h7v4H3zM14 6h7v4h-7zM14 14h7v4h-7z"/>')}
            ${modeCard('random','Re-draw / random reveal','Reveal one match at a time with a live spin. Confirm or re-roll each pairing.','<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}
          </div>
        </div>

        <!-- settings -->
        <div class="card p-5">
          <div class="seclabel text-felt mb-3">3 · Round settings</div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div><label class="lbl">Frames — best of</label>
              <div class="flex items-center gap-2">
                <select onchange="setBo(+this.value)" class="input !py-2 !w-24 appearance-none text-center">${[5,7,9,11,13,17,19,35].map(n=>`<option ${n===G.bo?'selected':''}>${n}</option>`).join('')}</select>
                <span class="text-[13px] text-ink-500">→ first to <b class="text-ink-800">${framesToWin(G.bo)}</b> frames</span>
              </div>
            </div>
            <div><label class="lbl">Assign byes to ${byes>0?`<span class="text-ink-400">(${byes})</span>`:'<span class="text-ink-400">(none needed)</span>'}</label>
              <div class="relative"><select onchange="setByeMode(this.value)" ${byes===0?'disabled':''} class="input !py-2 appearance-none pr-9 ${byes===0?'opacity-50':''}">
                <option value="seeds" ${G.byeMode==='seeds'?'selected':''}>Highest seeds (recommended)</option>
                <option value="random" ${G.byeMode==='random'?'selected':''}>Random</option>
                <option value="lowest" ${G.byeMode==='lowest'?'selected':''}>Lowest seeds (play-in)</option>
              </select><svg class="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 1l5 5 5-5"/></svg></div>
            </div>
          </div>
        </div>

        <!-- output -->
        <div>
          <div class="flex items-center justify-between mb-3"><div class="seclabel text-felt">Generated matches</div>${G.generated?`<button onclick="clearGen()" class="text-[12.5px] font-semibold text-ink-500 hover:text-bad">Clear</button>`:''}</div>
          ${output}
        </div>
      </div>

      <!-- pre-generation summary -->
      <div class="card overflow-hidden sticky top-[76px]">
        <div class="px-5 py-3.5 bg-night text-white"><div class="seclabel text-ink-300 !text-[10px]">Pre-generation summary</div><div class="font-display font-bold text-[16px] mt-0.5">${r.name}</div></div>
        <div class="p-5 space-y-3">
          <div class="flex items-center justify-between"><span class="text-[13px] text-ink-500">Pool size</span><span class="font-display font-bold tabular-nums text-[15px]">${r.pool}</span></div>
          <div class="flex items-center justify-between"><span class="text-[13px] text-ink-500">Matches</span><span class="font-display font-bold tabular-nums text-[15px] text-felt">${matches}</span></div>
          <div class="flex items-center justify-between"><span class="text-[13px] text-ink-500">Byes</span><span class="font-display font-bold tabular-nums text-[15px] ${byes>0?'text-warn':''}">${byes}</span></div>
          <div class="flex items-center justify-between pt-3 border-t border-hairline"><span class="text-[13px] text-ink-500">Advance to next</span><span class="font-display font-bold tabular-nums text-[15px]">${matches+byes}</span></div>
          <div class="flex items-center justify-between"><span class="text-[13px] text-ink-500">Format</span><span class="font-display font-semibold text-[13px]">Best of ${G.bo}</span></div>
          <div class="rounded-md bg-surface2 px-3 py-2 text-[12px] text-ink-500 flex items-center gap-2">
            <span class="badge ${G.mode==='fixed'?'bg-felt text-white':'bg-brass-tint text-brass-700'} !text-[9px]">${G.mode==='fixed'?'Fixed':'Random'}</span>
            ${G.mode==='fixed'?'Pairs instantly on generate.':'Opens the live reveal screen.'}
          </div>
          ${G.mode==='fixed'
            ? `<button onclick="doGenerate()" class="btn btn-primary w-full">Generate pairing</button>`
            : `<button onclick="doGenerate()" class="btn btn-brass w-full"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Launch live reveal</button>`}
        </div>
      </div>
    </div>`;
}

function renderGenerated(){
  const g=G.generated;
  const rows=g.matches.map((m,i)=>`
    <div class="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-3 px-5 py-3 border-b border-hairline last:border-0 dropin" style="animation-delay:${i*40}ms">
      <span class="font-display font-semibold text-ink-300 tabular-nums w-5 text-center">${i+1}</span>
      <div class="flex justify-start">${playerChip(m[0])}</div>
      <span class="font-display font-bold text-ink-300 text-[13px]">v</span>
      <div class="flex justify-end">${playerChip(m[1])}</div>
    </div>`).join('');
  const byeRows=g.byes.map((p,i)=>`
    <div class="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-3 px-5 py-3 border-b border-hairline last:border-0 bg-surface2/50 dropin" style="animation-delay:${(g.matches.length+i)*40}ms">
      <span class="font-display font-semibold text-ink-300 tabular-nums w-5 text-center">—</span>
      <div class="flex justify-start">${playerChip(p)}</div>
      <span class="badge bg-ink-100 text-ink-500 !text-[9px]">Bye</span>
      <div class="text-right text-[12px] text-ink-400 italic">advances</div>
    </div>`).join('');
  return `<div class="card overflow-hidden">
    <div class="px-5 py-3 bg-night text-white flex items-center gap-3"><span class="font-display font-bold uppercase tracking-[0.1em] text-[13px]">${g.roundName}</span><span class="seclabel text-ink-400 !text-[10px]">Best of ${g.bo} · first to ${framesToWin(g.bo)}</span><span class="ml-auto text-[11px] text-ink-400">${g.matches.length} matches · ${g.byes.length} byes</span></div>
    ${rows}${byeRows}
    <div class="flex items-center gap-2 px-5 py-3 bg-ok-tint border-t border-ok/20"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="text-ok"><path d="M5 12l5 5L20 6"/></svg><span class="text-[13px] text-[#0C6B3C] font-semibold">Draw generated.</span><button class="btn btn-primary btn-sm ml-auto">Publish round</button></div>
  </div>`;
}
function setRound(k){ G.round=k; const r=GROUNDS.find(x=>x.key===k); G.bo=r.defBo; G.generated=null; renderGen(); }
function setMode(m){ G.mode=m; renderGen(); }
function setBo(n){ G.bo=n; renderGen(); }
function setByeMode(m){ G.byeMode=m; renderGen(); }
function clearGen(){ G.generated=null; renderGen(); }
function doGenerate(){
  const {r,byes,matches}=poolMeta();
  // build the pool (seeded) — round 1 uses entrants; later rounds use placeholder winners
  let pool;
  if(r.key==='r1'){ pool=ROSTER.slice(0,r.pool).map(p=>({...p})); }
  else { pool=ROSTER.slice(0,r.pool).map((p,i)=>({...p, n:`Winner M${i+1}`, ph:true})); }
  if(G.mode==='random'){ // jump to live reveal note
    G.generated={ roundName:r.name, bo:G.bo, matches:[], byes:[], random:true };
    renderGen();
    document.getElementById('reveal')?.scrollIntoView?.({behavior:'smooth'});
    return;
  }
  // fixed pairing with byes by seed
  let byePlayers=[];
  const sorted=[...pool].sort((a,b)=>a.seed-b.seed);
  if(G.byeMode==='seeds') byePlayers=sorted.slice(0,byes);
  else if(G.byeMode==='lowest') byePlayers=sorted.slice(pool.length-byes);
  else { byePlayers=[...pool].sort(()=>Math.random()-0.5).slice(0,byes); }
  const byeSet=new Set(byePlayers.map(p=>p.seed));
  const rest=sorted.filter(p=>!byeSet.has(p.seed));
  const ms=[];
  for(let i=0;i<rest.length/2;i++){ ms.push([rest[i], rest[rest.length-1-i]]); } // 1v8, 2v7…
  G.generated={ roundName:r.name, bo:G.bo, matches:ms, byes:byePlayers };
  renderGen();
}
function renderGen(){ document.getElementById('generate').innerHTML = buildGenerate(); }

/* ============================================================
   02 — LIVE DRAW REVEAL (random mode, slot-machine)
   states: idle → spinning → settled → confirmed
   ============================================================ */
const R = {
  roundName:'Round 1', bo:7,
  pool: ROSTER.slice(0,16).map(p=>({...p})),
  drawn: [],
  total: 8,
  phase: 'idle',    // idle | spinning | settled | done
  pair: [null,null],
};
let spinTimer=null;

function stateLegend(){
  const states=[['idle','Idle'],['spinning','Spinning'],['settled','Settled'],['confirmed','Confirmed']];
  // map current phase to a legend position
  const cur = R.phase==='done'?'confirmed':R.phase;
  return `<div class="flex items-center gap-1.5">${states.map(([k,label],i)=>{
    const on = k===cur || (cur==='confirmed'&&k==='confirmed');
    return `<div class="flex items-center gap-1.5">
      <span class="px-2.5 py-1 rounded-full text-[10.5px] font-display font-bold uppercase tracking-wide ${on?'bg-felt text-white':'bg-surface2 text-ink-400'}">${label}</span>
      ${i<3?'<span class="text-ink-300 text-[10px]">→</span>':''}</div>`;
  }).join('')}</div>`;
}
function slot(side){
  const p=R.pair[side==='a'?0:1];
  const spinning=R.phase==='spinning';
  const settled=R.phase==='settled';
  return `<div class="flex-1 rounded-xl border-2 ${settled?'border-felt bg-felt-50':spinning?'border-ink-300 bg-white':'border-dashed border-ink-300 bg-surface2'} p-5 text-center min-h-[150px] grid place-items-center ${settled?'pop':''}">
    <div>
      <div id="slot-${side}" class="${spinning?'spinning':''}">
        ${p ? `<div class="w-14 h-14 mx-auto rounded-full ${p.tier==='Pro'?'bg-felt text-white':'bg-ink-300 text-ink-700'} grid place-items-center font-display font-extrabold text-lg mb-2 ${p.seed===1?'ring-2 ring-brass':''}">${inits(p.n)}</div>
           <div class="font-display font-bold text-[17px]">${p.n}</div>
           <div class="flex items-center justify-center gap-1.5 text-[12px] text-ink-500 mt-1">${flag(p.cc,18,12)}${p.cc} · seed ${p.seed}</div>`
         : `<div class="w-14 h-14 mx-auto rounded-full bg-ink-200 grid place-items-center text-ink-400 mb-2"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg></div>
            <div class="font-display font-bold text-[15px] text-ink-300">—</div>`}
      </div>
    </div>
  </div>`;
}
function buildReveal(){
  const remaining=R.pool.length;
  const done = R.phase==='done' || R.drawn.length>=R.total;
  const drawnList = R.drawn.map((m,i)=>`
    <div class="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2.5 px-4 py-2.5 border-b border-hairline last:border-0 dropin">
      <span class="font-display font-semibold text-ink-300 tabular-nums w-4 text-center text-[12px]">${i+1}</span>
      <div class="flex items-center gap-2 min-w-0"><span class="text-[13px] font-semibold truncate">${m[0].n}</span>${flag(m[0].cc,15,10)}</div>
      <span class="font-display font-bold text-ink-300 text-[12px]">v</span>
      <div class="flex items-center gap-2 justify-end text-right min-w-0">${flag(m[1].cc,15,10)}<span class="text-[13px] font-semibold truncate">${m[1].n}</span></div>
    </div>`).join('');

  const poolChips=R.pool.map(p=>`<div class="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-surface2 ${R.pair.includes(p)&&R.phase==='settled'?'ring-2 ring-felt':''}"><span class="w-6 h-6 rounded-full ${p.tier==='Pro'?'bg-felt text-white':'bg-ink-300 text-ink-700'} grid place-items-center font-display font-bold text-[10px]">${inits(p.n)}</span><span class="text-[12.5px] font-semibold truncate">${p.n}</span><span class="text-[10px] text-ink-400 ml-auto tabular-nums">${p.seed}</span></div>`).join('');

  const controls = done
    ? `<div class="flex items-center gap-2 bg-ok-tint border border-ok/30 rounded-md px-4 py-3"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="text-ok"><path d="M5 12l5 5L20 6"/></svg><b class="text-[#0C6B3C] text-[14px]">Draw complete — ${R.total} matches.</b><button class="btn btn-primary btn-sm ml-auto">Publish draw</button></div>`
    : R.phase==='settled'
      ? `<div class="flex items-center gap-3">
          <span class="badge bg-warn-tint text-[#9A5B12]"><span class="dot pulse"></span>Awaiting approval</span>
          <div class="ml-auto flex gap-2.5">
            <button onclick="reroll()" class="btn btn-ghost"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1015-6.7L21 8"/><path d="M21 3v5h-5"/></svg>Re-roll</button>
            <button onclick="confirmPair()" class="btn btn-primary">Confirm matchup</button>
          </div></div>`
      : R.phase==='spinning'
        ? `<button class="btn btn-brass btn-lg w-full" disabled><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><path d="M21 12a9 9 0 11-6.2-8.5"/></svg>Spinning…</button>`
        : `<button onclick="drawNext()" class="btn btn-brass btn-lg w-full"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Draw next match</button>`;

  const phaseNote={
    idle:'Ready. Press “Draw next match” to spin for a random pairing.',
    spinning:'Spinning through the remaining pool…',
    settled:'A pair has been drawn. Confirm to lock it in, or re-roll.',
    done:'All matches drawn. Publish to push the bracket live.',
  }[R.phase];

  return `
    <div class="flex items-end justify-between gap-4 flex-wrap mb-5">
      <div><h1 class="font-display font-extrabold uppercase text-[28px] leading-none">Live draw reveal</h1>
        <p class="text-ink-500 text-[14px] mt-1.5">${R.roundName} · random mode · best of ${R.bo}</p></div>
      <div class="text-right"><div class="seclabel text-ink-400 !text-[10px]">Progress</div><div class="font-display font-extrabold text-[22px] tabular-nums">Match ${Math.min(R.drawn.length+ (done?0:1), R.total)} <span class="text-ink-400">of ${R.total}</span></div></div>
    </div>

    <!-- state legend -->
    <div class="flex items-center gap-3 mb-5 flex-wrap">
      <span class="seclabel text-ink-400 !text-[10px]">State</span>
      ${stateLegend()}
      <span class="text-[12px] text-ink-500 ml-1">${phaseNote}</span>
    </div>

    <div class="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
      <div class="space-y-5">
        <!-- stage -->
        <div class="card p-6 relative overflow-hidden">
          <div class="absolute inset-0 bg-night felt-grain opacity-[0.03]"></div>
          <div class="relative flex items-center gap-4">
            ${slot('a')}
            <div class="font-display font-extrabold text-ink-300 text-2xl">VS</div>
            ${slot('b')}
          </div>
          <div class="relative mt-6">${controls}</div>
        </div>

        <!-- drawn list -->
        <div>
          <div class="seclabel text-felt mb-3">Confirmed matches</div>
          <div class="card overflow-hidden">
            <div class="px-4 py-2.5 bg-night text-white flex items-center"><span class="font-display font-bold uppercase tracking-[0.1em] text-[12px]">${R.roundName}</span><span class="ml-auto text-[11px] text-ink-400">${R.drawn.length} of ${R.total}</span></div>
            ${R.drawn.length?drawnList:`<div class="px-4 py-8 text-center text-ink-400 text-[13px]">No matches confirmed yet.</div>`}
          </div>
        </div>
      </div>

      <!-- remaining pool -->
      <div class="card overflow-hidden sticky top-[76px]">
        <div class="px-4 py-3 bg-surface2 flex items-center justify-between"><span class="seclabel text-ink-500">Remaining pool</span><span class="badge bg-felt text-white !text-[9px] tabular-nums">${remaining}</span></div>
        <div class="p-3 space-y-1.5 max-h-[420px] overflow-y-auto">${remaining?poolChips:`<div class="py-6 text-center text-ink-400 text-[13px]">Pool empty</div>`}</div>
      </div>
    </div>`;
}
function renderReveal(){ document.getElementById('reveal').innerHTML = buildReveal(); }

function drawNext(){
  if(R.pool.length<2) return;
  R.phase='spinning'; renderReveal();
  let ticks=0;
  spinTimer=setInterval(()=>{
    // randomly flash names in both slots
    const sa=document.getElementById('slot-a'), sb=document.getElementById('slot-b');
    const ra=R.pool[Math.floor(Math.random()*R.pool.length)];
    const rb=R.pool[Math.floor(Math.random()*R.pool.length)];
    if(sa) sa.innerHTML=`<div class="w-14 h-14 mx-auto rounded-full bg-ink-300 text-ink-700 grid place-items-center font-display font-extrabold text-lg mb-2">${inits(ra.n)}</div><div class="font-display font-bold text-[17px]">${ra.n}</div><div class="text-[12px] text-ink-400 mt-1">seed ${ra.seed}</div>`;
    if(sb) sb.innerHTML=`<div class="w-14 h-14 mx-auto rounded-full bg-ink-300 text-ink-700 grid place-items-center font-display font-extrabold text-lg mb-2">${inits(rb.n)}</div><div class="font-display font-bold text-[17px]">${rb.n}</div><div class="text-[12px] text-ink-400 mt-1">seed ${rb.seed}</div>`;
    ticks++;
  },90);
  setTimeout(()=>{
    clearInterval(spinTimer); spinTimer=null;
    // settle on a random distinct pair
    const idxs=[...R.pool.keys()].sort(()=>Math.random()-0.5).slice(0,2);
    R.pair=[R.pool[idxs[0]], R.pool[idxs[1]]];
    R.phase='settled'; renderReveal();
  },1500);
}
function reroll(){ R.phase='idle'; R.pair=[null,null]; renderReveal(); drawNext(); }
function confirmPair(){
  R.drawn.push([R.pair[0], R.pair[1]]);
  R.pool = R.pool.filter(p=>p!==R.pair[0] && p!==R.pair[1]);
  R.pair=[null,null];
  R.phase = (R.drawn.length>=R.total || R.pool.length<2) ? 'done' : 'idle';
  renderReveal();
}

/* ============================================================
   INIT
   ============================================================ */
document.querySelectorAll('[data-sidebar]').forEach(el=>{ el.innerHTML = sidebar(el.getAttribute('data-sidebar')); });
document.querySelectorAll('[data-topbar]').forEach(el=>{ el.outerHTML = topbar(el.getAttribute('data-topbar')); });
renderGen();
renderReveal();
