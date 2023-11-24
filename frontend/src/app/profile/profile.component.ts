import { Component } from '@angular/core';
import { StyleManagerService, ThemeStyle } from '../services/stylemanager.service';
import { LocalStorageService } from '../services/localstorage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  themes = [
    { name: 'Subdued Light Theme', enum: ThemeStyle.SubduedLight, checked: true },
    { name: 'Subdued Dark Theme', enum: ThemeStyle.SubduedDark, checked: false },
    { name: 'Colorful Light Theme', enum: ThemeStyle.ColorfulLight, checked: false },
    { name: 'Colorful Dark Theme', enum: ThemeStyle.ColorfulDark, checked: false },
  ];

  constructor(private styleService: StyleManagerService,
              private localStorage: LocalStorageService) {

    var currentTheme = localStorage.getValue(LocalStorageService.themeKey);
    if(currentTheme === null) {
      currentTheme = ThemeStyle.Default;
    }

    for(let theme of this.themes) {
      theme.checked = (theme.enum == currentTheme);
    }
  }

  changeThemeStyle(themeStyle: ThemeStyle): void {
    this.styleService.setStyle(themeStyle);
    this.localStorage.store(LocalStorageService.themeKey, themeStyle);
  }
}
