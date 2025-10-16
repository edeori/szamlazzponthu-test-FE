// src/app/core/services/users.service.ts
import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { apiClient } from './client.initializer';
import type { UsrCreate, UsrPut, Usr } from './api/models';

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

    getById(id: number): Observable<Usr> {
        return from(apiClient.usersIdGet({ id }));
    }

    update(id: number, person: UsrPut): Observable<Usr> {
        return from(apiClient.usersIdPut({ id: id, usrPut: person }));
    }

    delete(id: number): Observable<void> {
        return from(apiClient.usersIdDelete({ id }));
    }

    create(form: {
        firstname: string;
        lastname: string;
        address: string;
        telephone: string;
        job?: string;
        active?: boolean;
    }): Observable<Usr> {
        const payload: UsrCreate = {
            firstname: form.firstname.trim(),
            lastname: form.lastname.trim(),
            job: (form.job ?? '').trim(),
            address: form.address?.trim(),
            telephone: form.telephone?.trim(),
            active: form.active ?? true,
        };

        return from(apiClient.usersPost({ usrCreate: payload }));
    }
}
