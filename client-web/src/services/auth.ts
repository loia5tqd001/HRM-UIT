// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  // NOTE: The endpoint must trail with a slash "/", or set APPEND_SLASH=False in the Django settings
  return request<API.LoginResult>('/api/auth/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<API.CurrentUser>('/api/auth/currentUser/', {
    method: 'GET',
    ...(options || {}),
  });
}