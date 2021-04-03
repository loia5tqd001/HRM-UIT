// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

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

export async function refreshAccessToken(refresh_token: string, options?: { [key: string]: any }) {
  // NOTE: The endpoint must trail with a slash "/", or set APPEND_SLASH=False in the Django settings
  return request<API.LoginResult>('/api/auth/token/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      refresh: refresh_token,
    },
    ...(options || {}),
  });
}

export async function currentUser(options?: { [key: string]: any }) {
  return request<API.Employee>('/api/auth/current_user/', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function allRoles(options?: { [key: string]: any }) {
  return request<API.RoleItem[]>('/api/auth/roles/', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateRole(id: string, body: API.RoleItem, options?: { [key: string]: any }) {
  return request<API.RoleItem>(`/api/auth/role/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function createRole(body: Partial<API.RoleItem>, options?: { [key: string]: any }) {
  return request<API.RoleItem>(`/api/auth/role/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteRole(id: string, options?: { [key: string]: any }) {
  return request<API.RoleItem>(`/api/auth/role/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}
