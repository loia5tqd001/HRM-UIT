import { request } from 'umi';
import { saveAs } from 'file-saver';

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

export async function exportExcel(id: number) {
  return fetch(`${endpoint}${id}/export_excel/`, {
    method: 'GET',
    headers: {
      responseType: 'arrayBuffer',
    },
  }).then(async (response) => {
    const contentDisposition = response.headers.get('content-disposition');
    const contentType = response.headers.get('content-type') || undefined;
    const data = await response.arrayBuffer();
    const blob = new Blob([data], { type: contentType });
    saveAs(blob, contentDisposition?.match(/filename="(.*?)"/)?.[1] || 'payslips.xlsx');
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
