import { api } from '../api';

const drawsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDrawPreview: builder.query({
      query: (tournamentId) => ({ url: `/draw/${tournamentId}/preview` }),
      transformResponse: (res) => res.data ?? res,
    }),
    generateDraw: builder.mutation({
      query: (data) => ({ url: '/draw/generate', method: 'POST', data }),
      invalidatesTags: (result, error, { tournament_id }) => [
        { type: 'TournamentDraw', id: tournament_id },
        { type: 'Round', id: tournament_id },
      ],
    }),
    confirmDraw: builder.mutation({
      query: (data) => ({ url: '/draw/confirm', method: 'POST', data }),
      invalidatesTags: (result, error, { tournament_id }) => [
        { type: 'TournamentDraw', id: tournament_id },
        { type: 'Round', id: tournament_id },
      ],
    }),
    rerollDraw: builder.mutation({
      query: (data) => ({ url: '/draw/reroll', method: 'POST', data }),
      invalidatesTags: (result, error, { tournament_id }) => [
        { type: 'TournamentDraw', id: tournament_id },
        { type: 'Round', id: tournament_id },
      ],
    }),
  }),
});

export const {
  useGetDrawPreviewQuery,
  useGenerateDrawMutation,
  useConfirmDrawMutation,
  useRerollDrawMutation,
} = drawsApi;
