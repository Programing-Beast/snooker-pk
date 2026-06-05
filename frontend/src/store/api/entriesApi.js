import { api } from '../api';

const entriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyEntries: builder.query({
      query: () => ({ url: '/entries/mine' }),
      transformResponse: (res) => res.data ?? res ?? [],
      providesTags: [{ type: 'MyEntries', id: 'LIST' }],
    }),
    getEntries: builder.query({
      query: ({ tournamentId, params }) => ({
        url: `/tournaments/${tournamentId}/entries`,
        params,
      }),
      transformResponse: (res) => res.data ?? res ?? [],
      providesTags: (result, error, { tournamentId }) => [{ type: 'Entry', id: tournamentId }],
    }),
    requestEntry: builder.mutation({
      query: (data) => ({ url: '/entries/request', method: 'POST', data }),
      invalidatesTags: [{ type: 'MyEntries', id: 'LIST' }],
    }),
    approveEntry: builder.mutation({
      query: (id) => ({ url: `/entries/${id}/approve`, method: 'PUT' }),
      invalidatesTags: (result, error, id, { tournamentId } = {}) => [
        { type: 'Entry', id: tournamentId },
        { type: 'TournamentPlayers', id: tournamentId },
      ],
    }),
    rejectEntry: builder.mutation({
      query: (id) => ({ url: `/entries/${id}/reject`, method: 'PUT' }),
      invalidatesTags: (result, error, id, { tournamentId } = {}) => [
        { type: 'Entry', id: tournamentId },
        { type: 'TournamentPlayers', id: tournamentId },
      ],
    }),
    bulkAddEntries: builder.mutation({
      query: ({ tournamentId, playerIds }) => ({
        url: '/entries/admin-add',
        method: 'POST',
        data: { tournament_id: tournamentId, player_ids: playerIds },
      }),
      invalidatesTags: (result, error, { tournamentId }) => [
        { type: 'Entry', id: tournamentId },
        { type: 'TournamentPlayers', id: tournamentId },
      ],
    }),
    setEntrySeed: builder.mutation({
      query: ({ id, data }) => ({ url: `/entries/${id}/seed`, method: 'PUT', data }),
      invalidatesTags: (result, error, { tournamentId }) => [
        { type: 'Entry', id: tournamentId },
      ],
    }),
  }),
});

export const {
  useGetMyEntriesQuery,
  useGetEntriesQuery,
  useRequestEntryMutation,
  useApproveEntryMutation,
  useRejectEntryMutation,
  useBulkAddEntriesMutation,
  useSetEntrySeedMutation,
} = entriesApi;
