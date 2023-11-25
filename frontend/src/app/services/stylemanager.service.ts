import { Injectable } from '@angular/core';

export enum ThemeStyle {
    SubduedLight = 'subdued-light-theme',
    SubduedDark = 'subdued-dark-theme',
    ColorfulLight = 'colorful-light-theme',
    ColorfulDark = 'colorful-dark-theme',
    Default = SubduedLight
}

export function getThemeStyleFromString(value: string): ThemeStyle {
    return (Object.values(ThemeStyle) as unknown as string[]).includes(value)
        ? value as unknown as ThemeStyle
        : ThemeStyle.Default;
}

@Injectable({
  providedIn: 'root'
})
export class StyleManagerService {

  setStyle(themeStyle: ThemeStyle): void{
    this.removeStyle('theme');
    this.getLinkElementForKey('style').setAttribute('href', `${themeStyle}.css`);
  }

  removeStyle(key: string): void{
    const existingLinkElement = this.getExistingLinkElementByKey(key);
    if (existingLinkElement) {
      document.head.removeChild(existingLinkElement);
    }
  }

  getLinkElementForKey(key: string) {
    return this.getExistingLinkElementByKey(key) || this.createLinkElementWithKey(key);
  }

  getExistingLinkElementByKey(key: string) {
    return document.head.querySelector(`link[rel="stylesheet"].${this.getClassNameForKey(key)}`);
  }

  createLinkElementWithKey(key: string) {
    const linkEl = document.createElement('link');
    linkEl.setAttribute('rel', 'stylesheet');
    linkEl.classList.add(this.getClassNameForKey(key));
    document.head.appendChild(linkEl);
    return linkEl;
  }

  getClassNameForKey(key: string) {
    return `style-manager-${key}`;
  }
}
