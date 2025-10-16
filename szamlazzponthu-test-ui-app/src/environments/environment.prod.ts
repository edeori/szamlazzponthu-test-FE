export const environment = {
  production: true,
  apiBaseUrl: (window as any).__env?.API_BASE_URL ?? 'https://api.sajatdomain.hu',
};
