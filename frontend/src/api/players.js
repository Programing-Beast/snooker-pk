import client from './client';

export const list = (params) => client.get('/players', { params });
export const show = (id) => client.get(`/players/${id}`);
export const create = (data) => client.post('/players', data);
export const update = (id, data) => {
  if (data instanceof FormData) {
    data.append('_method', 'PUT');
    return client.post(`/players/${id}`, data);
  }
  return client.put(`/players/${id}`, data);
};
export const history = (id) => client.get(`/players/${id}/history`);
export const upcoming = (id) => client.get(`/players/${id}/upcoming`);
