/**
 * api.js — Centralised API client for FinSolve backend
 * Base URL: http://127.0.0.1:8000
 */

const BASE_URL = 'http://127.0.0.1:8000';

/**
 * POST /auth/login
 * Uses application/x-www-form-urlencoded (OAuth2PasswordRequestForm)
 */
export async function apiLogin(username, password) {
  const body = new URLSearchParams({ username, password });
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

/**
 * GET /auth/me
 */
export async function apiGetMe(token) {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

/**
 * POST /chat
 */
export async function apiChat(message, token) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  return res.json();
}

/**
 * GET /health
 */
export async function apiHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Backend unreachable');
  return res.json();
}

/**
 * GET /admin/users
 */
export async function apiGetUsers(token) {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to load users');
  }
  return res.json();
}

/**
 * POST /admin/users
 */
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
    throw new Error(err.detail || 'Failed to create user');
  }
  return res.json();
}

/**
 * PUT /admin/users/{username}
 */
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
    throw new Error(err.detail || 'Failed to update user');
  }
  return res.json();
}

/**
 * DELETE /admin/users/{username}
 */
export async function apiDeleteUser(username, token) {
  const res = await fetch(`${BASE_URL}/admin/users/${username}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete user');
  }
  return true;
}
