import { api } from '../api';

const rankingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRankings: builder.query({
      query: (params) => ({ url: '/rankings', params }),
      transformResponse: (res) => res.data ?? res,
      providesTags: (result) =>
        Array.isArray(result)
          ? [...result.map((p) => ({ type: 'Ranking', id: p.id })), { type: 'Ranking', id: 'LIST' }]
          : [{ type: 'Ranking', id: 'LIST' }],
    }),
    adjustRanking: builder.mutation({
      query: (data) => ({ url: '/rankings/adjust', method: 'POST', data }),
      invalidatesTags: [{ type: 'Ranking', id: 'LIST' }, { type: 'Player', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetRankingsQuery,
  useAdjustRankingMutation,
} = rankingsApi;
