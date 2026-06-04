import client from './client';

export const list = (tournamentId) => client.get(`/tournaments/${tournamentId}/rounds`);
export const show = (id) => client.get(`/rounds/${id}`);
export const create = (tournamentId, data) => client.post(`/tournaments/${tournamentId}/rounds`, data);
export const update = (id, data) => client.put(`/rounds/${id}`, data);
export const destroy = (id) => client.delete(`/rounds/${id}`);
