import { request } from 'umi';

const endpoint = '/api/job_titles/';
type Item = API.JobTitle;

export async function allJobTitles(options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createJobTitle(body: Item, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function readJobTitle(id: number, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateJobTitle(id: number, body: Item, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteJobTitle(id: number, options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}
