import { api } from '../api';

const statsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => ({ url: '/stats' }),
      transformResponse: (res) => res.data ?? res,
    }),
  }),
});

export const { useGetStatsQuery } = statsApi;
