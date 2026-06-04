/* ============================================================
   SnookerPK · Umpire Scoreboard — snooker rules engine + renderer
   Phases: 'reds' (red on) → 'colour' (any colour on, after a red)
           → 'clearing' (colours in sequence Y G Br Bl P Bk)
   ============================================================ */
const BALL = {
  1:['Red','#c0392b','#fff'], 2:['Yellow','#f2c200','#3a2c08'], 3:['Green','#1e7a3d','#fff'],
  4:['Brown','#7a4a1e','#fff'], 5:['Blue','#1f5fa8','#fff'], 6:['Pink','#e86a92','#fff'], 7:['Black','#161616','#fff'],
};
const CLR_SEQ = [2,3,4,5,6,7];          // yellow→black
const ftw = bo => Math.ceil(bo/2);
function inits(n){ return n.split(' ').map(x=>x[0]).join('').replace(/\./g,'').slice(0,2); }
function flag(cc,w=20,h=13){ const b={PAK:`<i style="background:#016d31"></i><i style="background:#fff;flex:0 0 ${Math.round(w*0.3)}px"></i>`,ENG:`<i style="background:#fff"></i>`,CHN:`<i style="background:#de2910"></i>`}; return `<span class="fg" style="width:${w}px;height:${h}px">${b[cc]||b.PAK}</span>`; }
const brkTotal = brk => brk.reduce((a,v)=>a+v,0);
const mmss = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

/* ---- legal-ball logic ---- */
function expected(s){
  if(s.phase==='reds') return {kind:'red', label:'RED', balls:[1]};
  if(s.phase==='colour') return {kind:'colour', label:'COLOUR', balls:CLR_SEQ};
  // clearing — only the on colour
  return {kind:'clear', label:BALL[s.clearOn][0], balls:[s.clearOn]};
}
function isLegal(s,v){ return expected(s).balls.includes(v); }

/* ============================================================
   ENGINE (mutating actions on a state object)
   ============================================================ */
function actPot(s,v){
  if(!isLegal(s,v)) return;
  const p=s.players[s.active];
  if(s.phase==='reds' && v===1){
    p.pts+=1; s.brk.push(1); s.reds-=1; s.phase='colour';
  } else if(s.phase==='colour'){
    p.pts+=v; s.brk.push(v);
    s.phase = s.reds>0 ? 'reds' : 'clearing';
    if(s.phase==='clearing') s.clearOn=2;
  } else if(s.phase==='clearing' && v===s.clearOn){
    p.pts+=v; s.brk.push(v);
    if(v===7){ bankHi(s); s.frameOver=true; resolveFrameWinner(s); return; }
    s.clearOn = CLR_SEQ[CLR_SEQ.indexOf(v)+1];
  }
  if(brkTotal(s.brk)>p.hi) p.hi=brkTotal(s.brk);
}
function bankHi(s){ const p=s.players[s.active]; const t=brkTotal(s.brk); if(t>p.hi)p.hi=t; }
function actEndTurn(s){
  bankHi(s); s.brk=[]; s.active=1-s.active;
  s.phase = s.reds>0 ? 'reds' : 'clearing';
  if(s.phase==='clearing' && !s.clearOn) s.clearOn=2;
}
function actFoul(s,val,giveBack){
  s.players[1-s.active].pts += val;        // points to opponent
  s.brk=[];                                 // offender's break ends
  s.phase = s.reds>0 ? 'reds' : 'clearing';
  if(s.phase==='clearing' && !s.clearOn) s.clearOn=2;
  if(!giveBack) s.active = 1-s.active;       // turn passes unless made to play again
  s.foulOpen=false;
}
function resolveFrameWinner(s){
  const [a,b]=s.players;
  s.frameWinner = a.pts>=b.pts ? 0 : 1;
}
function actEndFrame(s){
  bankHi(s);
  if(s.frameWinner==null) resolveFrameWinner(s);
  const w=s.frameWinner;
  s.history.push({ a:s.players[0].pts, b:s.players[1].pts, hi:Math.max(s.frameHiByEnd(0),0), winner:w,
                   topBreak:s.players[w].frameHi||0 });
  s.players[w].frames+=1;
  s.frameOver=true;
  // match decided?
  if(s.players[w].frames>=ftw(s.bo)) s.matchOver=true;
}
function actStartNext(s,breaker){
  s.players.forEach(p=>{p.pts=0;});
  s.reds=15; s.phase='reds'; s.clearOn=2; s.brk=[];
  s.frameNo+=1; s.active=breaker; s.frameOver=false; s.frameWinner=null;
}

/* ============================================================
   RENDERER
   ============================================================ */
function ballBtn(s,v,frozen){
  const [name,col,txt]=BALL[v]; const legal=isLegal(s,v) && !s.foulOpen && !s.frameOver && !s.matchOver;
  const click = frozen?'' : `onclick="LV.pot(${v})"`;
  return `<button ${click} ${legal?'':'disabled'} title="${name} (${v})"
    class="ballbtn relative grid place-items-center rounded-full font-display font-extrabold transition ${legal?'hover:brightness-110 active:scale-90 cursor-pointer':'opacity-25 grayscale cursor-not-allowed'}"
    style="width:72px;height:72px;background:${col};color:${txt}">
    <span style="font-size:22px">${v}</span>
    ${legal && expected(s).balls.length===1 ? '<span class="absolute -inset-1 rounded-full ring-2 ring-white/80 pulse"></span>':''}
  </button>`;
}
function playerPanel(s,i){
  const p=s.players[i]; const active = s.active===i && !s.frameOver && !s.matchOver;
  const side = i===0?'left':'right';
  return `<div class="relative rounded-2xl p-5 ${active?'bg-felt-900 activeglow':'bg-panel2 border border-hairline-d'} transition">
    ${active?'<span class="absolute top-4 '+(side==='left'?'right-4':'left-4')+' badge bg-felt text-white !text-[9px]"><span class="dot pulse"></span>At table</span>':''}
    <div class="flex items-center gap-3 ${side==='right'?'flex-row-reverse text-right':''}">
      <div class="w-12 h-12 rounded-full ${i===0?'bg-felt':'bg-panel'} grid place-items-center font-display font-extrabold text-white text-lg ring-2 ${i===0?'ring-brass':'ring-white/15'} shrink-0">${inits(p.n)}</div>
      <div class="${side==='right'?'items-end':''} flex flex-col">
        <div class="font-display font-bold text-white text-[19px] leading-none">${p.n}</div>
        <div class="flex items-center gap-1.5 text-[12px] text-ink-400 mt-1.5 ${side==='right'?'flex-row-reverse':''}">${flag(p.cc,18,12)}<span>${p.cc} · ${p.tier} · seed ${p.seed}</span></div>
      </div>
    </div>
    <div class="rounded-xl bg-black/35 mt-4 py-4 text-center">
      <div class="seclabel text-ink-500 !text-[9px]">Frame points</div>
      <div class="font-display font-extrabold ${active?'text-brass':'text-white'} leading-none tabular-nums" style="font-size:76px">${p.pts}</div>
    </div>
    <div class="grid grid-cols-2 gap-2.5 mt-3">
      <div class="rounded-lg bg-black/25 px-3 py-2.5 text-center"><div class="seclabel text-ink-500 !text-[9px]">Break</div><div class="font-display font-bold tabular-nums leading-none mt-1 ${active&&brkTotal(s.brk)>0?'text-live':'text-white'}" style="font-size:24px">${active?brkTotal(s.brk):0}</div></div>
      <div class="rounded-lg bg-black/25 px-3 py-2.5 text-center"><div class="seclabel text-ink-500 !text-[9px]">High this frame</div><div class="font-display font-bold tabular-nums leading-none mt-1 text-brass" style="font-size:24px">${p.frameHi||0}</div></div>
    </div>
  </div>`;
}
function breakStrip(s){
  const dots = s.brk.length
    ? s.brk.map(v=>{const[n,c,t]=BALL[v];return `<span class="grid place-items-center rounded-full font-display font-bold text-[11px] dropin" style="width:26px;height:26px;background:${c};color:${t};box-shadow:inset -2px -2px 4px rgba(0,0,0,.5)">${v}</span>`;}).join('<span class="text-ink-500 mx-0.5">·</span>')
    : '<span class="text-ink-500 text-[13px]">No balls potted this visit</span>';
  return `<div class="rounded-xl bg-panel2 border border-hairline-d px-4 py-3 flex items-center gap-3">
    <span class="seclabel text-ink-400 !text-[9px] shrink-0">This visit</span>
    <div class="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">${dots}</div>
    <div class="text-right shrink-0"><div class="seclabel text-ink-500 !text-[9px]">Break</div><div class="font-display font-extrabold text-live text-[26px] leading-none tabular-nums">${brkTotal(s.brk)}</div></div>
  </div>`;
}
function expectedIndicator(s){
  const e=expected(s);
  let glyphs;
  if(e.kind==='red') glyphs=`<span class="grid place-items-center rounded-full font-display font-bold text-[13px]" style="width:34px;height:34px;background:${BALL[1][1]};color:#fff;box-shadow:inset -3px -3px 5px rgba(0,0,0,.5)">1</span>`;
  else if(e.kind==='colour') glyphs=CLR_SEQ.map(v=>`<span class="grid place-items-center rounded-full font-display font-bold text-[10px]" style="width:22px;height:22px;background:${BALL[v][1]};color:${BALL[v][2]}">${v}</span>`).join('');
  else { const[n,c,t]=BALL[s.clearOn]; glyphs=`<span class="grid place-items-center rounded-full font-display font-bold text-[13px]" style="width:34px;height:34px;background:${c};color:${t};box-shadow:inset -3px -3px 5px rgba(0,0,0,.5)">${s.clearOn}</span>`; }
  const phaseLabel = s.phase==='clearing' ? 'Colours clearing' : s.phase==='colour' ? 'Colour after red' : 'Reds & colours';
  return `<div class="rounded-xl bg-gradient-to-r from-felt-900 to-panel2 border border-felt-700 px-5 py-3.5 flex items-center gap-4">
    <div><div class="seclabel text-felt-400 !text-[9px]">On</div><div class="font-display font-extrabold text-white uppercase leading-none mt-0.5" style="font-size:26px;letter-spacing:.02em">${e.label}</div></div>
    <div class="flex items-center gap-1.5 ml-1">${glyphs}</div>
    <div class="ml-auto text-right">
      <div class="seclabel text-ink-500 !text-[9px]">${phaseLabel}</div>
      <div class="flex items-center gap-2 justify-end mt-1">
        <span class="grid place-items-center rounded-full font-display font-bold text-[11px]" style="width:22px;height:22px;background:${BALL[1][1]};color:#fff">●</span>
        <span class="font-display font-extrabold text-white text-[22px] tabular-nums leading-none">${s.reds}</span>
        <span class="text-ink-400 text-[12px]">reds left</span>
      </div>
    </div>
  </div>`;
}
function foulOverlay(s,frozen){
  const click=v=>frozen?'':`onclick="LV.foulPick(${v})"`;
  const opt=(v,label)=>`<button ${click(v)} class="rounded-lg border-2 ${s.foulVal===v?'border-bad bg-bad/15 text-white':'border-hairline-d text-ink-200 hover:border-ink-500'} py-3 font-display font-bold text-[18px] transition">+${v}<span class="block text-[10px] font-sans font-medium text-ink-400 normal-case tracking-normal">${label}</span></button>`;
  const decided = s.foulVal!=null;
  return `<div class="absolute inset-0 z-20 bg-night/85 backdrop-blur-sm grid place-items-center p-8">
    <div class="bg-panel rounded-2xl border border-hairline-d shadow-2xl w-full max-w-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-hairline-d flex items-center gap-3">
        <span class="badge bg-bad text-white"><span class="dot"></span>Foul</span>
        <span class="text-white font-display font-bold text-[17px]">Award points to ${s.players[1-s.active].n}</span>
        <button ${frozen?'':'onclick="LV.foulCancel()"'} class="ml-auto w-8 h-8 rounded-md grid place-items-center text-ink-400 hover:bg-panel2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
      <div class="p-6">
        <div class="seclabel text-ink-400 mb-2">Foul value</div>
        <div class="grid grid-cols-4 gap-2.5 mb-2">${opt(4,'min / low')}${opt(5,'blue')}${opt(6,'pink')}${opt(7,'black')}</div>
        <button ${frozen?'':'onclick="LV.foulPick(0)"'} class="w-full rounded-lg border-2 ${s.foulVal===0?'border-bad bg-bad/15 text-white':'border-hairline-d text-ink-300 hover:border-ink-500'} py-2.5 font-display font-semibold text-[13px] transition">Custom value…</button>

        <div class="mt-5 pt-5 border-t border-hairline-d ${decided?'':'opacity-40 pointer-events-none'}">
          <div class="text-white font-display font-bold text-[15px] mb-1">Give turn back to ${s.players[s.active].n}?</div>
          <div class="text-ink-400 text-[12.5px] mb-3">The non-offender may ask the fouling player to play again.</div>
          <div class="grid grid-cols-2 gap-2.5">
            <button ${frozen?'':'onclick="LV.foulApply(true)"'} class="btn bg-felt text-white hover:bg-felt-700 py-3">Yes — play again</button>
            <button ${frozen?'':'onclick="LV.foulApply(false)"'} class="btn bg-panel2 border border-hairline-d text-white hover:bg-panel py-3">No — pass turn</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}
function frameEndOverlay(s,frozen){
  const w=s.frameWinner, lp=s.players[1-w], wp=s.players[w];
  const nextBreaker = 1-s.active; // alternate default
  return `<div class="absolute inset-0 z-20 bg-night/88 backdrop-blur-sm grid place-items-center p-8">
    <div class="bg-panel rounded-2xl border border-brass/40 shadow-2xl w-full max-w-xl overflow-hidden">
      <div class="px-6 py-4 bg-gradient-to-r from-felt-900 to-panel2 border-b border-hairline-d flex items-center gap-3">
        <span class="badge bg-brass text-[#3a2c08]">Frame ${s.frameNo}</span><span class="text-white font-display font-bold text-[16px]">Frame complete</span>
      </div>
      <div class="p-6 text-center">
        <div class="seclabel text-ink-400">Winner</div>
        <div class="font-display font-extrabold text-white text-[30px] leading-none mt-1">${wp.n}</div>
        <div class="font-display font-extrabold text-brass tabular-nums mt-3" style="font-size:54px;line-height:1">${wp.pts} <span class="text-ink-500">–</span> ${lp.pts}</div>
        <div class="flex items-center justify-center gap-6 mt-4 text-[13px]">
          <div><span class="text-ink-400">High break&nbsp;</span><b class="text-white">${wp.frameHi}</b> <span class="text-ink-500">(${wp.n})</span></div>
          <div><span class="text-ink-400">Frames&nbsp;</span><b class="text-white tabular-nums">${s.players[0].frames}–${s.players[1].frames}</b></div>
        </div>
        <div class="mt-6 pt-5 border-t border-hairline-d">
          <div class="text-ink-300 text-[13px] mb-3">Who breaks off next frame? <span class="text-ink-500">(default: alternate)</span></div>
          <div class="grid grid-cols-2 gap-2.5 max-w-sm mx-auto">
            <button ${frozen?'':`onclick="LV.startNext(${nextBreaker})"`} class="btn bg-felt text-white hover:bg-felt-700 py-3">${s.players[nextBreaker].n} ▸</button>
            <button ${frozen?'':`onclick="LV.startNext(${s.active})"`} class="btn bg-panel2 border border-hairline-d text-white hover:bg-panel py-3">${s.players[s.active].n}</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}
function matchOverOverlay(s,frozen){
  const w=s.frameWinner!=null && s.players[s.frameWinner].frames>=ftw(s.bo)?s.frameWinner:(s.players[0].frames>s.players[1].frames?0:1);
  const wp=s.players[w], lp=s.players[1-w];
  const rows=s.history.map((h,i)=>`<div class="flex items-center justify-between px-3 py-1.5 ${i%2?'bg-white/5':''} rounded"><span class="text-ink-400 text-[12px] font-display font-semibold">F${i+1}</span><span class="font-display font-bold text-white tabular-nums text-[13px]">${h.a}–${h.b}</span><span class="text-brass text-[11px] tabular-nums">${h.topBreak?'('+h.topBreak+')':''}</span></div>`).join('');
  return `<div class="absolute inset-0 z-20 bg-night/92 backdrop-blur-sm grid place-items-center p-8">
    <div class="bg-panel rounded-2xl border border-brass/50 shadow-2xl w-full max-w-2xl overflow-hidden">
      <div class="px-6 py-4 bg-gradient-to-r from-felt to-felt-900 flex items-center gap-3"><span class="badge bg-brass text-[#3a2c08]">Match complete</span><span class="text-white/80 font-display font-semibold text-[13px]">${s.round} · best of ${s.bo}</span></div>
      <div class="p-6 grid md:grid-cols-[1fr_220px] gap-6">
        <div class="text-center md:text-left">
          <div class="seclabel text-ink-400">Winner</div>
          <div class="flex items-center gap-3 mt-2 justify-center md:justify-start">
            <div class="w-14 h-14 rounded-full bg-felt grid place-items-center font-display font-extrabold text-white text-xl ring-2 ring-brass">${inits(wp.n)}</div>
            <div><div class="font-display font-extrabold text-white text-[26px] leading-none">${wp.n}</div><div class="flex items-center gap-1.5 text-[12px] text-ink-400 mt-1.5">${flag(wp.cc,18,12)}${wp.cc} · ${wp.tier}</div></div>
          </div>
          <div class="font-display font-extrabold text-brass tabular-nums mt-4" style="font-size:60px;line-height:1">${wp.frames}<span class="text-ink-500"> – </span>${lp.frames}</div>
          <div class="text-ink-400 text-[13px] mt-1">def. ${lp.n}</div>
          <button ${frozen?'':'onclick="LV.reset()"'} class="btn bg-felt text-white hover:bg-felt-700 mt-5">Confirm &amp; submit result</button>
        </div>
        <div class="rounded-xl bg-black/30 p-3">
          <div class="seclabel text-ink-400 mb-2 px-1">Frame history</div>
          <div class="space-y-0.5">${rows}</div>
        </div>
      </div>
    </div>
  </div>`;
}
function historyRail(s){
  const cells=s.history.length
    ? s.history.map((h,i)=>`<div class="shrink-0 rounded-lg ${h.winner===0?'':'flex-row-reverse'} bg-panel2 border border-hairline-d px-3 py-2 min-w-[104px]">
        <div class="seclabel text-ink-500 !text-[9px]">Frame ${i+1}</div>
        <div class="font-display font-bold text-white tabular-nums text-[15px] mt-0.5">${h.a}<span class="text-ink-500">–</span>${h.b}</div>
        ${h.topBreak?`<div class="text-brass text-[10.5px] tabular-nums">break ${h.topBreak}</div>`:'<div class="text-ink-500 text-[10.5px]">&nbsp;</div>'}
      </div>`).join('')
    : '<span class="text-ink-500 text-[12px] py-2">No completed frames yet</span>';
  return `<div class="flex items-center gap-2.5">
    <span class="seclabel text-ink-400 !text-[9px] shrink-0">History</span>
    <div class="flex items-center gap-2 overflow-x-auto flex-1">${cells}</div>
  </div>`;
}

function render(s,frozen){
  const need=ftw(s.bo);
  const topbar=`<div class="flex items-center gap-4 px-6 h-[60px] bg-night border-b border-hairline-d shrink-0">
    <span class="font-display font-extrabold text-white uppercase tracking-tight text-[15px]">Snooker<span class="text-live">PK</span></span>
    <span class="badge bg-brass/20 text-brass !text-[9px]">Umpire</span>
    <div class="text-[12.5px] text-ink-400 hidden sm:block">${s.tournament} · <b class="text-ink-200">${s.round}</b> · best of ${s.bo}</div>
    <div class="mx-auto flex items-center gap-3">
      <span class="font-display font-bold text-white text-[15px]">${s.players[0].n}</span>
      <span class="font-display font-extrabold text-white tabular-nums text-[22px] px-3 py-0.5 rounded-md bg-panel2">${s.players[0].frames} <span class="text-ink-500">—</span> ${s.players[1].frames}</span>
      <span class="font-display font-bold text-white text-[15px]">${s.players[1].n}</span>
    </div>
    <div class="ml-auto flex items-center gap-4">
      <div class="text-right"><div class="seclabel text-ink-500 !text-[9px]">Frame</div><div class="font-display font-bold text-white text-[14px] leading-none">${s.frameNo} <span class="text-ink-500 font-medium">of ${s.bo}</span> <span class="text-ink-600">· first to ${need}</span></div></div>
      <div class="flex items-center gap-1.5 text-ink-300"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span class="font-display font-bold tabular-nums text-[15px] text-white" id="${frozen?'':'lv-timer'}">${mmss(s.timer)}</span></div>
    </div>
  </div>`;

  const center=`<div class="flex flex-col gap-3.5 min-w-0">
    ${expectedIndicator(s)}
    <div class="flex items-center justify-center gap-3 flex-wrap py-1">${[1,2,3,4,5,6,7].map(v=>ballBtn(s,v,frozen)).join('')}</div>
    ${breakStrip(s)}
    <div class="grid grid-cols-3 gap-3 mt-auto">
      <button ${frozen?'':'onclick="LV.endTurn()"'} ${(s.frameOver||s.matchOver)?'disabled':''} class="btn bg-panel2 border border-hairline-d text-white hover:bg-panel py-4 text-[15px] disabled:opacity-30"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/></svg>End turn</button>
      <button ${frozen?'':'onclick="LV.foulOpen()"'} ${(s.frameOver||s.matchOver)?'disabled':''} class="btn bg-bad/90 text-white hover:bg-bad py-4 text-[15px] disabled:opacity-30"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z"/></svg>Foul</button>
      <button ${frozen?'':'onclick="LV.undo()"'} class="btn bg-panel2 border border-hairline-d text-white hover:bg-panel py-4 text-[15px]"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1015-6.7L21 8"/><path d="M21 3v5h-5"/></svg>Undo</button>
    </div>
    <button ${frozen?'':'onclick="LV.endFrameBtn()"'} ${(s.frameOver||s.matchOver)?'disabled':''} class="btn w-full bg-brass text-[#3a2c08] hover:brightness-105 py-3.5 text-[15px] disabled:opacity-30">End frame ▸ record winner &amp; high break</button>
  </div>`;

  let overlay='';
  if(s.matchOver) overlay=matchOverOverlay(s,frozen);
  else if(s.frameOver) overlay=frameEndOverlay(s,frozen);
  else if(s.foulOpen) overlay=foulOverlay(s,frozen);

  return `<div class="relative h-full flex flex-col bg-night felt-grain">
    ${topbar}
    <div class="flex-1 grid grid-cols-[300px_1fr_300px] gap-4 p-4 min-h-0">
      ${playerPanel(s,0)}
      ${center}
      ${playerPanel(s,1)}
    </div>
    <div class="px-4 py-3 border-t border-hairline-d bg-night/60">${historyRail(s)}</div>
    ${overlay}
  </div>`;
}

/* helper used by engine for history high break */
function attachHelpers(s){ s.frameHiByEnd = (i)=> s.players[i].frameHi||0; return s; }

/* ============================================================
   LIVE STATE + CONTROLLER
   ============================================================ */
function freshFrameHi(s){ // track per-frame top break separately from rolling hi
  s.players.forEach(p=>{ if(p.frameHi==null)p.frameHi=0; });
}
function newMatch(){
  return attachHelpers({
    tournament:'Karachi National Open ’26', round:'Quarter-final', bo:9,
    players:[ {n:'M. Asif',cc:'PAK',tier:'Pro',seed:1,frames:2,pts:0,hi:0,frameHi:0},
              {n:'S. Khan',cc:'PAK',tier:'Pro',seed:2,frames:1,pts:0,hi:0,frameHi:0} ],
    active:0, reds:15, phase:'reds', clearOn:2, brk:[],
    frameNo:4, timer:1287, history:[
      {a:66,b:7,winner:0,topBreak:54},{a:53,b:78,winner:1,topBreak:51},{a:71,b:44,winner:0,topBreak:0}
    ],
    foulOpen:false, foulVal:null, frameOver:false, frameWinner:null, matchOver:false,
  });
}
let LIVE = newMatch();
freshFrameHi(LIVE);
let UNDO=[];
function snap(){ UNDO.push(JSON.stringify({...LIVE,frameHiByEnd:undefined})); if(UNDO.length>60)UNDO.shift(); }
function restore(o){ LIVE=attachHelpers(o); }

const LV = {
  pot(v){ snap(); const before=LIVE.players[LIVE.active].frameHi||0; actPot(LIVE,v);
    // track per-frame top break
    const t=brkTotal(LIVE.brk); const p=LIVE.players[LIVE.active]; if(t>(p.frameHi||0))p.frameHi=t;
    renderLive(); const el=document.getElementById('pts-'+LIVE.active); },
  endTurn(){ snap(); actEndTurn(LIVE); renderLive(); },
  foulOpen(){ snap(); LIVE.foulOpen=true; LIVE.foulVal=null; renderLive(); },
  foulPick(v){ LIVE.foulVal=v; renderLive(); },
  foulCancel(){ LIVE.foulOpen=false; LIVE.foulVal=null; renderLive(); },
  foulApply(giveBack){ const v=LIVE.foulVal||4; actFoul(LIVE,v,giveBack); LIVE.foulVal=null; renderLive(); },
  endFrameBtn(){ snap(); bankHi(LIVE); if(LIVE.frameWinner==null) resolveFrameWinner(LIVE);
    const w=LIVE.frameWinner; LIVE.history.push({a:LIVE.players[0].pts,b:LIVE.players[1].pts,winner:w,topBreak:LIVE.players[w].frameHi||0});
    LIVE.players[w].frames+=1; LIVE.frameOver=true;
    if(LIVE.players[w].frames>=ftw(LIVE.bo)) LIVE.matchOver=true; renderLive(); },
  startNext(breaker){ snap(); actStartNext(LIVE,breaker); LIVE.players.forEach(p=>p.frameHi=0); renderLive(); },
  undo(){ if(UNDO.length){ restore(JSON.parse(UNDO.pop())); freshFrameHi(LIVE); renderLive(); } },
  reset(){ LIVE=newMatch(); freshFrameHi(LIVE); UNDO=[]; renderLive(); },
};
function renderLive(){ document.getElementById('live').innerHTML = render(LIVE,false); }

/* timer */
setInterval(()=>{ if(LIVE.matchOver) return; LIVE.timer++; const el=document.getElementById('lv-timer'); if(el) el.textContent=mmss(LIVE.timer); },1000);

/* ============================================================
   FIVE ANNOTATED FROZEN STATES
   ============================================================ */
function base(){ return attachHelpers(JSON.parse(JSON.stringify({
  tournament:'Karachi National Open ’26', round:'Quarter-final', bo:9,
  players:[ {n:'M. Asif',cc:'PAK',tier:'Pro',seed:1,frames:2,pts:54,hi:54,frameHi:54},
            {n:'S. Khan',cc:'PAK',tier:'Pro',seed:2,frames:1,pts:8,hi:32,frameHi:0} ],
  active:0, reds:9, phase:'reds', clearOn:2, brk:[1,7,1,6],
  frameNo:4, timer:1322, history:[{a:66,b:7,winner:0,topBreak:54},{a:53,b:78,winner:1,topBreak:51},{a:71,b:44,winner:0,topBreak:0}],
  foulOpen:false, foulVal:null, frameOver:false, frameWinner:null, matchOver:false,
}))); }

const STATES=[
  { title:'Active turn — Red expected', desc:'It’s <b>M. Asif</b> at the table (felt glow). Only <b>Red</b> is tappable; every colour is dimmed and locked. The break strip shows this visit in order — <b>R · Bk · R · Pk = 15</b> — and the running break total reads live. <b>9 reds</b> remain.', make:()=>{const s=base(); s.phase='reds'; s.brk=[1,7,1,6]; s.players[0].pts=54; s.players[0].frameHi=54; return s;} },
  { title:'Colours-clearing phase', desc:'All reds are gone, so the frame is in the <b>colours sequence</b>. Only the <b>on</b> colour — here <b>Brown (4)</b>, with yellow &amp; green already cleared — is enabled; the rest are locked. The on-ball pulses with a white ring so the referee can’t miss it.', make:()=>{const s=base(); s.reds=0; s.phase='clearing'; s.clearOn=4; s.active=1; s.brk=[2,3]; s.players[1].pts=63; s.players[1].frameHi=46; s.players[0].pts=58; return s;} },
  { title:'Foul flow', desc:'<b>Foul</b> opens a focused overlay: pick the value (<b>4/5/6/7</b> or custom), points go to the opponent, then the referee answers <b>“Give turn back to the fouling player?”</b> — Yes makes the offender play again, No passes the turn. Everything behind it is locked until resolved.', make:()=>{const s=base(); s.foulOpen=true; s.foulVal=5; s.active=0; return s;} },
  { title:'Frame-end confirmation', desc:'When the frame is decided the referee confirms the <b>winner, the frame score and the high break</b> — exactly the data the public sees after completion — then chooses who <b>breaks off</b> next (default: alternate).', make:()=>{const s=base(); s.frameOver=true; s.frameWinner=0; s.players[0].pts=78; s.players[1].pts=41; s.players[0].frameHi=62; s.players[0].frames=3; s.active=0; return s;} },
  { title:'Match complete', desc:'Reaching <b>first to 5</b> ends the match. The summary shows the <b>final frames score</b>, the winner, and the full <b>frame history</b> with per-frame scores and top breaks — ready to submit as the official result.', make:()=>{const s=base(); s.matchOver=true; s.frameWinner=0; s.players[0].frames=5; s.players[1].frames=3; s.frameNo=8;
      s.history=[{a:66,b:7,winner:0,topBreak:54},{a:53,b:78,winner:1,topBreak:51},{a:71,b:44,winner:0,topBreak:38},{a:12,b:74,winner:1,topBreak:60},{a:88,b:20,winner:0,topBreak:71},{a:33,b:69,winner:1,topBreak:44},{a:81,b:28,winner:0,topBreak:55},{a:70,b:30,winner:0,topBreak:48}]; return s;} },
];
function buildStates(){
  const SCALE=0.66; const W=1180*SCALE, H=724*SCALE;
  document.getElementById('states').innerHTML = STATES.map((st,i)=>`
    <div class="grid lg:grid-cols-[${Math.round(W)}px_1fr] gap-6 items-center">
      <div class="tablet-bezel justify-self-center" style="padding:12px">
        <div class="snap-wrap bg-night" style="width:${W}px;height:${H}px">
          <div class="board" style="transform:scale(${SCALE});transform-origin:top left">${render(attachHelpers(st.make()),true)}</div>
        </div>
      </div>
      <div>
        <div class="annot"><span class="num">${i+1}</span><div><div class="font-display font-bold text-white text-[15px] uppercase tracking-wide mb-1.5">${st.title}</div>${st.desc}</div></div>
      </div>
    </div>`).join('');
}

/* ---- init ---- */
renderLive();
buildStates();
