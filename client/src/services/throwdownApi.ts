export async function fetchThrowdowns(page = 1, limit = 10) {
  const res = await fetch(`/api/throwdowns?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch throwdowns');
  return res.json();
}

export async function fetchThrowdownById(id: string) {
  const res = await fetch(`/api/throwdowns/${id}`);
  if (!res.ok) throw new Error('Failed to fetch throwdown');
  return res.json();
}

export async function createThrowdown(data: any) {
  const response = await fetch('/api/throwdowns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create throwdown');
  }
  return response.json();
}

export async function fetchScoreTypes() {
  const res = await fetch('/api/score-types');
  if (!res.ok) throw new Error('Failed to fetch score types');
  return res.json();
}
