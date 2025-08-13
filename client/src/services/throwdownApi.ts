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
