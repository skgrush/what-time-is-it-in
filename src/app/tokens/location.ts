import { InjectionToken } from '@angular/core';

/**
 * Browser {@link Location} global instance.
 * May be `undefined` in server-side rendering.
 */
export const LOCATION = new InjectionToken<Location | undefined>('Location');
