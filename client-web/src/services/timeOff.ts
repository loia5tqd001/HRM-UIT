import { request } from 'umi';

const endpoint = '/api/time_off/';
type Item = API.TimeoffRequest;

export async function allTimeoffs(options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}`, {
    method: 'GET',
    ...(options || {}),
  });
}