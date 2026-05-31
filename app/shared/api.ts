export type ApiSuccess<T> = { ok: true } & T;
export type ApiError = { ok: false; code?: string; error: string };

export async function postJson<TResponse extends Record<string, unknown>>(url: string, body: unknown): Promise<ApiSuccess<TResponse>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string } & TResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Islem basarisiz");
  }

  return data as ApiSuccess<TResponse>;
}
