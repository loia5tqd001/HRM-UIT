// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  // NOTE: The endpoint must trail with a slash "/", or set APPEND_SLASH=False in the Django settings
  return request<API.LoginResult>('/api/auth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
