/* ============================================================
   SnookerPK · Umpire Scoreboard — MOBILE (phone portrait)
   Reuses the rules engine, BALL meta, expected()/isLegal(),
   LV controller and LIVE/STATES from umpire.js.
   ============================================================ */

function mPlayerPanel(s,i){
  const p=s.players[i]; const active = s.active===i && !s.frameOver && !s.matchOver;
  return `<div class="relative rounded-xl p-3 ${active?'bg-felt-900 activeglow':'bg-panel2 border border-hairline-d'} transition">
    ${active?'<span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-felt-400 pulse"></span>':''}
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-full ${i===0?'bg-felt':'bg-panel'} grid place-items-center font-display font-extrabold text-white text-[12px] ring-1 ${i===0?'ring-brass':'ring-white/15'} shrink-0">${inits(p.n)}</div>
      <div class="min-w-0">
        <div class="font-display font-bold text-white text-[13px] leading-none truncate">${p.n}</div>
        <div class="flex items-center gap-1 text-[10px] text-ink-400 mt-1">${flag(p.cc,15,10)}<span>${p.tier}</span></div>
      </div>
    </div>
    <div class="text-center mt-2">
      <div class="font-display font-extrabold ${active?'text-brass':'text-white'} leading-none tabular-nums" style="font-size:50px">${p.pts}</div>
    </div>
    <div class="grid grid-cols-2 gap-1.5 mt-2">
      <div class="rounded-md bg-black/25 px-1.5 py-1.5 text-center"><div class="seclabel text-ink-500 !text-[8px] !tracking-[.1em]">Break</div><div class="font-display font-bold tabular-nums leading-none mt-0.5 text-[15px] ${active&&brkTotal(s.brk)>0?'text-live':'text-white'}">${active?brkTotal(s.brk):0}</div></div>
      <div class="rounded-md bg-black/25 px-1.5 py-1.5 text-center"><div class="seclabel text-ink-500 !text-[8px] !tracking-[.1em]">High</div><div class="font-display font-bold tabular-nums leading-none mt-0.5 text-[15px] text-brass">${p.frameHi||0}</div></div>
    </div>
  </div>`;
}
function mExpected(s){
  const e=expected(s);
  let glyph;
  if(e.kind==='red') glyph=`<span class="grid place-items-center rounded-full font-display font-bold text-[12px]" style="width:28px;height:28px;background:${BALL[1][1]};color:#fff;box-shadow:inset -2px -2px 4px rgba(0,0,0,.5)">1</span>`;
  else if(e.kind==='colour') glyph=`<span class="flex -space-x-1">${[2,3,4,5,6,7].map(v=>`<span class="grid place-items-center rounded-full font-display font-bold text-[9px] ring-1 ring-night" style="width:18px;height:18px;background:${BALL[v][1]};color:${BALL[v][2]}">${v}</span>`).join('')}</span>`;
  else { const[n,c,t]=BALL[s.clearOn]; glyph=`<span class="grid place-items-center rounded-full font-display font-bold text-[12px]" style="width:28px;height:28px;background:${c};color:${t};box-shadow:inset -2px -2px 4px rgba(0,0,0,.5)">${s.clearOn}</span>`; }
  return `<div class="rounded-xl bg-gradient-to-r from-felt-900 to-panel2 border border-felt-700 px-3.5 py-2.5 flex items-center gap-3">
    <div><div class="seclabel text-felt-400 !text-[8px] !tracking-[.1em]">On</div><div class="font-display font-extrabold text-white uppercase leading-none mt-0.5 text-[19px]">${e.label}</div></div>
    ${glyph}
    <div class="ml-auto flex items-center gap-1.5">
      <span class="grid place-items-center rounded-full text-[9px]" style="width:18px;height:18px;background:${BALL[1][1]};color:#fff">●</span>
      <span class="font-display font-extrabold text-white text-[18px] tabular-nums leading-none">${s.reds}</span>
      <span class="text-ink-400 text-[10px] leading-none">reds</span>
    </div>
  </div>`;
}
function mBallBtn(s,v,frozen){
  const [name,col,txt]=BALL[v]; const legal=isLegal(s,v) && !s.foulOpen && !s.frameOver && !s.matchOver;
  const click=frozen?'':`onclick="LV.pot(${v})"`;
  return `<button ${click} ${legal?'':'disabled'} title="${name} (${v})"
    class="ballbtn relative grid place-items-center rounded-full font-display font-extrabold transition mx-auto ${legal?'active:scale-90 cursor-pointer':'opacity-25 grayscale cursor-not-allowed'}"
    style="width:60px;height:60px;background:${col};color:${txt}">
    <span style="font-size:19px">${v}</span>
    ${legal && expected(s).balls.length===1 ? '<span class="absolute -inset-1 rounded-full ring-2 ring-white/80 pulse"></span>':''}
  </button>`;
}
function mBreakStrip(s){
  const dots = s.brk.length
    ? s.brk.map(v=>{const[n,c,t]=BALL[v];return `<span class="grid place-items-center rounded-full font-display font-bold text-[10px] shrink-0" style="width:22px;height:22px;background:${c};color:${t};box-shadow:inset -2px -2px 3px rgba(0,0,0,.5)">${v}</span>`;}).join('')
    : '<span class="text-ink-500 text-[11px]">No balls this visit</span>';
  return `<div class="rounded-lg bg-panel2 border border-hairline-d px-3 py-2 flex items-center gap-2">
    <span class="seclabel text-ink-400 !text-[8px] !tracking-[.1em] shrink-0">Visit</span>
    <div class="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">${dots}</div>
    <div class="font-display font-extrabold text-live text-[20px] leading-none tabular-nums shrink-0">${brkTotal(s.brk)}</div>
  </div>`;
}
function mHistory(s){
  if(!s.history.length) return '';
  return `<div class="flex items-center gap-1.5 overflow-x-auto">
    <span class="seclabel text-ink-500 !text-[8px] shrink-0">F</span>
    ${s.history.map((h,i)=>`<span class="shrink-0 rounded-md bg-panel2 border border-hairline-d px-2 py-1 font-display font-bold text-white text-[11px] tabular-nums">${i+1}<span class="text-ink-500 font-normal ml-1">${h.a}–${h.b}</span>${h.topBreak?`<span class="text-brass ml-1">${h.topBreak}</span>`:''}</span>`).join('')}
  </div>`;
}

/* overlays — phone width */
function mFoul(s,frozen){
  const click=v=>frozen?'':`onclick="LV.foulPick(${v})"`;
  const opt=(v,l)=>`<button ${click(v)} class="rounded-lg border-2 ${s.foulVal===v?'border-bad bg-bad/15 text-white':'border-hairline-d text-ink-200'} py-2.5 font-display font-bold text-[16px]">+${v}<span class="block text-[9px] font-sans font-medium text-ink-400 normal-case tracking-normal">${l}</span></button>`;
  const decided=s.foulVal!=null;
  return `<div class="absolute inset-0 z-20 bg-night/88 backdrop-blur-sm flex items-end p-3">
    <div class="bg-panel rounded-2xl border border-hairline-d w-full overflow-hidden">
      <div class="px-4 py-3 border-b border-hairline-d flex items-center gap-2">
        <span class="badge bg-bad text-white !text-[10px]"><span class="dot"></span>Foul</span>
        <span class="text-white font-display font-bold text-[14px] truncate">to ${s.players[1-s.active].n}</span>
        <button ${frozen?'':'onclick="LV.foulCancel()"'} class="ml-auto w-7 h-7 rounded-md grid place-items-center text-ink-400"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
      <div class="p-4">
        <div class="seclabel text-ink-400 mb-1.5 !text-[9px]">Foul value</div>
        <div class="grid grid-cols-4 gap-2 mb-2">${opt(4,'min')}${opt(5,'blue')}${opt(6,'pink')}${opt(7,'black')}</div>
        <button ${frozen?'':'onclick="LV.foulPick(0)"'} class="w-full rounded-lg border-2 ${s.foulVal===0?'border-bad bg-bad/15 text-white':'border-hairline-d text-ink-300'} py-2 font-display font-semibold text-[12px]">Custom…</button>
        <div class="mt-4 pt-4 border-t border-hairline-d ${decided?'':'opacity-40 pointer-events-none'}">
          <div class="text-white font-display font-bold text-[14px] mb-2.5">Give turn back to ${s.players[s.active].n}?</div>
          <div class="grid grid-cols-2 gap-2">
            <button ${frozen?'':'onclick="LV.foulApply(true)"'} class="btn bg-felt text-white py-3 text-[13px]">Play again</button>
            <button ${frozen?'':'onclick="LV.foulApply(false)"'} class="btn bg-panel2 border border-hairline-d text-white py-3 text-[13px]">Pass turn</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}
function mFrameEnd(s,frozen){
  const w=s.frameWinner, lp=s.players[1-w], wp=s.players[w]; const nb=1-s.active;
  return `<div class="absolute inset-0 z-20 bg-night/90 backdrop-blur-sm flex items-center p-4">
    <div class="bg-panel rounded-2xl border border-brass/40 w-full overflow-hidden">
      <div class="px-4 py-2.5 bg-gradient-to-r from-felt-900 to-panel2 border-b border-hairline-d flex items-center gap-2"><span class="badge bg-brass text-[#3a2c08] !text-[10px]">Frame ${s.frameNo}</span><span class="text-white font-display font-bold text-[13px]">complete</span></div>
      <div class="p-4 text-center">
        <div class="seclabel text-ink-400 !text-[9px]">Winner</div>
        <div class="font-display font-extrabold text-white text-[22px] leading-none mt-1">${wp.n}</div>
        <div class="font-display font-extrabold text-brass tabular-nums mt-2" style="font-size:40px;line-height:1">${wp.pts}<span class="text-ink-500"> – </span>${lp.pts}</div>
        <div class="text-[12px] text-ink-300 mt-2">High break <b class="text-white">${wp.frameHi}</b> · Frames <b class="text-white tabular-nums">${s.players[0].frames}–${s.players[1].frames}</b></div>
        <div class="mt-4 pt-3 border-t border-hairline-d">
          <div class="text-ink-300 text-[12px] mb-2">Who breaks next? <span class="text-ink-500">(alternate)</span></div>
          <div class="grid grid-cols-2 gap-2">
            <button ${frozen?'':`onclick="LV.startNext(${nb})"`} class="btn bg-felt text-white py-2.5 text-[13px]">${s.players[nb].n} ▸</button>
            <button ${frozen?'':`onclick="LV.startNext(${s.active})"`} class="btn bg-panel2 border border-hairline-d text-white py-2.5 text-[13px]">${s.players[s.active].n}</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}
function mMatchOver(s,frozen){
  const w=s.players[0].frames>s.players[1].frames?0:1; const wp=s.players[w], lp=s.players[1-w];
  const rows=s.history.map((h,i)=>`<div class="flex items-center justify-between px-2.5 py-1 ${i%2?'bg-white/5':''} rounded"><span class="text-ink-400 text-[11px] font-display font-semibold">F${i+1}</span><span class="font-display font-bold text-white tabular-nums text-[12px]">${h.a}–${h.b}</span><span class="text-brass text-[10px] tabular-nums">${h.topBreak?'('+h.topBreak+')':''}</span></div>`).join('');
  return `<div class="absolute inset-0 z-20 bg-night/93 backdrop-blur-sm overflow-y-auto p-4">
    <div class="bg-panel rounded-2xl border border-brass/50 w-full overflow-hidden">
      <div class="px-4 py-2.5 bg-gradient-to-r from-felt to-felt-900 flex items-center gap-2"><span class="badge bg-brass text-[#3a2c08] !text-[10px]">Match complete</span><span class="text-white/80 font-display font-semibold text-[11px]">best of ${s.bo}</span></div>
      <div class="p-4 text-center">
        <div class="seclabel text-ink-400 !text-[9px]">Winner</div>
        <div class="flex items-center gap-2.5 mt-2 justify-center">
          <div class="w-11 h-11 rounded-full bg-felt grid place-items-center font-display font-extrabold text-white ring-2 ring-brass">${inits(wp.n)}</div>
          <div class="text-left"><div class="font-display font-extrabold text-white text-[20px] leading-none">${wp.n}</div><div class="flex items-center gap-1.5 text-[11px] text-ink-400 mt-1">${flag(wp.cc,16,11)}${wp.tier}</div></div>
        </div>
        <div class="font-display font-extrabold text-brass tabular-nums mt-3" style="font-size:46px;line-height:1">${wp.frames}<span class="text-ink-500"> – </span>${lp.frames}</div>
        <div class="text-ink-400 text-[12px] mt-1">def. ${lp.n}</div>
        <div class="rounded-xl bg-black/30 p-2.5 mt-4 text-left">
          <div class="seclabel text-ink-400 !text-[9px] mb-1.5 px-1">Frame history</div>
          <div class="space-y-0.5">${rows}</div>
        </div>
        <button ${frozen?'':'onclick="LV.reset()"'} class="btn bg-felt text-white w-full mt-4 py-3 text-[14px]">Submit result</button>
      </div>
    </div>
  </div>`;
}

function renderMobile(s,frozen){
  const need=ftw(s.bo);
  let overlay='';
  if(s.matchOver) overlay=mMatchOver(s,frozen);
  else if(s.frameOver) overlay=mFrameEnd(s,frozen);
  else if(s.foulOpen) overlay=mFoul(s,frozen);
  const dis=(s.frameOver||s.matchOver)?'opacity-30 pointer-events-none':'';

  return `<div class="relative h-full flex flex-col bg-night felt-grain">
    <!-- top -->
    <div class="shrink-0 bg-night border-b border-hairline-d">
      <div class="flex items-center gap-2 px-3.5 h-10">
        <span class="font-display font-extrabold text-white uppercase tracking-tight text-[13px]">Snooker<span class="text-live">PK</span></span>
        <span class="badge bg-brass/20 text-brass !text-[8px] !px-1.5">Umpire</span>
        <div class="ml-auto flex items-center gap-1.5 text-white"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span class="font-display font-bold tabular-nums text-[13px]" id="${frozen?'':'lv-timer-m'}">${mmss(s.timer)}</span></div>
      </div>
      <div class="flex items-center justify-center gap-3 px-3.5 pb-2">
        <span class="font-display font-bold text-white text-[12px] truncate max-w-[90px] text-right">${s.players[0].n}</span>
        <span class="font-display font-extrabold text-white tabular-nums text-[20px] px-2.5 py-0.5 rounded-md bg-panel2">${s.players[0].frames} <span class="text-ink-500">—</span> ${s.players[1].frames}</span>
        <span class="font-display font-bold text-white text-[12px] truncate max-w-[90px]">${s.players[1].n}</span>
      </div>
      <div class="text-center text-[10.5px] text-ink-400 pb-2 -mt-1">${s.round} · best of ${s.bo} · <b class="text-ink-200">Frame ${s.frameNo}</b> <span class="text-ink-600">· first to ${need}</span></div>
    </div>

    <!-- body -->
    <div class="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 min-h-0">
      <div class="grid grid-cols-2 gap-2.5">${mPlayerPanel(s,0)}${mPlayerPanel(s,1)}</div>
      ${mExpected(s)}
      <div class="grid grid-cols-4 gap-2 ${dis}">${[1,2,3,4,5,6,7].map(v=>mBallBtn(s,v,frozen)).join('')}
        <div class="grid place-items-center"><span class="seclabel text-ink-600 !text-[8px] text-center leading-tight">tap<br>on-ball</span></div>
      </div>
      ${mBreakStrip(s)}
      ${mHistory(s)}
    </div>

    <!-- fixed action bar -->
    <div class="shrink-0 border-t border-hairline-d bg-night/95 p-2.5 space-y-2">
      <div class="grid grid-cols-3 gap-2 ${dis}">
        <button ${frozen?'':'onclick="LV.endTurn()"'} class="btn bg-panel2 border border-hairline-d text-white py-3 text-[12.5px] flex-col !gap-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/></svg>End turn</button>
        <button ${frozen?'':'onclick="LV.foulOpen()"'} class="btn bg-bad/90 text-white py-3 text-[12.5px] flex-col !gap-1"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z"/></svg>Foul</button>
        <button ${frozen?'':'onclick="LV.undo()"'} class="btn bg-panel2 border border-hairline-d text-white py-3 text-[12.5px] flex-col !gap-1"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1015-6.7L21 8"/><path d="M21 3v5h-5"/></svg>Undo</button>
      </div>
      <button ${frozen?'':'onclick="LV.endFrameBtn()"'} class="btn w-full bg-brass text-[#3a2c08] py-3 text-[13.5px] ${dis}">End frame ▸ record winner</button>
    </div>
    ${overlay}
  </div>`;
}

/* ---- hook mobile into the shared controller ---- */
function renderLiveMobile(){ const el=document.getElementById('live-m'); if(el) el.innerHTML=renderMobile(LIVE,false); }
if(typeof renderLive==='function'){
  const _orig=renderLive;
  renderLive=function(){ _orig(); renderLiveMobile(); };
}
/* mobile timer mirror (display only — umpire.js owns the increment) */
setInterval(()=>{ const el=document.getElementById('lv-timer-m'); if(el) el.textContent=mmss(LIVE.timer); },1000);

/* ---- mobile annotated states (reuse STATES from umpire.js) ---- */
function buildStatesMobile(){
  const host=document.getElementById('states-m'); if(!host||typeof STATES==='undefined') return;
  host.innerHTML = STATES.map((st,i)=>`
    <div class="flex flex-col items-center gap-3">
      <div class="phone-bezel">
        <div class="snap-wrap bg-night" style="width:340px;height:704px">${renderMobile(attachHelpers(st.make()),true)}</div>
      </div>
      <div class="annot max-w-[340px]"><span class="num">${i+1}</span><div><div class="font-display font-bold text-white text-[13px] uppercase tracking-wide mb-1">${st.title}</div><div class="text-[12px]">${st.descShort||st.desc}</div></div></div>
    </div>`).join('');
}

renderLiveMobile();
buildStatesMobile();
