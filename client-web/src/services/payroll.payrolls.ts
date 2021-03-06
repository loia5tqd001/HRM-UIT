import { request } from 'umi';
import { saveAs } from 'file-saver';
import jwt from '@/utils/jwt';

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
      Authorization: `Bearer ${jwt.getAccess()}`,
    },
  }).then(async (response) => {
    const contentDisposition = response.headers.get('content-disposition');
    const contentType = response.headers.get('content-type') || undefined;
    const data = await response.arrayBuffer();
    const blob = new Blob([data], { type: contentType });
    saveAs(blob, contentDisposition?.match(/filename="(.*?)"/)?.[1] || 'payslips.xlsx');
  });
}

export async function downloadSampleExcel(id: number) {
  return fetch(`${endpoint}${id}/inputs_template/`, {
    method: 'GET',
    headers: {
      responseType: 'arrayBuffer',
      Authorization: `Bearer ${jwt.getAccess()}`,
    },
  }).then(async (response) => {
    const contentDisposition = response.headers.get('content-disposition');
    const contentType = response.headers.get('content-type') || undefined;
    const data = await response.arrayBuffer();
    const blob = new Blob([data], { type: contentType });
    saveAs(blob, contentDisposition?.match(/filename="(.*?)"/)?.[1] || 'template.xlsx');
  });
}

export async function uploadInput(id: number, data: any, options?: { [key: string]: any }) {
  return request(`${endpoint}${id}/upload_inputs/`, {
    method: 'POST',
    data,
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

export async function confirmPayroll(id: number, options?: { [key: string]: any }) {
  return request<Item>(`${endpoint}${id}/confirm/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}
