// src/app/core/services/users.service.ts
import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { apiClient } from './client.initializer';

export interface Person {
    id: number;
    name: string;
    job: string;
    active: boolean;
}
export interface Page<T> {
    items: T[];
    pageIndex: number;
    pageSize: number;
    hasMore: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
    list(pageIndex: number, pageSize: number): Observable<Page<Person>> {
        const limit = pageSize;
        const offset = pageIndex * pageSize;

        return from(apiClient.usersGet({ limit, offset })).pipe(
            map(usrs => ({
                items: usrs.map(u => ({
                    id: u.id,
                    name: `${u.firstname} ${u.lastname}`.trim(),
                    job: u.job,
                    active: u.active,
                })),
                pageIndex,
                pageSize,
                hasMore: usrs.length === pageSize, // nincs total → ebből következtetünk
            }))
        );
    }
}
