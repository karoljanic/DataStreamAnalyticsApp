import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  static themeKey = 'theme-current-name';
  static userKey = 'user';

  store(key: string, value: string): void {
    localStorage[key] = value;
  }

  get(key: string): any | null {
    return localStorage[key] || null;
  }

  clear(key: string): void {
    localStorage.removeItem(key);
  }
}
