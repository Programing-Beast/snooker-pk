import client from './client';

export const show = (id) => client.get(`/matches/${id}`);
export const update = (id, data) => client.put(`/matches/${id}`, data);
export const assignUmpire = (id, data) => client.post(`/matches/${id}/assign-umpire`, data);
export const walkover = (id, data) => client.post(`/matches/${id}/walkover`, data);
export const complete = (id) => client.post(`/matches/${id}/complete`);
export const board = (id) => client.get(`/matches/${id}/board`);
