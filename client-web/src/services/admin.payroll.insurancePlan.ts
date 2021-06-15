import { request } from 'umi';

const endpoint = '/api/insurance_policies/';
type Item = API.InsurancePlan;

export async function allInsurancePlans(options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createInsurancePlan(body: Item, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function readInsurancePlan(id: number, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateInsurancePlan(
  id: number,
  body: Item,
  options?: { [key: string]: any },
) {
  return request<Item>(`${endpoint}${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteInsurancePlan(id: number, options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}
