import client from './client';

export const list = (params) => client.get('/tournaments', { params });
export const show = (slug) => client.get(`/tournaments/${slug}`);
export const draw = (id) => client.get(`/tournaments/${id}/draw`);
export const players = (id) => client.get(`/tournaments/${id}/players`);
export const create = (data) => {
  if (data instanceof FormData) {
    return client.post('/tournaments', data);
  }
  return client.post('/tournaments', data);
};
export const update = (id, data) => {
  if (data instanceof FormData) {
    data.append('_method', 'PUT');
    return client.post(`/tournaments/${id}`, data);
  }
  return client.put(`/tournaments/${id}`, data);
};
export const destroy = (id) => client.delete(`/tournaments/${id}`);
export const updateEntryStatus = (id, data) => client.put(`/tournaments/${id}/entry-status`, data);
export const updateMaxPlayers = (id, data) => client.put(`/tournaments/${id}/max-players`, data);
