import { request } from 'umi';

const endpoint = '/api/custom_fields/';
type Item = API.CustomField;

export async function allCustomFields(options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createCustomField(body: Item, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function readCustomField(id: number, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateCustomField(id: number, body: Item, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteCustomField(id: number, options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}
