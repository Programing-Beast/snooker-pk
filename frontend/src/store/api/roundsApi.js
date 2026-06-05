import { api } from '../api';

const roundsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRounds: builder.query({
      query: (tournamentId) => ({ url: `/tournaments/${tournamentId}/rounds` }),
      transformResponse: (res) => res.data ?? res ?? [],
      providesTags: (result, error, tournamentId) => [{ type: 'Round', id: tournamentId }],
    }),
    getRound: builder.query({
      query: (id) => ({ url: `/rounds/${id}` }),
      transformResponse: (res) => res.data ?? res,
      providesTags: (result, error, id) => [{ type: 'Round', id }],
    }),
    createRound: builder.mutation({
      query: ({ tournamentId, data }) => ({
        url: `/tournaments/${tournamentId}/rounds`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (result, error, { tournamentId }) => [{ type: 'Round', id: tournamentId }],
    }),
    updateRound: builder.mutation({
      query: ({ id, data }) => ({ url: `/rounds/${id}`, method: 'PUT', data }),
      invalidatesTags: (result, error, { tournamentId }) => [
        ...(tournamentId ? [{ type: 'Round', id: tournamentId }] : []),
      ],
    }),
    destroyRound: builder.mutation({
      query: (id) => ({ url: `/rounds/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id, { tournamentId } = {}) => [
        ...(tournamentId ? [{ type: 'Round', id: tournamentId }] : []),
      ],
    }),
  }),
});

export const {
  useGetRoundsQuery,
  useGetRoundQuery,
  useCreateRoundMutation,
  useUpdateRoundMutation,
  useDestroyRoundMutation,
} = roundsApi;
