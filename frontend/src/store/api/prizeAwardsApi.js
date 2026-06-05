import { api } from '../api';

const prizeAwardsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPrizeAwards: builder.query({
      query: (tournamentId) => ({ url: `/tournaments/${tournamentId}/prize-awards` }),
      transformResponse: (res) => res.data ?? res ?? [],
      providesTags: (result, error, tournamentId) => [{ type: 'PrizeAward', id: tournamentId }],
    }),
    createPrizeAward: builder.mutation({
      query: (data) => ({ url: '/prize-awards', method: 'POST', data }),
      invalidatesTags: (result, error, { tournament_id }) => [
        { type: 'PrizeAward', id: tournament_id },
      ],
    }),
    bulkPrizeAward: builder.mutation({
      query: (data) => ({ url: '/prize-awards/bulk', method: 'POST', data }),
      invalidatesTags: (result, error, { tournament_id }) => [
        { type: 'PrizeAward', id: tournament_id },
      ],
    }),
    updatePrizeAward: builder.mutation({
      query: ({ id, data }) => ({ url: `/prize-awards/${id}`, method: 'PUT', data }),
      invalidatesTags: (result, error, { tournamentId }) => [
        ...(tournamentId ? [{ type: 'PrizeAward', id: tournamentId }] : []),
      ],
    }),
    getEligiblePlayers: builder.query({
      query: ({ tournamentId, params }) => ({
        url: `/tournaments/${tournamentId}/eligible-players`,
        params,
      }),
      transformResponse: (res) => res.data ?? res ?? [],
      providesTags: (result, error, { tournamentId }) => [{ type: 'EligiblePlayers', id: tournamentId }],
    }),
    getPlayerPrizeHistory: builder.query({
      query: (playerId) => ({ url: `/players/${playerId}/prize-history` }),
      transformResponse: (res) => res.data ?? res ?? [],
    }),
  }),
});

export const {
  useGetPrizeAwardsQuery,
  useCreatePrizeAwardMutation,
  useBulkPrizeAwardMutation,
  useUpdatePrizeAwardMutation,
  useGetEligiblePlayersQuery,
  useGetPlayerPrizeHistoryQuery,
} = prizeAwardsApi;
