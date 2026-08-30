/**
 * departmentService.js — Corporate Department CRUD & File Management API services
 */
const BASE_URL = 'http://127.0.0.1:8000';

export async function apiGetDepartments(token) {
  const res = await fetch(`${BASE_URL}/admin/departments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to load departments');
  }
  return res.json();
}

export async function apiCreateDepartment(deptData, token) {
  const res = await fetch(`${BASE_URL}/admin/departments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(deptData),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create department');
  }
  return res.json();
}

export async function apiUpdateDepartment(deptId, deptData, token) {
  const res = await fetch(`${BASE_URL}/admin/departments/${deptId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(deptData),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update department');
  }
  return res.json();
}

export async function apiDeleteDepartment(deptId, token) {
  const res = await fetch(`${BASE_URL}/admin/departments/${deptId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete department');
  }
  return true;
}

// ══════════════════════════════════════════════════════════════════════════════
// DEPARTMENT KNOWLEDGE DOCUMENTS & FILE REPOSITORY SERVICES
// ══════════════════════════════════════════════════════════════════════════════

export async function apiGetDepartmentFiles(deptId, token) {
  const res = await fetch(`${BASE_URL}/admin/departments/${deptId}/files`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to load department files');
  }
  return res.json();
}

export async function apiUploadDepartmentFile(deptId, file, token) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/admin/departments/${deptId}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload document file');
  }
  return res.json();
}

export async function apiDeleteDepartmentFile(deptId, filename, token) {
  const res = await fetch(`${BASE_URL}/admin/departments/${deptId}/files/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete file');
  }
  return res.json();
}
