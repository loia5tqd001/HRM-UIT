import { request } from 'umi';

const endpoint = '/api/employees/';
type Item = API.Employee;

export async function allEmployees(options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createEmployee(data: Item, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}`, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function readEmployee(id: number, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}${id}/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateEmployee(id: number, data: Item, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}${id}/`, {
    method: 'PATCH',
    data,
    ...(options || {}),
  });
}

export async function deleteEmployee(id: number, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

// export async function updateRole(id: string, body: API.RoleItem, options?: { [key: string]: any }) {
//   return request<API.RoleItem>(`/api/auth/role/${id}/`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     data: body,
//     ...(options || {}),
//   });
// }

// export async function createRole(body: Partial<API.RoleItem>, options?: { [key: string]: any }) {
//   return request<API.RoleItem>(`/api/auth/role/`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     data: body,
//     ...(options || {}),
//   });
// }

// export async function deleteRole(id: string, options?: { [key: string]: any }) {
//   return request<API.RoleItem>(`/api/auth/role/${id}/`, {
//     method: 'DELETE',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     ...(options || {}),
//   });
// }
