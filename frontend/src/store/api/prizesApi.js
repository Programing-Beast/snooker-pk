import { api } from '../api';

const prizesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPrizes: builder.query({
      query: (tournamentId) => ({ url: `/tournaments/${tournamentId}/prizes` }),
      transformResponse: (res) => res.data ?? res ?? [],
      providesTags: (result, error, tournamentId) => [{ type: 'Prize', id: tournamentId }],
    }),
    createPrize: builder.mutation({
      query: ({ tournamentId, data }) => ({
        url: `/tournaments/${tournamentId}/prizes`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (result, error, { tournamentId }) => [{ type: 'Prize', id: tournamentId }],
    }),
    updatePrize: builder.mutation({
      query: ({ id, data }) => ({ url: `/prizes/${id}`, method: 'PUT', data }),
      invalidatesTags: (result, error, { tournamentId }) => [
        ...(tournamentId ? [{ type: 'Prize', id: tournamentId }] : []),
      ],
    }),
    destroyPrize: builder.mutation({
      query: (id) => ({ url: `/prizes/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id, { tournamentId } = {}) => [
        ...(tournamentId ? [{ type: 'Prize', id: tournamentId }] : []),
      ],
    }),
  }),
});

export const {
  useGetPrizesQuery,
  useCreatePrizeMutation,
  useUpdatePrizeMutation,
  useDestroyPrizeMutation,
} = prizesApi;
