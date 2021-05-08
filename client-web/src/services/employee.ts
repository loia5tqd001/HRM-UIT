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

export async function allEmployeePayrolls(employeeId: number, options?: { [key: string]: any }) {
  return request<API.EmployeePayroll>(`${endpoint}${employeeId}/salary_info/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateEmployeePayroll(
  employeeId: number,
  data: API.EmployeePayroll,
  options?: { [key: string]: any },
) {
  return request<API.EmployeePayroll>(`${endpoint}${employeeId}/salary_info/`, {
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

export async function editOvertime(employeeId: number, recordId: number, data: API.EditOvertime) {
  return request(`${endpoint}${employeeId}/attendance/${recordId}/edit_overtime_hours/`, {
    method: 'POST',
    data,
  });
}

export async function allEmployeeTimeoffs(employeeId: number, options?: { [key: string]: any }) {
  return request<API.TimeoffRequest[]>(`${endpoint}${employeeId}/time_off/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createEmployeeTimeoff(
  employeeId: number,
  body: API.TimeoffRequest,
  options?: { [key: string]: any },
) {
  return request<API.TimeoffRequest>(`${endpoint}${employeeId}/time_off/`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function readEmployeeTimeoff(
  employeeId: number,
  id: number,
  options?: { [key: string]: any },
) {
  return request<API.TimeoffRequest>(`${endpoint}${employeeId}/time_off/${id}/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateEmployeeTimeoff(
  employeeId: number,
  id: number,
  body: API.TimeoffRequest,
  options?: { [key: string]: any },
) {
  return request<API.TimeoffRequest>(`${endpoint}${employeeId}/time_off/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteEmployeeTimeoff(
  employeeId: number,
  id: number,
  options?: { [key: string]: any },
) {
  return request<API.TimeoffRequest[]>(`${endpoint}${employeeId}/time_off/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

export async function approveEmployeeTimeoff(
  employeeId: number,
  id: number,
  options?: { [key: string]: any },
) {
  return request(`${endpoint}${employeeId}/time_off/${id}/approve/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

export async function rejectEmployeeTimeoff(
  employeeId: number,
  id: number,
  options?: { [key: string]: any },
) {
  return request(`${endpoint}${employeeId}/time_off/${id}/reject/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

export async function cancelEmployeeTimeoff(
  employeeId: number,
  id: number,
  options?: { [key: string]: any },
) {
  return request(`${endpoint}${employeeId}/time_off/${id}/cancel/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

export async function approveEmployeeAttendance(
  employeeId: number,
  id: number,
  options?: { [key: string]: any },
) {
  return request(`${endpoint}${employeeId}/attendance/${id}/approve/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

export async function rejectEmployeeAttendance(
  employeeId: number,
  id: number,
  options?: { [key: string]: any },
) {
  return request(`${endpoint}${employeeId}/attendance/${id}/reject/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

export async function revertEmployeeAttendance(
  employeeId: number,
  id: number,
  options?: { [key: string]: any },
) {
  return request(`${endpoint}${employeeId}/attendance/${id}/revert/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

export async function confirmEmployeeAttendance(
  employeeId: number,
  id: number,
  options?: { [key: string]: any },
) {
  return request(`${endpoint}${employeeId}/attendance/${id}/confirm/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}
