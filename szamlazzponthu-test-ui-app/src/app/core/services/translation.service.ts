import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private translations: Record<string, any> = {};
  currentLang = signal<'hu' | 'en'>('hu');

  constructor(private http: HttpClient) {}

  async loadLanguage(lang: 'hu' | 'en'): Promise<void> {
    const url = `assets/i18n/${lang}.json`;
    const data = await firstValueFrom(this.http.get<Record<string, any>>(url));
    this.translations = data;
    this.currentLang.set(lang);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = this.translations;
    for (const k of keys) {
      if (value && k in value) value = value[k];
      else return key; // ha nincs ilyen kulcs
    }
    if (typeof value === 'string' && params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{{${k}}}`, String(v));
      });
    }
    return value || key;
  }
}
