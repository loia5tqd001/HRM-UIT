import { request } from 'umi';

const endpoint = '/api/payrolls/';
type Item = API.Payroll;

export async function allPayrolls(options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createPayroll(body: Item, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function readPayroll(id: number, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}${id}/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function readPayslips(id: number, options?: { [key: string]: any }) {
  return request<API.Payslip[]>(`${endpoint}${id}/payslips/`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function calculatePayslips(id: number, options?: { [key: string]: any }) {
  return request(`${endpoint}${id}/calculate/`, {
    method: 'POST',
    ...(options || {}),
  });
}

export async function exportExcel(id: number, options?: { [key: string]: any }) {
  return request(`${endpoint}${id}/export_excel/`, {
    method: 'POST',
    ...(options || {}),
  });
}

export async function sendViaEmail(id: number, options?: { [key: string]: any }) {
  return request(`${endpoint}${id}/send_payslip/`, {
    method: 'POST',
    ...(options || {}),
  });
}

export async function deletePayroll(id: number, options?: { [key: string]: any }) {
  return request<Item[]>(`${endpoint}${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}
