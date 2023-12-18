import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UserCredentials } from './auth';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  logInForm: any;
  loginError: string = '';

  constructor(private formBuilder: FormBuilder, private snackBar: MatSnackBar, private authService: AuthService, private router: Router) {
    this.logInForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void { }

  logInUser(user: UserCredentials): void {
    this.loginError = '';
    this.authService.login(user.email, user.password).subscribe({
      next: (data) => {
        this.authService.setLoggedInUser(data);
        this.router.navigateByUrl(`/`);
      },
      error: (error) => {
        this.loginError = error['error']['non_field_errors'][0];
      }
    });
  }

  onLogInSubmit(formData: UserCredentials): void {
    if (this.logInForm.invalid) {
      this.loginError = 'Fill form data';
    }
    else {
      this.logInUser(formData);
    }
  }
} 
