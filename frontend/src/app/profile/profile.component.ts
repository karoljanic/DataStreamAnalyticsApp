import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StyleManagerService, ThemeStyle } from '../services/stylemanager.service';
import { LocalStorageService } from '../services/localstorage.service';
import { UserProfile } from './user-profile';
import { UserProfileService } from '../services/userprofile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  themes = [
    { name: 'Subdued Light Theme', enum: ThemeStyle.SubduedLight, checked: true },
    { name: 'Subdued Dark Theme', enum: ThemeStyle.SubduedDark, checked: false },
    { name: 'Colorful Light Theme', enum: ThemeStyle.ColorfulLight, checked: false },
    { name: 'Colorful Dark Theme', enum: ThemeStyle.ColorfulDark, checked: false },
  ];

  userProfile: UserProfile | null = null;

  constructor(private userProfileService: UserProfileService,
    private styleService: StyleManagerService,
    private localStorage: LocalStorageService,
    private activatedRoute: ActivatedRoute) {

    var currentTheme = localStorage.get(LocalStorageService.themeKey);
    if (currentTheme === null) {
      currentTheme = ThemeStyle.Default;
    }

    for (let theme of this.themes) {
      theme.checked = (theme.enum == currentTheme);
    }
  }

  ngOnInit(): void {
    const userId = this.activatedRoute.snapshot.paramMap.get('user_id');
    this.userProfileService.getUserProfile(userId).subscribe({
      next: (data) => {
        this.userProfile = data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  changeThemeStyle(themeStyle: ThemeStyle): void {
    this.styleService.setStyle(themeStyle);
    this.localStorage.store(LocalStorageService.themeKey, themeStyle);
  }
}
