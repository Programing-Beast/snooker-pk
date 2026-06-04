import client from './client';

export const list = (tournamentId) => client.get(`/tournaments/${tournamentId}/organizers`);
export const create = (tournamentId, data) => client.post(`/tournaments/${tournamentId}/organizers`, data);
export const update = (organizerId, data) => client.put(`/tournament-organizers/${organizerId}`, data);
export const destroy = (organizerId) => client.delete(`/tournament-organizers/${organizerId}`);
