import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { INTL_LOCALE } from './tokens/intl-locale';
import { LOCATION } from './tokens/location';
import { HISTORY } from './tokens/history';
import { CLIPBOARD } from './tokens/clipboard';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    {
      provide: LOCATION,
      useValue: globalThis.location,
    },
    {
      provide: HISTORY,
      useValue: globalThis.history,
    },
    {
      provide: CLIPBOARD,
      useValue: globalThis.navigator.clipboard,
    },
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
