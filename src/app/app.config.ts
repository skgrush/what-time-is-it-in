import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { INTL_LOCALE } from './tokens/intl-locale';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    {
      provide: INTL_LOCALE,
      useFactory: () => {
        const overrideLocale = globalThis.localStorage?.getItem('wtiii.locale') ?? '';

        const navLocales = globalThis.navigator.languages;
        const allLocales = [overrideLocale, ...navLocales];
        const supportedLocales = Intl.DateTimeFormat.supportedLocalesOf(navLocales, { localeMatcher: 'lookup' });
        const chosenLocale = supportedLocales[0] ?? 'en';

        console.info('locale info', {
          navLocales,
          allLocales,
          supportedLocales,
          chosenLocale,
        });
        return chosenLocale;
      }
    }
  ]
};
