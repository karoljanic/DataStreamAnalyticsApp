import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field'
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { RequestCreatorComponent } from './data-analyze/request-creator/request-creator.component';
import { DataAnalyzeComponent } from './data-analyze/data-analyze.component';
import { StyleManagerService } from './services/stylemanager.service';
import { LocalStorageService } from './services/localstorage.service';
import { AnalyzeDataService } from './services/analyzedata.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { TokenInterceptor } from './token.interceptor';
import { AuthRequiredComponent } from './auth-required/auth-required.component';
import { ActivationComponent } from './activation/activation.component';
import { ChangeNameComponent } from './profile/change-name/change-name.component';
import { ChangeSurnameComponent } from './profile/change-surname/change-surname.component';
import { ChangePictureComponent } from './profile/change-picture/change-picture.component';
import { DeleteAccountComponent } from './profile/delete-account/delete-account.component';

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    DashboardComponent,
    LoginComponent,
    DataAnalyzeComponent,
    RequestCreatorComponent,
    AuthRequiredComponent,
    ActivationComponent,
    ChangeNameComponent,
    ChangeSurnameComponent,
    ChangePictureComponent,
    DeleteAccountComponent
  ],
  imports: [
    AppRoutingModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatRadioModule,
    MatStepperModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    FormsModule,
    MatSnackBarModule,
    MatChipsModule,
    MatSelectModule,
    MatDialogModule
  ],
  providers: [
    LocalStorageService,
    StyleManagerService,
    AuthService,
    AnalyzeDataService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
