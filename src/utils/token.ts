const REFRESH_KEY = 'refresh_token';

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_KEY, token);
}

export function removeRefreshToken(): void {
  localStorage.removeItem(REFRESH_KEY);
}
