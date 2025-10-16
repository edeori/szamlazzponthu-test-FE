// src/app/core/services/users.service.ts
import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { jobTypesApi } from './client.initializer';
import type { JobType } from './api/models';

export interface UiSelectOption {
    value: string;
    label: string;
}

@Injectable({ providedIn: 'root' })
export class JobTypesService {

    list(): Observable<JobType[]> {
        return from(jobTypesApi.jobTypesGet());
    }

}