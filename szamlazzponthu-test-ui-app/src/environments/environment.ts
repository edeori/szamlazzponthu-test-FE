export const environment = {
  production: false,
  apiBaseUrl: (window as any).__env?.API_BASE_URL ?? 'http://localhost:8080',
};
