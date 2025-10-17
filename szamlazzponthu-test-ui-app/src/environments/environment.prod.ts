const RUNTIME = (window as any).__env || {};
const API_BASE = (RUNTIME.API_BASE_URL as string) || '/api';

export const environment = {
  production: true,
  apiBaseUrl: API_BASE,
};
