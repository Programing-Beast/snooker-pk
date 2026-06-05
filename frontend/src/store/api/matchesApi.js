import { api } from '../api';

const matchesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMatch: builder.query({
      query: (id) => ({ url: `/matches/${id}` }),
      transformResponse: (res) => res.data ?? res,
      providesTags: (result, error, id) => [{ type: 'Match', id }],
    }),
    getMatchBoard: builder.query({
      query: (id) => ({ url: `/matches/${id}/board` }),
      transformResponse: (res) => res.data ?? res,
      providesTags: (result, error, id) => [{ type: 'MatchBoard', id }],
    }),
    updateMatch: builder.mutation({
      query: ({ id, data }) => ({ url: `/matches/${id}`, method: 'PUT', data }),
      invalidatesTags: (result, error, { id, tournamentId }) => [
        { type: 'Match', id },
        ...(tournamentId ? [{ type: 'TournamentDraw', id: tournamentId }] : []),
      ],
    }),
    walkoverMatch: builder.mutation({
      query: ({ id, data }) => ({ url: `/matches/${id}/walkover`, method: 'POST', data }),
      invalidatesTags: (result, error, { id, tournamentId }) => [
        { type: 'Match', id },
        ...(tournamentId ? [{ type: 'TournamentDraw', id: tournamentId }] : []),
      ],
    }),
    completeMatch: builder.mutation({
      query: (id) => ({ url: `/matches/${id}/complete`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Match', id },
      ],
    }),
    declareWinner: builder.mutation({
      query: ({ id, data }) => ({ url: `/matches/${id}/declare-winner`, method: 'POST', data }),
      invalidatesTags: (result, error, { id, tournamentId }) => [
        { type: 'Match', id },
        ...(tournamentId ? [{ type: 'TournamentDraw', id: tournamentId }] : []),
      ],
    }),
    assignUmpire: builder.mutation({
      query: ({ id, data }) => ({ url: `/matches/${id}/assign-umpire`, method: 'POST', data }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Match', id },
        { type: 'Match', id: 'UMPIRE_LIST' },
      ],
    }),
    getUmpireMatches: builder.query({
      query: () => ({ url: '/umpire/matches' }),
      transformResponse: (res) => res.data ?? res ?? [],
      providesTags: [{ type: 'Match', id: 'UMPIRE_LIST' }],
    }),
  }),
});

export const {
  useGetMatchQuery,
  useGetMatchBoardQuery,
  useUpdateMatchMutation,
  useWalkoverMatchMutation,
  useCompleteMatchMutation,
  useDeclareWinnerMutation,
  useAssignUmpireMutation,
  useGetUmpireMatchesQuery,
} = matchesApi;
