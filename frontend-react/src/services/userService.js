/**
 * userService.js — User Account CRUD API services
 */
const BASE_URL = 'http://127.0.0.1:8000';

export async function apiGetUsers(token) {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to load user accounts');
  }
  return res.json();
}

export async function apiCreateUser(userData, token) {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create user account');
  }
  return res.json();
}

export async function apiUpdateUser(username, userData, token) {
  const res = await fetch(`${BASE_URL}/admin/users/${username}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update user account');
  }
  return res.json();
}

export async function apiDeleteUser(username, token) {
  const res = await fetch(`${BASE_URL}/admin/users/${username}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete user account');
  }
  return true;
}
