import { Component, OnInit } from '@angular/core';
import { StyleManagerService, ThemeStyle } from '../services/stylemanager.service';
import { LocalStorageService } from '../services/localstorage.service';
import { UserProfile } from './user-profile';
import { UserProfileService } from '../services/userprofile.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangeNameComponent } from './change-name/change-name.component';
import { ChangeSurnameComponent } from './change-surname/change-surname.component';
import { ChangePictureComponent } from './change-picture/change-picture.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteAccountComponent } from './delete-account/delete-account.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
  profilePicture: string = "assets/no-image.jpg";
  profilePictureName: string = "no-image.jpg";

  constructor(private userProfileService: UserProfileService,
    private authService: AuthService,
    private styleService: StyleManagerService,
    private localStorage: LocalStorageService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router) {

    var currentTheme = localStorage.get(LocalStorageService.themeKey);
    if (currentTheme === null) {
      currentTheme = ThemeStyle.Default;
    }

    for (let theme of this.themes) {
      theme.checked = (theme.enum == currentTheme);
    }
  }

  ngOnInit(): void {
    const userData = JSON.parse(this.localStorage.get(LocalStorageService.userKey) || '{}')
    const userId = userData.user_id;
    this.userProfileService.getUserProfile(userId).subscribe({
      next: (data) => {
        this.userProfile = data;
        if (data != null && data.picture != null) {
          this.profilePictureName = data.picture.substring(data.picture.indexOf('/media'));
          this.profilePicture = 'api' + this.profilePictureName;
        }
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

  changeName(): void {
    const dialogRef = this.dialog.open(ChangeNameComponent, {
      data: { name: this.userProfile?.name },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.name.length > 20 || result.name.length < 3) {
          this.snackBar.open('Name must be between 3 and 20 characters long.', 'Close');
        }
        else {
          var newUserProfile: UserProfile = { ...this.userProfile! };
          newUserProfile.name = result.name;
          this.userProfileService.updateUserProfile(newUserProfile).subscribe({
            next: (data) => {
              this.userProfile = data;
            },
            error: (error) => {
              console.log(error);
            }
          });
        }
      }
    });
  }

  changeSurname(): void {
    const dialogRef = this.dialog.open(ChangeSurnameComponent, {
      data: { surname: this.userProfile?.surname },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result.surname.length > 20 || result.surname.length < 3) {
          this.snackBar.open('Surname must be between 3 and 20 characters long.', 'Close');
        }
        else {
          var newUserProfile: UserProfile = { ...this.userProfile! };
          newUserProfile.surname = result.surname;
          this.userProfileService.updateUserProfile(newUserProfile).subscribe({
            next: (data) => {
              this.userProfile = data;
            },
            error: (error) => {
              console.log(error);
            }
          });
        }
      }
    })
  }

  changePicture(): void {
    const dialogRef = this.dialog.open(ChangePictureComponent, {
      data: { picture: null, pictureName: '' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && result.picture !== null) {
        var newUserProfile: UserProfile = { ...this.userProfile! };
        console.log(result.picture);
        newUserProfile.picture = result.picture;
        this.userProfileService.updateUserProfile(newUserProfile).subscribe({
          next: (data) => {
            this.userProfile = data;
          },
          error: (error) => {
            console.log(error);
          }
        });
      }
    })
  }

  deleteProfile(): void {
    const dialogRef = this.dialog.open(DeleteAccountComponent, {
      data: { decision: false },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && result.decision === true) {
        this.userProfileService.deleteUserProfile(this.userProfile!.id).subscribe({
          next: (data) => {
            this.authService.setLoggedOutUser();
            this.router.navigateByUrl('/');
          },
          error: (error) => {
            console.log(error);
          }
        });
      }
    })
  }
}
