export async function http(
  request: RequestInfo,
  config?: RequestInit
): Promise<any> {
  const response = await fetch(request, config);
  const body = await response.json();
  return body;
}
