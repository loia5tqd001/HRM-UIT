import { request } from 'umi';

const endpoint = '/api/holidays/';
type Item = API.Holiday;

export async function allHolidays(options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createHoliday(body: Item, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function readHoliday(id: number, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateHoliday(id: number, body: Item, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteHoliday(id: number, options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}
