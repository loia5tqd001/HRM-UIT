import { request } from 'umi';

const endpoint = '/api/salary_templates/';
type Item = API.PayrollTemplate;

export async function allPayrollTemplates(options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createPayrollTemplate(body: Item, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function readPayrollTemplate(id: number, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}${id}/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updatePayrollTemplate(
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

export async function duplicatePayrollTemplate(
  id: number,
  body: { name: string },
  options?: { [key: string]: any },
) {
  return request<Item>(`${endpoint}${id}/duplicate/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deletePayrollTemplate(id: number, options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

export async function allPayrollSystemFields(options?: { [key: string]: any }) {
  return request<API.SystemField[]>(`/api/salary_system_fields/`, {
    method: 'GET',
    ...(options || {}),
  });
}
