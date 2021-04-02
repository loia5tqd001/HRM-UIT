import { request } from 'umi';

export async function allEmployees(options?: { [key: string]: any }) {
  return request<API.EmployeeOnList[]>('/api/employees/', {
    method: 'GET',
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
