import { Configuration, UsersApi } from '../../core/services/api';
import { environment } from '../../../environments/environment';

function getBaseUrl(): string {
  return environment.apiBaseUrl;
}

export function createApiClient() {
  const config = new Configuration({
    basePath: getBaseUrl()
  });

  return new UsersApi(config);
}

export const apiClient = createApiClient();
