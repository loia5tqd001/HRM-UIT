import { request } from 'umi';

const endpoint = '/api/attendance';
type Item = API.AttendanceEmployee;

export async function allAttendances(options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}`, {
    method: 'GET',
    ...(options || {}),
  });
}
