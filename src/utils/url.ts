/**
 * Utility for handling URLs in hosted vs local offline standalone (file://) environments.
 */

export function getLiveAppUrl(): string {
  const defaultUrl = 'https://ais-pre-cwfhs3kjnhahsqos4mg4ru-1012192092682.asia-southeast1.run.app';
  if (typeof window === 'undefined' || !window.location) {
    return defaultUrl;
  }
  const origin = window.location.origin;
  // If we are opened offline via file:// or run on localhost, yield the real production URL so links route correctly
  if (!origin || origin.startsWith('file:') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return defaultUrl;
  }
  return origin;
}
