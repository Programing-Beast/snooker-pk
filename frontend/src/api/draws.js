import client from './client';

export const preview = (tournamentId) => client.get(`/draw/${tournamentId}/preview`);
export const generate = (data) => client.post('/draw/generate', data);
export const confirm = (data) => client.post('/draw/confirm', data);
export const reroll = (data) => client.post('/draw/reroll', data);
