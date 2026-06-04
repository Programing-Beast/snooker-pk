/* ============================================================
   SnookerPK · Admin — Manage Matches & Live Scoring
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
const NAV=[['dashboard','Dashboard'],['tournaments','Tournaments'],['entries','Entries'],['draw','Draw'],['players','Players'],['rankings','Rankings'],['results','Matches']];
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
    <div class="ml-auto"><button class="btn btn-primary btn-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 17l3-9 3 9M6 21h12"/></svg>Open live scorer</button></div>
  </div>`;
}
function flag(cc,w=20,h=13){const b={PAK:`<i style="background:#016d31"></i><i style="background:#fff;flex:0 0 ${Math.round(w*0.3)}px"></i>`,ENG:`<i style="background:#fff"></i>`,CHN:`<i style="background:#de2910"></i>`};return `<span class="fg" style="width:${w}px;height:${h}px">${b[cc]||b.PAK}</span>`;}
function inits(n){return n.split(' ').map(x=>x[0]).join('').replace(/\./g,'').slice(0,2);}
function ftw(bo){return Math.ceil(bo/2);}

/* ============================================================
   01 — MANAGE MATCHES / ENTER SCORES
   ============================================================ */
const MROUNDS=[
  { key:'qf', name:'Quarter-finals', bo:9, matches:[
    { id:1, a:{n:'M. Asif',cc:'PAK',seed:1,tier:'Pro'}, b:{n:'R. Walker',cc:'ENG',seed:8,tier:'Am'}, sa:5, sb:2, st:'completed', winner:0, wo:false, video:'youtube.com/snookerpk/qf1', frames:[[74,21],[12,88],[67,40],[71,9],[33,82],[91,0],[64,45]], open:false },
    { id:2, a:{n:'A. Mehmood',cc:'PAK',seed:5,tier:'Pro'}, b:{n:'J. Trump',cc:'ENG',seed:4,tier:'Pro'}, sa:4, sb:3, st:'live', winner:null, wo:false, video:'youtube.com/snookerpk/qf2', frames:[[70,30],[20,75],[81,12],[66,40],[33,72],[90,1],[28,64]], open:true },
    { id:3, a:{n:'D. Junhui',cc:'CHN',seed:3,tier:'Pro'}, b:{n:'B. Sajjad',cc:'PAK',seed:6,tier:'Am'}, sa:0, sb:0, st:'scheduled', winner:null, wo:false, video:'', when:'Today 18:30 · Table 2', frames:[], open:false },
    { id:4, a:{n:'N. Hussain',cc:'PAK',seed:7,tier:'Pro'}, b:{n:'S. Khan',cc:'PAK',seed:2,tier:'Pro'}, sa:0, sb:0, st:'scheduled', winner:null, wo:false, video:'', when:'Today 20:00 · Table 1', frames:[], open:false },
  ]},
];
const MST={ scheduled:'bg-brass-tint text-brass-700', live:'bg-live-fill text-white', completed:'bg-ink-100 text-ink-600' };

function pName(p,bold,mut){ return `<span class="flex items-center gap-2 min-w-0"><span class="text-[11px] text-ink-400 tabular-nums w-3">${p.seed}</span>${flag(p.cc,18,12)}<span class="text-[14.5px] ${bold?'font-bold':mut?'text-ink-500':''} truncate">${p.n}</span><span class="tier ${p.tier==='Pro'?'tier-pro':'tier-am'}">${p.tier}</span></span>`; }

function matchRow(m, bo){
  const aWin=m.winner===0, bWin=m.winner===1;
  const live=m.st==='live';
  const scoreCtl = m.wo
    ? `<div class="flex items-center justify-center"><span class="font-display font-bold text-ink-700">w/o</span></div>`
    : `<div class="flex items-center gap-2 justify-center">
        <div class="flex items-center gap-1"><button onclick="bump(${m.id},0,-1)" class="w-7 h-7 rounded-md bg-surface2 hover:bg-ink-100 grid place-items-center text-ink-600">−</button><span class="font-display font-bold text-[20px] tabular-nums w-6 text-center ${aWin?'text-felt':''}">${m.sa}</span><button onclick="bump(${m.id},0,1)" class="w-7 h-7 rounded-md bg-surface2 hover:bg-ink-100 grid place-items-center text-ink-600">+</button></div>
        <span class="text-ink-300 font-display">–</span>
        <div class="flex items-center gap-1"><button onclick="bump(${m.id},1,-1)" class="w-7 h-7 rounded-md bg-surface2 hover:bg-ink-100 grid place-items-center text-ink-600">−</button><span class="font-display font-bold text-[20px] tabular-nums w-6 text-center ${bWin?'text-felt':''}">${m.sb}</span><button onclick="bump(${m.id},1,1)" class="w-7 h-7 rounded-md bg-surface2 hover:bg-ink-100 grid place-items-center text-ink-600">+</button></div>
      </div>`;

  const editor = m.open ? `
    <div class="border-t border-hairline bg-surface2/60 px-5 py-4">
      <div class="grid lg:grid-cols-[1fr_1fr] gap-5">
        <div class="space-y-3">
          <div>
            <div class="lbl">Set winner</div>
            <div class="inline-flex bg-white border border-hairline rounded-md p-1 gap-1">
              <button onclick="setWinner(${m.id},0)" class="px-3 py-1.5 rounded text-[12.5px] font-display font-semibold ${m.winner===0?'bg-felt text-white':'text-ink-600'}">${m.a.n}</button>
              <button onclick="setWinner(${m.id},1)" class="px-3 py-1.5 rounded text-[12.5px] font-display font-semibold ${m.winner===1?'bg-felt text-white':'text-ink-600'}">${m.b.n}</button>
              <button onclick="setWinner(${m.id},null)" class="px-3 py-1.5 rounded text-[12.5px] font-display font-semibold ${m.winner===null?'bg-ink-200 text-ink-700':'text-ink-400'}">—</button>
            </div>
          </div>
          <div class="flex items-center gap-5">
            <label class="flex items-center gap-2.5 text-[13px] font-medium cursor-pointer"><span class="switch ${m.st==='live'?'on bg-live-fill':'bg-ink-300'}" onclick="toggleLive(${m.id})"></span>Mark live</label>
            <label class="flex items-center gap-2.5 text-[13px] font-medium cursor-pointer"><span class="switch ${m.wo?'on bg-felt':'bg-ink-300'}" onclick="toggleWO(${m.id})"></span>Walkover</label>
          </div>
          <div>
            <div class="lbl">Video / stream URL</div>
            <div class="relative"><svg class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg><input value="${m.video}" oninput="setVideo(${m.id},this.value)" class="input pl-9" placeholder="https://…"></div>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-2"><div class="lbl !mb-0">Per-frame scores</div><span class="text-caption text-ink-400">${m.frames.length} frames · ${m.a.n.split(' ').pop()} / ${m.b.n.split(' ').pop()}</span></div>
          <div class="rounded-md border border-hairline bg-white overflow-hidden ${m.wo?'opacity-40 pointer-events-none':''}">
            <div class="max-h-40 overflow-y-auto divide-y divide-hairline">
            ${m.frames.map((f,i)=>`<div class="flex items-center gap-2 px-3 py-1.5">
              <span class="text-[11px] text-ink-400 w-10">F${i+1}</span>
              <input value="${f[0]}" oninput="setFrame(${m.id},${i},0,this.value)" class="input !py-1 !px-2 !w-16 text-center tabular-nums" inputmode="numeric">
              <span class="text-ink-300">–</span>
              <input value="${f[1]}" oninput="setFrame(${m.id},${i},1,this.value)" class="input !py-1 !px-2 !w-16 text-center tabular-nums" inputmode="numeric">
              <span class="ml-auto text-[11px] font-display font-bold ${f[0]>f[1]?'text-felt':'text-ink-400'}">${f[0]>f[1]?m.a.n.split(' ').pop():m.b.n.split(' ').pop()}</span>
              <button onclick="delFrame(${m.id},${i})" class="w-6 h-6 rounded text-ink-400 hover:text-bad grid place-items-center"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
            </div>`).join('')||'<div class="px-3 py-3 text-caption text-ink-400 text-center">No frames recorded.</div>'}
            </div>
            <button onclick="addFrame(${m.id})" class="w-full px-3 py-2 text-[12px] font-semibold text-felt hover:bg-felt-50 border-t border-hairline">+ Add frame</button>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2.5 mt-4 pt-3 border-t border-hairline">
        ${m.st==='live'?`<a href="#scorer" onclick="loadScorer(${m.id})" class="btn btn-live btn-sm"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 17l3-9 3 9M6 21h12"/></svg>Open live scorer</a>`:''}
        <button onclick="markComplete(${m.id})" class="btn btn-primary btn-sm ml-auto">Save &amp; mark completed</button>
        <button onclick="toggleOpen(${m.id})" class="btn btn-ghost btn-sm">Close</button>
      </div>
    </div>` : '';

  return `<div class="border-b border-hairline last:border-0 ${live?'bg-gradient-to-r from-live-tint to-transparent':''}">
    <div class="grid grid-cols-[auto_1fr_auto_1fr_auto_auto] items-center gap-3 px-5 py-3">
      <span class="font-display font-semibold text-ink-300 tabular-nums w-5 text-center">${m.id}</span>
      <div class="flex justify-start">${pName(m.a,aWin,bWin)}</div>
      ${scoreCtl}
      <div class="flex justify-end">${pName(m.b,bWin,aWin)}</div>
      <span class="badge ${MST[m.st]} ${m.st==='live'?'':''}">${m.st==='live'?'<span class="dot pulse"></span>':'<span class="dot"></span>'}${m.st[0].toUpperCase()+m.st.slice(1)}</span>
      <button onclick="toggleOpen(${m.id})" class="w-8 h-8 rounded-md hover:bg-surface2 grid place-items-center text-ink-500"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:${m.open?'rotate(180deg)':'none'}"><path d="M6 9l6 6 6-6"/></svg></button>
    </div>
    ${m.st==='scheduled'&&!m.open?`<div class="px-5 pb-2 -mt-1 text-caption text-ink-400">◷ ${m.when||'TBD'}</div>`:''}
    ${editor}
  </div>`;
}

function buildMatches(){
  const counts = MROUNDS[0].matches.reduce((a,m)=>{a[m.st]++;return a;},{scheduled:0,live:0,completed:0});
  const rounds = MROUNDS.map(r=>`
    <div class="card overflow-hidden mb-6">
      <div class="px-5 py-3 bg-night text-white flex items-center gap-3"><span class="font-display font-bold uppercase tracking-[0.1em] text-[14px]">${r.name}</span><span class="seclabel text-ink-400 !text-[10px]">Best of ${r.bo} · first to ${ftw(r.bo)}</span><span class="ml-auto text-[11px] text-ink-400">${r.matches.length} matches</span></div>
      ${r.matches.map(m=>matchRow(m,r.bo)).join('')}
    </div>`).join('');
  return `
    <div class="flex items-end justify-between gap-4 flex-wrap mb-6">
      <div><h1 class="font-display font-extrabold uppercase text-[28px] leading-none">Matches</h1><p class="text-ink-500 text-[14px] mt-1.5">Enter scores, set winners and control live status. Expand a match to record frame scores.</p></div>
      <div class="flex gap-2.5">
        <span class="badge bg-live-fill text-white"><span class="dot pulse"></span>${counts.live} live</span>
        <span class="badge bg-brass-tint text-brass-700"><span class="dot"></span>${counts.scheduled} scheduled</span>
        <span class="badge bg-ink-100 text-ink-600"><span class="dot"></span>${counts.completed} completed</span>
      </div>
    </div>
    ${rounds}`;
}
function findM(id){ for(const r of MROUNDS){ const m=r.matches.find(x=>x.id===id); if(m) return m; } }
function renderMatches(){ document.getElementById('matches').innerHTML = buildMatches(); }
function toggleOpen(id){ const m=findM(id); m.open=!m.open; renderMatches(); }
function bump(id,side,d){ const m=findM(id); if(m.wo) return; if(side===0) m.sa=Math.max(0,m.sa+d); else m.sb=Math.max(0,m.sb+d);
  // auto-winner if reaches first-to
  const r=MROUNDS.find(rr=>rr.matches.includes(m)); const need=ftw(r.bo);
  if(m.sa>=need) m.winner=0; else if(m.sb>=need) m.winner=1; else if(m.st==='completed') m.winner=null;
  renderMatches(); }
function setWinner(id,w){ const m=findM(id); m.winner=w; renderMatches(); }
function toggleLive(id){ const m=findM(id); m.st = m.st==='live'?'scheduled':'live'; renderMatches(); }
function toggleWO(id){ const m=findM(id); m.wo=!m.wo; if(m.wo){ m.st='completed'; if(m.winner===null) m.winner=0; } renderMatches(); }
function setVideo(id,v){ findM(id).video=v; }
function setFrame(id,i,side,v){ findM(id).frames[i][side]=v.replace(/[^0-9]/g,'')||'0'; }
function addFrame(id){ findM(id).frames.push([0,0]); renderMatches(); }
function delFrame(id,i){ findM(id).frames.splice(i,1); renderMatches(); }
function markComplete(id){ const m=findM(id); if(m.winner===null){ m.winner = m.sa>=m.sb?0:1; } m.st='completed'; m.open=false; renderMatches(); }

/* ============================================================
   02 — LIVE SCORING (dark broadcast)
   ============================================================ */
const BALLS=[['Red','#c0392b',1],['Yellow','#f2c200',2],['Green','#1e7a3d',3],['Brown','#7a4a1e',4],['Blue','#1f5fa8',5],['Pink','#e86a92',6],['Black','#161616',7]];
const SC={
  round:'Quarter-final', bo:9,
  p:[ {n:'A. Mehmood',cc:'PAK',seed:5,frames:4,pts:62,hi:81}, {n:'J. Trump',cc:'ENG',seed:4,frames:3,pts:17,hi:75} ],
  active:0, brk:0, frameNo:8,
  hist:[],
};
function snapshot(){ SC.hist.push(JSON.stringify({p:SC.p,active:SC.active,brk:SC.brk,frameNo:SC.frameNo})); if(SC.hist.length>40)SC.hist.shift(); }
function buildScorer(){
  const need=ftw(SC.bo);
  const won = SC.p[0].frames>=need ? 0 : SC.p[1].frames>=need ? 1 : null;
  const panel=(i)=>{
    const p=SC.p[i], on=SC.active===i && won===null;
    return `<div class="relative rounded-xl p-5 ${on?'bg-felt-900 ring-2 ring-felt':'bg-panel2'} transition">
      ${on?'<span class="absolute top-3 right-3 badge bg-felt text-white !text-[9px]"><span class="dot pulse"></span>At table</span>':''}
      <div class="flex items-center gap-3 mb-3">
        <div class="w-11 h-11 rounded-full ${i===0?'bg-felt':'bg-panel'} grid place-items-center font-display font-extrabold text-white ring-2 ${i===0?'ring-brass':'ring-white/20'}">${inits(p.n)}</div>
        <div><div class="font-display font-bold text-white text-[18px] leading-none">${p.n}</div><div class="flex items-center gap-1.5 text-[12px] text-ink-400 mt-1">${flag(p.cc,18,12)}${p.cc} · seed ${p.seed}</div></div>
        <div class="ml-auto text-center"><div class="seclabel text-ink-500 !text-[9px]">Frames</div><div class="font-display font-extrabold text-white text-[34px] leading-none tabular-nums" id="fr-${i}">${p.frames}</div></div>
      </div>
      <div class="rounded-lg bg-black/30 p-4 text-center">
        <div class="seclabel text-ink-500 !text-[9px]">Frame points</div>
        <div class="font-display font-extrabold ${on?'text-brass':'text-white'} text-[64px] leading-none tabular-nums" id="pts-${i}">${p.pts}</div>
      </div>
      <div class="grid grid-cols-2 gap-2 mt-3">
        <div class="rounded-md bg-black/20 px-3 py-2"><div class="seclabel text-ink-500 !text-[9px]">Break</div><div class="font-display font-bold text-[20px] tabular-nums ${on&&SC.brk>0?'text-live':'text-white'}">${on?SC.brk:0}</div></div>
        <div class="rounded-md bg-black/20 px-3 py-2"><div class="seclabel text-ink-500 !text-[9px]">High break</div><div class="font-display font-bold text-[20px] tabular-nums text-brass">${p.hi}</div></div>
      </div>
    </div>`;
  };

  const ballBtns = BALLS.map(([name,col,val])=>`<button onclick="ball(${val})" ${won!==null?'disabled':''} class="group flex flex-col items-center gap-1" title="${name} (${val})">
      <span class="w-12 h-12 rounded-full grid place-items-center font-display font-extrabold text-white text-[15px] shadow-lg group-active:scale-90 transition" style="background:${col};box-shadow:inset -3px -4px 7px rgba(0,0,0,.45),0 3px 8px rgba(0,0,0,.4)">${val}</span>
    </button>`).join('');

  const onName = SC.p[SC.active].n;
  const controls = won!==null ? `
    <div class="rounded-xl bg-felt-900 ring-2 ring-brass p-5 text-center">
      <div class="seclabel text-brass mb-1">Match complete</div>
      <div class="font-display font-extrabold text-white text-2xl">${SC.p[won].n} wins ${SC.p[won].frames}–${SC.p[1-won].frames}</div>
      <button onclick="resetScorer()" class="btn btn-brass btn-sm mt-4">Reset demo</button>
    </div>` : `
    <div class="rounded-xl bg-panel2 p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="text-[13px] text-ink-300">On table: <b class="text-white">${onName}</b></div>
        <button onclick="undo()" class="btn btn-sm bg-white/10 text-white hover:bg-white/20"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1015-6.7L21 8"/><path d="M21 3v5h-5"/></svg>Undo</button>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-2.5 mb-4">${ballBtns}</div>
      <div class="grid grid-cols-3 gap-2.5">
        <button onclick="foul()" class="btn bg-white/10 text-white hover:bg-white/20">Foul +4</button>
        <button onclick="switchPlayer()" class="btn bg-white/10 text-white hover:bg-white/20"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/></svg>End break / switch</button>
        <button onclick="endFrame()" class="btn btn-brass">End frame ▸</button>
      </div>
    </div>`;

  return `
    <div class="px-6 py-4 flex items-center gap-3 border-b border-hairline-d">
      <span class="font-display font-extrabold text-white uppercase tracking-tight text-[15px]">Snooker<span class="text-live">PK</span></span>
      <span class="badge bg-live-fill text-white"><span class="dot pulse"></span>Live</span>
      <div class="text-[13px] text-ink-300">${SC.round} · <b class="text-white">Frame ${SC.frameNo}</b> · Best of ${SC.bo}</div>
      <div class="ml-auto flex items-center gap-2 text-[12px] text-ink-400"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>Streaming · Table 1</div>
    </div>
    <div class="p-6">
      <div class="grid md:grid-cols-2 gap-4 mb-4">${panel(0)}${panel(1)}</div>
      ${controls}
      <div class="text-center mt-3 text-[11px] text-ink-500">Pot a ball to add to the current break · “End break / switch” passes the table · “End frame” awards the frame to the higher score</div>
    </div>`;
}
function renderScorer(){ document.getElementById('scorer').innerHTML = buildScorer(); }
function ball(v){ snapshot(); const p=SC.p[SC.active]; p.pts+=v; SC.brk+=v; if(SC.brk>p.hi)p.hi=SC.brk; renderScorer(); pulsePts(SC.active); }
function foul(){ snapshot(); SC.p[1-SC.active].pts+=4; SC.brk=0; renderScorer(); pulsePts(1-SC.active); }
function switchPlayer(){ snapshot(); SC.brk=0; SC.active=1-SC.active; renderScorer(); }
function endFrame(){ snapshot(); const w=SC.p[0].pts>=SC.p[1].pts?0:1; SC.p[w].frames++; SC.p[0].pts=0; SC.p[1].pts=0; SC.brk=0; SC.frameNo++; SC.active=1-w; renderScorer(); }
function undo(){ if(!SC.hist.length) return; const s=JSON.parse(SC.hist.pop()); SC.p=s.p; SC.active=s.active; SC.brk=s.brk; SC.frameNo=s.frameNo; renderScorer(); }
function resetScorer(){ SC.p=[ {n:'A. Mehmood',cc:'PAK',seed:5,frames:4,pts:62,hi:81}, {n:'J. Trump',cc:'ENG',seed:4,frames:3,pts:17,hi:75} ]; SC.active=0; SC.brk=0; SC.frameNo=8; SC.hist=[]; renderScorer(); }
function pulsePts(i){ const el=document.getElementById('pts-'+i); if(el){ el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } }
function loadScorer(id){ /* in a real app would load match `id`; demo uses the live QF */ document.getElementById('scorer').scrollIntoView({behavior:'smooth'}); }

/* ============================================================
   INIT
   ============================================================ */
document.querySelectorAll('[data-sidebar]').forEach(el=>{ el.innerHTML = sidebar(el.getAttribute('data-sidebar')); });
document.querySelectorAll('[data-topbar]').forEach(el=>{ el.outerHTML = topbar(el.getAttribute('data-topbar')); });
renderMatches();
renderScorer();
