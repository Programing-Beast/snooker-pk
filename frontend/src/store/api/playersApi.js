import { api } from '../api';

const playersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPlayers: builder.query({
      query: (params) => ({ url: '/players', params }),
      transformResponse: (res) => res.data ?? res,
      providesTags: (result) =>
        Array.isArray(result)
          ? [...result.map((p) => ({ type: 'Player', id: p.id })), { type: 'Player', id: 'LIST' }]
          : [{ type: 'Player', id: 'LIST' }],
    }),
    getPlayer: builder.query({
      query: (id) => ({ url: `/players/${id}` }),
      transformResponse: (res) => res.data ?? res,
      providesTags: (result, error, id) => [{ type: 'Player', id }],
    }),
    getPlayerHistory: builder.query({
      query: (id) => ({ url: `/players/${id}/history` }),
      transformResponse: (res) => res.data ?? res ?? [],
      providesTags: (result, error, id) => [{ type: 'Player', id: `${id}-history` }],
    }),
    getPlayerUpcoming: builder.query({
      query: (id) => ({ url: `/players/${id}/upcoming` }),
      transformResponse: (res) => res.data ?? res ?? [],
      providesTags: (result, error, id) => [{ type: 'Player', id: `${id}-upcoming` }],
    }),
    createPlayer: builder.mutation({
      query: (data) => ({ url: '/players', method: 'POST', data }),
      invalidatesTags: [{ type: 'Player', id: 'LIST' }],
    }),
    updatePlayer: builder.mutation({
      query: ({ id, data }) => {
        if (data instanceof FormData) {
          data.append('_method', 'PUT');
          return { url: `/players/${id}`, method: 'POST', data };
        }
        return { url: `/players/${id}`, method: 'PUT', data };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Player', id },
        { type: 'Player', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetPlayersQuery,
  useGetPlayerQuery,
  useGetPlayerHistoryQuery,
  useGetPlayerUpcomingQuery,
  useCreatePlayerMutation,
  useUpdatePlayerMutation,
} = playersApi;
