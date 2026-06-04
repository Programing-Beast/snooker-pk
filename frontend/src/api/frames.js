import client from './client';

export const create = (matchId, data) => client.post(`/matches/${matchId}/frames`, data);
export const update = (id, data) => client.put(`/frames/${id}`, data);
