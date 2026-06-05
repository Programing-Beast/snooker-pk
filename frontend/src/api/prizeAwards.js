import client from './client';

export const list = (tournamentId) => client.get(`/tournaments/${tournamentId}/prize-awards`);
export const create = (data) => client.post('/prize-awards', data);
export const bulk = (data) => client.post('/prize-awards/bulk', data);
export const update = (id, data) => client.put(`/prize-awards/${id}`, data);
export const playerHistory = (playerId) => client.get(`/players/${playerId}/prize-history`);
export const eligiblePlayers = (tournamentId, params) => client.get(`/tournaments/${tournamentId}/eligible-players`, { params });
