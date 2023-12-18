import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../app/services/localstorage.service';
import { StyleManagerService, ThemeStyle, getThemeStyleFromString } from './services/stylemanager.service';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LoggedInUser } from './login/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public isMenuOpen: boolean = false;
  public onSidenavClick() {
    this.isMenuOpen = false;
  }

  menuItems = [
    { icon: 'home', text: 'Home', route: '' },
    { icon: 'bar_chart', text: 'Analyze', route: 'analyzer' },
    { icon: 'person', text: 'Profile', route: 'profile' },
    { icon: 'login', text: 'Login', route: 'login' },
    { icon: 'register', text: 'Register', route: 'register'}
  ];

  user: LoggedInUser | null = null;

  constructor(private router: Router,
    private styleService: StyleManagerService,
    private localStorage: LocalStorageService,
    private authService: AuthService) {

    const themeName = this.localStorage.get(LocalStorageService.themeKey);

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

  ngOnInit(): void {
    this.authService.loggedInUser.subscribe(user => {
      this.user = user;
    });
  }

  navigateToRoute(route: string): void {
    this.router.navigate([route]);
  }

  navigateToProfile(): void {
    if (this.user !== null) {
      this.router.navigateByUrl('/profile');
    }
    else {
      this.router.navigateByUrl(`/authentication-required`);
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: (data) => {
        this.authService.setLoggedOutUser();
        this.navigateToRoute('/login');
      },
      error: (error) => {
        console.log(error);
      }
    });

  }
}
