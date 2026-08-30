/**
 * chatService.js — RAG AI Assistant Chat & Multi-Session API Service
 */
const BASE_URL = 'http://127.0.0.1:8000';

export async function apiChat(message, token, sessionId = null) {
  const payload = { message };
  if (sessionId) {
    payload.session_id = sessionId;
  }
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  return res.json();
}

export async function apiUploadAttachment(file, token) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/chat/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Upload failed with status ${res.status}`);
  }
  return res.json();
}

export async function apiGetChatSessions(token) {
  const res = await fetch(`${BASE_URL}/chat/sessions`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  return res.json();
}

export async function apiGetChatSessionDetail(token, sessionId) {
  const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  return res.json();
}

export async function apiDeleteChatSession(token, sessionId) {
  const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok && res.status !== 204) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  return true;
}

export async function apiRenameChatSession(token, sessionId, newTitle) {
  const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title: newTitle }),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  return res.json();
}

