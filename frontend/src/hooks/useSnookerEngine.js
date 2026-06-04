import { useReducer, useRef, useCallback, useEffect } from 'react';
import { ACTIONS, snookerReducer, createInitialState } from '../engine/snookerEngine';

/**
 * Custom hook that wraps snookerReducer with undo support.
 * Saves state snapshots before mutating actions and provides an undo function.
 */

const MUTATING_ACTIONS = new Set([
  ACTIONS.POT_BALL,
  ACTIONS.END_TURN,
  ACTIONS.FOUL_OPEN,
  ACTIONS.FOUL_APPLY,
  ACTIONS.END_FRAME,
  ACTIONS.START_NEXT_FRAME,
]);

function undoReducer(wrappedState, action) {
  if (action.type === '__UNDO__') {
    if (action.prevState) {
      return { state: action.prevState, _rev: (wrappedState._rev || 0) + 1 };
    }
    return wrappedState;
  }

  const newState = snookerReducer(wrappedState.state, action);
  return { state: newState, _rev: (wrappedState._rev || 0) + 1 };
}

export default function useSnookerEngine(config) {
  const [wrapped, rawDispatch] = useReducer(undoReducer, config, (cfg) => ({
    state: createInitialState(cfg),
    _rev: 0,
  }));

  const undoStack = useRef([]);
  const MAX_UNDO = 60;

  const dispatch = useCallback((action) => {
    if (MUTATING_ACTIONS.has(action.type)) {
      // Save current state for undo
      undoStack.current = [
        ...undoStack.current.slice(-(MAX_UNDO - 1)),
        wrapped.state,
      ];
    }
    rawDispatch(action);
  }, [wrapped.state]);

  const undo = useCallback(() => {
    if (undoStack.current.length > 0) {
      const prevState = undoStack.current.pop();
      rawDispatch({ type: '__UNDO__', prevState });
    }
  }, []);

  const canUndo = undoStack.current.length > 0;

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!wrapped.state.matchOver) {
        rawDispatch({ type: ACTIONS.TICK });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [wrapped.state.matchOver]);

  return { state: wrapped.state, dispatch, undo, canUndo };
}
