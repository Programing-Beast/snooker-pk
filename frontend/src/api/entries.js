import client from './client';

export const request = (data) => client.post('/entries/request', data);
export const mine = () => client.get('/entries/mine');
export const list = (tournamentId, params) => client.get(`/tournaments/${tournamentId}/entries`, { params });
export const approve = (id) => client.put(`/entries/${id}/approve`);
export const reject = (id) => client.put(`/entries/${id}/reject`);
export const adminAdd = (data) => client.post('/entries/admin-add', data);
export const bulkAdd = (tournamentId, playerIds) => client.post('/entries/admin-add', { tournament_id: tournamentId, player_ids: playerIds });
export const setSeed = (id, data) => client.put(`/entries/${id}/seed`, data);
