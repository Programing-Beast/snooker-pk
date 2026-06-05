import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './axiosBaseQuery';

export const api = createApi({
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Tournament',
    'TournamentDraw',
    'TournamentPlayers',
    'Player',
    'Ranking',
    'Entry',
    'MyEntries',
    'Match',
    'MatchBoard',
    'Round',
    'Prize',
    'PrizeAward',
    'EligiblePlayers',
  ],
  endpoints: () => ({}),
});
