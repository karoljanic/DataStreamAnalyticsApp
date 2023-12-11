import { Component } from '@angular/core';
import { LocalStorageService } from '../app/services/localstorage.service';
import { StyleManagerService, ThemeStyle, getThemeStyleFromString } from './services/stylemanager.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  menuItems = [
    { icon: 'home', text: 'Home', route: '' },
    { icon: 'bar_chart', text: 'Analyze', route: 'analyzer' },
    { icon: 'person', text: 'Profile', route: 'profile' },
    { icon: 'login', text: 'Login', route: 'login' },
    { icon: 'person_add', text: 'Register', route: 'register' }
  ];

  constructor(private router: Router,
              private styleService: StyleManagerService,
              private localStorage: LocalStorageService) {

    const themeName = this.localStorage.getValue(LocalStorageService.themeKey);

    if (themeName) {
      const theme = getThemeStyleFromString(themeName);
      this.styleService.setStyle(theme);
    }
    else {
      const theme = ThemeStyle.Default;
      this.styleService.setStyle(theme);
      this.localStorage.store(LocalStorageService.themeKey, theme);
    }
  }

  navigateToRoute(route: string): void {
    this.router.navigate([route]);
  }
}
