import type { Request } from 'express';

export const SESSION_COOKIE = 'session';
export const STATE_COOKIE = 'oauth_state';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type AuthenticatedRequest = Request & { userId: string };

export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}
