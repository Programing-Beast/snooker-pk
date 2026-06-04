import client from './client';

export const list = (playerId) => client.get(`/players/${playerId}/phones`);
export const create = (playerId, data) => client.post(`/players/${playerId}/phones`, data);
export const update = (phoneId, data) => client.put(`/player-phones/${phoneId}`, data);
export const destroy = (phoneId) => client.delete(`/player-phones/${phoneId}`);
