import client from './client';

export const create = (frameId, data) => client.post(`/frames/${frameId}/breaks`, data);
export const update = (id, data) => client.put(`/breaks/${id}`, data);
export const destroy = (id) => client.delete(`/breaks/${id}`);
