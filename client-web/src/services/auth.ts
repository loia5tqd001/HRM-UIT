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

export async function getMyPermission(options?: { [key: string]: any }) {
  // NOTE: The endpoint must trail with a slash "/", or set APPEND_SLASH=False in the Django settings
  return request<API.AuthenticatedPermission[]>('/api/auth/authenticated_permissions/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
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

export async function updateProfile(data: API.Employee, options?: { [key: string]: any }) {
  return request<API.Employee>('/api/auth/current_user/', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function changeAvatar(data: any, options?: { [key: string]: any }) {
  return request(`/api/auth/current_user/avatar/`, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

export async function changePassword(
  password: string,
  new_password: string,
  options?: { [key: string]: any },
) {
  return request('/api/auth/current_user/password/', {
    method: 'PUT',
    data: {
      password,
      new_password,
    },
    ...(options || {}),
  });
}

const roleEndpoint = '/api/auth/roles/';
type RoleItem = API.RoleItem;

export async function allRoles(options?: { [key: string]: any }) {
  return request<RoleItem[]>(`${roleEndpoint}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function createRole(body: RoleItem, options?: { [key: string]: any }) {
  return request<RoleItem>(`${roleEndpoint}`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function readRole(id: number, options?: { [key: string]: any }) {
  return request<RoleItem>(`${roleEndpoint}${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function updateRole(id: number, body: RoleItem, options?: { [key: string]: any }) {
  return request<RoleItem>(`${roleEndpoint}${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteRole(id: number, options?: { [key: string]: any }) {
  return request<RoleItem[]>(`${roleEndpoint}${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}
