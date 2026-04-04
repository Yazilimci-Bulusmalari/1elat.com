const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

export async function createSession(
  kv: KVNamespace,
  userId: string
): Promise<string> {
  const token = crypto.randomUUID();
  await kv.put(`session:${token}`, userId, { expirationTtl: SESSION_TTL });
  return token;
}

export async function getSession(
  kv: KVNamespace,
  token: string
): Promise<string | null> {
  return kv.get(`session:${token}`);
}

export async function deleteSession(
  kv: KVNamespace,
  token: string
): Promise<void> {
  await kv.delete(`session:${token}`);
}
