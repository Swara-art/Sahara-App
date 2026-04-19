const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ── Helpers ───────────────────────────────────────────────

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.detail || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  // Backend sometimes returns {"error": "..."} with 200 status — treat as error
  if (data?.error) {
    throw new Error(data.error);
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────────

/**
 * POST /login  → { access_token }
 * Backend expects JSON body: { email, password }
 */
export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

/**
 * POST /signup  → { message, user_id }
 * Backend expects JSON body: { name, email, password, pincode, role }
 */
export async function signupUser({ name, email, password, pincode }) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, pincode, role: 'citizen' }),
  });
  return handleResponse(res);
}

// ── Complaints ────────────────────────────────────────────

/**
 * GET /complaints/search-nearby  (no auth required)
 * Used for homepage feed + search
 */
export async function searchNearby(lat, lng, query = '') {
  const params = new URLSearchParams({ lat, lng, query });
  const res = await fetch(`${BASE_URL}/complaints/search-nearby?${params}`);
  return handleResponse(res);
}

/**
 * POST /complaint/{id}/upvote?lat=&lng=  (auth required)
 */
export async function toggleUpvote(complaintId, lat, lng, token) {
  const params = new URLSearchParams({ lat, lng });
  const res = await fetch(
    `${BASE_URL}/complaint/${complaintId}/upvote?${params}`,
    { method: 'POST', headers: authHeaders(token) }
  );
  return handleResponse(res);
}

/**
 * POST /complaint (multipart form — auth required)
 */
export async function postComplaint(formData, token) {
  const res = await fetch(`${BASE_URL}/complaint`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }, // no Content-Type; browser sets multipart boundary
    body: formData,
  });
  return handleResponse(res);
}

// ── Profile ───────────────────────────────────────────────

/**
 * GET /profile  (auth required)
 */
export async function getProfile(token) {
  const res = await fetch(`${BASE_URL}/profile`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

/**
 * PATCH /profile?name=&profile_pic=  (auth required)
 */
export async function updateProfile(fields, token) {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== '' && v != null))
  );
  const res = await fetch(`${BASE_URL}/profile?${params}`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ── Leaderboard ───────────────────────────────────────────

/**
 * GET /leaderboard  (no auth required)
 */
export async function getLeaderboard() {
  const res = await fetch(`${BASE_URL}/leaderboard`);
  return handleResponse(res);
}

// ── Vouchers ──────────────────────────────────────────────

/**
 * GET /vouchers  (no auth required)
 */
export async function getVouchers() {
  const res = await fetch(`${BASE_URL}/vouchers`);
  return handleResponse(res);
}

/**
 * POST /vouchers/buy/{id}  (auth required)
 */
export async function buyVoucher(voucherId, token) {
  const res = await fetch(`${BASE_URL}/vouchers/buy/${voucherId}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}
