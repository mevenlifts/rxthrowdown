export async function getUserProfile(token: string) {
  console.log("token:", token);
  if (!token) throw new Error('No token provided');
  const res = await fetch('/api/user/me', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function updateUserProfile(data: { homeGym?: string; birthdate?: string; first_name?: string; last_name?: string }, token: string) {
  const res = await fetch('/api/user/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}
export async function signupUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  // Convert camelCase to snake_case for backend compatibility
  const payload = {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    password: data.password,
  };
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Signup failed');
  return res.json();
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Login failed');
  return result;
}

export async function signupForThrowdown(throwdownId: string, userId: string) {
  const res = await fetch(`/api/throwdowns/${throwdownId}/add-participant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIds: userId }),
  });
  if (!res.ok) throw new Error('Failed to sign up for throwdown');
  return res.json();
}