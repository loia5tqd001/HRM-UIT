import { request } from 'umi';

const endpoint = '/api/app_config';
type Item = API.AppConfig;

export async function getAppConfig() {
  return request<Item>(`${endpoint}/`, {
    method: 'GET',
  });
}

export async function updateAppConfig(data: Item) {
  return request<Item>(`${endpoint}/`, {
    method: 'POST',
    data,
  });
}
