import { request } from 'umi';

const endpoint = '/api/employees/';
type Item = API.Employee;

export async function allEmployees(options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createEmployee(data: Item, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}/`, {
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

export async function changeEmployeePassword(
  id: number,
  new_password: string,
  options?: { [key: string]: any },
) {
  return request(`${endpoint}${id}/password/`, {
    method: 'PUT',
    data: {
      new_password,
    },
    ...(options || {}),
  });
}

export async function changeEmployeeAvatar(
  id: number,
  data: any,
  options?: { [key: string]: any },
) {
  return request(`${endpoint}${id}/avatar/`, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function getHomeAddress(employeeId: number, options?: { [key: string]: any }) {
  return request<API.EmployeeHomeAddress>(`${endpoint}${employeeId}/contact_info/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateHomeAddress(
  employeeId: number,
  data: API.EmployeeHomeAddress,
  options?: { [key: string]: any },
) {
  return request<API.EmployeeHomeAddress>(`${endpoint}${employeeId}/contact_info/`, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function getEmergencyContact(employeeId: number, options?: { [key: string]: any }) {
  return request<API.EmployeeEmergencyContact>(`${endpoint}${employeeId}/emergency_contact/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateEmergencyContact(
  employeeId: number,
  data: API.EmployeeEmergencyContact,
  options?: { [key: string]: any },
) {
  return request<API.EmployeeEmergencyContact>(`${endpoint}${employeeId}/emergency_contact/`, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function getBankInfo(employeeId: number, options?: { [key: string]: any }) {
  return request<API.EmployeeBankInfo>(`${endpoint}${employeeId}/bank_info/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateBankInfo(
  employeeId: number,
  data: API.EmployeeBankInfo,
  options?: { [key: string]: any },
) {
  return request<API.EmployeeBankInfo>(`${endpoint}${employeeId}/bank_info/`, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function allJobs(employeeId: number, options?: { [key: string]: any }) {
  return request<API.EmployeeJob[]>(`${endpoint}${employeeId}/jobs/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateJob(
  employeeId: number,
  data: API.EmployeeJob,
  options?: { [key: string]: any },
) {
  return request<API.EmployeeJob>(`${endpoint}${employeeId}/jobs/`, {
    method: 'POST',
    data,
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
