import client from './client';

export const list = (tournamentId) => client.get(`/tournaments/${tournamentId}/prizes`);
export const show = (id) => client.get(`/prizes/${id}`);
export const create = (tournamentId, data) => client.post(`/tournaments/${tournamentId}/prizes`, data);
export const update = (id, data) => client.put(`/prizes/${id}`, data);
export const destroy = (id) => client.delete(`/prizes/${id}`);
