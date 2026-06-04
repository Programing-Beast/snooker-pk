/**
 * SnookerPK — Framework-agnostic snooker scoring engine
 *
 * Ported from SSB Vue logic (umpire.js). Designed for use with
 * React useReducer or any state management. Pure functions + reducer pattern.
 *
 * Phases:
 *   'reds'     — red ball on
 *   'colour'   — any colour on (after potting a red)
 *   'clearing' — colours in sequence Y→G→Br→Bl→P→Bk
 */

// ─── Constants ───────────────────────────────────────────────────────

export const BALLS = {
  1: { name: 'Red',    color: '#c0392b', textColor: '#fff' },
  2: { name: 'Yellow', color: '#f2c200', textColor: '#3a2c08' },
  3: { name: 'Green',  color: '#1e7a3d', textColor: '#fff' },
  4: { name: 'Brown',  color: '#7a4a1e', textColor: '#fff' },
  5: { name: 'Blue',   color: '#1f5fa8', textColor: '#fff' },
  6: { name: 'Pink',   color: '#e86a92', textColor: '#fff' },
  7: { name: 'Black',  color: '#161616', textColor: '#fff' },
};

export const COLOUR_SEQUENCE = [2, 3, 4, 5, 6, 7]; // yellow → black

export const ALL_BALL_VALUES = [1, 2, 3, 4, 5, 6, 7];

// ─── Helpers ─────────────────────────────────────────────────────────

export function framesToWin(bestOf) {
  return Math.ceil(bestOf / 2);
}

export function breakTotal(balls) {
  return balls.reduce((sum, v) => sum + v, 0);
}

export function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function playerInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .replace(/\./g, '')
    .slice(0, 2);
}

// ─── Expected ball logic ─────────────────────────────────────────────

export function getExpectedBall(state) {
  if (state.phase === 'reds') {
    return { kind: 'red', label: 'RED', balls: [1] };
  }
  if (state.phase === 'colour') {
    return { kind: 'colour', label: 'COLOUR', balls: COLOUR_SEQUENCE };
  }
  // clearing — only the current on-colour
  return { kind: 'clear', label: BALLS[state.clearOn].name, balls: [state.clearOn] };
}

export function isLegalBall(state, value) {
  return getExpectedBall(state).balls.includes(value);
}

export function getPhaseLabel(state) {
  if (state.phase === 'clearing') return 'Colours clearing';
  if (state.phase === 'colour') return 'Colour after red';
  return 'Reds & colours';
}

// ─── Initial state factory ───────────────────────────────────────────

export function createInitialState({ players, bestOf, tournament = '', round = '' }) {
  return {
    // Match context
    tournament,
    round,
    bestOf,

    // Players: [{id, name, countryCode, tier, seed, frames, points, highBreak, frameHighBreak}]
    players: players.map((p) => ({
      id: p.id,
      name: p.name,
      countryCode: p.countryCode || 'PAK',
      tier: p.tier || 'Amateur',
      seed: p.seed || null,
      frames: 0,
      points: 0,
      highBreak: 0,
      frameHighBreak: 0,
    })),

    // Frame state
    activePlayerIndex: 0,
    reds: 15,
    phase: 'reds', // 'reds' | 'colour' | 'clearing'
    clearOn: 2,     // next colour in clearing sequence
    currentBreak: [], // array of ball values potted this visit

    // Overlays / flow
    foulOpen: false,
    foulValue: null,
    frameOver: false,
    frameWinner: null, // 0 or 1
    matchOver: false,

    // History
    frameNo: 1,
    timer: 0,
    frameHistory: [], // [{p1Score, p2Score, winner, topBreak}]
  };
}

// ─── Reducer actions ─────────────────────────────────────────────────

export const ACTIONS = {
  POT_BALL: 'POT_BALL',
  END_TURN: 'END_TURN',
  FOUL_OPEN: 'FOUL_OPEN',
  FOUL_PICK: 'FOUL_PICK',
  FOUL_CANCEL: 'FOUL_CANCEL',
  FOUL_APPLY: 'FOUL_APPLY',
  END_FRAME: 'END_FRAME',
  START_NEXT_FRAME: 'START_NEXT_FRAME',
  UNDO: 'UNDO',
  TICK: 'TICK',
  RESET: 'RESET',
};

// ─── Pure state transitions ──────────────────────────────────────────
// Each returns a new state object (immutable).

function potBall(state, value) {
  if (!isLegalBall(state, value)) return state;
  if (state.foulOpen || state.frameOver || state.matchOver) return state;

  const s = cloneState(state);
  const player = s.players[s.activePlayerIndex];

  if (s.phase === 'reds' && value === 1) {
    player.points += 1;
    s.currentBreak = [...s.currentBreak, 1];
    s.reds -= 1;
    s.phase = 'colour';
  } else if (s.phase === 'colour') {
    player.points += value;
    s.currentBreak = [...s.currentBreak, value];
    s.phase = s.reds > 0 ? 'reds' : 'clearing';
    if (s.phase === 'clearing') s.clearOn = 2;
  } else if (s.phase === 'clearing' && value === s.clearOn) {
    player.points += value;
    s.currentBreak = [...s.currentBreak, value];
    if (value === 7) {
      // All balls potted — frame over
      updateHighBreak(s);
      s.frameOver = true;
      resolveFrameWinner(s);
      return s;
    }
    s.clearOn = COLOUR_SEQUENCE[COLOUR_SEQUENCE.indexOf(value) + 1];
  }

  // Update frame high break
  const brkTotal = breakTotal(s.currentBreak);
  if (brkTotal > player.frameHighBreak) player.frameHighBreak = brkTotal;
  if (brkTotal > player.highBreak) player.highBreak = brkTotal;

  return s;
}

function endTurn(state) {
  if (state.frameOver || state.matchOver) return state;

  const s = cloneState(state);
  updateHighBreak(s);
  s.currentBreak = [];
  s.activePlayerIndex = 1 - s.activePlayerIndex;
  s.phase = s.reds > 0 ? 'reds' : 'clearing';
  if (s.phase === 'clearing' && !s.clearOn) s.clearOn = 2;
  return s;
}

function foulApply(state, giveBack) {
  const s = cloneState(state);
  const foulPts = s.foulValue || 4;

  // Points go to the opponent
  s.players[1 - s.activePlayerIndex].points += foulPts;
  s.currentBreak = [];
  s.phase = s.reds > 0 ? 'reds' : 'clearing';
  if (s.phase === 'clearing' && !s.clearOn) s.clearOn = 2;
  if (!giveBack) s.activePlayerIndex = 1 - s.activePlayerIndex;
  s.foulOpen = false;
  s.foulValue = null;
  return s;
}

function endFrame(state) {
  const s = cloneState(state);
  updateHighBreak(s);
  if (s.frameWinner == null) resolveFrameWinner(s);

  const w = s.frameWinner;
  s.frameHistory = [
    ...s.frameHistory,
    {
      p1Score: s.players[0].points,
      p2Score: s.players[1].points,
      winner: w,
      topBreak: s.players[w].frameHighBreak || 0,
    },
  ];
  s.players[w].frames += 1;
  s.frameOver = true;

  if (s.players[w].frames >= framesToWin(s.bestOf)) {
    s.matchOver = true;
  }
  return s;
}

function startNextFrame(state, breakerIndex) {
  const s = cloneState(state);
  s.players = s.players.map((p) => ({ ...p, points: 0, frameHighBreak: 0 }));
  s.reds = 15;
  s.phase = 'reds';
  s.clearOn = 2;
  s.currentBreak = [];
  s.frameNo += 1;
  s.activePlayerIndex = breakerIndex;
  s.frameOver = false;
  s.frameWinner = null;
  return s;
}

// ─── Reducer ─────────────────────────────────────────────────────────

export function snookerReducer(state, action) {
  switch (action.type) {
    case ACTIONS.POT_BALL:
      return potBall(state, action.value);

    case ACTIONS.END_TURN:
      return endTurn(state);

    case ACTIONS.FOUL_OPEN:
      return { ...cloneState(state), foulOpen: true, foulValue: null };

    case ACTIONS.FOUL_PICK:
      return { ...cloneState(state), foulValue: action.value };

    case ACTIONS.FOUL_CANCEL:
      return { ...cloneState(state), foulOpen: false, foulValue: null };

    case ACTIONS.FOUL_APPLY:
      return foulApply(state, action.giveBack);

    case ACTIONS.END_FRAME:
      return endFrame(state);

    case ACTIONS.START_NEXT_FRAME:
      return startNextFrame(state, action.breakerIndex);

    case ACTIONS.TICK:
      return { ...state, timer: state.timer + 1 };

    case ACTIONS.RESET:
      return createInitialState(action.config);

    default:
      return state;
  }
}

// ─── Internal helpers ────────────────────────────────────────────────

function cloneState(state) {
  return {
    ...state,
    players: state.players.map((p) => ({ ...p })),
    currentBreak: [...state.currentBreak],
    frameHistory: [...state.frameHistory],
  };
}

function updateHighBreak(state) {
  const player = state.players[state.activePlayerIndex];
  const total = breakTotal(state.currentBreak);
  if (total > player.frameHighBreak) player.frameHighBreak = total;
  if (total > player.highBreak) player.highBreak = total;
}

function resolveFrameWinner(state) {
  const [a, b] = state.players;
  state.frameWinner = a.points >= b.points ? 0 : 1;
}
