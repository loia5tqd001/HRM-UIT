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

export async function getSchedule(employeeId: number, options?: { [key: string]: any }) {
  return request<API.EmployeeSchedule>(`${endpoint}${employeeId}/schedule/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateSchedule(
  employeeId: number,
  data: API.EmployeeSchedule,
  options?: { [key: string]: any },
) {
  return request<API.EmployeeSchedule>(`${endpoint}${employeeId}/schedule/`, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function readAttendances(employeeId: number, options?: { [key: string]: any }) {
  return request<API.EmployeeAttendance[]>(`${endpoint}${employeeId}/attendance/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function checkIn(employeeId: number, data: API.CheckInBody) {
  return request(`${endpoint}${employeeId}/attendance/check_in/`, {
    method: 'POST',
    data,
  });
}

export async function checkOut(employeeId: number, data: API.CheckOutBody) {
  return request(`${endpoint}${employeeId}/attendance/check_out/`, {
    method: 'POST',
    data,
  });
}

export async function editActual(employeeId: number, recordId: number, data: API.EditActual) {
  return request(`${endpoint}${employeeId}/attendance/${recordId}/edit_actual_hours/`, {
    method: 'POST',
    data,
  });
}
