let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response = await fetch(input, { ...init, headers });

  if (response.status === 401) {
    // Attempt to refresh token
    try {
      const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST' });
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          headers.set('Authorization', `Bearer ${data.accessToken}`);
          // Retry original request
          response = await fetch(input, { ...init, headers });
        }
      } else {
        // Refresh failed, likely session expired. Clear token and force logout.
        setAccessToken(null);
        // Dispatch custom event to let UI know
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth_expired'));
        }
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }

  return response;
}
