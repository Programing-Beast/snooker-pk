import { BALLS, getExpectedBall, isLegalBall } from '../../engine/snookerEngine';

export default function BallButton({ state, value, onPot, size = 'lg' }) {
  const ball = BALLS[value];
  const legal = isLegalBall(state, value) && !state.foulOpen && !state.frameOver && !state.matchOver;
  const expected = getExpectedBall(state);
  const isOnly = legal && expected.balls.length === 1;

  const sizes = {
    lg: 'w-[72px] h-[72px] text-[22px]',
    md: 'w-[60px] h-[60px] text-[19px]',
  };

  return (
    <button
      onClick={() => legal && onPot(value)}
      disabled={!legal}
      title={`${ball.name} (${value})`}
      className={`ballbtn relative grid place-items-center rounded-full font-display font-extrabold transition
        ${sizes[size]}
        ${legal
          ? 'hover:brightness-110 active:scale-90 cursor-pointer'
          : 'opacity-25 grayscale cursor-not-allowed'
        }`}
      style={{ background: ball.color, color: ball.textColor }}
    >
      <span>{value}</span>
      {isOnly && (
        <span className="absolute -inset-1 rounded-full ring-2 ring-white/80 pulse" />
      )}
    </button>
  );
}
