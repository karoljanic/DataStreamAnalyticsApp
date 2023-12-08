import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { DataAnalyzeComponent } from './data-analyze/data-analyze.component';
import { AuthRequiredComponent } from './auth-required/auth-required.component';

const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'login', component: LoginComponent },
    { path: 'authentication-required', component: AuthRequiredComponent },
    { path: 'profile/:user_id', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'analyzer', component: DataAnalyzeComponent, canActivate: [AuthGuard] },
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            routes
        )
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule { }
