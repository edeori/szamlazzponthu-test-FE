import { ApplicationConfig, APP_INITIALIZER, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { TranslationService } from './core/services/translation.service';

function initI18n() {
  return () => {
    const i18n = inject(TranslationService);
    const stored = localStorage.getItem('lang');
    const browser = (navigator.languages?.[0] ?? navigator.language ?? '').toLowerCase();
    const preferred = (stored as 'hu' | 'en' | null)
      ?? (browser.startsWith('hu') ? 'hu' : 'hu'); // default HU
    return i18n.loadLanguage(preferred);

  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),                              // kell a JSON betöltéshez
    { provide: APP_INITIALIZER, useFactory: initI18n, multi: true }
  ]
};
