import { BALLS, getExpectedBall, isLegalBall } from '../../engine/snookerEngine';

export default function BallButton({ state, value, onPot, size = 'lg' }) {
  const ball = BALLS[value];
  const legal = isLegalBall(state, value) && !state.foulOpen && !state.frameOver && !state.matchOver;
  const expected = getExpectedBall(state);
  const isOnly = legal && expected.balls.length === 1;

  const sizes = {
    lg: 'w-[52px] h-[52px] text-[18px] sm:w-[72px] sm:h-[72px] sm:text-[22px]',
    md: 'w-[44px] h-[44px] text-[16px] sm:w-[60px] sm:h-[60px] sm:text-[19px]',
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
