import { api } from '../api';

const tournamentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTournaments: builder.query({
      query: (params) => ({ url: '/tournaments', params }),
      transformResponse: (res) => res.data ?? res,
      providesTags: (result) =>
        Array.isArray(result)
          ? [...result.map((t) => ({ type: 'Tournament', id: t.id })), { type: 'Tournament', id: 'LIST' }]
          : [{ type: 'Tournament', id: 'LIST' }],
    }),
    getTournament: builder.query({
      query: (slug) => ({ url: `/tournaments/${slug}` }),
      transformResponse: (res) => res.data ?? res,
      providesTags: (result) => result ? [{ type: 'Tournament', id: result.id }] : [],
    }),
    getTournamentDraw: builder.query({
      query: (id) => ({ url: `/tournaments/${id}/draw` }),
      transformResponse: (res) => res.data ?? res,
      providesTags: (result, error, id) => [{ type: 'TournamentDraw', id }],
    }),
    getTournamentPlayers: builder.query({
      query: (id) => ({ url: `/tournaments/${id}/players` }),
      transformResponse: (res) => res.data ?? res,
      providesTags: (result, error, id) => [{ type: 'TournamentPlayers', id }],
    }),
    createTournament: builder.mutation({
      query: (data) => ({ url: '/tournaments', method: 'POST', data }),
      invalidatesTags: [{ type: 'Tournament', id: 'LIST' }],
    }),
    updateTournament: builder.mutation({
      query: ({ id, data }) => {
        if (data instanceof FormData) {
          data.append('_method', 'PUT');
          return { url: `/tournaments/${id}`, method: 'POST', data };
        }
        return { url: `/tournaments/${id}`, method: 'PUT', data };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tournament', id },
        { type: 'Tournament', id: 'LIST' },
      ],
    }),
    destroyTournament: builder.mutation({
      query: (id) => ({ url: `/tournaments/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Tournament', id: 'LIST' }],
    }),
    updateEntryStatus: builder.mutation({
      query: ({ id, data }) => ({ url: `/tournaments/${id}/entry-status`, method: 'PUT', data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tournament', id }],
    }),
    updateMaxPlayers: builder.mutation({
      query: ({ id, data }) => ({ url: `/tournaments/${id}/max-players`, method: 'PUT', data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tournament', id }],
    }),
  }),
});

export const {
  useGetTournamentsQuery,
  useGetTournamentQuery,
  useGetTournamentDrawQuery,
  useGetTournamentPlayersQuery,
  useCreateTournamentMutation,
  useUpdateTournamentMutation,
  useDestroyTournamentMutation,
  useUpdateEntryStatusMutation,
  useUpdateMaxPlayersMutation,
} = tournamentsApi;
