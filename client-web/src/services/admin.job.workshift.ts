import { request } from 'umi';

const endpoint = '/api/work_shifts/';
type Item = API.WorkShift;

export async function allWorkShifts(options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createWorkShift(body: Item, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function readWorkShift(id: number, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateWorkShift(id: number, body: Item, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteWorkShift(id: number, options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}
