import client from './client';

export const list = (params) => client.get('/rankings', { params });
export const adjust = (data) => client.post('/rankings/adjust', data);
