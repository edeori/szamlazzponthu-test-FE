import { Configuration, UsersApi, JobTypesApi } from '../../core/services/api';
import { environment } from '../../../environments/environment';

function getBaseUrl(): string {
  return environment.apiBaseUrl;
}

const config = new Configuration({
  basePath: getBaseUrl(),
});

export const usersApi = new UsersApi(config);
export const jobTypesApi = new JobTypesApi(config);
