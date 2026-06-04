import { BALLS, COLOUR_SEQUENCE, getExpectedBall, getPhaseLabel } from '../../engine/snookerEngine';

export default function ExpectedBallIndicator({ state }) {
  const expected = getExpectedBall(state);
  const phaseLabel = getPhaseLabel(state);

  let glyphs;
  if (expected.kind === 'red') {
    glyphs = (
      <span
        className="grid place-items-center rounded-full font-display font-bold text-[13px]"
        style={{
          width: 34, height: 34,
          background: BALLS[1].color, color: '#fff',
          boxShadow: 'inset -3px -3px 5px rgba(0,0,0,.5)',
        }}
      >1</span>
    );
  } else if (expected.kind === 'colour') {
    glyphs = COLOUR_SEQUENCE.map((v) => (
      <span
        key={v}
        className="grid place-items-center rounded-full font-display font-bold text-[10px]"
        style={{ width: 22, height: 22, background: BALLS[v].color, color: BALLS[v].textColor }}
      >{v}</span>
    ));
  } else {
    const ball = BALLS[state.clearOn];
    glyphs = (
      <span
        className="grid place-items-center rounded-full font-display font-bold text-[13px]"
        style={{
          width: 34, height: 34,
          background: ball.color, color: ball.textColor,
          boxShadow: 'inset -3px -3px 5px rgba(0,0,0,.5)',
        }}
      >{state.clearOn}</span>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-r from-felt-900 to-panel2 border border-felt-700 px-5 py-3.5 flex items-center gap-4">
      <div>
        <div className="font-display font-semibold uppercase tracking-[0.18em] text-felt-400 text-[9px]">On</div>
        <div className="font-display font-extrabold text-white uppercase leading-none mt-0.5" style={{ fontSize: 26, letterSpacing: '.02em' }}>
          {expected.label}
        </div>
      </div>
      <div className="flex items-center gap-1.5 ml-1">{glyphs}</div>
      <div className="ml-auto text-right">
        <div className="font-display font-semibold uppercase tracking-[0.18em] text-ink-500 text-[9px]">{phaseLabel}</div>
        <div className="flex items-center gap-2 justify-end mt-1">
          <span
            className="grid place-items-center rounded-full font-display font-bold text-[11px]"
            style={{ width: 22, height: 22, background: BALLS[1].color, color: '#fff' }}
          >●</span>
          <span className="font-display font-extrabold text-white text-[22px] tabular-nums leading-none">{state.reds}</span>
          <span className="text-ink-400 text-[12px]">reds left</span>
        </div>
      </div>
    </div>
  );
}
