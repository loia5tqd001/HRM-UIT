import { request } from 'umi';

const endpoint = '/api/attendance';
type Item = API.AttendanceEmployee;

export async function allAttendances(options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function allPeriods() {
  return request<API.Period[]>(`${endpoint}/cycle/periods/`, {
    method: 'GET',
  });
}

export async function attendanceHelper() {
  return request<API.AttendanceHelper>(`attendance_helper`, {
    method: 'GET',
  });
}