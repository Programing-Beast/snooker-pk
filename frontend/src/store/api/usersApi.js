import { api } from '../api';

const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUmpireUsers: builder.query({
      query: () => ({ url: '/admin/umpires' }),
      transformResponse: (res) => res.data ?? res ?? [],
      providesTags: [{ type: 'Umpire', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetUmpireUsersQuery,
} = usersApi;
